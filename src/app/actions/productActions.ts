"use server"

import { connectDB } from "src/lib/database/db"
import { Product } from "src/lib/database/models/Product"
import { Seller } from "src/lib/database/models/Seller"
import { Category } from "src/lib/database/models/Category"
import { SubscriptionPlan } from "src/lib/database/models/SubscriptionPlan"
import { getAuthUser } from "src/lib/auth/jwt"
import { ProductSchema } from "src/lib/validation"
import {
  generateProductDescription as generateDescAI,
  generateSEOMetadata as generateSEOAI,
  generateProductTags as generateTagsAI,
} from "src/lib/ai"
import { uploadBase64ToCloudinary } from "src/lib/cloudinary"

export async function uploadProductImageAction(base64Str: string) {
  try {
    const user = await getAuthUser()
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return { success: false, error: "Unauthorized." }
    }
    const url = await uploadBase64ToCloudinary(base64Str, "products")
    return { success: true, url }
  } catch (error: any) {
    console.error("Error uploading product image action:", error)
    return { success: false, error: error.message || "Failed to upload image." }
  }
}

export async function createProduct(formData: any) {
  try {
    const user = await getAuthUser()
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return { success: false, error: "Unauthorized. Seller credentials required." }
    }

    await connectDB()

    const validated = ProductSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // 1. Get Seller Profile
    const seller = await Seller.findOne({ user: user.id })
    if (!seller) {
      return { success: false, error: "Seller profile not found. Please complete verification." }
    }

    // 2. Enforce Subscription Product Limits
    const currentProductCount = await Product.countDocuments({ seller: seller._id })
    
    // Limits default mapping
    const planLimits = { free: 10, silver: 50, gold: 200, platinum: 999999 }
    const limit = planLimits[seller.subscriptionPlan] || 10

    if (currentProductCount >= limit) {
      return {
        success: false,
        error: `Listing limit reached. Your current plan (${seller.subscriptionPlan.toUpperCase()}) allows up to ${limit} products. Please upgrade to list more.`,
      }
    }

    // 3. Setup Slug
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    let uniqueSlug = slug
    let count = 1
    while (await Product.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${count}`
      count++
    }

    // 4. Generate SEO automatically if not provided
    const seoMeta = formData.seoMetadata || {}
    if (!seoMeta.title || !seoMeta.description) {
      const generatedSEO = await generateSEOAI(formData.name, formData.description)
      seoMeta.title = seoMeta.title || generatedSEO.title
      seoMeta.description = seoMeta.description || generatedSEO.description
      seoMeta.keywords = seoMeta.keywords || generatedSEO.keywords
    }

    // 5. Create
    const product = await Product.create({
      ...validated.data,
      slug: uniqueSlug,
      seller: seller._id,
      seoMetadata: seoMeta,
    })

    return { success: true, product: JSON.parse(JSON.stringify(product)) }
  } catch (error: any) {
    console.error("Error creating product:", error)
    return { success: false, error: error.message || "Failed to create product." }
  }
}

export async function updateProduct(id: string, formData: any) {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Unauthorized." }

    await connectDB()

    const product = await Product.findById(id)
    if (!product) return { success: false, error: "Product not found." }

    // Enforce owner check
    const seller = await Seller.findOne({ user: user.id })
    if (!seller && user.role !== "admin") return { success: false, error: "Profile mismatch." }
    if (user.role !== "admin" && product.seller.toString() !== seller?._id.toString()) {
      return { success: false, error: "Unauthorized. You do not own this listing." }
    }

    const validated = ProductSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Dynamic slug update only if name changed
    let uniqueSlug = product.slug
    if (formData.name !== product.name) {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      uniqueSlug = slug
      let count = 1
      while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
        uniqueSlug = `${slug}-${count}`
        count++
      }
    }

    Object.assign(product, validated.data)
    product.slug = uniqueSlug
    if (formData.seoMetadata) {
      product.seoMetadata = formData.seoMetadata
    }

    await product.save()

    return { success: true, product: JSON.parse(JSON.stringify(product)) }
  } catch (error: any) {
    console.error("Error updating product:", error)
    return { success: false, error: "Failed to update product." }
  }
}

export async function deleteProduct(id: string) {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Unauthorized." }

    await connectDB()
    const product = await Product.findById(id)
    if (!product) return { success: false, error: "Product not found." }

    const seller = await Seller.findOne({ user: user.id })
    if (user.role !== "admin" && (!seller || product.seller.toString() !== seller._id.toString())) {
      return { success: false, error: "Unauthorized." }
    }

    await Product.findByIdAndDelete(id)
    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product." }
  }
}

// Advanced global search query
export async function queryProducts(params: {
  q?: string
  category?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  minQty?: number
  verified?: boolean
  rating?: number
  page?: number
  limit?: number
}) {
  try {
    await connectDB()

    const query: Record<string, any> = {}

    // 1. Text Search
    if (params.q) {
      query.$text = { $search: params.q }
    }

    // 2. Category Filter
    if (params.category) {
      // Find category and children subcategories
      const cat = await Category.findOne({ slug: params.category })
      if (cat) {
        const subcategories = await Category.find({ parentCategory: cat._id })
        const ids = [cat._id, ...subcategories.map((sc) => sc._id)]
        query.category = { $in: ids }
      }
    }

    // 3. Pricing Filter
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      query.price = {}
      if (params.minPrice !== undefined) query.price.$gte = params.minPrice
      if (params.maxPrice !== undefined) query.price.$lte = params.maxPrice
    }

    // 4. MoQ Filter
    if (params.minQty !== undefined) {
      query.minOrderQuantity = { $lte: params.minQty }
    }

    // 5. Seller Filters (Location & Verification status)
    let sellerIds: any[] = []
    const sellerQuery: Record<string, any> = {}

    if (params.location) {
      sellerQuery["contactInfo.address"] = { $regex: params.location, $options: "i" }
    }
    if (params.verified) {
      sellerQuery.isVerified = true
    }

    if (params.location || params.verified) {
      const sellers = await Seller.find(sellerQuery).select("_id")
      sellerIds = sellers.map((s) => s._id)
      query.seller = { $in: sellerIds }
    }

    // 6. Rating Filter
    if (params.rating) {
      query.rating = { $gte: params.rating }
    }

    const page = params.page || 1
    const limit = params.limit || 24
    const skip = (page - 1) * limit

    // Execute with sorting: Sponsored listing priority, then rating/time
    const products = await Product.find(query)
      .populate({
        path: "seller",
        select: "companyName slug logo isVerified subscriptionPlan contactInfo",
      })
      .populate("category", "name slug")
      .sort({ isSponsored: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Product.countDocuments(query)

    return {
      products: JSON.parse(JSON.stringify(products)),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error("Search query products error:", error)
    return { products: [], total: 0, pages: 1, currentPage: 1 }
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await connectDB()
    const product = await Product.findOne({ slug })
      .populate({
        path: "seller",
        populate: { path: "user", select: "name" },
      })
      .populate("category")
      .lean()

    if (!product) return null
    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    console.error("Error fetching product by slug:", error)
    return null
  }
}

// ---------------- AI Helpers ----------------
export async function getAIDescriptionAction(name: string, keywords: string[]) {
  return await generateDescAI(name, keywords)
}

export async function getAITagsAction(name: string, description: string) {
  return await generateTagsAI(name, description)
}

export async function getAISEOAction(name: string, description: string) {
  return await generateSEOAI(name, description)
}
