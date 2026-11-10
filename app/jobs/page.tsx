import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  Bookmark,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Flame,
  Search,
  Star,
  Zap,
} from "lucide-react"

import { SiteHeader } from "@/components/site-header"

// ------------------------------------------------------------------
// 💼 JOB LIST
// ------------------------------------------------------------------
// আপাতত ডেমো ডেটা। পরে database/API থেকে jobs এনে এখানে বসাতে হবে।
const jobs = [
  {
    title: "Senior Product Designer",
    company: "TechFlow Systems",
    location: "San Francisco, CA (Remote)",
    salary: "$140k - $180k",
    type: "Full-time",
    easyApply: true,
    hot: false,
    senior: false,
    logoStyle: "from-violet-500 to-blue-500",
  },
  {
    title: "Lead Frontend Engineer",
    company: "FinGrid Solutions",
    location: "New York, NY",
    salary: "$165k - $210k",
    type: "Hybrid",
    easyApply: false,
    hot: false,
    senior: false,
    logoStyle: "from-sky-500 to-cyan-400",
  },
  {
    title: "UX Researcher",
    company: "CreativeStudio",
    location: "Austin, TX",
    salary: "$110k - $145k",
    type: "Contract",
    easyApply: false,
    hot: false,
    senior: false,
    logoStyle: "from-amber-500 to-orange-400",
  },
  {
    title: "Machine Learning Engineer",
    company: "HealthAI Corp",
    location: "Boston, MA (Remote)",
    salary: "$180k - $250k",
    type: "Remote",
    easyApply: false,
    hot: true,
    senior: true,
    logoStyle: "from-emerald-500 to-teal-400",
  },
]

// filter list-এর ডেটা
const jobTypes = [
  { label: "Full-time", count: "1.2k", checked: true },
  { label: "Contract", count: "432", checked: false },
  { label: "Freelance", count: "156", checked: false },
]

// badge-এর সাধারণ style
const badgeClass =
  "inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60"

// ছোট badge বানানোর helper
function Badge({
  icon: Icon,
  children,
  className = "",
}: {
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`${badgeClass} ${className}`}>
      <Icon className="size-3.5" />
      {children}
    </span>
  )
}

// ------------------------------------------------------------------
// 📄 JOBS PAGE
// ------------------------------------------------------------------
export default function JobsPage() {
  return (
    <div className="min-h-svh bg-[#050505] text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* ---------- সার্চ বক্স ---------- */}
        <form className="rounded-2xl border border-white/[0.07] bg-[#101012] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                placeholder="Search by job title, keywords..."
                aria-label="Search jobs"
                className="h-12 w-full rounded-lg border border-white/[0.08] bg-[#151517] pr-4 pl-12 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
              />
            </label>

            <button
              type="button"
              className="h-12 shrink-0 rounded-lg bg-white px-8 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Search Jobs
            </button>
          </div>
        </form>

        {/* ---------- ফিল্টার + রেজাল্ট ---------- */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* ----- বাম: Filters ----- */}
          <aside className="h-fit rounded-2xl border border-white/[0.07] bg-[#101012] p-6">
            <h2 className="text-2xl font-semibold text-white">Filters</h2>

            <div className="mt-8">
              <p className="text-base text-white/60">Job Type</p>

              <div className="mt-5 space-y-5">
                {jobTypes.map((jobType) => (
                  <label
                    key={jobType.label}
                    className="flex cursor-pointer items-center gap-3 text-sm text-white/70"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={jobType.checked}
                      className="size-4 rounded border border-white/20 accent-white"
                    />
                    <span>{jobType.label}</span>
                    <span className="ml-auto text-xs text-white/30">
                      {jobType.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* ----- ডান: Job list ----- */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
                Found 1,248 Professional Jobs
              </h1>

              <label className="flex items-center gap-2 text-xs text-white/40">
                Sort by:
                <select
                  aria-label="Sort jobs"
                  className="rounded-md border border-white/[0.08] bg-[#101012] px-2.5 py-1.5 text-xs text-white/70 outline-none"
                >
                  <option>Most Recent</option>
                  <option>Highest Salary</option>
                  <option>Oldest</option>
                </select>
              </label>
            </div>

            {/* job cards */}
            <div className="mt-4 space-y-4">
              {jobs.map((job) => (
                <article
                  key={job.title}
                  className="rounded-2xl border border-white/[0.07] bg-[#101012] p-6 transition hover:border-white/[0.14] sm:p-7"
                >
                  <div className="flex items-start gap-5">
                    {/* company logo placeholder */}
                    <span
                      className={`grid size-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${job.logoStyle} text-xl font-semibold text-white`}
                    >
                      {job.company.charAt(0)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-white sm:text-[22px]">
                            {job.title}
                          </h2>
                          <p className="mt-2 text-[15px] text-white/45">
                            {job.company} • {job.location}
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-label={`Save ${job.title}`}
                          className="grid size-9 shrink-0 place-items-center rounded-md text-white/45 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          <Bookmark className="size-4" />
                        </button>
                      </div>

                      {/* badges */}
                      <div className="mt-5 flex flex-wrap items-center gap-2.5">
                        <Badge icon={Banknote}>{job.salary}</Badge>
                        <Badge icon={BriefcaseBusiness}>{job.type}</Badge>

                        {job.easyApply && (
                          <Badge
                            icon={Zap}
                            className="border-emerald-400/25 bg-emerald-500/10 text-emerald-400"
                          >
                            Easy Apply
                          </Badge>
                        )}

                        {job.senior && (
                          <Badge icon={Star}>Senior</Badge>
                        )}

                        {job.hot && (
                          <Badge
                            icon={Flame}
                            className="border-amber-400/25 bg-amber-500/10 text-amber-400"
                          >
                            Hot Job
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* ---------- Pagination ---------- */}
            <div className="mt-8 flex items-center justify-center gap-1.5">
              <button
                type="button"
                aria-label="Previous page"
                className="grid size-9 place-items-center rounded-md border border-white/[0.08] text-white/40 transition hover:text-white"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
                className="grid size-9 place-items-center rounded-md bg-white text-sm font-semibold text-black"
              >
                1
              </button>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-md border border-white/[0.08] text-sm text-white/50 transition hover:text-white"
              >
                2
              </button>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-md border border-white/[0.08] text-sm text-white/50 transition hover:text-white"
              >
                3
              </button>

              <span className="px-1 text-white/30">...</span>

              <button
                type="button"
                className="grid size-9 place-items-center rounded-md border border-white/[0.08] text-sm text-white/50 transition hover:text-white"
              >
                42
              </button>

              <button
                type="button"
                aria-label="Next page"
                className="grid size-9 place-items-center rounded-md border border-white/[0.08] text-white/40 transition hover:text-white"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
