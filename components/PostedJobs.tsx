"use client"

import Link from "next/link"
import { useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Delete,
  Laptop,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteJob } from "@/lib/actions/delete-job"
import type { JobSalary, PostedJob } from "@/lib/job"
import { showToast } from "@/lib/toast"

type PostedJobsProps = {
  jobs: PostedJob[]
}

type JobCardProps = {
  job: PostedJob
  isDeleting: boolean
  onDelete: () => void
}

type MetaProps = {
  icon: LucideIcon
  children: ReactNode
}

/**
 * 📄 ফাইল: components/PostedJobs.tsx
 * কাজ: recruiter-এর post করা jobs এক column-এ সুন্দর card আকারে দেখানো।
 *
 * 💡 type:
 * - `jobs: PostedJob[]` — backend থেকে আসা job + MongoDB `_id`
 * - `job.salary` — JobSalary type DeleteJob
 * - helper function-গুলোতেও আলাদা type দেওয়া আছে
 */
export default function PostedJobs({ jobs }: PostedJobsProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(job: PostedJob): Promise<void> {
    setDeletingId(job._id)

    try {
      await deleteJob(job._id)

      //amar code
      // const result =  await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/DeleteJob/${job._id}`,{
      //   method:delete,
      // })
      showToast.success("Job deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Job delete failed:", error)
      showToast.error(error instanceof Error ? error.message : "Could not delete job.")
    } finally {
      setDeletingId(null)
    }
  }

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
            Everything you have posted in one place. Review details, edit roles and remove old posts.
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
          <p className="text-xs text-white/35">Live roles from your recruiter account</p>
        </div>
      </div>

      {/* ---------- Empty state ---------- */}
      {jobs.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/20">
            <BriefcaseBusiness className="size-8" strokeWidth={1.6} />
          </span>

          <h2 className="mt-5 text-lg font-semibold text-white">No jobs posted yet</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/40">
            Post your first role and it will appear here with edit and delete controls.
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
        /* ---------- One column job cards ---------- */
        <div className="mt-6 flex flex-col gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isDeleting={deletingId === job._id}
              onDelete={() => handleDelete(job)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function JobCard({ job, isDeleting, onDelete }: JobCardProps) {
  const skills = job.skills
    ? job.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : []

  const visibleSkills = skills.slice(0, 5)
  const remainingSkills = Math.max(skills.length - visibleSkills.length, 0)
  const salary = formatSalary(job.salary)

  return (
    <Card className="group relative gap-0 overflow-hidden rounded-3xl border border-white/[0.07] bg-[#101012] py-0 ring-0 transition duration-300 hover:border-violet-400/20 hover:bg-[#121014]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 size-56 rounded-full bg-violet-500/[0.08] blur-3xl transition group-hover:bg-violet-500/[0.12]"
      />

      <CardContent className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        {/* ---------- Left: job info ---------- */}
        <div className="flex min-w-0 gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/25 via-violet-500/10 to-transparent text-violet-300 ring-1 ring-violet-400/20 sm:size-14">
            <BriefcaseBusiness className="size-6 sm:size-7" strokeWidth={1.7} />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                {job.title || "Untitled role"}
              </h2>

              {job.category && (
                <span className="rounded-full border border-violet-400/15 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-violet-200/80 uppercase">
                  {job.category}
                </span>
              )}
            </div>

            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/45">
              <Building2 className="size-4 shrink-0" />
              <span className="truncate">{job.company || "Company not set"}</span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Meta icon={MapPin}>{job.location || "Location not set"}</Meta>
              <Meta icon={Clock3}>{job.jobType || "Job type not set"}</Meta>
              <Meta icon={Laptop}>{job.workplace || "Workplace not set"}</Meta>
              <Meta icon={CircleDollarSign}>{salary || "Salary not set"}</Meta>

              {job.deadline && (
                <Meta icon={CalendarDays}>Apply by {formatDeadline(job.deadline)}</Meta>
              )}
            </div>

            {job.description && (
              <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/35">
                {job.description}
              </p>
            )}

            {visibleSkills.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Tag className="size-3.5 text-white/25" />

                {visibleSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[11px] text-white/50"
                  >
                    {skill}
                  </span>
                ))}

                {remainingSkills > 0 && (
                  <span className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[11px] text-white/35">
                    +{remainingSkills} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---------- Right: actions ---------- */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
          <Button
            type="button"
            variant="outline"
            aria-label={`Edit ${job.title}`}
            className="h-9 gap-2 rounded-xl border-white/10 bg-white/[0.03] px-3 text-xs text-white/70 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>

          <Dialog>
            <DialogTrigger
              disabled={isDeleting}
              aria-label={`Delete ${job.title}`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-400/15 bg-rose-500/[0.06] px-3 text-xs font-medium text-rose-200/80 transition outline-none hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200 disabled:pointer-events-none disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              Delete
            </DialogTrigger>

            <DialogContent className="border border-white/10 bg-[#0b0b0e] text-white shadow-2xl shadow-black/60 sm:max-w-md">
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/20">
                    <Trash2 className="size-5" />
                  </span>

                  <div>
                    <DialogTitle className="text-base font-semibold text-white">
                      Delete this job?
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-xs leading-relaxed text-white/45">
                      &quot;{job.title}&quot; will be permanently removed. This action cannot be
                      undone.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <DialogFooter className="-mx-4 -mb-4 mt-2 gap-2 border-white/10 bg-white/[0.02] p-4">
                <DialogClose
                  render={
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07] hover:text-white"
                    />
                  }
                >
                  Cancel
                </DialogClose>

                <DialogClose
                  disabled={isDeleting}
                  onClick={onDelete}
                  render={
                    <Button
                      variant="destructive"
                      className="bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                    />
                  }
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  {isDeleting ? "Deleting..." : "Delete job"}
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

function Meta({ icon: Icon, children }: MetaProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
      <Icon className="size-3.5 shrink-0 text-violet-300/70" strokeWidth={1.7} />
      {children}
    </span>
  )
}

function formatSalary(salary?: JobSalary): string {
  if (!salary) return ""

  const currency = salary.currency?.trim()
  const min = salary.min?.trim()
  const max = salary.max?.trim()

  if (!min && !max) return ""

  const range = min && max ? `${min} - ${max}` : min || max
  const amount = [currency, range].filter(Boolean).join(" ")

  return [amount, salary.period].filter(Boolean).join(" · ")
}

function formatDeadline(deadline: string): string {
  if (!deadline) return ""

  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return deadline

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}
