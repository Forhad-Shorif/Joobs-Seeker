import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { ProfileView } from "@/components/profile-view"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "My profile - HireLoop",
  description: "Manage your HireLoop profile, photo and career details.",
}

/**
 * 📄 ফাইল: app/profile/page.tsx (server page)
 * কাজ: সার্ভারে চেক করে ইউজার লগইন করা আছে কি না।
 *  - লগইন না থাকলে → /sign-in?redirect=/profile এ পাঠায়
 *  - লগইন থাকলে → client component (ProfileView) render করে
 * এই চেক সার্ভারে হওয়ায় পেজ লোডের আগেই unauthorized ইউজার ফিরে যায়।
 */
export default async function ProfilePage() {
  // রিকোয়েস্টের headers থেকে লগইন session বের করে
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  // ইউজার না থাকলে সাইন-ইন পেজে পাঠায়; সাইন-ইন শেষে আবার এখানেই ফিরবে
  if (!session?.user) {
    redirect("/sign-in?redirect=/profile")
  }

  // client component-এ শুধু দরকারি তথ্য পাঠায় (id নয়, email-ই যথেষ্ট)
  return (
    <ProfileView
      initialUser={{
        name: session.user.name || "",
        email: session.user.email,
        image: session.user.image || "",
      }}
    />
  )
}
