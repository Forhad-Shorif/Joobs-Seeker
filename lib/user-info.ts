/**
 * 📄 ফাইল: lib/user-info.ts
 * কাজ: AddInfo form-এর field type + খালি form-এর default মান।
 *
 * ⚠️ Cover image এখানে নেই।
 * Cover image Better Auth user-এর `coverImage` field-এ ছোট URL হিসেবে থাকে।
 * (দেখো: lib/auth.ts + components/profile-view.tsx)
 */

// AddInfo form-এর সব field-এর ধরন
export type ProfileDetails = {
  headline: string
  skills: string[]
  experience: string
  status: string
  phone: string
  city: string
  dateOfBirth: string
  gender: string
  nationality: string
  nationalId: string
  homeAddress: string
  permanentAddress: string
  personalDetails: string
}

// Form প্রথম খোলার সময় এই খালি মানগুলো দেখায়
export const emptyProfileDetails: ProfileDetails = {
  headline: "",
  skills: [],
  experience: "",
  status: "Open to work",
  phone: "",
  city: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  nationalId: "",
  homeAddress: "",
  permanentAddress: "",
  personalDetails: "",
}
