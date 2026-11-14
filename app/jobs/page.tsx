import { Fragment, type ReactNode } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react"

import { SiteHeader } from "@/components/SheareHome/site-header"
import { formatSalary } from "@/lib/everything/format"
import {
  hasActiveFilters,
  parseJobFilters,
  toJobQuery,
} from "@/lib/everything/job-url"
import { getJobs } from "@/lib/SheareAction/RecruiterAction/Action"
import type { JobFilters, PostedJob } from "@/lib/Type/job"

/**
 * 📄 app/jobs/page.tsx
 *
 * কেন: job list-টা backend API থেকে দেখাতে
 * কখন: user /jobs page খুললে
 * কীভাবে: URL search params → getJobs() → GET /jobs → real job cards
 *
 * এখানে কোনো demo data নেই। backend যা দেয়, সেটাই দেখায়।
 */

export const metadata: Metadata = {
  title: "Jobs | HireLoop",
  description: "Browse real job opportunities from HireLoop.",
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

// backend-এ যেসব jobType value আছে
const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
] as const

const badgeClass =
  "inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60"

// ছোট info badge (icon + text)
function Badge({
  icon: Icon,
  children,
  className = "",
}: {
  icon: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`${badgeClass} ${className}`}>
      <Icon className="size-3.5" />
      {children}
    </span>
  )
}

// deadline 30 দিনের মধ্যে হলে "New" badge
function isNewJob(deadline: string): boolean {
  const time = new Date(deadline).getTime()
  if (Number.isNaN(time)) return false

  const daysLeft = (time - Date.now()) / (1000 * 60 * 60 * 24)
  return daysLeft >= 0 && daysLeft <= 30
}

// filter object → /jobs?search=...&jobType=...
function buildJobsHref(filters: JobFilters): string {
  const query = toJobQuery(filters)
  return query ? `/jobs?${query}` : "/jobs"
}

// current page-এর আশেপাশে সর্বোচ্চ ৫টা page number
function pageWindow(current: number, total: number): number[] {
  const size = Math.min(5, total)
  const start = Math.max(1, Math.min(current - 2, total - size + 1))

  return Array.from({ length: size }, (_, index) => start + index)
}

/* ------------------------------------------------------------------ */
/* Job card                                                            */
/* ------------------------------------------------------------------ */

function JobCard({ job }: { job: PostedJob }) {
  const salary = formatSalary(job.salary)

  return (
    <article className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 transition hover:border-white/[0.14] sm:p-6">
      <div className="flex items-start gap-4 sm:gap-5">
        {/* company logo placeholder */}
        <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-lg font-semibold text-white">
          {job.company.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/browse-jobs/detailsjobs/${job._id}`}
                className="group inline-flex min-w-0 items-center"
              >
                <h2 className="truncate text-lg font-semibold text-white transition group-hover:text-violet-200 sm:text-xl">
                  {job.title}
                </h2>
              </Link>

              <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-white/45">
                <span>{job.company}</span>

                {job.location && (
                  <>
                    <span aria-hidden>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {job.location}
                    </span>
                  </>
                )}

                {job.workplace && (
                  <>
                    <span aria-hidden>•</span>
                    <span>{job.workplace}</span>
                  </>
                )}
              </p>
            </div>

            <Link
              href={`/browse-jobs/detailsjobs/${job._id}`}
              aria-label={`View ${job.title}`}
              className="grid size-9 shrink-0 place-items-center rounded-md text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {salary && <Badge icon={Banknote}>{salary}</Badge>}
            {job.jobType && (
              <Badge icon={BriefcaseBusiness}>{job.jobType}</Badge>
            )}
            {job.experience && (
              <Badge icon={GraduationCap}>{job.experience}</Badge>
            )}

            {isNewJob(job.deadline) && (
              <Badge
                icon={Zap}
                className="border-emerald-400/25 bg-emerald-500/10 text-emerald-400"
              >
                New
              </Badge>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

const pageBase = "grid size-9 place-items-center rounded-md text-sm transition"
const pageIdle = "border border-white/[0.08] text-white/50 hover:text-white"
const pageActive = "bg-white font-semibold text-black"
const pageDisabled = "pointer-events-none opacity-40"

function Pagination({
  filters,
  currentPage,
  totalPages,
}: {
  filters: JobFilters
  currentPage: number
  totalPages: number
}) {
  const pages = pageWindow(currentPage, totalPages)

  return (
    <nav
      aria-label="Job pages"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
    >
      <Link
        href={buildJobsHref({
          ...filters,
          page: String(Math.max(1, currentPage - 1)),
        })}
        aria-label="Previous page"
        aria-disabled={currentPage <= 1}
        className={`${pageBase} ${pageIdle} ${
          currentPage <= 1 ? pageDisabled : ""
        }`}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((page, index) => (
        <Fragment key={page}>
          {/* মাঝখানে ফাঁক থাকলে "..." দেখাই */}
          {index > 0 && page - pages[index - 1] > 1 && (
            <span className="px-1 text-white/30">...</span>
          )}

          <Link
            href={buildJobsHref({ ...filters, page: String(page) })}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${pageBase} ${
              page === currentPage ? pageActive : pageIdle
            }`}
          >
            {page}
          </Link>
        </Fragment>
      ))}

      <Link
        href={buildJobsHref({
          ...filters,
          page: String(Math.min(totalPages, currentPage + 1)),
        })}
        aria-label="Next page"
        aria-disabled={currentPage >= totalPages}
        className={`${pageBase} ${pageIdle} ${
          currentPage >= totalPages ? pageDisabled : ""
        }`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const filters = parseJobFilters(await searchParams)

  // backend থেকে real jobs আনি
  const data = await getJobs(toJobQuery(filters)).catch(() => null)
  const loadFailed =
    !data || data.success === false || !Array.isArray(data.result)

  const jobs = data?.result ?? []
  const totalJobs = data?.totalJobs ?? 0
  const currentPage = data?.currentPage ?? 1
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="min-h-svh bg-[#050505] text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* ---------- search box ---------- */}
        <form
          action="/jobs"
          className="rounded-2xl border border-white/[0.07] bg-[#101012] p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/35" />
              <input
                key={filters.search ?? "all"}
                type="search"
                name="search"
                defaultValue={filters.search}
                placeholder="Search by job title, keywords..."
                aria-label="Search jobs"
                className="h-12 w-full rounded-lg border border-white/[0.08] bg-[#151517] pr-4 pl-12 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
              />
            </label>

            {/* job type filter active থাকলে search করার সময় সেটাও ধরে রাখি */}
            {filters.jobType && (
              <input type="hidden" name="jobType" value={filters.jobType} />
            )}

            <button
              type="submit"
              className="h-12 shrink-0 rounded-lg bg-white px-8 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Search Jobs
            </button>
          </div>
        </form>

        {/* ---------- filter + result ---------- */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* বাম: job type filter */}
          <aside className="h-fit rounded-2xl border border-white/[0.07] bg-[#101012] p-6">
            <h2 className="text-2xl font-semibold text-white">Filters</h2>

            <div className="mt-8">
              <p className="text-base text-white/60">Job Type</p>

              <div className="mt-4 space-y-1.5">
                <Link
                  href={buildJobsHref({
                    ...filters,
                    jobType: undefined,
                    page: undefined,
                  })}
                  aria-current={!filters.jobType ? "page" : undefined}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm transition ${
                    !filters.jobType
                      ? "bg-white/[0.08] text-white"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  All job types
                </Link>

                {JOB_TYPES.map((type) => {
                  const active = filters.jobType === type

                  return (
                    <Link
                      key={type}
                      href={buildJobsHref({
                        ...filters,
                        jobType: type,
                        page: undefined,
                      })}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? "bg-white/[0.08] text-white"
                          : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {type}
                    </Link>
                  )
                })}
              </div>
            </div>

            {hasActiveFilters(filters) && (
              <Link
                href="/jobs"
                className="mt-6 inline-flex text-xs text-violet-300 transition hover:text-violet-200"
              >
                Clear filters
              </Link>
            )}
          </aside>

          {/* ডান: job list */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
                {loadFailed
                  ? "Jobs unavailable"
                  : `Found ${totalJobs.toLocaleString()} jobs`}
              </h1>

              <p className="text-xs text-white/35">Latest first</p>
            </div>

            {loadFailed ? (
              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-[#101012] p-10 text-center">
                <RefreshCw className="mx-auto size-6 text-white/40" />
                <p className="mt-3 text-white/60">
                  Could not load jobs from the backend.
                </p>
                <Link
                  href="/jobs"
                  className="mt-2 inline-block text-sm text-violet-300 transition hover:text-violet-200"
                >
                  Try again
                </Link>
              </div>
            ) : jobs.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-[#101012] p-10 text-center">
                <p className="text-white/60">No jobs found.</p>

                {hasActiveFilters(filters) && (
                  <Link
                    href="/jobs"
                    className="mt-2 inline-block text-sm text-violet-300 transition hover:text-violet-200"
                  >
                    Clear filters
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}

            {!loadFailed && totalPages > 1 && (
              <Pagination
                filters={filters}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
