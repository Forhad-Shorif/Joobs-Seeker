"use server"

import { createHash } from "node:crypto"

/**
 * 📄 ফাইল: lib/actions/upload-image.ts
 * কাজ: Browser-এ compress করা image data URL কে Cloudinary-তে upload করে
 *       ছোট `https://res.cloudinary.com/...` URL return করা।
 *
 * কেন এটা দরকার?
 * - MongoDB-তে base64 (data:image/...) রাখলে অনেক বড় string হয়।
 * - MongoDB document limit 16MB, আর বড় string DB/request দুটোই slow করে।
 * - তাই: File → ছোট WebP → Cloudinary → URL → MongoDB।
 *
 * .env-এ এই ৩টা key লাগবে:
 *   CLOUDINARY_CLOUD_NAME=...
 *   CLOUDINARY_API_KEY=...
 *   CLOUDINARY_API_SECRET=...
 *
 * ⚠️ API secret কখনো client-এ রাখা যাবে না, তাই এটা server action।
 */

export async function uploadImageToCloudinary(dataUrl: string) {
  // শুধু image data URL accept করি — অন্য কিছু হলে upload করবো না
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Invalid image data.")
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  // Env missing হলে পরিষ্কার error দিই — base64 যেন MongoDB-তে না যায়
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env",
    )
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = "hireloop/profiles"

  // Cloudinary signed upload-এর জন্য SHA-1 signature বানাতে হয়।
  // Params alphabetically: folder তারপর timestamp, শেষে api_secret।
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex")

  // Cloudinary-র upload API body হিসেবে FormData চায়
  const formData = new FormData()
  formData.append("file", dataUrl)
  formData.append("api_key", apiKey)
  formData.append("timestamp", String(timestamp))
  formData.append("folder", folder)
  formData.append("signature", signature)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Cloudinary upload failed: ${response.status} ${message}`)
  }

  const data = (await response.json()) as { secure_url?: string }

  // URL না পেলে error — Mongo-তে কিছুই save হবে না
  if (!data.secure_url) {
    throw new Error("Cloudinary upload failed: no URL returned")
  }

  return data.secure_url
}
