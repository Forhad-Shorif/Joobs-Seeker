"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { setProfessional } from "@/lib/everything/subscription"

/**
 * 📄 components/Seeker/return-to-page.tsx
 * ==================================================================
 * 📌 কী: /success পেজে payment verify হওয়ার পরে এই component চলে।
 *
 * 📌 কেন দরকার:
 *      payment সফল হয়েছে → এখন (ক) plan professional করতে হবে,
 *      (খ) user-কে আগের পেজে ফেরত পাঠাতে হবে।
 *
 * 📌 কী করে:
 *      ১. setProfessional() → localStorage-এ plan "professional" হয়
 *         → এরপর ApplyBtn আর ১০টার limit দেখবে না
 *      ২. ১.২ সেকেন্ড পরে router.replace(href) → আগের পেজে ফেরত
 *         (replace, তাই back চাপলে আবার success পেজে আসবে না)
 *      ৩. "Continue" বাটনে চাপলে সাথে সাথে ফিরে যায়
 *
 * 📦 কোথা থেকে আসে:
 *      href → /success পেজের `from` (Stripe success_url থেকে)
 *
 * ⚠️ plan localStorage-এ রাখা হচ্ছে (simple)। real project-এ Stripe
 *      webhook দিয়ে backend-এ plan save করাই সঠিক।
 * ==================================================================
 */
export function ReturnToPage({ href }: { href: string }) {
  const router = useRouter()

  useEffect(() => {
    setProfessional()

    const timer = setTimeout(() => router.replace(href), 1200)
    return () => clearTimeout(timer)
  }, [href, router])

  return (
    <button
      type="button"
      onClick={() => router.replace(href)}
      className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
    >
      Continue
    </button>
  )
}
