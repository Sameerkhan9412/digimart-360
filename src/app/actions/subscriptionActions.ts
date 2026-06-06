"use server"

import crypto from "crypto"
import Razorpay from "razorpay"
import { connectDB } from "src/lib/database/db"
import { Seller } from "src/lib/database/models/Seller"
import { getAuthUser } from "src/lib/auth/jwt"

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ""
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ""

const isRazorpayConfigured = !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)

// Subscriptions Pricing Plans configuration details
const SUBSCRIPTION_PRICING = {
  free: { price: 0, label: "Free Plan", productLimit: 10, leadLimit: 5 },
  silver: { price: 999, label: "Silver Tier", productLimit: 50, leadLimit: 25 },
  gold: { price: 2499, label: "Gold Corporate", productLimit: 200, leadLimit: 100 },
  platinum: { price: 4999, label: "Platinum Enterprise", productLimit: 9999, leadLimit: 9999 },
}

export async function createSubscriptionOrder(planName: "silver" | "gold" | "platinum") {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "seller") {
      return { success: false, error: "Unauthorized. Must be a seller to purchase subscriptions." }
    }

    await connectDB()
    const seller = await Seller.findOne({ user: user.id })
    if (!seller) return { success: false, error: "Seller profile not found." }

    const selectedPlan = SUBSCRIPTION_PRICING[planName]
    if (!selectedPlan) return { success: false, error: "Invalid subscription plan selected." }

    const amountInPaise = selectedPlan.price * 100 // Razorpay takes amounts in smallest currency unit

    // 1. If Razorpay is not configured, trigger a simulated checkout flow
    if (!isRazorpayConfigured) {
      console.warn("WARNING: Razorpay keys are not configured. Simulating order placement...")
      return {
        success: true,
        isMock: true,
        keyId: "mock_key_id_digimart",
        orderId: "order_mock_" + Math.random().toString(36).substring(7),
        amount: amountInPaise,
        currency: "INR",
        planName,
        companyName: seller.companyName,
        email: seller.contactInfo.email,
        phone: seller.contactInfo.phone,
      }
    }

    // 2. Initialize live client and create order
    const rzp = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    })

    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_sub_${seller._id.toString().substring(0, 10)}_${Date.now().toString().substring(5)}`,
      notes: {
        planName,
        sellerId: seller._id.toString(),
      },
    })

    return {
      success: true,
      isMock: false,
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName,
      companyName: seller.companyName,
      email: seller.contactInfo.email,
      phone: seller.contactInfo.phone,
    }
  } catch (error: any) {
    console.error("Error creating subscription order action:", error)
    return { success: false, error: error.message || "Failed to initiate payment." }
  }
}

export async function verifySubscriptionPayment(data: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  planName: "free" | "silver" | "gold" | "platinum"
  isMock: boolean
}) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "seller") {
      return { success: false, error: "Unauthorized." }
    }

    await connectDB()
    const seller = await Seller.findOne({ user: user.id })
    if (!seller) return { success: false, error: "Seller profile not found." }

    // 1. Signature Verification for Mock Orders
    if (data.isMock) {
      if (!data.razorpay_order_id.startsWith("order_mock_")) {
        return { success: false, error: "Security validation failed. Order tamper detected." }
      }
      
      // Update plan to database
      seller.subscriptionPlan = data.planName
      seller.subscriptionStatus = "active"
      seller.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Days expiry
      await seller.save()

      return {
        success: true,
        message: `Subscription upgraded to ${data.planName.toUpperCase()} successfully (Simulated payment).`,
        plan: data.planName,
      }
    }

    // 2. Signature Verification for Live Razorpay Payments
    if (!isRazorpayConfigured) {
      return { success: false, error: "Razorpay credentials not configured on the server." }
    }

    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex")

    if (generatedSignature !== data.razorpay_signature) {
      return { success: false, error: "Payment verification failed. Cryptographic signature mismatch." }
    }

    // Upgrade plan
    seller.subscriptionPlan = data.planName
    seller.subscriptionStatus = "active"
    seller.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Days expiry
    await seller.save()

    return {
      success: true,
      message: `Subscription upgraded to ${data.planName.toUpperCase()} successfully.`,
      plan: data.planName,
    }
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return { success: false, error: error.message || "Failed to verify payment." }
  }
}

// Action to cancel or downgrade subscription
export async function downgradeToFree() {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Unauthorized." }

    await connectDB()
    const seller = await Seller.findOne({ user: user.id })
    if (!seller) return { success: false, error: "Seller profile not found." }

    seller.subscriptionPlan = "free"
    seller.subscriptionStatus = "active"
    seller.subscriptionExpiresAt = undefined // free never expires
    await seller.save()

    return { success: true, message: "Downgraded to free plan. Limits reset." }
  } catch (error) {
    console.error("Subscription downgrade error:", error)
    return { success: false, error: "Error resetting plan." }
  }
}
