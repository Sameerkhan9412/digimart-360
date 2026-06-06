"use server"

import { connectDB } from "src/lib/database/db"
import { Seller } from "src/lib/database/models/Seller"
import { User } from "src/lib/database/models/User"
import { getAuthUser } from "src/lib/auth/jwt"
import { sendVerificationUpdateEmail } from "src/lib/email"

export async function getPendingSellers() {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized." }
    }

    await connectDB()
    const sellers = await Seller.find({
      verificationStatus: { $in: ["under_review", "pending", "rejected"] },
    })
      .populate("user", "name email")
      .sort({ updatedAt: -1 })
      .lean()

    return { success: true, sellers: JSON.parse(JSON.stringify(sellers)) }
  } catch (error) {
    console.error("Error fetching pending sellers:", error)
    return { success: false, error: "Failed to fetch audit queue." }
  }
}

export async function updateSellerVerification(
  sellerId: string,
  status: "approved" | "rejected",
  rejectionReason?: string
) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized access." }
    }

    await connectDB()

    const seller = await Seller.findById(sellerId).populate("user", "name email")
    if (!seller) {
      return { success: false, error: "Seller profile not found." }
    }

    // Update statuses
    seller.verificationStatus = status
    seller.isVerified = status === "approved"
    await seller.save()

    // Trigger Nodemailer alert
    const sellerUser = seller.user as any
    const emailTo = sellerUser?.email || seller.contactInfo.email
    const nameTo = sellerUser?.name || seller.companyName

    await sendVerificationUpdateEmail(emailTo, nameTo, status, rejectionReason)

    return { success: true, message: `Seller verification status set to ${status.toUpperCase()} successfully.` }
  } catch (error: any) {
    console.error("Verification update error:", error)
    return { success: false, error: error.message || "Failed to update status." }
  }
}
