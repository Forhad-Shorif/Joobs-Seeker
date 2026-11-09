import Link from "next/link"
import { BriefcaseBusiness, MapPin, Search } from "lucide-react"

const popularSearches = ["Product Designer", "AI Engineering", "DevOps Engineer", "Data Analyst"]

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#050505] px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-24 lg:pt-24">
      {/* Soft violet glow + faint grid behind the hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-52 left-1/2 h-[520px] w-[820px] max-w-[140vw] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
          </span>
          <span className="text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase">
            20,000+ new jobs this month
          </span>
        </div>

        <h1 className="mt-7 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-4xl font-semibold tracking-[-0.04em] text-balance text-transparent sm:text-6xl lg:text-7xl">
          Find Your Dream Job Today
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
          Discover your next career move with HireLoop&apos;s curated job board that connects top
          talent with world-class companies.
        </p>

        <form
          action="#jobs"
          role="search"
          className="mt-9 flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-[#0c0c0c]/90 p-2 shadow-2xl shadow-black/40 backdrop-blur md:flex-row md:items-center"
        >
          <label className="flex h-12 flex-1 items-center gap-3 rounded-xl px-4 transition focus-within:bg-white/5">
            <Search className="size-5 shrink-0 text-white/45" />
            <span className="sr-only">Job title, skill or company</span>
            <input
              name="query"
              type="text"
              placeholder="Job title, skill or company"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </label>

          <span aria-hidden className="hidden h-8 w-px bg-white/10 md:block" />

          <label className="flex h-12 flex-1 items-center gap-3 rounded-xl px-4 transition focus-within:bg-white/5">
            <MapPin className="size-5 shrink-0 text-white/45" />
            <span className="sr-only">Location or remote</span>
            <input
              name="location"
              type="text"
              placeholder="Location or remote"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </label>

          <button
            type="submit"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-medium text-white shadow-[0_0_35px_-10px_rgba(139,92,246,1)] transition hover:bg-violet-500 md:w-14 md:px-0"
          >
            <Search className="size-5" />
            <span className="md:sr-only">Search jobs</span>
          </button>
        </form>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-xs font-semibold tracking-wide text-white/50 uppercase">
            Popular
          </span>
          {popularSearches.map((term) => (
            <Link
              key={term}
              href="#jobs"
              className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/70 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white"
            >
              {term}
            </Link>
          ))}
        </div>

        <p className="mt-8 flex items-center gap-2 text-xs text-white/40">
          <BriefcaseBusiness className="size-4 text-violet-400" />
          Free to use. No credit card required.
        </p>
      </div>
    </section>
  )
}
