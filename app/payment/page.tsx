import type { Metadata } from "next"
import { headers } from "next/headers"

import { PaymentView, type BillingRecord } from "@/components/Seeker/payment-view"
import { auth } from "@/lib/auth"
import { getPayments } from "@/lib/SheareAction/SeekerAction/PaymentAction/payment-store"

/**
 * 📄 app/payment/page.tsx
 * ==================================================================
 * 📌 কী: Subscription & Billing পেজ (route: /payment)।
 *        Free user ১০টার বেশি apply করতে চাইলে এখানেই আসে।
 *
 * 📌 কে পাঠায়:
 *      ApplyBtn → ১০টা application হয়ে গেলে
 *      /payment?from=/browse-jobs/detailsjobs/xxxx
 *
 * 📌 এই পেজ কী করে:
 *      ১. URL-এর `from` পড়ে → payment শেষে কোথায় ফিরবে (returnTo)
 *      ২. `checkout` থাকলে ছোট message দেখায় (cancelled / failed)
 *      ৩. session থেকে user-এর নাম/ছবি/email নেয় (topbar-এর avatar-এর জন্য)
 *      ৪. ওই email দিয়ে MongoDB-র `payments` collection থেকে নিজের
 *         payment history আনে (getPayments) — শুধু আসল paid record
 *      ৫. সব UI + data prop আকারে PaymentView-কে দেয়
 *
 * 📌 payment-এর আসল কাজ কোথায়:
 *      - "Upgrade Plan" form POST করে → app/api/checkout_sessions/route.ts
 *      - সেখানে Stripe session তৈরি হয়
 *      - UI-তে কোনো fake payment নেই
 * ==================================================================
 * 📦 data কোথা থেকে:
 *      - returnTo   → URL-এর `from` (ApplyBtn দিয়ে আসে)
 *      - user name/ছবি/email → better-auth session
 *      - billing history → MongoDB `payments` collection
 *                          (/success পেজ Stripe verify করার পরে save করে)
 * ==================================================================
 * 🔁 পুরো flow এক নজরে:
 *
 *   ApplyBtn (১১তম apply)
 *        ↓
 *   /payment?from=...            (এই পেজ)
 *        ↓ form POST
 *   /api/checkout_sessions        (Stripe session বানায়)
 *        ↓ 303
 *   Stripe Checkout               (user card দিয়ে pay করে)
 *        ↓ success_url
 *   /success?session_id=...&from=...
 *        ↓ verify + replace
 *   আগের পেজ (job details / saved jobs) → limit খুলে গেছে
 * ==================================================================
 */

export const metadata: Metadata = {
  title: "Subscription & Billing | HireLoop",
  description:
    "Manage your professional tier features, recurring payments, and billing history.",
}

// session (headers) দরকার, তাই প্রতিবার request-time-এ render হবে
export const dynamic = "force-dynamic"

type PageProps = {
  searchParams: Promise<{
    from?: string | string[]
    checkout?: string | string[]
  }>
}

// Stripe-এর amount_total (যেমন 2900) + currency (usd) → "$29.00"
function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// MongoDB-র Date → "14 Nov 2026"
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date))
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const { from, checkout } = await searchParams

  const fromValue = Array.isArray(from) ? from[0] : from
  const checkoutValue = Array.isArray(checkout) ? checkout[0] : checkout

  // payment শেষে এখানেই ফিরে যাবে (শুধু app-এর ভিতরের path)
  const returnTo =
    fromValue && fromValue.startsWith("/") ? fromValue : "/dashboard/seeker"

  // উপরের ছোট message
  const notice =
    checkoutValue === "cancelled"
      ? "Payment was cancelled. You can try again anytime."
      : checkoutValue === "failed"
        ? "Payment could not be started. Please try again."
        : fromValue
          ? "You have used all 10 free applications. Upgrade to keep applying — payment শেষে আপনি আগের page-এ ফিরে যাবেন।"
          : undefined

  // topbar-এ user-এর নাম/ছবি দেখানোর জন্য; session না থাকলেও page ভাঙবে না
  let userName: string | undefined
  let userImage: string | undefined
  // এই user-এর payment history (আসল paid record, MongoDB থেকে)
  let billingHistory: BillingRecord[] = []

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    userName = session?.user?.name ?? undefined
    userImage = session?.user?.image ?? undefined

    const email = session?.user?.email

    if (email) {
      // নিজের payment গুলোই আসে — অন্য কারো history দেখা যাবে না
      const payments = await getPayments(email)

      billingHistory = payments.map((payment) => ({
        // transaction id হিসেবে Stripe session id
        id: payment.sessionId,
        date: formatDate(payment.paidAt),
        plan: payment.plan,
        amount: formatAmount(payment.amount, payment.currency),
        status: payment.status,
      }))
    }
  } catch {
    // session/DB সমস্যা হলে default নাম + empty history দেখাবে
  }

  return (
    <PaymentView
      returnTo={returnTo}
      userName={userName}
      userImage={userImage}
      notice={notice}
      billingHistory={billingHistory}
      /*
       * এখনো যেসব data নেই (saved card), সেগুলো না দিলে UI নিজেই
       * empty state দেখাবে — নতুন user-এর কাছে ভুয়া card দেখাবে না।
       */
    />
  )
}
