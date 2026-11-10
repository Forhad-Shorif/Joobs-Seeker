"use client"

/**
 * 📄 ফাইল: components/profile-form-page.tsx
 * কাজ: AddInfo form-এর page wrapper।
 *
 * কেন আলাদা component?
 * - `ProfileForm` আগে profile view-এর ভিতরে ছিল।
 * - এখন form আলাদা page-এ, তাই state এখানে রাখা হয়েছে।
 * - Save করলে `ProfileForm` নিজেই backend-এ POST করবে।
 *
 * 💡 হিন্ট: এখন কোনো GET নেই, তাই form খালি state থেকে শুরু হয়।
 *    পরে তুমি GET করে initial data বসাতে পারবে।
 */

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

import { ProfileForm } from "@/components/Profileform"
import { SiteHeader } from "@/components/site-header"
import { emptyProfileDetails, type ProfileDetails } from "@/lib/user-info"

export function ProfileFormPage({ email }: { email: string }) {
  // Form-এর সব field state এখানে থাকছে।
  // ProfileForm শুধু onChange দিয়ে নতুন details পাঠাবে।
  const [details, setDetails] = useState<ProfileDetails>({
    ...emptyProfileDetails,
  })

  return (
    <div className="min-h-svh bg-[#050505] text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Profile view-এ ফিরে যাওয়ার ছোট link */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Back to profile
        </Link>

        <div className="mt-6">
          <ProfileForm
            email={email}
            details={details}
            onDetailsChange={setDetails}
          />
        </div>
      </main>
    </div>
  )
}
