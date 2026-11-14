import type { Metadata } from "next"
import { headers } from "next/headers"

import { PaymentView } from "@/components/Seeker/payment-view"
import { auth } from "@/lib/auth"

/**
 * 📄 app/payment/page.tsx
 * কাজ: Subscription & Billing page।
 *
 * কখন আসে?
 *  - ApplyBtn-এ ১০টার বেশি apply করতে গেলে:
 *    /payment?from=/browse-jobs/detailsjobs/xxxx
 *  - Dashboard sidebar-এর "Billing"-এ click করলেও এখানেই আসে।
 *
 * Payment হলে PaymentView আবার `from` page-এ replace করে দেয়,
 * তাই user ঠিক যেখানে ছিল সেখানেই ফিরে যায়।
 */

export const metadata: Metadata = {
  title: "Subscription & Billing | HireLoop",
  description:
    "Manage your professional tier features, recurring payments, and billing history.",
}

// session (headers) দরকার, তাই প্রতিবার request-time-এ render হবে
export const dynamic = "force-dynamic"

type PageProps = {
  searchParams: Promise<{ from?: string | string[] }>
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const { from } = await searchParams
  const fromValue = Array.isArray(from) ? from[0] : from

  // শুধু app-এর ভিতরের path-এ ফেরত যাই (external URL নয়)
  const returnTo =
    fromValue && fromValue.startsWith("/") ? fromValue : "/dashboard/seeker"

  // topbar-এ user-এর নাম/ছবি দেখানোর জন্য; session না থাকলেও page ভাঙবে না
  let userName: string | undefined
  let userImage: string | undefined

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    userName = session?.user?.name ?? undefined
    userImage = session?.user?.image ?? undefined
  } catch {
    // session/backend সমস্যা হলে default নাম দেখাবে
  }

  return (
    <PaymentView
      returnTo={returnTo}
      // `from` থাকার মানে ApplyBtn থেকে পাঠানো হয়েছে (limit শেষ)
      showLimitNotice={Boolean(fromValue)}
      userName={userName}
      userImage={userImage}
    />
  )
}
