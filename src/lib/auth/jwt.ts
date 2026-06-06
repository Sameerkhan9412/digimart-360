import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { connectDB } from "../database/db"
import { User } from "../database/models/User"

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret-digimart"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret-digimart"

export interface IUserPayload {
  id: string
  email: string
  role: "admin" | "seller" | "buyer"
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateAccessToken(user: { _id: any; email: string; role: string }): string {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: "1h" } // Longer expiry for B2B ease
  )
}

export function generateRefreshToken(user: { _id: any; email: string; role: string }): string {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  )
}

export function verifyAccessToken(token: string): IUserPayload | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as IUserPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): IUserPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as IUserPayload
  } catch {
    return null
  }
}

export function generateOTP() {
  const code = Math.floor(100000 + Math.random() * 900000).toString() // 6 digits
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 mins expiry
  return { code, expiresAt }
}

// Set HTTP-only cookies in server scope
export async function setAuthCookies(user: { _id: any; email: string; role: string }) {
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  const cookieStore = await cookies()

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600, // 1 hour
    path: "/",
  })

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 3600, // 7 days
    path: "/",
  })
}

// Clear cookies
export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
  cookieStore.delete("refresh_token")
}

// Get and verify the currently logged-in user from cookies
export async function getAuthUser(): Promise<IUserPayload | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (accessToken) {
    const payload = verifyAccessToken(accessToken)
    if (payload) {
      return payload
    }
  }

  // Fallback to refresh token if access token is expired/missing
  const refreshToken = cookieStore.get("refresh_token")?.value
  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken)
    if (payload) {
      await connectDB()
      const user = await User.findById(payload.id)
      if (user && user.isVerified) {
        // Issue new access token and set cookies
        await setAuthCookies(user)
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        }
      }
    }
  }

  return null
}
