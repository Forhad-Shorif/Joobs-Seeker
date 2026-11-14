import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, Home, SearchX } from "lucide-react"

import { SiteHeader } from "@/components/SheareHome/site-header"

/**
 * 📄 app/browse-jobs/detailsjobs/[id]/not-found.tsx
 *
 * কেন: কোনো job পাওয়া না গেলে সাধারণ 404-এর বদলে job-এর জন্য আলাদা message দেখাতে
 * কখন: details page থেকে notFound() call হলে (job না থাকলে)
 * কীভাবে: Next.js এই file-টা ওই route segment-এর not-found UI হিসেবে দেখায়
 */

export const metadata: Metadata = {
  title: "Job not found | HireLoop",
  description: "This job may have been filled or removed.",
}

export default function JobNotFound() {
  return (
    <div className="min-h-svh bg-[#050505] text-white">
      <SiteHeader />

      <main className="relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-4xl items-center justify-center overflow-hidden px-5 py-16">
        {/* background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[110px]" />
        </div>

        <div className="relative w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#101012]/95 p-6 text-center shadow-2xl shadow-black/30 backdrop-blur sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
            <SearchX className="size-7" />
          </span>

          <p className="mt-6 text-[11px] font-semibold tracking-[0.2em] text-white/35 uppercase">
            404 · Job not found
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            This role is no longer available.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
            The job may have been filled, removed, or the link is incorrect.
            Browse fresh opportunities instead.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/browse-jobs"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              <BriefcaseBusiness className="size-4" />
              Browse all jobs
            </Link>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <Home className="size-4" />
              Back home
            </Link>
          </div>

          <Link
            href="/browse-jobs"
            className="mt-7 inline-flex items-center gap-1.5 text-xs text-white/35 transition hover:text-white/70"
          >
            <ArrowLeft className="size-3.5" />
            Back to job search
          </Link>
        </div>
      </main>
    </div>
  )
}
