"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  Check,
  Download,
  Loader2,
  Mail,
  Search,
} from "lucide-react"

import { isProfessional, setProfessional } from "@/lib/everything/subscription"
import { showToast } from "@/lib/utils/toast"

/**
 * 📄 components/Seeker/payment-view.tsx
 * কাজ: Subscription & Billing page-এর পুরো UI।
 *
 * Simple flow:
 *  1. user ApplyBtn থেকে এখানে আসে → /payment?from=/browse-jobs/detailsjobs/xxx
 *  2. "Upgrade Plan" click → একটু processing দেখিয়ে payment success ধরি
 *  3. তারপর router.replace(from) → user আগের page-এই ফিরে যায়
 *
 * (আসল payment gateway এখনো যুক্ত হয়নি — এটা UI + navigation flow)
 */

type PaymentViewProps = {
  // payment শেষে কোথায় ফিরে যাবে
  returnTo: string
  // ApplyBtn থেকে পাঠানো হয়েছে কি না (limit শেষ)
  showLimitNotice: boolean
  userName?: string
  userImage?: string
}

const cardClass = "rounded-2xl border border-white/[0.07] bg-[#101012]"

// Professional plan-এর features
const planFeatures = [
  "Unlimited Applications",
  "Premium Job Insights",
  "Priority Candidate Badge",
  "Direct Recruiter Messaging",
]

// demo billing history (backend billing API আসলে এখান থেকে আসবে)
const billingHistory = [
  {
    date: "Sep 24, 2023",
    plan: "Professional Tier",
    amount: "$29.00",
    id: "TRX-948102-HIL",
    status: "Paid",
  },
  {
    date: "Aug 24, 2023",
    plan: "Professional Tier",
    amount: "$29.00",
    id: "TRX-771929-HIL",
    status: "Paid",
  },
  {
    date: "Jul 24, 2023",
    plan: "Professional Tier",
    amount: "$29.00",
    id: "TRX-331085-HIL",
    status: "Paid",
  },
  {
    date: "Jun 24, 2023",
    plan: "Standard Tier",
    amount: "$12.00",
    id: "TRX-220199-HIL",
    status: "Paid",
  },
]

const tableHead = "px-5 py-4 text-left text-xs font-medium text-white/45"

export function PaymentView({
  returnTo,
  showLimitNotice,
  userName,
  userImage,
}: PaymentViewProps) {
  const router = useRouter()

  // payment চলছে কি না (button-এ spinner দেখানোর জন্য)
  const [paying, setPaying] = useState(false)

  const holderName = (userName?.trim() || "HireLoop Seeker").toUpperCase()
  const initial = holderName.charAt(0)

  /**
   * Simple payment:
   * click → ১ সেকেন্ড processing → success toast → আগের page-এ replace।
   */
  const handlePayment = () => {
    if (paying) return

    // আগেই payment করা থাকলে আবার payment দেখানোর দরকার নেই
    if (isProfessional()) {
      router.replace(returnTo)
      return
    }

    setPaying(true)

    setTimeout(() => {
      // payment সফল → professional plan, তাই আর ১০টার limit থাকবে না
      setProfessional()

      showToast.success("Payment successful. Welcome back!")
      router.replace(returnTo)
    }, 1000)
  }

  // billing history CSV download (কোনো library ছাড়া)
  const handleExport = () => {
    const rows = [
      ["Date", "Plan", "Amount", "Transaction ID", "Status"],
      ...billingHistory.map((row) => [
        row.date,
        row.plan,
        row.amount,
        row.id,
        row.status,
      ]),
    ]

    const csv = rows.map((row) => row.join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))

    const link = document.createElement("a")
    link.href = url
    link.download = "hireloop-billing-history.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-svh bg-[#050505] text-white">
      {/* ---------- top bar ---------- */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050505]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-3 px-5 sm:gap-4 sm:px-8">
          <label className="relative min-w-0 flex-1 sm:max-w-3xl">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              placeholder="Search invoices or plans..."
              aria-label="Search invoices or plans"
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#121214] pr-4 pl-11 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
            />
          </label>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="grid size-10 place-items-center rounded-full text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Bell className="size-[18px]" />
            </button>

            <button
              type="button"
              aria-label="Messages"
              className="hidden size-10 place-items-center rounded-full text-white/60 transition hover:bg-white/[0.06] hover:text-white sm:grid"
            >
              <Mail className="size-[18px]" />
            </button>

            <span className="hidden h-8 w-px bg-white/10 sm:block" />

            <Link href="/profile" aria-label="My profile">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-semibold text-white">
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userImage}
                    alt={holderName}
                    className="size-full object-cover"
                  />
                ) : (
                  initial
                )}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        {/* ---------- heading ---------- */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Subscription &amp; Billing
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/45 sm:text-base">
          Manage your professional tier features, recurring payments, and
          billing history.
        </p>

        {/* Apply limit শেষ হয়ে এলে ছোট notice */}
        {showLimitNotice && (
          <div className="mt-6 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            You have used all 10 free applications. Upgrade to keep applying —
            payment শেষে আপনি আগের page-এ ফিরে যাবেন।
          </div>
        )}

        {/* ---------- plan + payment method ---------- */}
        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1.25fr_1fr]">
          {/* Current plan */}
          <section className={`${cardClass} p-6 sm:p-8`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <span className="rounded border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                Current Plan
              </span>

              <div className="text-right">
                <p className="text-4xl font-semibold tracking-tight">
                  $29
                  <span className="text-base font-normal text-white/45">
                    /mo
                  </span>
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Next billing date: Oct 24, 2023
                </p>
              </div>
            </div>

            <h2 className="mt-7 text-3xl font-semibold tracking-tight">
              Professional Tier
            </h2>
            <p className="mt-2 text-sm text-white/45">
              Unlock global job insights and unlimited applications.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {planFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2.5 text-sm text-white/70"
                >
                  <span className="grid size-4 shrink-0 place-items-center rounded-full bg-emerald-500 text-black">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePayment}
                disabled={paying}
                className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paying && <Loader2 className="size-4 animate-spin" />}
                {paying ? "Processing..." : "Upgrade Plan"}
              </button>

              <button
                type="button"
                onClick={() =>
                  showToast.success("Professional Tier is already active.")
                }
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#2a2a2d] px-6 text-sm font-medium text-white/85 transition hover:bg-[#333337]"
              >
                Manage Plan
              </button>
            </div>
          </section>

          {/* Payment method */}
          <section className={`${cardClass} p-6 sm:p-7`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight">
                Payment Method
              </h2>

              <span className="rounded border border-white/[0.12] px-2 py-1 text-[10px] font-medium tracking-[0.12em] text-white/40">
                SECURE BY STRIPE
              </span>
            </div>

            {/* credit card visual */}
            <div className="mt-5 rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1b1b1f] to-[#101012] p-5">
              <div className="flex items-start justify-between">
                {/* chip */}
                <span className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200/85 to-amber-600/70" />
                <span className="text-sm font-bold tracking-[0.08em] text-white/85 italic">
                  VISA
                </span>
              </div>

              <p className="mt-6 flex items-center gap-2.5 text-sm tracking-[0.22em] text-white/80">
                <span aria-hidden>••••</span>
                <span aria-hidden>••••</span>
                <span aria-hidden>••••</span>
                <span>4242</span>
              </p>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] tracking-[0.14em] text-white/35 uppercase">
                    Card Holder
                  </p>
                  <p className="mt-1 truncate text-[11px] font-medium tracking-[0.06em] text-white/75 uppercase">
                    {holderName}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[9px] tracking-[0.14em] text-white/35 uppercase">
                    Expires
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-white/75">
                    12/25
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast.success("Payment method form coming soon.")}
              className="mt-6 w-full py-1 text-center text-sm text-white/55 transition hover:text-white"
            >
              + Add New Payment Method
            </button>
          </section>
        </div>

        {/* ---------- billing history ---------- */}
        <section className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Billing History
            </h2>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
            >
              <Download className="size-4" />
              Export
            </button>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-white/[0.07] bg-[#101012]">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-white/[0.07] text-white/45">
                <tr>
                  <th className={tableHead}>Date</th>
                  <th className={tableHead}>Plan</th>
                  <th className={tableHead}>Amount</th>
                  <th className={tableHead}>Transaction ID</th>
                  <th className={`${tableHead} text-right`}>Status</th>
                </tr>
              </thead>

              <tbody>
                {billingHistory.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-5 text-white/75">{row.date}</td>
                    <td className="px-5 py-5 text-white/75">{row.plan}</td>
                    <td className="px-5 py-5 text-white/75">{row.amount}</td>
                    <td className="px-5 py-5 text-xs tracking-[0.06em] text-white/45">
                      {row.id}
                    </td>
                    <td className="px-5 py-5 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] text-emerald-400 uppercase">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- help ---------- */}
        <section
          className={`${cardClass} mt-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7`}
        >
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Need help with your invoice?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
              Our support team is available 24/7 to help you resolve any
              payment issues or clarify billing details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="mailto:support@hireloop.com"
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#2a2a2d] px-6 text-sm font-medium text-white transition hover:bg-[#333337]"
            >
              Contact Support
            </a>

            <button
              type="button"
              onClick={() =>
                showToast.success("Full refund available within 7 days.")
              }
              className="text-sm text-white/60 underline underline-offset-4 transition hover:text-white"
            >
              Read Refund Policy
            </button>
          </div>
        </section>
      </main>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2023 HireLoop Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/terms" className="transition hover:text-white/70">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition hover:text-white/70">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
