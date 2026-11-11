"use server"

import type { ProfileDetails } from "@/lib/user-info"
import { showToast } from "../../toast"

/**
 * 📄 ফাইল: lib/actions/userinfo.tsx
 * কাজ: শুধু AddInfo form-এর ডেটা backend-এ save করা।
 *
 * এখন এখানে GET নেই।
 * পরে তুমি নিজে backend থেকে user data GET করে cards বানাবে।
 *
 * Save → POST /UserInfo
 */
export async function saveUserInfo(email: string, details: ProfileDetails) {
  // 💡 .env-এ যেহেতু NEXT_PUBLIC_BACKEND_URL আছে, সেটাই ব্যবহার করছি।
  //    Backend URL বদলালে শুধু .env বদলাবে, কোড বদলাতে হবে না।
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!backendUrl) {
    showToast.error("something went rong")
  }

  const response = await fetch(`${backendUrl}/UserInfo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, details }),
  })

  // Backend 2xx না দিলে client-এর catch block error toast দেখাবে
  if (!response.ok) {
    showToast.error(`Error ${response.status}`)
  }
}
