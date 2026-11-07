import { BriefcaseBusiness, MapPin, Search } from "lucide-react"
import Link from "next/link"

const trendingPositions = ["Product Designer", "AI Engineering", "Dev-ops Engineer"]

export function Hero() {
  return (
    <section className="bg-black px-6 pt-16 pb-24 text-white md:pt-24 md:pb-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* Small announcement pill */}
        <div className="flex items-center gap-4">
          <span className="hidden h-px w-20 bg-gradient-to-r from-transparent to-white/25 sm:block" />

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 sm:gap-3 sm:px-4">
            <BriefcaseBusiness className="size-5 text-amber-500" />
            <span className="text-xs font-semibold sm:text-sm">50,000+</span>
            <span className="text-[10px] font-medium tracking-wider text-white/50 uppercase sm:text-[11px]">
              New jobs this month
            </span>
          </div>

          <span className="hidden h-px w-20 bg-gradient-to-l from-transparent to-white/25 sm:block" />
        </div>

        <h1 className="mt-8 text-5xl font-extrabold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
          Find Your Dream Job Today
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
          HireLoop connects top talent with world-class companies. Browse thousands of
          curated opportunities and land your next role — faster.
        </p>

        {/* Search bar */}
        <div className="mt-10 flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-[#0c0c0c] p-2 md:flex-row md:items-center">
          <label className="flex h-14 flex-1 items-center gap-3 rounded-xl px-4 focus-within:bg-white/5">
            <Search className="size-5 shrink-0 text-white/60" />
            <span className="sr-only">Job title, skill or company</span>
            <input
              type="text"
              placeholder="Job title, skill or company"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
            />
          </label>

          <span className="hidden h-8 w-px bg-white/10 md:block" />

          <label className="flex h-14 flex-1 items-center gap-3 rounded-xl px-4 focus-within:bg-white/5">
            <MapPin className="size-5 shrink-0 text-white/60" />
            <span className="sr-only">Location or Remote</span>
            <input
              type="text"
              placeholder="Location or Remote"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
            />
          </label>

          <button
            type="button"
            aria-label="Search jobs"
            className="flex h-14 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 md:w-14"
          >
            <Search className="size-5" />
          </button>
        </div>

        {/* Trending searches */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span className="text-sm font-semibold">Trending Position</span>

          {trendingPositions.map((position) => (
            <Link
              key={position}
              href="#jobs"
              className="rounded-full bg-[#1a1a1a] px-4 py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {position}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
