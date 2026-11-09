/**
 * 🖼️ IMAGE HELPER
 * ------------------------------------------------------------------
 * User je chobi upload kore, seta ke amra choto kore "data URL" (base64)
 * banai. Ei data URL ta database e string hisebe save kora jay.
 *
 * Kano choto kori?
 * - Boro chobi (5MB) base64 hole 6-7MB string hoy.
 * - Vercel er moto hosting e request size limit ~4.5MB, tai fail korte pare.
 * - Profile picture 512px holei enough, quality o thik thake.
 */

/**
 * STEP 1: File ke browser e read kore ekta data URL banai.
 * Example output: "data:image/png;base64,iVBORw0KG..."
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    // File successfully read hole ei function call hobe
    reader.onload = () => resolve(String(reader.result))

    // Kono problem hole error throw hobe
    reader.onerror = () => reject(new Error("Could not read the image file."))

    reader.readAsDataURL(file)
  })
}

/**
 * STEP 2: Data URL ke ekta <img> element e load kori,
 * jate chobir width/height jana jay.
 */
function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Invalid image file."))

    image.src = source
  })
}

/**
 * MAIN FUNCTION 👉 compressImage(file)
 * ------------------------------------------------------------------
 * - Chobi ke max 512px e resize kore
 * - WebP format e convert kore (quality 85%)
 * - Return kore ekta choto data URL string
 *
 * Use kora hoy: signup form (avatar) + profile page (avatar).
 */
export async function compressImage(file: File, maxSize = 512, quality = 0.85): Promise<string> {
  const originalDataUrl = await fileToDataUrl(file)
  const image = await loadImage(originalDataUrl)

  // Chobi maxSize er cheye boro hole scale koto hobe hisab kori
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  // Canvas diye chobi ta notun size e draw kori
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")

  // Kono karone canvas na pele original data URL return kori
  if (!context) return originalDataUrl

  context.drawImage(image, 0, 0, width, height)

  // WebP support na thakle browser data: (empty) return kore,
  // tokhon original data URL use kori.
  const compressed = canvas.toDataURL("image/webp", quality)
  return compressed.startsWith("data:image/webp") ? compressed : originalDataUrl
}
