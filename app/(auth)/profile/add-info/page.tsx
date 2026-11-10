import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { ProfileFormPage } from "@/components/profile-form-page"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Add profile info - HireLoop",
  description: "Add your career and personal details.",
}

/**
 * 📄 ফাইল: app/(auth)/profile/add-info/page.tsx
 * কাজ: AddInfo form-এর আলাদা page।
 *
 * Flow:
 * 1. Server-এ session check করি
 * 2. Client form দেখাই (এখন কোনো GET নেই)
 * 3. Save করলে POST /UserInfo-এ data যাবে
 */
export default async function AddInfoPage() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  // Login না থাকলে sign-in-এ পাঠাই; login শেষে আবার এই page-এ ফিরবে
  if (!session?.user) {
    redirect("/sign-in?redirect=/profile/add-info")
  }

  return <ProfileFormPage email={session.user.email} />
}
