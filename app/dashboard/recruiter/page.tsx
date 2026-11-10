"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Building2,
  CheckCircle2,
  FileText,
  Plus,
  UsersRound,
  Zap,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"

// ------------------------------------------------------------------
// 📊 STAT CARDS
// ------------------------------------------------------------------
// উপরের ৪টি ছোট কার্ডের ডেটা। নতুন কার্ড লাগলে এখানে যোগ করুন।
const stats: { label: string; value: string; icon: LucideIcon }[] = [
  { label: "Total Job Posts", value: "48", icon: FileText },
  { label: "Total Applicants", value: "1,284", icon: UsersRound },
  { label: "Active Jobs", value: "18", icon: Zap },
  { label: "Jobs Closed", value: "32", icon: CheckCircle2 },
]

// ------------------------------------------------------------------
// 🧾 RECENT APPLICATIONS
// ------------------------------------------------------------------
// আপাতত ডেমো ডেটা। পরে API/database থেকে এনে এখানে বসাতে হবে।
const applications = [
  {
    name: "Julianne Moore",
    role: "Senior Product Designer",
    date: "Oct 24, 2023",
    experience: "6 years",
    status: "Interviewing",
  },
  {
    name: "Robert Downey",
    role: "Backend Engineer",
    date: "Oct 23, 2023",
    experience: "4 years",
    status: "New",
  },
  {
    name: "Emma Stone",
    role: "Marketing Lead",
    date: "Oct 22, 2023",
    experience: "8 years",
    status: "Reviewing",
  },
  {
    name: "Chris Pratt",
    role: "Product Manager",
    date: "Oct 21, 2023",
    experience: "5 years",
    status: "Rejected",
  },
]

// status অনুযায়ী badge-এর রঙ
const statusStyles: Record<string, string> = {
  Interviewing: "border-emerald-400/25 bg-emerald-500/10 text-emerald-400",
  New: "border-white/10 bg-white/[0.04] text-white/60",
  Reviewing: "border-amber-400/25 bg-amber-500/10 text-amber-400",
  Rejected: "border-rose-400/25 bg-rose-500/10 text-rose-400",
}

// ------------------------------------------------------------------
// 🏢 TOP COMPANIES
// ------------------------------------------------------------------
const companies = [
  {
    name: "Google Inc.",
    industry: "Technology",
    location: "Mountain View",
    jobs: 24,
    iconStyle: "bg-sky-500/15 text-sky-300",
  },
  {
    name: "Meta Platforms",
    industry: "Social Media",
    location: "Menlo Park",
    jobs: 18,
    iconStyle: "bg-blue-500/15 text-blue-300",
  },
  {
    name: "Stripe",
    industry: "Fintech",
    location: "San Francisco",
    jobs: 12,
    iconStyle: "bg-violet-500/15 text-violet-300",
  },
  {
    name: "Tesla",
    industry: "Automotive",
    location: "Austin",
    jobs: 31,
    iconStyle: "bg-rose-500/15 text-rose-300",
  },
]

// "Julianne Moore" → "JM"
function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// ------------------------------------------------------------------
// 📄 RECRUITER DASHBOARD PAGE
// ------------------------------------------------------------------
export default function RecruiterPage() {
  const { data: session } = authClient.useSession()

  // session না থাকলে ডেমো নাম দেখাবে
  const name = session?.user?.name?.trim() || "Alex Sterling"

  return (
    <div className="mx-auto w-full max-w-[1280px] pb-20">
      {/* ---------- শিরোনাম ---------- */}
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Welcome back, {name}
      </h1>

      {/* ---------- ৪টি স্ট্যাট কার্ড ---------- */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.07] bg-[#101012] p-6"
            >
              <span className="grid size-12 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70">
                <Icon className="size-5" />
              </span>

              <p className="mt-7 text-sm text-white/45">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* ---------- নিচের দুই কলাম ---------- */}
      <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ----- বাম: Recent Applications ----- */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Recent Applications
            </h2>
            <Link
              href="/dashboard/recruiter/applications"
              className="text-sm text-white/60 transition hover:text-white"
            >
              View all
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101012]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07] text-xs text-white/40">
                    <th className="px-6 py-4 font-medium">Candidate Name</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Date Applied</th>
                    <th className="px-6 py-4 font-medium">Experience</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.name}
                      className="border-b border-white/[0.05] last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[11px] font-semibold text-white/60">
                            {getInitials(application.name)}
                          </span>
                          <span className="whitespace-nowrap font-medium text-white">
                            {application.name}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-white/60">
                        {application.role}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-white/60">
                        {application.date}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-white/60">
                        {application.experience}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                            statusStyles[application.status]
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ----- ডান: My Top Companies ----- */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              My Top Companies
            </h2>
            <Link
              href="/dashboard/recruiter/company"
              className="text-sm text-white/60 transition hover:text-white"
            >
              View all
            </Link>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5">
            {companies.map((company) => (
              <div
                key={company.name}
                className="flex items-center gap-3 border-b border-white/[0.05] py-4 first:pt-1 last:border-0"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-lg ${company.iconStyle}`}
                >
                  <Building2 className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {company.name}
                  </p>
                  <p className="truncate text-[11px] text-white/40">
                    {company.industry} • {company.location}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-white">
                    {company.jobs}
                  </p>
                  <p className="text-[9px] tracking-wide text-white/35 uppercase">
                    Active jobs
                  </p>
                </div>
              </div>
            ))}

            <Link
              href="/dashboard/recruiter/company"
              className="mt-4 flex h-11 items-center justify-center rounded-lg border border-white/[0.08] text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              View All Companies
            </Link>
          </div>
        </section>
      </div>

      {/* ---------- নিচে ডান কোণে + বাটন ---------- */}
      <Link
        href="/dashboard/recruiter/jobs/new"
        aria-label="Post a new job"
        className="fixed right-6 bottom-6 grid size-14 place-items-center rounded-full bg-white text-black shadow-2xl transition hover:scale-105 hover:bg-white/90"
      >
        <Plus className="size-6" />
      </Link>
    </div>
  )
}
