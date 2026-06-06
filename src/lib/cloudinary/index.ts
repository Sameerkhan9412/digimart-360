import { v2 as cloudinary } from "cloudinary"

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ""
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ""
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ""

const isConfigured = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  })
} else {
  console.warn("WARNING: Cloudinary is not configured. Media files will fall back to premium mock URLs.")
}

export async function uploadToCloudinary(fileBuffer: Buffer, folder: string): Promise<string> {
  if (!isConfigured) {
    // Return high quality placeholder
    return `https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600&auto=format&fit=crop`
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "auto" }, (error, result) => {
        if (error) return reject(error)
        resolve(result?.secure_url || "")
      })
      .end(fileBuffer)
  })
}

export async function uploadBase64ToCloudinary(base64Str: string, folder: string): Promise<string> {
  if (!isConfigured) {
    if (folder.includes("document")) {
      return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
    return `https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=800&auto=format&fit=crop`
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Str, {
      folder,
      resource_type: "auto",
    })
    return uploadResponse.secure_url
  } catch (error) {
    console.error("Cloudinary base64 upload error:", error)
    throw error
  }
}
