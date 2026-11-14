import { Fragment, type ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  Search,
  Zap,
} from "lucide-react"

import { FilterSidebar } from "@/components/browse-jobs/filter-sidebar"
import {SortSelect } from "@/components/browse-jobs/job-controls"
import { SiteHeader } from "@/components/SheareHome/site-header"
import { getJobs } from "@/lib/SheareAction/RecruiterAction/Action"
import { formatSalary } from "@/lib/everything/format"
import type { JobFilters, PostedJob } from "@/lib/Type/job"
import { buildJobHref, hasActiveFilters, parseJobFilters, toJobQuery } from "@/lib/everything/job-url"
import { SaveJobButton } from "@/components/browse-jobs/SaveBtn"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * 📄 app/browse-jobs/page.tsx
 * কাজ: image-এর মতো job browse page — search + left filter + job cards + pagination।
 *
 * Data flow:
 *  URL (?search=&category=&sort=&page=) → parseJobFilters → getJobs → render
 *  Filter/sort click করলে শুধু URL বদলায়, server আবার নতুন data এনে দেয়।
 */
export default async function BrowseJobsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const filters = parseJobFilters(await searchParams)

  // backend down হলেও page ভাঙবে না — empty list দেখাবে
  const data = await getJobs(toJobQuery(filters)).catch(() => null)

  const jobs = data?.result ?? []
  const totalJobs = data?.totalJobs ?? 0
  const currentPage = data?.currentPage ?? 1
  const totalPages = data?.totalPages ?? 1

  // search করার সময় বাকি active filter গুলো hidden input দিয়ে ধরে রাখি
  const hiddenFilters = Object.entries(filters).filter(
    (entry): entry is [string, string] =>
      Boolean(entry[1]) && entry[0] !== "search" && entry[0] !== "page"
  )

  return (
    <div className="min-h-svh bg-[#050505] text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* ---------- search bar ---------- */}
        <form
          action="/browse-jobs"
          className="rounded-2xl border border-white/[0.07] bg-[#101012] p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/35" />
              <input
                // search বদলালে input-ও reset হবে
                key={filters.search ?? "all"}
                type="search"
                name="search"
                defaultValue={filters.search}
                placeholder="Search by job title, keywords..."
                aria-label="Search jobs"
                className="h-12 w-full rounded-lg border border-white/[0.08] bg-[#151517] pr-4 pl-12 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
              />
            </label>

            {hiddenFilters.map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}

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
          <FilterSidebar filters={filters} />

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                Found {totalJobs.toLocaleString()} Professional Jobs
              </h1>

              <SortSelect value={filters.sort ?? "latest"} />
            </div>

            {jobs.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-[#101012] p-10 text-center">
                <p className="text-white/60">No jobs found.</p>

                {hasActiveFilters(filters) && (
                  <Link
                    href="/browse-jobs"
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

            {totalPages > 1 && (
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

/* ------------------------------------------------------------------ */
/* Job card                                                            */
/* ------------------------------------------------------------------ */

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
              <h2 className="truncate text-lg font-semibold text-white sm:text-xl">
                {job.title}
              </h2>
              <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-white/45">
                <span>{job.company}</span>
                <span aria-hidden>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {job.location}
                </span>
                <span aria-hidden>•</span>
                <span>{job.workplace}</span>
              </p>
            </div>

            {/* ডান দিকের save button */}
            <SaveJobButton Id = {job._id}/>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {salary && <Badge icon={Banknote}>{salary}</Badge>}
            <Badge icon={BriefcaseBusiness}>{job.jobType}</Badge>
            <Badge icon={GraduationCap}>{job.experience}</Badge>

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

// current page-এর আশেপাশে সর্বোচ্চ ৫টা page number
function pageWindow(current: number, total: number): number[] {
  const size = Math.min(5, total)
  const start = Math.max(1, Math.min(current - 2, total - size + 1))

  return Array.from({ length: size }, (_, index) => start + index)
}

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
        href={buildJobHref({ ...filters, page: String(Math.max(1, currentPage - 1)) })}
        aria-label="Previous page"
        aria-disabled={currentPage <= 1}
        className={`${pageBase} ${pageIdle} ${currentPage <= 1 ? pageDisabled : ""}`}
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
            href={buildJobHref({ ...filters, page: String(page) })}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${pageBase} ${page === currentPage ? pageActive : pageIdle}`}
          >
            {page}
          </Link>
        </Fragment>
      ))}

      <Link
        href={buildJobHref({
          ...filters,
          page: String(Math.min(totalPages, currentPage + 1)),
        })}
        aria-label="Next page"
        aria-disabled={currentPage >= totalPages}
        className={`${pageBase} ${pageIdle} ${currentPage >= totalPages ? pageDisabled : ""}`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  )
}
