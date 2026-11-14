"use client"

import { useState } from "react"
import Link from "next/link"
import { Banknote, Bookmark, Clock3, MapPin, Trash2 } from "lucide-react"

import type { SavedJob } from "@/lib/Type/job"
import { SeekerDeleteSavedJob } from "@/lib/SheareAction/SeekerAction/Action"
import { showToast } from "@/lib/utils/toast"
import ApplyBtn from '@/components/Seeker/ApplyBtn'

/**
 * 📄 components/seeker/saved-jobs-view.tsx
 *
 * কেন এই file?
 * - saved jobs-এর list দেখানোর UI
 * - delete button-এর কাজ
 *
 * কখন use হয়?
 * - app/dashboard/seeker/saved/page.tsx থেকে
 *   <SavedJobsView jobs={jobs} /> call হলে
 *
 * কীভাবে data আসে?
 * - page backend থেকে jobs এনে props আকারে পাঠায়
 * - এই component শুধু সেগুলো screen-এ দেখায়
 */

type SavedJobsViewProps = {
  jobs: SavedJob[]
}

type SavedJobCardProps = {
  job: SavedJob
  deleting: boolean
  onDelete: (id: string) => void
}

// ---------- একটা job card ----------

function SavedJobCard({ job, deleting, onDelete }: SavedJobCardProps) {
  // savedAt থেকে শুধু তারিখ দেখাই (সহজে বোঝার জন্য)
  const savedDate = new Date(job.savedAt).toISOString().slice(0, 10)

  return (
    <article className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* company-র প্রথম অক্ষর দিয়ে ছোট logo */}
        <span className="grid size-14 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-[#171719] text-lg font-semibold text-white">
          {job.company.charAt(0).toUpperCase()}
        </span>

        {/* job title, company, location, salary */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-semibold text-white">{job.title}</h2>

            <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white/45 uppercase">
              {job.company}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white/55">
              <MapPin className="size-3.5" />
              {job.location}
            </span>

            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white/55">
              <Banknote className="size-3.5" />
              {job.salary.currency} {job.salary.min} - {job.salary.max} ({job.salary.period})
            </span>
          </div>
        </div>

        {/* saved date + delete/apply button */}
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <p className="flex items-center gap-1.5 text-xs text-white/45">
            <Clock3 className="size-3.5" />
            Saved {savedDate}
          </p>

          <div className="mt-1 flex items-center gap-2">
            {/* Delete icon: click করলে backend থেকে saved job delete হবে */}
            <button
              type="button"
              onClick={() => onDelete(job._id)}
              disabled={deleting}
              aria-label="Delete saved job"
              title="Delete saved job"
              className="grid size-9 place-items-center rounded-full border border-white/[0.08] text-white/60 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
            >
              <Trash2 className="size-4" />
            </button>

            <ApplyBtn job = {job}/>
          </div>
        </div>
      </div>
    </article>
  )
}

// ---------- main component ----------

export function SavedJobsView({ jobs: initialJobs }: SavedJobsViewProps) {
  // কেন state? delete success হলে list থেকে card বাদ দিতে
  const [jobs, setJobs] = useState(initialJobs)

  // কেন state? delete চলাকালীন ওই card-এর button disable রাখতে
  const [deletingId, setDeletingId] = useState<string | null>(null)

  /**
   * Delete কীভাবে কাজ করে:
   * 1. deletingId set করি → button disable হয়
   * 2. SeekerDeleteSavedJob(id) backend-এ DELETE request পাঠায়
   * 3. success হলে list থেকে card বাদ দিই
   * 4. fail হলে error toast দেখাই
   */
  async function deleteJob(id: string) {
    setDeletingId(id)

    try {
      await SeekerDeleteSavedJob(id)

      setJobs((previous) => previous.filter((job) => job._id !== id))
      showToast.success("Removed from saved jobs")
    } catch (error) {
      console.error("Saved job delete failed:", error)
      showToast.error("Could not delete saved job.")
    } finally {
      // কাজ শেষ হলে button আবার normal করি
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* page heading + total saved */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Saved Jobs</h1>
          <p className="mt-2 text-sm text-white/45">
            Manage and track your bookmarked opportunities.
          </p>
        </div>

        <div className="flex min-w-[150px] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#101012] px-4 py-3">
          <Bookmark className="size-4 text-white/50" />
          <div>
            <p className="text-[10px] tracking-[0.08em] text-white/40 uppercase">Total Saved</p>
            <p className="text-2xl font-semibold text-white">{jobs.length}</p>
          </div>
        </div>
      </div>

      {/* job list */}
      {jobs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#101012] p-10 text-center">
          <p className="text-white/60">No saved jobs found.</p>
          <Link href="/browse-jobs" className="mt-2 inline-block text-sm text-violet-300">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {jobs.map((job) => (
            <SavedJobCard
              key={job._id}
              job={job}
              deleting={deletingId === job._id}
              onDelete={deleteJob}
            />
          ))}
        </div>
      )}
    </div>
  )
}
