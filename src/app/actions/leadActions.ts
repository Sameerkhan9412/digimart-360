"use server"

import { connectDB } from "src/lib/database/db"
import { Lead } from "src/lib/database/models/Lead"
import { Seller } from "src/lib/database/models/Seller"
import { Product } from "src/lib/database/models/Product"
import { getAuthUser } from "src/lib/auth/jwt"
import { LeadSchema } from "src/lib/validation"
import { sendLeadNotificationEmail } from "src/lib/email"
import { scoreLead as runLeadScorer } from "src/lib/ai"

export async function createLeadInquiry(formData: any) {
  try {
    await connectDB()

    const validated = LeadSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const {
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerCompany,
      message,
      quantity,
      targetPrice,
      product,
      seller,
    } = validated.data

    // Find seller
    const sellerDoc = await Seller.findById(seller).populate("user", "email name")
    if (!sellerDoc) {
      return { success: false, error: "Seller storefront not found." }
    }

    // Resolve optional product name
    let productName = "General Product Inquiry"
    if (product) {
      const prod = await Product.findById(product)
      if (prod) {
        productName = prod.name
      }
    }

    // Resolve optional logged-in buyer user
    const currentUser = await getAuthUser()
    const buyerUserId = currentUser && currentUser.role === "buyer" ? currentUser.id : undefined

    // 1. Initial AI Score in the background
    const scoreResult = await runLeadScorer(message, quantity, targetPrice, buyerCompany)

    // 2. Create lead
    const lead = await Lead.create({
      buyer: buyerUserId,
      buyerDetails: {
        name: buyerName,
        email: buyerEmail,
        phone: buyerPhone,
        company: buyerCompany || "",
      },
      seller: sellerDoc._id,
      product: product || undefined,
      message,
      quantity,
      targetPrice: targetPrice || undefined,
      status: "new",
      leadScore: scoreResult.score,
      notes: [
        {
          text: `AI Lead Score: ${scoreResult.score}/100. Reasoning: ${scoreResult.reasoning}`,
          author: "DIGIMART360 AI Engine",
          date: new Date(),
        },
      ],
      activities: [
        {
          action: "Lead Created",
          description: `Inquiry submitted for ${productName}.`,
          date: new Date(),
        },
      ],
    })

    // 3. Dispatch Email Alert to Seller
    const sellerUserEmail = (sellerDoc.user as any)?.email || sellerDoc.contactInfo.email
    const sellerUserName = (sellerDoc.user as any)?.name || sellerDoc.companyName
    await sendLeadNotificationEmail(
      sellerUserEmail,
      sellerUserName,
      buyerName,
      productName,
      quantity,
      message
    )

    return { success: true, lead: JSON.parse(JSON.stringify(lead)) }
  } catch (error: any) {
    console.error("Error creating inquiry:", error)
    return { success: false, error: error.message || "Failed to submit inquiry." }
  }
}

export async function getSellerLeads() {
  try {
    const user = await getAuthUser()
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return { success: false, error: "Unauthorized." }
    }

    await connectDB()

    const seller = await Seller.findOne({ user: user.id })
    if (!seller && user.role !== "admin") {
      return { success: false, error: "Seller profile not found." }
    }

    const query = user.role === "admin" ? {} : { seller: seller?._id }

    const leads = await Lead.find(query)
      .populate("product", "name slug images")
      .sort({ createdAt: -1 })
      .lean()

    return { success: true, leads: JSON.parse(JSON.stringify(leads)) }
  } catch (error) {
    console.error("Error getting seller leads:", error)
    return { success: false, error: "Failed to load leads." }
  }
}

export async function getBuyerInquiries() {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Unauthorized." }

    await connectDB()

    const leads = await Lead.find({ buyer: user.id })
      .populate({
        path: "seller",
        select: "companyName slug logo",
      })
      .populate("product", "name slug images")
      .sort({ createdAt: -1 })
      .lean()

    return { success: true, inquiries: JSON.parse(JSON.stringify(leads)) }
  } catch (error) {
    console.error("Error getting buyer inquiries:", error)
    return { success: false, error: "Failed to load inquiries." }
  }
}

export async function updateLeadStage(id: string, status: "new" | "contacted" | "qualified" | "negotiation" | "won" | "lost") {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Unauthorized." }

    await connectDB()

    const lead = await Lead.findById(id)
    if (!lead) return { success: false, error: "Lead not found." }

    // Owner check
    const seller = await Seller.findOne({ user: user.id })
    if (user.role !== "admin" && (!seller || lead.seller.toString() !== seller._id.toString())) {
      return { success: false, error: "Unauthorized." }
    }

    const oldStatus = lead.status
    lead.status = status
    lead.activities.push({
      action: "Stage Updated",
      description: `Funnel pipeline shifted from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}.`,
      date: new Date(),
    })

    await lead.save()
    return { success: true, lead: JSON.parse(JSON.stringify(lead)) }
  } catch (error) {
    console.error("Error updating lead stage:", error)
    return { success: false, error: "Failed to update status." }
  }
}

export async function addLeadNote(id: string, noteText: string) {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Unauthorized." }

    await connectDB()

    const lead = await Lead.findById(id)
    if (!lead) return { success: false, error: "Lead not found." }

    const seller = await Seller.findOne({ user: user.id })
    if (user.role !== "admin" && (!seller || lead.seller.toString() !== seller._id.toString())) {
      return { success: false, error: "Unauthorized." }
    }

    const authorName = user.role === "admin" ? "Administrator" : seller?.companyName || "Seller"
    
    lead.notes.push({
      text: noteText,
      author: authorName,
      date: new Date(),
    })
    
    lead.activities.push({
      action: "Note Added",
      description: `New commentary added by ${authorName}.`,
      date: new Date(),
    })

    await lead.save()
    return { success: true, lead: JSON.parse(JSON.stringify(lead)) }
  } catch (error) {
    console.error("Error adding note:", error)
    return { success: false, error: "Failed to add comment note." }
  }
}

export async function triggerAILeadScoring(id: string) {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Unauthorized." }

    await connectDB()

    const lead = await Lead.findById(id)
    if (!lead) return { success: false, error: "Lead not found." }

    const seller = await Seller.findOne({ user: user.id })
    if (user.role !== "admin" && (!seller || lead.seller.toString() !== seller._id.toString())) {
      return { success: false, error: "Unauthorized." }
    }

    // Execute OpenAI score check
    const scoreResult = await runLeadScorer(
      lead.message,
      lead.quantity,
      lead.targetPrice,
      lead.buyerDetails.company
    )

    lead.leadScore = scoreResult.score
    lead.notes.push({
      text: `AI Lead Re-Scored: ${scoreResult.score}/100. Reasoning: ${scoreResult.reasoning} (${scoreResult.isMock ? 'Simulated AI' : 'Live OpenAI'})`,
      author: "DIGIMART360 AI Engine",
      date: new Date(),
    })
    lead.activities.push({
      action: "AI Score Evaluated",
      description: `Lead priority score updated to ${scoreResult.score}.`,
      date: new Date(),
    })

    await lead.save()
    return { success: true, lead: JSON.parse(JSON.stringify(lead)) }
  } catch (error) {
    console.error("Error scoring lead via AI action:", error)
    return { success: false, error: "Failed to compute lead scoring." }
  }
}

export async function getSourcingCatalogData() {
  try {
    await connectDB()

    const sellers = await Seller.find({})
      .select("companyName slug logo isVerified contactInfo")
      .sort({ companyName: 1 })
      .lean()

    const products = await Product.find({})
      .select("name slug seller price unit minOrderQuantity images")
      .sort({ name: 1 })
      .lean()

    return {
      success: true,
      sellers: JSON.parse(JSON.stringify(sellers)),
      products: JSON.parse(JSON.stringify(products)),
    }
  } catch (error: any) {
    console.error("Error fetching sourcing catalog data:", error)
    return { success: false, error: error.message || "Failed to fetch catalog data." }
  }
}

