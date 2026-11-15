"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Bookmark,
  CalendarDays,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react"

/**
 * 📄 components/Seeker/seeker-dashboard.tsx
 * ==================================================================
 * 📌 কী: seeker dashboard-এর main content — stat cards, profile,
 *        Application Status bar আর Recent Activity।
 *        Sidebar / topbar dashboard layout থেকেই আসে।
 *
 * 📦 data কোথা থেকে (সবই prop আকারে আসে, এখানে কোনো demo data নেই):
 *      - userName / userEmail / userImage → better-auth session
 *      - savedJobsCount   → GET /SeekerGet/:email
 *      - applicationsCount / interviewsCount / offersCount
 *      - statusCounts     → GET /ApplicationGet/:email থেকে page-এ হিসাব হয়
 *      - recentApplications → ওই applications-এর নতুন ৩টা
 *
 * ⚠️ আগে এখানে 24 / 3 / 1, "Sarah Jenkins", "TechFlow" ইত্যাদি লিখে রাখা
 *    demo data ছিল — সব সরানো হয়েছে। এখন যত apply করেছ, ঠিক ততটাই দেখাবে।
 * ==================================================================
 */

// page থেকে হিসাব করা status count
export type StatusCount = {
  label: string
  count: number
}

// Recent Activity-র একটা row (আসল application থেকে)
export type RecentApplication = {
  id: string
  title: string
  company: string
  status: string
  time: string
}

type SeekerDashboardProps = {
  userName?: string
  userEmail?: string
  userImage?: string
  savedJobsCount: number
  applicationsCount: number
  interviewsCount: number
  offersCount: number
  statusCounts: StatusCount[]
  recentApplications: RecentApplication[]
}

type StatItem = {
  label: string
  value: number
  icon: LucideIcon
}

// status অনুযায়ী bar-এর রঙ
const STATUS_BAR: Record<string, string> = {
  Applied: "bg-white",
  "Under Review": "bg-amber-400",
  Shortlisted: "bg-blue-500",
  Rejected: "bg-rose-500",
  Offered: "bg-emerald-500",
}

// status অনুযায়ী text-এর রঙ (Recent Activity-তে)
const STATUS_TEXT: Record<string, string> = {
  Applied: "text-white/75",
  Review: "text-amber-400",
  "Under Review": "text-amber-400",
  Shortlisted: "text-emerald-400",
  Interview: "text-sky-400",
  Rejected: "text-rose-400",
  Offered: "text-emerald-400",
}

function statusTextClass(status: string) {
  return STATUS_TEXT[status] ?? "text-white/75"
}

export function SeekerDashboard({
  userName,
  userEmail,
  userImage,
  savedJobsCount,
  applicationsCount,
  interviewsCount,
  offersCount,
  statusCounts,
  recentApplications,
}: SeekerDashboardProps) {
  // login না থাকলে ভুয়া নাম নয় — নিরপেক্ষ fallback
  const name = userName?.trim() || "Your profile"
  const email = userEmail || ""

  // ৪টা stat card — সব আসল count
  const stats: readonly StatItem[] = [
    { label: "Saved Jobs", value: savedJobsCount, icon: Bookmark },
    { label: "Applications Submitted", value: applicationsCount, icon: Send },
    { label: "Interviews Scheduled", value: interviewsCount, icon: CalendarDays },
    { label: "Offers Received", value: offersCount, icon: Trophy },
  ]

  // bar-এর width = count / total; কোনো application না থাকলে 0
  const maxCount = Math.max(applicationsCount, 1)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* ---------- 4টা stat card ---------- */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="max-w-[8rem] text-sm leading-snug text-white/55">
                  {stat.label}
                </p>
                <Icon className="size-5 shrink-0 text-white/45" />
              </div>

              <p className="mt-6 text-4xl font-semibold tracking-tight text-white">
                {stat.value}
              </p>
            </div>
          )
        })}
      </section>

      {/* ---------- profile + application status ---------- */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* profile card */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
          <div className="flex items-center gap-5">
            <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.06] text-white/45 ring-1 ring-white/10">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={name} className="size-full object-cover" />
              ) : (
                <UserRound className="size-10" strokeWidth={1.5} />
              )}
            </span>

            <div className="min-w-0">
              <h2 className="truncate text-2xl font-semibold tracking-tight text-white">
                {name}
              </h2>
              {email && (
                <p className="mt-1.5 truncate text-sm text-white/45">{email}</p>
              )}
            </div>
          </div>

          <Link
            href="/profile"
            className="mt-8 flex h-11 items-center justify-center gap-2 rounded-lg border border-white/[0.12] text-sm font-medium text-white/80 transition hover:border-white/25 hover:bg-white/[0.03] hover:text-white"
          >
            <Pencil className="size-4" />
            Edit Profile
          </Link>
        </div>

        {/* application status card — আসল application থেকে */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Application Status
          </h2>

          {applicationsCount === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-5 py-10 text-center">
              <p className="text-sm text-white/60">No applications yet.</p>
              <Link
                href="/browse-jobs"
                className="mt-2 inline-block text-sm text-violet-300 hover:text-violet-200"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {statusCounts.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-white/55">{item.label}</span>
                    <span className="font-medium text-white/80">{item.count}</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR[item.label] ?? "bg-white/40"}`}
                      style={{
                        width: `${Math.round((item.count / maxCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- recent activity ---------- */}
      <section className="pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Recent Activity
          </h2>
          <Link
            href="/dashboard/seeker/application"
            className="text-sm text-white/50 underline underline-offset-4 transition hover:text-white"
          >
            View All Activity
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-5 py-12 text-center">
            <p className="text-sm text-white/60">No activity yet.</p>
            <p className="mt-1 text-xs text-white/35">
              Apply to a job and your activity will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {recentApplications.map((item) => {
              // Offered/Shortlisted হলে অন্য icon, নাহলে Send
              const lower = item.status.toLowerCase()
              const Icon = lower.includes("offer")
                ? Trophy
                : lower.includes("shortlist")
                  ? Sparkles
                  : Send

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/seeker/application/applicationdetails/${item.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#101012] p-4 transition hover:border-white/15 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.04] text-white/60">
                    <Icon className="size-4" />
                  </span>

                  <p className="min-w-0 flex-1 text-sm leading-relaxed text-white/55">
                    You applied for{" "}
                    <strong className="font-semibold text-white">
                      {item.title}
                    </strong>{" "}
                    at {item.company} —{" "}
                    <span className={`font-medium ${statusTextClass(item.status)}`}>
                      {item.status}
                    </span>
                  </p>

                  <span className="shrink-0 text-xs text-white/35 sm:text-sm">
                    {item.time}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ---------- image-এর নিচের ডান দিকের plus button ---------- */}
      <button
        type="button"
        aria-label="Add new item"
        className="fixed right-6 bottom-6 z-30 grid size-14 place-items-center rounded-full bg-white text-black shadow-[0_16px_40px_-12px_rgba(255,255,255,0.45)] transition hover:bg-white/90 sm:right-8 sm:bottom-8"
      >
        <Plus className="size-6" />
      </button>
    </div>
  )
}
