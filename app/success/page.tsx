import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Check } from "lucide-react"

import { ReturnToPage } from "@/components/Seeker/return-to-page"
import { savePayment } from "@/lib/SheareAction/SeekerAction/PaymentAction/payment-store"
import { stripe } from "@/lib/stripe"

/**
 * 📄 app/success/page.tsx
 * ==================================================================
 * 📌 কী: Stripe payment সফল হলে user এই পেজে আসে।
 *        URL: /success?session_id=cs_test_xxx&from=/browse-jobs/...
 *
 * 📌 কেন দরকার:
 *      Stripe session-এ `success_url` হিসেবে এই পেজ দেওয়া আছে।
 *      এখানে এসে payment সত্যিই হয়েছে কিনা সেটা আবার যাচাই করা হয়।
 *
 * 📌 কী করে (ধাপে ধাপে):
 *      ১. URL থেকে session_id আর from নেয়
 *      ২. session_id নেই? → সোজা from পেজে redirect
 *      ৩. stripe.checkout.sessions.retrieve(session_id) দিয়ে Stripe থেকে দেখে
 *         payment_status === "paid" কি না
 *      ৪. paid না হলে → আবার /payment পেজে redirect
 *      ৫. paid হলে → payment history MongoDB-তে save করে (savePayment),
 *         success কার্ড দেখায়, আর ReturnToPage
 *         (plan professional করে ১.২ সেকেন্ড পরে আগের পেজে ফেরত পাঠায়)
 *
 * 📦 data কোথা থেকে:
 *      session_id + from → Stripe-এর redirect URL
 *      paid কিনা → Stripe API (stripe.checkout.sessions.retrieve)
 *      email → checkout session-এর metadata (logged-in user-এর email)
 * ==================================================================
 */

export const metadata: Metadata = {
  title: "Payment successful | HireLoop",
}

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams: Promise<{
    session_id?: string | string[]
    from?: string | string[]
  }>
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const { session_id, from } = await searchParams

  const sessionId = Array.isArray(session_id) ? session_id[0] : session_id
  const fromValue = Array.isArray(from) ? from[0] : from

  // payment শেষে এখানেই ফিরে যাবে
  const returnTo =
    fromValue && fromValue.startsWith("/") ? fromValue : "/dashboard/seeker"

  // session_id ছাড়া কেউ ঢুকলে সরাসরি আগের page-এ
  if (!sessionId) redirect(returnTo)

  // Stripe থেকে verify করি — শুধু paid হলেই success দেখাব
  let paid = false

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    paid = session.payment_status === "paid"

    // payment সত্যিই হয়েছে → এই user-এর payment history MongoDB-তে save
    // (এখানেই history তৈরি হয়, তাই আগে থেকে কোনো ভুয়া record নেই)
    // email: checkout session-এ রাখা logged-in user-এর email
    const email = session.metadata?.email || session.customer_details?.email

    if (paid && email) {
      await savePayment({
        email,
        name: session.customer_details?.name ?? undefined,
        sessionId: session.id,
        plan: "Professional Tier",
        amount: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        status: "paid",
        paidAt: new Date(),
      })
    }
  } catch (error) {
    console.error("Stripe session verify failed:", error)
  }

  // payment হয়নি → আবার payment page
  if (!paid) {
    redirect(`/payment?from=${encodeURIComponent(returnTo)}`)
  }

  return (
    <div className="grid min-h-svh place-items-center bg-[#050505] px-5 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.07] bg-[#101012] p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500 text-black">
          <Check className="size-6" strokeWidth={3} />
        </span>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          Payment successful
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-white/45">
          You are now on the Professional Tier. Unlimited applications are
          unlocked.
        </p>

        {/* ১.২ সেকেন্ড পরে অটো আগের page-এ ফিরে যাবে */}
        <ReturnToPage href={returnTo} />

        <Link
          href="/dashboard/seeker"
          className="mt-3 inline-block text-xs text-white/40 transition hover:text-white/70"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
