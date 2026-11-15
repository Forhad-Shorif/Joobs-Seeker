"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Inbox,
  Mail,
  MapPin,
  Search,
  Sparkles,
  UsersRound,
  XCircle,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  RECRUITER_DECISIONS,
  applicationStatusLabel,
  normalizeApplicationStatus,
  updateApplicationStatus,
} from "@/lib/SheareAction/RecruiterAction/Action"
import { formatDate, formatDateTime, formatTimeAgo } from "@/lib/everything/format"
import type {
  ApplicationStatus,
  JobApplicationsGroup,
  RecruiterApplication,
  RecruiterApplicationStats,
  RecruiterDecision,
} from "@/lib/Type/application"
import type { PostedJob } from "@/lib/Type/job"
import { showToast } from "@/lib/utils/toast"

/**
 * 📄 components/Recruiter/recruiter-applications.tsx
 * ==================================================================
 * 📌 কী: recruiter-এর Applications page — কার কাছ থেকে কী application
 *    এসেছে, কোন job-এ কতজন, কে কখন apply করেছে, আর status বদলানো।
 *
 * 📱 responsive নিয়ম:
 *    - সব flex/grid parent-এ `min-w-0` (নাহলে লম্বা email/job title
 *      পুরো page ডানে টেনে দেয় → horizontal overflow)
 *    - job chip গুলো horizontal scroll নয়, wrap করা grid
 *    - card-এর ডান পাশের mini details মোবাইলে নিচে, বড় screen-এ ডানে
 *    - dialog-এর max-height + নিজের scroll, তাই page ভেঙে যায় না
 *
 * 📦 data কোথা থেকে (সব আসল, কোনো demo data নেই):
 *    - groups → groupApplicationsByJob(jobs, applications)
 *    - stats  → buildRecruiterApplicationStats(jobs, applications)
 *    server page: app/dashboard/recruiter/applications/page.tsx
 *
 * 🔁 status বদলালে:
 *    updateApplicationStatus() → PATCH /ApplicationStatus/:id
 *    → backend Application document update করে
 *    → seeker-এর application page-এ নতুন status দেখায়
 * ==================================================================
 */

type Props = {
  groups: JobApplicationsGroup[]
  stats: RecruiterApplicationStats
}

type Row = {
  application: RecruiterApplication
  job: PostedJob
}

// status অনুযায়ী badge-এর রঙ
const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Applied: "border-white/20 bg-white/[0.06] text-white/70",
  Review: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  "Under Review": "border-amber-400/40 bg-amber-400/10 text-amber-300",
  Shortlisted: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Interview: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  Offered: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Rejected: "border-rose-400/40 bg-rose-400/10 text-rose-300",
}

const DECISION_STYLES: Record<RecruiterDecision, string> = {
  Review: "border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20",
  Shortlisted: "border-violet-400/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20",
  Interview: "border-sky-400/40 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20",
  Offered: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20",
  Rejected: "border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20",
}

function initials(name?: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// "React, Node" → ["React", "Node"]  (backend string বা array — দুটোই handle)
function skillList(value?: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value.map((skill) => String(skill).trim()).filter(Boolean)
  }

  return (value ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
}

export default function RecruiterApplications({ groups, stats }: Props) {
  const router = useRouter()

  const [query, setQuery] = useState("")
  const [activeJobId, setActiveJobId] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [note, setNote] = useState("")

  // status বদলালে সাথে সাথে UI-তে দেখানোর জন্য (server refresh-এর আগেই)
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ApplicationStatus>
  >({})

  // সব job-এর application এক flat list-এ
  const rows: Row[] = useMemo(
    () =>
      groups.flatMap((group) =>
        group.applications.map((application) => ({
          application,
          job: group.job,
        }))
      ),
    [groups]
  )

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()

    return rows.filter(({ application, job }) => {
      if (activeJobId !== "all" && job._id !== activeJobId) return false
      if (!text) return true

      return [application.name, application.email, application.title, job.title, job.company]
        .some((value) => (value ?? "").toLowerCase().includes(text))
    })
  }, [rows, query, activeJobId])

  const selected = useMemo(
    () => rows.find((row) => row.application._id === selectedId) ?? null,
    [rows, selectedId]
  )

  const statusOf = (application: RecruiterApplication): ApplicationStatus =>
    statusOverrides[application._id] ??
    normalizeApplicationStatus(application.status)

  const activeJob = groups.find((group) => group.job._id === activeJobId)

  /** recruiter decision → PATCH /ApplicationStatus/:id */
  async function changeStatus(status: RecruiterDecision) {
    if (!selected) return

    const applicationId = selected.application._id
    setSavingId(applicationId)

    try {
      await updateApplicationStatus(applicationId, {
        status,
        note: note.trim() || undefined,
        reviewer: selected.application.recruiterEmail,
      })

      setStatusOverrides((prev) => ({ ...prev, [applicationId]: status }))
      setNote("")
      showToast.success(
        `${selected.application.name || "Applicant"} → ${applicationStatusLabel(status)}`
      )

      // server data আবার আনি (stats/group-ও update হবে)
      router.refresh()
    } catch (error) {
      console.error("Status update failed:", error)
      showToast.error(
        error instanceof Error ? error.message : "Could not update status."
      )
    } finally {
      setSavingId(null)
    }
  }

  const statCards = [
    {
      label: "Total applications",
      value: stats.totalApplications,
      icon: Inbox,
    },
    {
      label: "Unique applicants",
      value: stats.uniqueApplicants,
      icon: UsersRound,
    },
    {
      label: "In interview",
      value: stats.byStatus.Interview,
      icon: CalendarDays,
    },
    {
      label: "Shortlisted / Offered",
      value: stats.byStatus.Shortlisted + stats.byStatus.Offered,
      icon: Sparkles,
    },
  ]

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 overflow-x-clip">
      {/* ---------- heading ---------- */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-violet-200 uppercase">
            <Sparkles className="size-3.5 shrink-0" />
            Recruiter workspace
          </span>

          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-wrap text-white sm:text-3xl">
            Applications
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
            আপনার post করা job-এ কে কে apply করেছে, কখন apply করেছে — সব এখানে।
            Applicant খুলে Review / Shortlist / Interview / Offer / Reject করুন।
          </p>
        </div>

        <Link
          href="/dashboard/recruiter/jobs"
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
        >
          <BriefcaseBusiness className="size-4 shrink-0" />
          Manage jobs
        </Link>
      </header>

      {/* ---------- stats ---------- */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="relative min-w-0 rounded-2xl border border-white/[0.07] bg-[#101012] p-4 sm:p-5"
            >
              <Icon className="absolute top-4 right-4 size-4 text-white/30" />

              <p className="pr-7 text-xs leading-snug text-white/55 sm:text-sm">
                {stat.label}
              </p>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-5 sm:text-3xl">
                {stat.value}
              </p>
            </div>
          )
        })}
      </section>

      {/* ---------- job-wise count ---------- */}
      <section className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-sm font-semibold text-white">
            Jobs by applicants
          </h2>
          <span className="text-xs text-white/35">
            {stats.jobsWithApplicants} / {stats.totalJobs} job-এ কেউ apply করেছে
          </span>
        </div>

        {groups.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
            এখনো কোনো job post করা হয়নি।{" "}
            <Link
              href="/dashboard/recruiter/jobs/new"
              className="text-violet-300 hover:text-violet-200"
            >
              Post a job
            </Link>
          </div>
        ) : (
          // horizontal scroll নয় — সবসময় wrap করা grid (overflow-এর মূল কারণ ছিল)
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              onClick={() => setActiveJobId("all")}
              className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                activeJobId === "all"
                  ? "border-violet-400/40 bg-violet-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-xs text-white/45">
                  All jobs
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-white/30">
                  সব application
                </span>
              </span>

              <span className="shrink-0 text-lg font-semibold text-white">
                {stats.totalApplications}
              </span>
            </button>

            {groups.map((group) => (
              <button
                key={group.job._id}
                type="button"
                onClick={() => setActiveJobId(group.job._id)}
                className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  activeJobId === group.job._id
                    ? "border-violet-400/40 bg-violet-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs text-white/45">
                    {group.job.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-white/30">
                    {group.job.company}
                  </span>
                </span>

                <span className="flex shrink-0 flex-col items-end">
                  <span className="text-lg font-semibold leading-tight text-white">
                    {group.total}
                  </span>
                  <span
                    className={
                      group.newCount > 0
                        ? "text-[10px] font-medium text-emerald-300"
                        : "text-[10px] text-white/35"
                    }
                  >
                    {group.newCount > 0
                      ? `${group.newCount} new`
                      : `applicant${group.total === 1 ? "" : "s"}`}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ---------- search ---------- */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full min-w-0 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email or job..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pr-3.5 pl-10 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>

        <p className="min-w-0 text-xs break-words text-white/40">
          {filtered.length} of {rows.length} applications
          {activeJob ? ` · ${activeJob.job.title}` : ""}
        </p>
      </section>

      {/* ---------- application list ---------- */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/20">
            <Inbox className="size-7" strokeWidth={1.6} />
          </span>

          <h2 className="mt-4 text-lg font-semibold text-white">
            {rows.length === 0 ? "No applications yet" : "Nothing matches"}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/40">
            {rows.length === 0
              ? "আপনার job-এ কেউ apply করলে এখানে সাথে সাথে দেখা যাবে।"
              : "Search বা job filter বদলে দেখুন।"}
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-3">
          {filtered.map(({ application, job }) => {
            const status = statusOf(application)
            const skills = skillList(application.skills).slice(0, 3)

            return (
              <article
                key={application._id}
                className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#101012] p-4 transition hover:border-white/15 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* left: কে apply করেছে */}
                  <div className="flex min-w-0 flex-1 gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/25 via-violet-500/10 to-transparent text-xs font-semibold text-violet-100 ring-1 ring-violet-400/20 sm:size-11 sm:text-sm">
                      {initials(application.name)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="min-w-0 max-w-full truncate text-[15px] font-semibold text-white">
                          {application.name || "Unnamed applicant"}
                        </h3>

                        <span
                          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                            STATUS_STYLES[status]
                          }`}
                        >
                          {applicationStatusLabel(status)}
                        </span>
                      </div>

                      <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-white/45">
                        <Mail className="size-3.5 shrink-0" />
                        <span className="truncate">{application.email}</span>
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-white/40">
                        <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5">
                          <BriefcaseBusiness className="size-3 shrink-0" />
                          <span className="truncate">{job.title}</span>
                        </span>

                        <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5">
                          <CalendarDays className="size-3 shrink-0" />
                          <span className="truncate">
                            {formatTimeAgo(application.applyAdt)} ·{" "}
                            {formatDateTime(application.applyAdt)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* right: mini details + view (মোবাইলে নিচে, বড় screen-এ ডানে) */}
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3 lg:w-52 lg:shrink-0 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                    <div className="min-w-0 text-[11px] text-white/40 lg:text-right">
                      {application.city && (
                        <p className="flex min-w-0 items-center gap-1 lg:justify-end">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{application.city}</span>
                        </p>
                      )}
                      {application.experience && (
                        <p className="truncate">{application.experience}</p>
                      )}
                      {skills.length > 0 && (
                        <p className="max-w-[12rem] truncate lg:max-w-full">
                          {skills.join(", ")}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNote("")
                        setSelectedId(application._id)
                      }}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-white/75 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                    >
                      View details
                      <ArrowUpRight className="size-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* ---------- details dialog ---------- */}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-1.5rem)] gap-3 overflow-y-auto overscroll-contain border border-white/10 bg-[#0b0b0e] p-4 text-white shadow-2xl shadow-black/60 sm:max-w-2xl sm:p-5">
          {selected && (
            <>
              <DialogHeader className="pr-7">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/30 to-transparent text-sm font-semibold text-violet-100 ring-1 ring-violet-400/25 sm:size-12 sm:text-base">
                    {initials(selected.application.name)}
                  </span>

                  <div className="min-w-0">
                    <DialogTitle className="truncate text-base font-semibold text-white sm:text-lg">
                      {selected.application.name || "Unnamed applicant"}
                    </DialogTitle>
                    <DialogDescription className="mt-1 min-w-0 text-xs break-words text-white/45">
                      <span className="break-all">{selected.application.email}</span>{" "}
                      · applied for{" "}
                      <span className="text-white/70">{selected.job.title}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* applicant details */}
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 sm:p-4">
                  <p className="text-[11px] font-semibold tracking-wider text-white/35 uppercase">
                    Applicant
                  </p>

                  <dl className="mt-3 space-y-2 text-xs">
                    {[
                      ["Location", selected.application.city],
                      ["Nationality", selected.application.nationality],
                      ["Date of birth", formatDate(selected.application.dateOfBirth)],
                      ["Gender", selected.application.gender],
                      ["Experience", selected.application.experience],
                      ["Applied", formatDateTime(selected.application.applyAdt)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-3"
                      >
                        <dt className="shrink-0 text-white/40">{label}</dt>
                        <dd className="min-w-0 text-right break-words text-white/80">
                          {value || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 sm:p-4">
                  <p className="text-[11px] font-semibold tracking-wider text-white/35 uppercase">
                    Job & skills
                  </p>

                  <dl className="mt-3 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="shrink-0 text-white/40">Job</dt>
                      <dd className="min-w-0 text-right break-words text-white/80">
                        {selected.job.title}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="shrink-0 text-white/40">Company</dt>
                      <dd className="min-w-0 text-right break-words text-white/80">
                        {selected.job.company}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="shrink-0 text-white/40">Workplace</dt>
                      <dd className="min-w-0 text-right break-words text-white/80">
                        {selected.application.workplace ||
                          selected.job.workplace ||
                          "—"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skillList(selected.application.skills).length === 0 ? (
                      <span className="text-xs text-white/40">No skills listed</span>
                    ) : (
                      skillList(selected.application.skills).map((skill) => (
                        <span
                          key={skill}
                          className="max-w-full rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] break-words text-white/60"
                        >
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* status actions */}
              <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 sm:p-4">
                <p className="text-[11px] font-semibold tracking-wider text-white/35 uppercase">
                  Update status
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {RECRUITER_DECISIONS.map((decision) => {
                    const active = statusOf(selected.application) === decision.value
                    const saving = savingId === selected.application._id

                    return (
                      <button
                        key={decision.value}
                        type="button"
                        title={decision.description}
                        disabled={saving}
                        onClick={() => changeStatus(decision.value)}
                        className={`inline-flex h-9 min-w-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          active
                            ? "border-white/60 bg-white text-black"
                            : DECISION_STYLES[decision.value]
                        }`}
                      >
                        {decision.value === "Offered" ? (
                          <CheckCircle2 className="size-3.5 shrink-0" />
                        ) : decision.value === "Rejected" ? (
                          <XCircle className="size-3.5 shrink-0" />
                        ) : null}
                        {decision.label}
                      </button>
                    )
                  })}
                </div>

                <label className="mt-3 block min-w-0">
                  <span className="text-[11px] text-white/40">
                    Note (optional) — seeker-ও দেখতে পাবে
                  </span>
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Interview 18 Nov, 3pm — Google Meet"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60"
                  />
                </label>

                {/* status history */}
                {selected.application.statusHistory &&
                  selected.application.statusHistory.length > 0 && (
                    <div className="mt-4 border-t border-white/[0.06] pt-3">
                      <p className="text-[11px] font-semibold tracking-wider text-white/35 uppercase">
                        History
                      </p>

                      <ul className="mt-2 space-y-1.5">
                        {selected.application.statusHistory.map((entry, index) => (
                          <li
                            key={`${entry.status}-${entry.at}-${index}`}
                            className="flex min-w-0 flex-col gap-0.5 text-[11px] text-white/50 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                          >
                            <span className="min-w-0 break-words text-white/75">
                              {applicationStatusLabel(entry.status)}
                              {entry.note ? ` — ${entry.note}` : ""}
                            </span>
                            <span className="shrink-0">{formatDateTime(entry.at)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              <p className="text-[11px] leading-relaxed text-white/30">
                Status বদলালে seeker-এর Application page-এ সাথে সাথে নতুন status
                দেখা যাবে (একই `Application` document update হয়)।
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
