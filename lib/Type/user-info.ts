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
  city: string
  dateOfBirth: string
  gender: string
  nationality: string
}

/**
 * MongoDB `userInfo` collection-এ যেভাবে save হয়।
 *
 * ⚠️ `_id` এখানে নেই — MongoDB নিজেই ObjectId বানায়।
 * Form থেকে কোনো id পাঠানো হয় না, শুধু email দিয়ে upsert হয়।
 */
export type ProfileDocument = ProfileDetails & {
  email: string
}

// Form প্রথম খোলার সময় এই খালি মানগুলো দেখায়
export const emptyProfileDetails: ProfileDetails = {
  headline: "",
  skills: [],
  experience: "",
  status: "Open to work",
  city: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
}
