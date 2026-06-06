"use server"

import { connectDB } from "src/lib/database/db"
import { User } from "src/lib/database/models/User"
import { Seller } from "src/lib/database/models/Seller"
import {
  hashPassword,
  comparePassword,
  generateOTP,
  setAuthCookies,
  clearAuthCookies,
  getAuthUser,
} from "src/lib/auth/jwt"
import { sendOTPEmail } from "src/lib/email"
import { RegisterSchema, LoginSchema, VerifyOTPSchema, ResetPasswordSchema } from "src/lib/validation"
import { revalidatePath } from "next/cache"

export async function registerUser(formData: any) {
  try {
    await connectDB()

    const validated = RegisterSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { name, email, password, role } = validated.data

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return { success: false, error: "Email address is already registered." }
    }

    const passwordHash = await hashPassword(password)
    const { code: otpCode, expiresAt: otpExpires } = generateOTP()

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      otpCode,
      otpExpires,
      isVerified: false,
    })

    // If seller, initialize their default profile too
    if (role === "seller") {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      // Ensure unique slug
      let uniqueSlug = slug
      let count = 1
      while (await Seller.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${count}`
        count++
      }

      await Seller.create({
        user: newUser._id,
        companyName: name,
        slug: uniqueSlug,
        contactInfo: {
          phone: "9999999999", // placeholder
          email: email,
        },
        isVerified: false,
        verificationStatus: "pending",
        verificationDocuments: [],
        timeline: [],
        certifications: [],
      })
    }

    // Send OTP Email
    await sendOTPEmail(email, otpCode, name)

    return {
      success: true,
      message: "Registration successful. Please verify the OTP sent to your email.",
      email: newUser.email,
    }
  } catch (error: any) {
    console.error("Registration action error:", error)
    return { success: false, error: "An unexpected error occurred during signup." }
  }
}

export async function loginUser(formData: any) {
  try {
    await connectDB()

    const validated = LoginSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { email, password } = validated.data

    const user = await User.findOne({ email })
    if (!user) {
      return { success: false, error: "Invalid email or password." }
    }

    const match = await comparePassword(password, user.passwordHash)
    if (!match) {
      return { success: false, error: "Invalid email or password." }
    }

    if (!user.isVerified) {
      // Re-trigger OTP
      const { code: otpCode, expiresAt: otpExpires } = generateOTP()
      user.otpCode = otpCode
      user.otpExpires = otpExpires
      await user.save()

      await sendOTPEmail(email, otpCode, user.name)

      return {
        success: false,
        isUnverified: true,
        email: user.email,
        error: "Your account is not verified yet. A new verification OTP code has been sent.",
      }
    }

    await setAuthCookies(user)

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  } catch (error: any) {
    console.error("Login action error:", error)
    return { success: false, error: "An unexpected error occurred during login." }
  }
}

export async function verifyOTP(formData: { email: string; otp: string }) {
  try {
    await connectDB()

    const validated = VerifyOTPSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { email, otp } = validated.data

    const user = await User.findOne({ email })
    if (!user) {
      return { success: false, error: "User not found." }
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return { success: false, error: "OTP expired. Please request a new one." }
    }

    if (user.otpCode !== otp) {
      return { success: false, error: "Invalid OTP code. Please check and try again." }
    }

    // Clear OTP and activate user
    user.otpCode = undefined
    user.otpExpires = undefined
    user.isVerified = true
    await user.save()

    // If seller, toggle basic verification helper or leave for admin validation
    await setAuthCookies(user)

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  } catch (error: any) {
    console.error("OTP verification error:", error)
    return { success: false, error: "Error verifying OTP code." }
  }
}

export async function resendOTP(email: string) {
  try {
    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return { success: false, error: "User not found." }
    }

    const { code: otpCode, expiresAt: otpExpires } = generateOTP()
    user.otpCode = otpCode
    user.otpExpires = otpExpires
    await user.save()

    await sendOTPEmail(email, otpCode, user.name)

    return { success: true, message: "A new OTP code has been sent successfully." }
  } catch (error) {
    console.error("Resend OTP error:", error)
    return { success: false, error: "Error resending OTP." }
  }
}

export async function logoutUser() {
  await clearAuthCookies()
  return { success: true }
}

export async function getCurrentUser() {
  try {
    const userPayload = await getAuthUser()
    if (!userPayload) return null

    await connectDB()
    const user = await User.findById(userPayload.id).select("-passwordHash")
    if (!user) return null

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone || "",
      company: user.company || "",
    }
  } catch {
    return null
  }
}

export async function updateBuyerProfile(payload: {
  name: string
  phone: string
  company?: string
}) {
  try {
    const userPayload = await getAuthUser()
    if (!userPayload) {
      return { success: false, error: "Authentication required to update profile." }
    }

    await connectDB()

    const { name, phone, company } = payload

    if (!name || name.trim().length < 2) {
      return { success: false, error: "Full Name must be at least 2 characters." }
    }

    if (!phone || phone.trim().length < 10) {
      return { success: false, error: "A valid phone number of at least 10 digits is required." }
    }

    const user = await User.findById(userPayload.id)
    if (!user) {
      return { success: false, error: "Buyer profile not found." }
    }

    user.name = name.trim()
    user.phone = phone.trim()
    user.company = company?.trim() || ""

    await user.save()

    // Revalidate paths to refresh cached session data
    revalidatePath("/buyer")
    revalidatePath("/buyer/profile")

    return { 
      success: true, 
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        company: user.company,
      }
    }
  } catch (error: any) {
    console.error("Error updating buyer profile:", error)
    return { success: false, error: error.message || "Failed to update profile." }
  }
}

export async function forgotPassword(email: string) {
  try {
    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      // Return success to prevent email enumeration, but log internally
      return { success: true, message: "If the email is registered, a password reset code has been sent." }
    }

    const { code: otpCode, expiresAt: otpExpires } = generateOTP()
    user.otpCode = otpCode
    user.otpExpires = otpExpires
    await user.save()

    await sendOTPEmail(email, otpCode, user.name)

    return { success: true, message: "A password reset OTP code has been sent to your email." }
  } catch (error) {
    console.error("Forgot password error:", error)
    return { success: false, error: "Error triggering forgot password request." }
  }
}

export async function resetPassword(formData: any) {
  try {
    await connectDB()

    const validated = ResetPasswordSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { email, otp, password } = validated.data

    const user = await User.findOne({ email })
    if (!user) {
      return { success: false, error: "Invalid email or OTP." }
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return { success: false, error: "OTP has expired. Please request a new one." }
    }

    if (user.otpCode !== otp) {
      return { success: false, error: "Invalid OTP code." }
    }

    // Set new password hash and clear OTP
    user.passwordHash = await hashPassword(password)
    user.otpCode = undefined
    user.otpExpires = undefined
    user.isVerified = true
    await user.save()

    return { success: true, message: "Password has been reset successfully. You can now log in." }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "Error resetting password." }
  }
}
