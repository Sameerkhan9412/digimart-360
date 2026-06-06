"use server"

import { connectDB } from "src/lib/database/db"
import { Setting } from "src/lib/database/models/Setting"
import { getAuthUser } from "src/lib/auth/jwt"

export async function getAdminAISettings() {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized access." }
    }

    await connectDB()
    const apiKeySetting = await Setting.findOne({ key: "openai_api_key" })
    const modelSetting = await Setting.findOne({ key: "openai_model" })

    // Mask API Key for security when sending to frontend
    const rawKey = apiKeySetting?.value || ""
    const maskedKey = rawKey.length > 8 
      ? `${rawKey.substring(0, 4)}...${rawKey.substring(rawKey.length - 4)}` 
      : rawKey

    return {
      success: true,
      apiKey: maskedKey,
      hasKey: !!rawKey,
      model: modelSetting?.value || "gpt-4o-mini",
    }
  } catch (error) {
    console.error("Error fetching admin AI settings:", error)
    return { success: false, error: "Failed to fetch settings." }
  }
}

export async function saveAdminAISettings(data: { apiKey?: string; model?: string }) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized access." }
    }

    await connectDB()

    // 1. Save OpenAI API key if provided (and not the masked representation)
    if (data.apiKey !== undefined && !data.apiKey.includes("...")) {
      await Setting.findOneAndUpdate(
        { key: "openai_api_key" },
        { key: "openai_api_key", value: data.apiKey },
        { upsert: true, new: true }
      )
    }

    // 2. Save Model Selection
    if (data.model !== undefined) {
      await Setting.findOneAndUpdate(
        { key: "openai_model" },
        { key: "openai_model", value: data.model },
        { upsert: true, new: true }
      )
    }

    return { success: true, message: "AI Configuration settings updated successfully." }
  } catch (error) {
    console.error("Error saving admin AI settings:", error)
    return { success: false, error: "Failed to update configurations." }
  }
}
