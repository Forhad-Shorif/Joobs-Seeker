"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Laptop,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Tag,
} from "lucide-react"

import { JobMeta } from "@/components/SheareJobs/job-meta"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteJob } from "@/lib/SheareAction/RecruiterAction/delete-job"
import { formatDeadline, formatSalary } from "@/lib/everything/format"
import type { PostedJob } from "@/lib/Type/job"

/**
 * 📄 components/PostedJobs.tsx
 * কাজ: recruiter-এর post করা job গুলো ছোট card আকারে দেখানো।
 *
 * Helper গুলো আলাদা ফাইলে:
 * - JobMeta          → components/job-meta.tsx
 * - formatSalary     → lib/format.ts
 * - formatDeadline   → lib/format.ts
 * - DeleteJob        → lib/SheareAction/delete-job.tsx
 */

type PostedJobsProps = {
  jobs: PostedJob[]
}

type JobCardProps = {
  job: PostedJob
}

export default function PostedJobs({ jobs }: PostedJobsProps) {
  return (
    <section>
      {/* ---------- Header ---------- */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-violet-200 uppercase">
            <Sparkles className="size-3.5" />
            Recruiter workspace
          </span>

          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Manage jobs
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
            Everything you have posted in one place. Review details, edit roles
            and remove old posts.
          </p>
        </div>

        <Link
          href="/dashboard/recruiter/jobs/new"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-medium text-white shadow-[0_0_35px_-12px_rgba(139,92,246,1)] transition hover:bg-violet-500"
        >
          <Plus className="size-4" />
          Post a job
        </Link>
      </div>

      {/* ---------- Job count ---------- */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
          <BriefcaseBusiness className="size-4" />
        </span>

        <div>
          <p className="text-sm font-medium text-white">
            {jobs.length} posted {jobs.length === 1 ? "job" : "jobs"}
          </p>
          <p className="text-xs text-white/35">
            Live roles from your recruiter account
          </p>
        </div>
      </div>

      {/* ---------- Empty state ---------- */}
      {jobs.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/20">
            <BriefcaseBusiness className="size-8" strokeWidth={1.6} />
          </span>

          <h2 className="mt-5 text-lg font-semibold text-white">
            No jobs posted yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/40">
            Post your first role and it will appear here with edit and delete
            controls.
          </p>

          <Link
            href="/dashboard/recruiter/jobs/new"
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Post your first job
            <ArrowUpRight className="size-4 text-violet-300" />
          </Link>
        </div>
      ) : (
        /* ---------- Job list (one column) ---------- */
        <div className="mt-5 flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </section>
  )
}

function JobCard({ job }: JobCardProps) {
  // skills একটা string ("React, Node"), তাই ভেঙে array বানাই
  const skills = job.skills
    ? job.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : []

  // card ছোট রাখতে প্রথম ৪টা skill দেখাই
  const visibleSkills = skills.slice(0, 4)
  const remainingSkills = skills.length - visibleSkills.length

  const salary = formatSalary(job.salary)

  return (
    <Card className="group relative gap-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101012] py-0 ring-0 transition duration-300 hover:border-violet-400/20 hover:bg-[#121014]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-12 size-40 rounded-full bg-violet-500/[0.08] blur-3xl transition group-hover:bg-violet-500/[0.12]"
      />

      <CardContent className="relative flex flex-col gap-3 p-3.5 sm:flex-row sm:items-start sm:justify-between sm:p-4">
        {/* ---------- Left: job info ---------- */}
        <div className="flex min-w-0 gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/25 via-violet-500/10 to-transparent text-violet-300 ring-1 ring-violet-400/20 sm:size-10">
            <BriefcaseBusiness className="size-5" strokeWidth={1.7} />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold tracking-tight text-white sm:text-base">
                {job.title || "Untitled role"}
              </h2>

              {job.category && (
                <span className="rounded-full border border-violet-400/15 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-violet-200/80 uppercase">
                  {job.category}
                </span>
              )}
            </div>

            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/45">
              <Building2 className="size-3.5 shrink-0" />
              <span className="truncate">
                {job.company || "Company not set"}
              </span>
            </p>

            <div className="mt-2 flex flex-wrap gap-1">
              <JobMeta icon={MapPin}>
                {job.location || "Location not set"}
              </JobMeta>
              <JobMeta icon={Clock3}>
                {job.jobType || "Job type not set"}
              </JobMeta>
              <JobMeta icon={Laptop}>
                {job.workplace || "Workplace not set"}
              </JobMeta>
              <JobMeta icon={CircleDollarSign}>
                {salary || "Salary not set"}
              </JobMeta>

              {job.deadline && (
                <JobMeta icon={CalendarDays}>
                  Apply by {formatDeadline(job.deadline)}
                </JobMeta>
              )}
            </div>

            {job.description && (
              <p className="mt-2 line-clamp-1 max-w-2xl text-xs leading-relaxed text-white/35">
                {job.description}
              </p>
            )}

            {visibleSkills.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <Tag className="size-3 text-white/25" />

                {visibleSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/50"
                  >
                    {skill}
                  </span>
                ))}

                {remainingSkills > 0 && (
                  <span className="rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/35">
                    +{remainingSkills} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---------- Right: actions (সবসময় এক row-তে) ---------- */}
        <div className="flex shrink-0 flex-row items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            aria-label={`Edit ${job.title}`}
            title="Edit job"
            className="size-8 rounded-lg border-white/10 bg-white/[0.03] px-0 text-white/70 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
          >
            <Pencil className="size-3.5" />
          </Button>

          <DeleteJob job={job} />
        </div>
      </CardContent>
    </Card>
  )
}
