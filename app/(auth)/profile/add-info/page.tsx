import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { ProfileFormPage } from "@/components/SheareProfile/profile-form-page"
import { getUserInfo } from "@/lib/SheareAction/ProfileAction/userinfo"
import { emptyProfileDetails } from "@/lib/Type/user-info"
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
 * 2. GET /UserInfo/:email দিয়ে আগের saved details আনি
 * 3. Client form-এ initial data বসাই
 * 4. Save করলে POST /UserInfo-এ data যাবে
 */
export default async function AddInfoPage() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  // Login না থাকলে sign-in-এ পাঠাই; login শেষে আবার এই page-এ ফিরবে
  if (!session?.user) {
    redirect("/sign-in?redirect=/profile/add-info")
  }

  let initialDetails = emptyProfileDetails

  try {
    initialDetails =
      (await getUserInfo(session.user.email)) ?? emptyProfileDetails
  } catch (error) {
    // Backend unavailable হলেও form খালি state-এ render হবে
    console.error("Could not load profile details:", error)
  }

  return (
    <ProfileFormPage
      email={session.user.email}
      initialDetails={initialDetails}
    />
  )
}
