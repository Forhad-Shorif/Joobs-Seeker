"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Bookmark,
  CalendarDays,
  Mail,
  Pencil,
  Plus,
  Repeat2,
  Send,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"

/**
 * 📄 components/seeker/seeker-dashboard.tsx
 * কাজ: seeker dashboard-এর main content — stats, profile, application status
 * আর recent activity. Sidebar/topbar dashboard layout থেকেই আসে।
 */

type SeekerDashboardProps = {
  savedJobsCount: number
}

type StatItem = {
  label: string
  value: number
  icon: LucideIcon
}

type StatusItem = {
  label: string
  count: number
  width: string
  barClass: string
}

type ActivityItem = {
  icon: LucideIcon
  iconClass: string
  text: ReactNode
  time: string
}

// image-এর মতো fixed demo data — পরে backend data দিয়ে replace করা যাবে।
const applicationStatus: readonly StatusItem[] = [
  { label: "Applied", count: 10, width: "100%", barClass: "bg-white" },
  { label: "Under Review", count: 6, width: "60%", barClass: "bg-amber-400" },
  { label: "Shortlisted", count: 5, width: "50%", barClass: "bg-blue-500" },
  { label: "Rejected", count: 2, width: "20%", barClass: "bg-rose-500" },
  { label: "Offered", count: 1, width: "10%", barClass: "bg-emerald-500" },
]

const recentActivity: readonly ActivityItem[] = [
  {
    icon: Repeat2,
    iconClass: "bg-white/[0.04] text-white/60",
    text: (
      <>
        Application for <strong className="font-semibold text-white">Senior Product Designer</strong> at
        TechFlow updated to{" "}
        <span className="font-medium text-amber-400 underline underline-offset-4">Under Review</span>
      </>
    ),
    time: "2 hours ago",
  },
  {
    icon: Sparkles,
    iconClass: "bg-emerald-500/10 text-emerald-400",
    text: (
      <>
        <strong className="font-semibold text-white">New Job Alert:</strong> Lead Frontend Engineer at
        FinGrid matches your profile.
      </>
    ),
    time: "5 hours ago",
  },
  {
    icon: Mail,
    iconClass: "bg-white/[0.04] text-white/60",
    text: (
      <>
        You have a new message from{" "}
        <strong className="font-semibold text-white">Sarah Jenkins</strong> (Hiring Manager at CloudOps).
      </>
    ),
    time: "1 day ago",
  },
]

export function SeekerDashboard({ savedJobsCount }: SeekerDashboardProps) {
  const { data: session } = authClient.useSession()
  const user = session?.user

  // login না থাকলে preview-এর জন্য image-এর নাম/email দেখাই
  const name = user?.name?.trim() || "Alex Rivera"
  const email = user?.email || "alex.rivera@example.com"

  const stats: readonly StatItem[] = [
    { label: "Saved Jobs", value: savedJobsCount, icon: Bookmark },
    { label: "Applications Submitted", value: 24, icon: Send },
    { label: "Interviews Scheduled", value: 3, icon: CalendarDays },
    { label: "Offers Received", value: 1, icon: Trophy },
  ]

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
                <p className="max-w-[8rem] text-sm leading-snug text-white/55">{stat.label}</p>
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
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={name} className="size-full object-cover" />
              ) : (
                <UserRound className="size-10" strokeWidth={1.5} />
              )}
            </span>

            <div className="min-w-0">
              <h2 className="truncate text-2xl font-semibold tracking-tight text-white">
                {name}
              </h2>
              <p className="mt-1.5 truncate text-sm text-white/45">{email}</p>
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

        {/* application status card */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Application Status
          </h2>

          <div className="mt-6 space-y-5">
            {applicationStatus.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-white/55">{item.label}</span>
                  <span className="font-medium text-white/80">{item.count}</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full ${item.barClass}`}
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- recent activity ---------- */}
      <section className="pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Recent Activity</h2>
          <Link
            href="/dashboard/seeker/application"
            className="text-sm text-white/50 underline underline-offset-4 transition hover:text-white"
          >
            View All Activity
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {recentActivity.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.time}
                className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#101012] p-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${item.iconClass}`}
                >
                  <Icon className="size-4" />
                </span>

                <p className="min-w-0 flex-1 text-sm leading-relaxed text-white/55">
                  {item.text}
                </p>

                <span className="shrink-0 text-xs text-white/35 sm:text-sm">{item.time}</span>
              </div>
            )
          })}
        </div>
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
