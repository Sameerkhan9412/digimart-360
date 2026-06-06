"use server"

import { connectDB } from "src/lib/database/db"
import { Review } from "src/lib/database/models/Review"
import { Lead } from "src/lib/database/models/Lead"
import { Product } from "src/lib/database/models/Product"
import { User } from "src/lib/database/models/User"
import { getAuthUser } from "src/lib/auth/jwt"
import { revalidatePath } from "next/cache"

export async function createProductReview(payload: {
  leadId: string
  rating: number
  comment: string
}) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: "Authentication required to submit reviews." }
    }

    await connectDB()

    const { leadId, rating, comment } = payload

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: "Please provide a valid rating between 1 and 5." }
    }

    if (!comment || comment.trim().length < 5) {
      return { success: false, error: "Please write a comment of at least 5 characters." }
    }

    // 1. Fetch Lead details
    const lead = await Lead.findById(leadId)
    if (!lead) {
      return { success: false, error: "Source transaction record not found." }
    }

    // 2. Validate ownership & status
    if (lead.buyer?.toString() !== user.id) {
      return { success: false, error: "Unauthorized. You are not the buyer for this inquiry." }
    }

    if (lead.status !== "won") {
      return { success: false, error: "Reviews can only be submitted for completed transactions (won leads)." }
    }

    if (!lead.product) {
      return { success: false, error: "This inquiry is a general sourcing brief and does not map to a catalog product." }
    }

    // 3. Prevent duplicates
    const existingReview = await Review.findOne({ lead: leadId })
    if (existingReview) {
      return { success: false, error: "You have already reviewed this transaction." }
    }

    // 4. Fetch buyer user profile to get their name
    const userDoc = await User.findById(user.id)
    const buyerName = userDoc?.name || "Verified Buyer"

    // 4. Create review document
    const review = await Review.create({
      buyer: user.id,
      product: lead.product,
      seller: lead.seller,
      lead: leadId,
      rating,
      comment: comment.trim(),
      buyerName,
    })

    // 5. Recalculate average rating & count for Product
    const reviews = await Review.find({ product: lead.product })
    const count = reviews.length
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0)
    const avgRating = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0

    await Product.findByIdAndUpdate(lead.product, {
      rating: avgRating,
      reviewsCount: count,
    })

    // 6. Record activity in Lead history
    lead.activities.push({
      action: "Review Submitted",
      description: `Buyer submitted a ${rating}-star product review.`,
      date: new Date(),
    })
    await lead.save()

    // Revalidate relevant cache paths
    revalidatePath("/buyer")
    
    // Find product slug for revalidation
    const product = await Product.findById(lead.product)
    if (product) {
      revalidatePath(`/product/${product.slug}`)
    }

    return { success: true, review: JSON.parse(JSON.stringify(review)) }
  } catch (error: any) {
    console.error("Error creating review:", error)
    return { success: false, error: error.message || "Failed to submit review." }
  }
}

export async function getProductReviews(productId: string) {
  try {
    await connectDB()

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .lean()

    return { success: true, reviews: JSON.parse(JSON.stringify(reviews)) }
  } catch (error) {
    console.error("Error fetching product reviews:", error)
    return { success: false, error: "Failed to load reviews.", reviews: [] }
  }
}

export async function getBuyerReviewsMap() {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, reviewsMap: {} }

    await connectDB()

    const reviews = await Review.find({ buyer: user.id }).lean()
    
    const reviewsMap: Record<string, any> = {}
    reviews.forEach((rev) => {
      reviewsMap[rev.lead.toString()] = JSON.parse(JSON.stringify(rev))
    })

    return { success: true, reviewsMap }
  } catch (error) {
    console.error("Error fetching buyer reviews map:", error)
    return { success: false, reviewsMap: {} }
  }
}
