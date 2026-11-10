import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Download,
  UsersRound,
} from "lucide-react"

// ------------------------------------------------------------------
// 📊 OVERVIEW STATS
// ------------------------------------------------------------------
// উপরের ৫টি কার্ডের ডেটা। নতুন কার্ড লাগলে এখানে যোগ করুন।
const stats: {
  label: string
  value: string
  change?: string
  icon: LucideIcon
}[] = [
  { label: "Total Users", value: "124,892", change: "+12%", icon: UsersRound },
  {
    label: "Total Companies",
    value: "12,405",
    change: "+8.4%",
    icon: Building2,
  },
  {
    label: "Total Jobs",
    value: "4,281",
    change: "+24%",
    icon: BriefcaseBusiness,
  },
  { label: "Jobs Pending", value: "8,920", icon: Clock3 },
  {
    label: "Total Revenue",
    value: "$245,800",
    change: "+15.2%",
    icon: DollarSign,
  },
]

// ------------------------------------------------------------------
// 📈 JOB POSTS BY CATEGORY (simple CSS bar chart)
// ------------------------------------------------------------------
// value = bar-এর উচ্চতা (শতাংশে)। পরে API থেকে আসল সংখ্যা বসানো যাবে।
const jobCategories = [
  { label: "Engineering", value: 82 },
  { label: "Design", value: 60 },
  { label: "Marketing", value: 46 },
  { label: "Sales", value: 70 },
  { label: "Operations", value: 34 },
]

// ------------------------------------------------------------------
// 💳 RECENT TRANSACTIONS
// ------------------------------------------------------------------
const transactions = [
  {
    name: "Olivia Rhye",
    email: "olivia@untitledui.com",
    plan: "Enterprise",
    id: "TXN-3847562",
    amount: "$1,200.00",
    date: "Oct 24, 2023, 10:30 AM",
    status: "Active",
  },
  {
    name: "Phoenix Baker",
    email: "phoenix@untitledui.com",
    plan: "Professional",
    id: "TXN-8475639",
    amount: "$499.00",
    date: "Oct 24, 2023, 09:45 AM",
    status: "Pending",
  },
  {
    name: "Lana Steiner",
    email: "lana@untitledui.com",
    plan: "Enterprise",
    id: "TXN-2938475",
    amount: "$2,400.00",
    date: "Oct 23, 2023, 04:20 PM",
    status: "Active",
  },
  {
    name: "Demi Wilkinson",
    email: "demi@untitledui.com",
    plan: "Starter",
    id: "TXN-5839201",
    amount: "$129.00",
    date: "Oct 23, 2023, 02:15 PM",
    status: "Failed",
  },
]

// plan অনুযায়ী badge-এর রঙ
const planStyles: Record<string, string> = {
  Enterprise: "border-violet-400/20 bg-violet-500/10 text-violet-300",
  Professional: "border-sky-400/20 bg-sky-500/10 text-sky-300",
  Starter: "border-white/10 bg-white/[0.04] text-white/60",
}

// status অনুযায়ী লেখা + dot-এর রঙ
const statusStyles: Record<string, string> = {
  Active: "text-emerald-400",
  Pending: "text-amber-400",
  Failed: "text-rose-400",
}

const statusDots: Record<string, string> = {
  Active: "bg-emerald-400",
  Pending: "bg-amber-400",
  Failed: "bg-rose-400",
}

// "Olivia Rhye" → "OR"
function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// ------------------------------------------------------------------
// 📄 ADMIN DASHBOARD PAGE
// ------------------------------------------------------------------
export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] pb-20">
      {/* ---------- পেজ শিরোনাম + অ্যাকশন ---------- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] text-white/35">
            Admin Dashboard <span className="mx-1 text-white/20">/</span>{" "}
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Monitor platform activity and key metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* date filter */}
          <div className="relative">
            <select
              aria-label="Date range"
              className="h-10 appearance-none rounded-lg border border-white/[0.08] bg-[#101012] pr-8 pl-3 text-xs text-white/60 outline-none"
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-white/35" />
          </div>

          {/* export button (আপাতত শুধু UI) */}
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-xs font-medium text-black transition hover:bg-white/90"
          >
            <Download className="size-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* ---------- ৫টি স্ট্যাট কার্ড ---------- */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.07] bg-[#101012] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-white/45">{stat.label}</p>
                <Icon className="size-4 text-white/35" />
              </div>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {stat.value}
              </p>

              {stat.change && (
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                  <ArrowUpRight className="size-3" />
                  {stat.change}
                  <span className="font-normal text-white/25">vs last month</span>
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* ---------- ২টি চার্ট ---------- */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* ----- Job Posts by Category ----- */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">
              Job Posts by Category
            </h2>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[10px] text-white/45"
            >
              Last 7 days
              <ChevronDown className="size-3" />
            </button>
          </div>

          {/* simple CSS bar chart */}
          <div className="mt-8">
            <div className="flex h-44 items-end gap-3 sm:gap-4">
              {jobCategories.map((item) => (
                <div
                  key={item.label}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-white/[0.05] to-white/[0.18] transition hover:to-white/[0.28]"
                  style={{ height: `${item.value}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              ))}
            </div>

            <div className="mt-3 flex gap-3 sm:gap-4">
              {jobCategories.map((item) => (
                <span
                  key={item.label}
                  className="flex-1 text-center text-[10px] text-white/35"
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ----- New Users (30d) ----- */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">
              New Users (30d)
            </h2>

            <span className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[10px] text-white/45">
              Last 30 days
            </span>
          </div>

          <div className="relative mt-6">
            {/* chart-এর উপরে ছোট badge */}
            <span className="absolute top-0 right-0 z-10 rounded-md border border-white/10 bg-[#1b1b1e] px-2 py-1 text-[10px] font-medium text-white/80">
              +1,248
            </span>

            <svg
              viewBox="0 0 600 200"
              className="h-44 w-full"
              preserveAspectRatio="none"
              aria-label="New users line chart"
            >
              <defs>
                <linearGradient id="users-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>

              {/* grid lines */}
              {[40, 90, 140, 190].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 6"
                />
              ))}

              {/* area fill */}
              <path
                d="M0,190 C60,185 90,160 140,165 C190,170 220,150 260,130 C300,110 330,120 370,95 C410,70 440,40 490,60 C530,76 560,30 600,20 L600,200 L0,200 Z"
                fill="url(#users-fill)"
              />

              {/* line */}
              <path
                d="M0,190 C60,185 90,160 140,165 C190,170 220,150 260,130 C300,110 330,120 370,95 C410,70 440,40 490,60 C530,76 560,30 600,20"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <div className="mt-2 flex justify-between text-[10px] text-white/30">
              <span>Oct 1</span>
              <span>Oct 8</span>
              <span>Oct 15</span>
              <span>Oct 22</span>
              <span>Oct 30</span>
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Recent Subscription Transactions ---------- */}
      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Recent Subscription Transactions
          </h2>
          <Link
            href="/dashboard/admin/payments"
            className="text-xs text-white/50 transition hover:text-white"
          >
            View All Activity
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101012]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Transaction ID</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-white/[0.05] last:border-0"
                  >
                    {/* user */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[11px] font-semibold text-white/60">
                          {getInitials(transaction.name)}
                        </span>
                        <div>
                          <p className="whitespace-nowrap font-medium text-white">
                            {transaction.name}
                          </p>
                          <p className="whitespace-nowrap text-[11px] text-white/35">
                            {transaction.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* plan */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-medium ${
                          planStyles[transaction.plan]
                        }`}
                      >
                        {transaction.plan}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-xs text-white/45">
                      {transaction.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                      {transaction.amount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-white/45">
                      {transaction.date}
                    </td>

                    {/* status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          statusStyles[transaction.status]
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            statusDots[transaction.status]
                          }`}
                        />
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination (আপাতত শুধু UI) */}
          <div className="flex items-center justify-center gap-1.5 border-t border-white/[0.06] px-6 py-4">
            <button
              type="button"
              aria-label="Previous page"
              className="grid size-8 place-items-center rounded-md border border-white/[0.08] text-white/40 transition hover:text-white"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              className="grid size-8 place-items-center rounded-md bg-white text-xs font-semibold text-black"
            >
              1
            </button>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-md border border-white/[0.08] text-xs text-white/50 transition hover:text-white"
            >
              2
            </button>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-md border border-white/[0.08] text-xs text-white/50 transition hover:text-white"
            >
              3
            </button>

            <button
              type="button"
              aria-label="Next page"
              className="grid size-8 place-items-center rounded-md border border-white/[0.08] text-white/40 transition hover:text-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
