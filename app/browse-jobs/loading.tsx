import { SiteHeader } from "@/components/SheareHome/site-header"

/**
 * 📄 app/browse-jobs/loading.tsx
 *
 * কেন: job list backend থেকে আসার সময় search/filter/card skeleton দেখাতে
 * কখন: Browse Jobs page load হলে
 * কীভাবে: Next.js এই file-টা browse page-এর loading fallback হিসেবে দেখায়
 */

export default function BrowseJobsLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="min-h-svh bg-[#050505] text-white"
    >
      <span className="sr-only">Loading jobs…</span>

      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* search bar skeleton */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-12 flex-1 animate-pulse rounded-lg bg-white/[0.07]" />
            <div className="h-12 w-full animate-pulse rounded-lg bg-white/[0.09] sm:w-36" />
          </div>
        </div>

        {/* filter + job list skeleton */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5">
            <div className="h-5 w-24 animate-pulse rounded bg-white/[0.08]" />

            <div className="mt-6 space-y-5">
              {[0, 1, 2, 3].map((item) => (
                <div key={item}>
                  <div className="h-3.5 w-20 animate-pulse rounded bg-white/[0.06]" />
                  <div className="mt-3 space-y-2.5">
                    <div className="h-3.5 w-full animate-pulse rounded bg-white/[0.05]" />
                    <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[0.05]" />
                    <div className="h-3.5 w-3/5 animate-pulse rounded bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="h-8 w-64 animate-pulse rounded-lg bg-white/[0.09]" />
              <div className="h-9 w-28 animate-pulse rounded-lg bg-white/[0.06]" />
            </div>

            <div className="mt-4 space-y-4">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="size-14 shrink-0 animate-pulse rounded-xl bg-white/[0.07]" />

                    <div className="min-w-0 flex-1">
                      <div className="h-6 w-3/4 animate-pulse rounded-lg bg-white/[0.09]" />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="h-8 w-32 animate-pulse rounded-full bg-white/[0.05]" />
                        <div className="h-8 w-44 animate-pulse rounded-full bg-white/[0.05]" />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      <div className="h-4 w-24 animate-pulse rounded bg-white/[0.05]" />
                      <div className="h-10 w-28 animate-pulse rounded-lg bg-white/[0.09]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
