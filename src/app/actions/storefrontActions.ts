"use server"

import { connectDB } from "src/lib/database/db"
import { Seller } from "src/lib/database/models/Seller"
import { Product } from "src/lib/database/models/Product"
import { getAuthUser } from "src/lib/auth/jwt"
import { SellerStorefrontSchema } from "src/lib/validation"

export async function getStorefrontBySlug(slug: string) {
  try {
    await connectDB()

    const seller = await Seller.findOne({ slug })
      .populate("user", "name email")
      .lean()

    if (!seller) return null

    // Fetch products belonging to this seller
    const products = await Product.find({ seller: seller._id })
      .sort({ createdAt: -1 })
      .lean()

    return {
      seller: JSON.parse(JSON.stringify(seller)),
      products: JSON.parse(JSON.stringify(products)),
    }
  } catch (error) {
    console.error("Error fetching storefront by slug:", error)
    return null
  }
}

export async function getSellerProfile() {
  try {
    const user = await getAuthUser()
    if (!user) return null

    await connectDB()
    const seller = await Seller.findOne({ user: user.id })
      .populate("user", "name email")
      .lean()

    if (!seller) return null
    return JSON.parse(JSON.stringify(seller))
  } catch (error) {
    console.error("Error fetching seller profile:", error)
    return null
  }
}

export async function updateSellerStorefront(formData: any) {
  try {
    const user = await getAuthUser()
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return { success: false, error: "Unauthorized." }
    }

    await connectDB()

    // Retrieve seller profile
    const seller = await Seller.findOne({ user: user.id })
    if (!seller) {
      return { success: false, error: "Seller profile not found." }
    }

    const validated = SellerStorefrontSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const {
      companyName,
      about,
      logo,
      banner,
      phone,
      email,
      address,
      whatsapp,
      contactPerson,
      timeline,
      certifications,
      theme,
    } = validated.data

    // Dynamic slug update only if companyName changes and is not admin
    let uniqueSlug = seller.slug
    if (companyName !== seller.companyName) {
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      uniqueSlug = slug
      let count = 1
      while (await Seller.findOne({ slug: uniqueSlug, _id: { $ne: seller._id } })) {
        uniqueSlug = `${slug}-${count}`
        count++
      }
    }

    seller.companyName = companyName
    seller.slug = uniqueSlug
    seller.about = about || ""
    if (logo) seller.logo = logo
    if (banner) seller.banner = banner
    
    seller.contactInfo = {
      phone,
      email,
      address: address || "",
      whatsapp: whatsapp || "",
      contactPerson: contactPerson || "",
    }
    
    seller.timeline = timeline || []
    seller.certifications = certifications || []
    
    if (theme) {
      seller.customTheme = {
        primaryColor: theme.primaryColor || "#009E49",
        secondaryColor: theme.secondaryColor || "#0F4C5C",
        font: theme.font || "Plus Jakarta Sans",
        layoutVariant: theme.layoutVariant || "modern",
      }
    }

    await seller.save()

    return { success: true, seller: JSON.parse(JSON.stringify(seller)) }
  } catch (error: any) {
    console.error("Error updating seller profile storefront:", error)
    return { success: false, error: error.message || "Failed to update profile." }
  }
}

export async function uploadVerificationDocuments(docUrls: string[]) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "seller") {
      return { success: false, error: "Unauthorized." }
    }

    await connectDB()
    const seller = await Seller.findOne({ user: user.id })
    if (!seller) return { success: false, error: "Seller not found." }

    // Update documents and shift status to 'under_review'
    seller.verificationDocuments = docUrls
    seller.verificationStatus = "under_review"
    await seller.save()

    return { success: true, seller: JSON.parse(JSON.stringify(seller)) }
  } catch (error) {
    console.error("Error uploading verification docs action:", error)
    return { success: false, error: "Failed to upload files." }
  }
}
