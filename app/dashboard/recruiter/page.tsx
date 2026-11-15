import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import type { LucideIcon } from "lucide-react"
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Inbox,
  Plus,
  UsersRound,
  Zap,
} from "lucide-react"

import { auth } from "@/lib/auth"
import {
  applicationStatusLabel,
  buildRecruiterApplicationStats,
  getRecruiterApplications,
  getRecruiterJobs,
  groupJobsByCompany,
  isJobOpen,
  normalizeApplicationStatus,
} from "@/lib/SheareAction/RecruiterAction/Action"
import { formatDate } from "@/lib/everything/format"
import type { ApplicationStatus, RecruiterApplication } from "@/lib/Type/application"
import type { PostedJob } from "@/lib/Type/job"

export const metadata: Metadata = {
  title: "Recruiter dashboard - HireLoop",
  description: "Your jobs, applicants and companies in one place.",
}

// session (headers) দরকার, তাই প্রতিবার request-time-এ render
export const dynamic = "force-dynamic"

/**
 * 📄 app/dashboard/recruiter/page.tsx
 * ==================================================================
 * 📌 কী: recruiter-এর dashboard — সব সংখ্যা ও list আসল data থেকে।
 *
 * 📦 data কোথা থেকে (কোনো hardcoded/demo data নেই):
 *   ১. session → recruiter-এর email + নাম
 *   ২. GET /GetJobs/:email            → নিজের post করা job
 *   ৩. GET /RecruiterApplications/:email
 *      (endpoint না থাকলে GET /JobApplications/:jobId fallback)
 *      → ওই job-গুলোর সব application
 *   ৪. buildRecruiterApplicationStats → job/applicant সংখ্যা
 *      isJobOpen                      → active/closed job
 *      groupJobsByCompany             → Top Companies
 *
 * ⚠️ session না থাকলে বা data না এলে সব 0 + empty state দেখাবে —
 *    কোনো ডেমো নাম/সংখ্যা নয়।
 * ==================================================================
 */

// status অনুযায়ী badge-এর রঙ
const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Applied: "border-white/15 bg-white/[0.05] text-white/65",
  Review: "border-amber-400/25 bg-amber-500/10 text-amber-300",
  "Under Review": "border-amber-400/25 bg-amber-500/10 text-amber-300",
  Shortlisted: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  Interview: "border-sky-400/25 bg-sky-500/10 text-sky-300",
  Offered: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  Rejected: "border-rose-400/25 bg-rose-500/10 text-rose-300",
}

// "Akub Ali" → "AA"
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default async function RecruiterPage() {
  let name = ""
  let jobs: PostedJob[] = []
  let applications: RecruiterApplication[] = []

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    name = session?.user?.name?.trim() ?? ""
    const email = session?.user?.email ?? ""

    if (email) {
      jobs = await getRecruiterJobs(email).catch((error) => {
        console.error("Recruiter dashboard jobs load failed:", error)
        return [] as PostedJob[]
      })

      if (jobs.length > 0) {
        applications = await getRecruiterApplications(email, jobs).catch(
          (error) => {
            console.error("Recruiter dashboard applications load failed:", error)
            return [] as RecruiterApplication[]
          }
        )
      }
    }
  } catch (error) {
    console.error("Recruiter dashboard load failed:", error)
  }

  const stats = buildRecruiterApplicationStats(jobs, applications)

  const openJobs = jobs.filter((job) => isJobOpen(job)).length
  const closedJobs = jobs.length - openJobs

  const recentApplications = applications.slice(0, 5)
  const companies = groupJobsByCompany(jobs).slice(0, 4)

  const statCards: { label: string; value: number; icon: LucideIcon }[] = [
    { label: "Total job posts", value: stats.totalJobs, icon: FileText },
    { label: "Total applicants", value: stats.uniqueApplicants, icon: UsersRound },
    { label: "Active jobs", value: openJobs, icon: Zap },
    { label: "Jobs closed", value: closedJobs, icon: CheckCircle2 },
  ]

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1280px] pb-20">
      {/* ---------- শিরোনাম ---------- */}
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-wrap text-white sm:text-3xl">
          Welcome back{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
          আপনার job, applicant আর company — সব এক জায়গায়।
        </p>
      </div>

      {/* ---------- ৪টি স্ট্যাট কার্ড ---------- */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#101012] p-4 sm:p-6"
            >
              <span className="grid size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 sm:size-12">
                <Icon className="size-5" />
              </span>

              <p className="mt-4 text-xs text-white/45 sm:mt-7 sm:text-sm">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white sm:mt-2 sm:text-3xl">
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* ---------- নিচের দুই কলাম ---------- */}
      <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ----- বাম: Recent Applications ----- */}
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Recent Applications
            </h2>
            <Link
              href="/dashboard/recruiter/applications"
              className="shrink-0 text-sm text-white/60 transition hover:text-white"
            >
              View all
            </Link>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101012]">
            {recentApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/20">
                  <Inbox className="size-6" strokeWidth={1.6} />
                </span>

                <p className="mt-4 text-sm font-medium text-white">
                  এখনো কোনো application আসেনি
                </p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/40">
                  আপনার job-এ কেউ apply করলে এখানে সবচেয়ে নতুন application গুলো
                  দেখা যাবে।
                </p>

                <Link
                  href="/dashboard/recruiter/jobs/new"
                  className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-white/75 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                >
                  <Plus className="size-3.5" />
                  Post a job
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {recentApplications.map((application) => {
                  const status = normalizeApplicationStatus(application.status)

                  return (
                    <li key={application._id} className="min-w-0">
                      <Link
                        href="/dashboard/recruiter/applications"
                        className="flex flex-col gap-3 px-4 py-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[11px] font-semibold text-white/60">
                            {getInitials(application.name)}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {application.name || "Unnamed applicant"}
                            </p>
                            <p className="truncate text-[11px] text-white/40">
                              {[application.title, application.company]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-white/45 sm:shrink-0 sm:justify-end">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3 shrink-0" />
                            {formatDate(application.applyAdt)}
                          </span>

                          <span className="max-w-[8rem] truncate">
                            {application.experience || "—"}
                          </span>

                          <span
                            className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                              STATUS_STYLES[status]
                            }`}
                          >
                            {applicationStatusLabel(status)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        {/* ----- ডান: Companies (নিজের job থেকে) ----- */}
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              My Companies
            </h2>
            <Link
              href="/dashboard/recruiter/jobs"
              className="shrink-0 text-sm text-white/60 transition hover:text-white"
            >
              View all
            </Link>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#101012] p-5">
            {companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="grid size-11 place-items-center rounded-lg bg-white/[0.04] text-white/40">
                  <Building2 className="size-5" />
                </span>

                <p className="mt-3 text-sm font-medium text-white">
                  এখনো কোনো company নেই
                </p>
                <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-white/40">
                  Job post করলে আপনার company এখানে নিজে থেকেই যোগ হবে।
                </p>

                <Link
                  href="/dashboard/recruiter/jobs/new"
                  className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-white/75 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                >
                  <Plus className="size-3.5" />
                  Post a job
                </Link>
              </div>
            ) : (
              <>
                {companies.map((company) => (
                  <div
                    key={company.name}
                    className="flex min-w-0 items-center gap-3 border-b border-white/[0.05] py-4 first:pt-1 last:border-0"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-violet-500/15 text-sm font-semibold text-violet-200">
                      {company.name.charAt(0).toUpperCase()}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {company.name}
                      </p>
                      <p className="truncate text-[11px] text-white/40">
                        {[company.category, company.location]
                          .filter(Boolean)
                          .join(" • ") || "—"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-white">
                        {company.jobs}
                      </p>
                      <p className="text-[9px] tracking-wide text-white/35 uppercase">
                        {company.openJobs} active
                      </p>
                    </div>
                  </div>
                ))}

                <Link
                  href="/dashboard/recruiter/jobs"
                  className="mt-4 flex h-11 items-center justify-center rounded-lg border border-white/[0.08] text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                >
                  Manage jobs
                </Link>
              </>
            )}
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
