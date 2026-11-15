"use client"

import Link from "next/link"
import {
  Bell,
  Check,
  CreditCard,
  Download,
  Mail,
  Search,
} from "lucide-react"

/**
 * 📄 components/Seeker/payment-view.tsx
 * ==================================================================
 * 📌 কী: Subscription & Billing পেজের শুধু UI (দেখতে কেমন হবে)।
 *        এখানে কোনো payment logic নেই — logic থাকে app/payment/page.tsx এবং
 *        app/api/checkout_sessions/route.ts এ।
 *
 * 📌 কোন জিনিস কোথা থেকে আসে (props):
 *      - userName / userImage → Topbar-এর avatar
 *      - returnTo             → payment শেষে কোথায় ফিরবে
 *      - notice               → উপরের ছোট message (limit শেষ / cancel / fail)
 *      - paymentMethod        → saved card (এখনো নেই); না থাকলে empty state
 *      - billingHistory       → MongoDB `payments` collection থেকে আসা
 *                               আসল payment তালিকা; না থাকলে empty state
 *
 * 📌 "Upgrade Plan" বাটনটা আসলে একটা form:
 *      <form action="/api/checkout_sessions" method="POST">
 *        <input type="hidden" name="from" value={returnTo} />
 *        <button type="submit">Upgrade Plan</button>
 *      </form>
 *      → submit করলে সরাসরি Stripe session বানানো হয় (কোনো fake payment নয়)
 *
 * ⚠️ কেন empty state:
 *      নতুন user কখনো payment করেনি, তাই তার কাছে ভুয়া card (•••• 4242)
 *      বা ভুয়া billing history দেখানো যাবে না। data না এলে empty state দেখায়।
 * ==================================================================
 */

// একটা saved card-এর তথ্য (backend/Stripe থেকে আসবে)
export type PaymentMethodInfo = {
  brand: string // "VISA"
  last4: string // "4242"
  holder: string // card holder name
  expires: string // "12/25"
}

// একটা payment record (payment সফল হলেই তৈরি হবে)
export type BillingRecord = {
  id: string
  date: string
  plan: string
  amount: string
  status: string
}

type PaymentViewProps = {
  userName?: string
  userImage?: string
  // payment শেষে user কোন page-এ ফিরবে (form-এ hidden input হিসেবে যায়)
  returnTo: string
  // উপরে ছোট message (যেমন: apply limit শেষ / gateway connect করা নেই)
  notice?: string
  // user-এর saved card — না থাকলে empty state
  paymentMethod?: PaymentMethodInfo | null
  // user-এর payment history — না থাকলে empty state
  billingHistory?: BillingRecord[]
  // এখনো যে feature নেই, তার handler না দিলে button disable থাকবে
  onAddPaymentMethod?: () => void
  onManagePlan?: () => void
}

const cardClass = "rounded-2xl border border-white/[0.07] bg-[#101012]"

// Professional plan-এর features
const planFeatures = [
  "Unlimited Applications",
  "Premium Job Insights",
  "Priority Candidate Badge",
  "Direct Recruiter Messaging",
]

const upgradeButtonClass =
  "inline-flex h-11 min-w-[150px] items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"

// Billing history → CSV download।
// কোনো backend লাগে না — props-এ যে আসল data আছে, সেটাই CSV হয়।
function exportHistory(rows: BillingRecord[]) {
  const lines = [
    ["Date", "Plan", "Amount", "Transaction ID", "Status"],
    ...rows.map((row) => [
      row.date,
      row.plan,
      row.amount,
      row.id,
      row.status,
    ]),
  ]

  const csv = lines.map((line) => line.join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))

  const link = document.createElement("a")
  link.href = url
  link.download = "hireloop-billing-history.csv"
  link.click()

  URL.revokeObjectURL(url)
}

function CreditCardVisual({ method }: { method: PaymentMethodInfo }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1b1b1f] to-[#101012] p-5">
      <div className="flex items-start justify-between">
        {/* chip */}
        <span className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200/85 to-amber-600/70" />
        <span className="text-sm font-bold tracking-[0.08em] text-white/85 italic">
          {method.brand}
        </span>
      </div>

      <p className="mt-6 flex items-center gap-2.5 text-sm tracking-[0.22em] text-white/80">
        <span aria-hidden>••••</span>
        <span aria-hidden>••••</span>
        <span aria-hidden>••••</span>
        <span>{method.last4}</span>
      </p>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] tracking-[0.14em] text-white/35 uppercase">
            Card Holder
          </p>
          <p className="mt-1 truncate text-[11px] font-medium tracking-[0.06em] text-white/75 uppercase">
            {method.holder}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[9px] tracking-[0.14em] text-white/35 uppercase">
            Expires
          </p>
          <p className="mt-1 text-[11px] font-medium text-white/75">
            {method.expires}
          </p>
        </div>
      </div>
    </div>
  )
}

export function PaymentView({
  userName,
  userImage,
  returnTo,
  notice,
  paymentMethod = null,
  billingHistory = [],
  onAddPaymentMethod,
  onManagePlan,
}: PaymentViewProps) {
  const holderName = (userName?.trim() || "HireLoop Seeker").toUpperCase()
  const initial = holderName.charAt(0)

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

        {/* page থেকে আসা message (limit শেষ / gateway নেই) */}
        {notice && (
          <div className="mt-6 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {notice}
          </div>
        )}

        {/* ---------- plan + payment method ---------- */}
        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1.25fr_1fr]">
          {/* Professional plan */}
          <section className={`${cardClass} p-6 sm:p-8`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <span className="rounded border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                Pro Plan
              </span>

              <div className="text-right">
                <p className="text-4xl font-semibold tracking-tight">
                  $29
                  <span className="text-base font-normal text-white/45">
                    /mo
                  </span>
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Billed monthly after upgrade
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
              {/*
                👉 Stripe Checkout form
                submit করলে app/api/checkout_sessions/route.ts চলবে,
                সেখানে Stripe session বানিয়ে checkout url-এ redirect করতে হবে।
                `from` hidden input-এ যায়, যাতে payment শেষে user
                ঠিক আগের page-এ ফিরে আসতে পারে।
              */}
              <form action="/api/checkout_sessions" method="POST">
                <input type="hidden" name="from" value={returnTo} />

                <button type="submit" className={upgradeButtonClass}>
                  Upgrade Plan
                </button>
              </form>

              <button
                type="button"
                onClick={onManagePlan}
                disabled={!onManagePlan}
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#2a2a2d] px-6 text-sm font-medium text-white/85 transition hover:bg-[#333337] disabled:cursor-not-allowed disabled:opacity-40"
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

            <div className="mt-5">
              {paymentMethod ? (
                <CreditCardVisual method={paymentMethod} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-5 py-10 text-center">
                  <span className="grid size-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40">
                    <CreditCard className="size-5" />
                  </span>

                  <div>
                    <p className="text-sm font-medium text-white/70">
                      No payment method added
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      Add a card to upgrade to the Professional Tier.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onAddPaymentMethod}
              disabled={!onAddPaymentMethod}
              className="mt-6 w-full py-1 text-center text-sm text-white/55 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
              onClick={() => exportHistory(billingHistory)}
              disabled={billingHistory.length === 0}
              className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="size-4" />
              Export
            </button>
          </div>

          {billingHistory.length === 0 ? (
            // নতুন user — কোনো payment হয়নি, তাই ভুয়া row নেই
            <div className="mt-5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-5 py-12 text-center">
              <p className="text-sm text-white/60">No billing history yet.</p>
              <p className="mt-1 text-xs text-white/35">
                Your payments will appear here after your first billing.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-xl border border-white/[0.07] bg-[#101012]">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-white/[0.07] text-white/45">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-medium">
                      Date
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium">
                      Plan
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium">
                      Transaction ID
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-medium">
                      Status
                    </th>
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
          )}
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

            <Link
              href="/terms"
              className="text-sm text-white/60 underline underline-offset-4 transition hover:text-white"
            >
              Read Refund Policy
            </Link>
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
