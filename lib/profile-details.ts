/**
 * 📄 ফাইল: lib/profile-details.ts
 * কাজ: প্রোফাইল ফর্মের ডেটা load/save করা।
 *
 * এখন ডেটা থাকে browser-এর localStorage-এ (ডেমো)।
 * backend বানালে শুধু নিচের দুটি ফাংশনের ভেতরে fetch() বসাবে:
 *   - loadProfileDetails(email) → backend থেকে ডেটা আনে
 *   - saveProfileDetails(email, details) → backend-এ ডেটা পাঠায়
 *
 * মনে রাখো: userId নয়, user-এর email দিয়েই ডেটা যায়।
 */

// ফর্মের সব ফিল্ডের ডেটার ধরন (TypeScript type)
export type ProfileDetails = {
  headline: string
  skills: string[]
  experience: string
  status: string
  phone: string
  city: string
  homeAddress: string
  personalDetails: string
  coverImage: string
}

// ফর্ম প্রথম খোলার সময় এই খালি মানগুলো দেখায়
export const emptyProfileDetails: ProfileDetails = {
  headline: "",
  skills: [],
  experience: "",
  status: "Open to work",
  phone: "",
  city: "",
  homeAddress: "",
  personalDetails: "",
  coverImage: "",
}

// email দিয়ে localStorage-এর key বানায় → "hireloop-profile-details:<email>"
function storageKey(email: string) {
  return `hireloop-profile-details:${email.toLowerCase()}`
}

/**
 * লোড: প্রোফাইল পেজ খুললে email দিয়ে আগের সেভ করা ডেটা আনে।
 * ডেটা না থাকলে খালি ফর্ম (emptyProfileDetails) ফেরত দেয়।
 */
export async function loadProfileDetails(
  email: string
): Promise<ProfileDetails> {
  // localStorage শুধু ব্রাউজারে পাওয়া যায়
  if (typeof window === "undefined") return { ...emptyProfileDetails }

  try {
    const saved = window.localStorage.getItem(storageKey(email))
    if (!saved) return { ...emptyProfileDetails }

    // পুরোনো/মিসিং ফিল্ডের জন্য ডিফল্ট মানের সাথে মিশিয়ে দেয়
    const parsed = JSON.parse(saved) as Partial<ProfileDetails>
    return { ...emptyProfileDetails, ...parsed }
  } catch (error) {
    console.error("Could not load profile details:", error)
    return { ...emptyProfileDetails }
  }
}

/**
 * সেভ: ফর্মের "Save details" বাটনে চাপলে এই ফাংশন চলে।
 *
 * backend-এ পাঠাতে হলে নিচের comment-এর মতো করো:
 *   await fetch("/api/profile-details", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ email, details }),
 *   })
 */
export async function saveProfileDetails( 
  email: string,
  details: ProfileDetails
): Promise<void> {
  if (typeof window === "undefined") return

  // এখন ডেমো হিসেবে ব্রাউজারে সেভ হচ্ছে
  window.localStorage.setItem(storageKey(email), JSON.stringify(details))
}

/**
 * কভার ছবি আলাদাভাবে সেভ করে।
 * আগের সেভ করা ডেটা পড়ে শুধু coverImage বদলে আবার সেভ করে,
 * তাই ফর্মের অসেভ করা বাকি এডিটগুলো এর সাথে যায় না।
 */
export async function saveProfileCover(
  email: string,
  coverImage: string
): Promise<void> {
  const current = await loadProfileDetails(email)
  await saveProfileDetails(email, { ...current, coverImage })
}
