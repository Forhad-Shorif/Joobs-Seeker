import { SiteHeader } from "@/components/SheareHome/site-header"

/**
 * 📄 app/browse-jobs/detailsjobs/[id]/loading.tsx
 *
 * কেন: job details backend থেকে আসার সময় page-এর skeleton দেখাতে
 * কখন: user কোনো job-এর details page খুললে
 * কীভাবে: Next.js এই file-টা details page-এর loading fallback হিসেবে দেখায়
 */

export default function JobDetailsLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="min-h-svh bg-[#050505] text-white"
    >
      <span className="sr-only">Loading job details…</span>

      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="size-16 shrink-0 animate-pulse rounded-2xl bg-white/[0.07]" />

                <div className="flex-1">
                  <div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/[0.09] sm:h-9" />
                  <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-white/[0.05]" />

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="h-8 w-32 animate-pulse rounded-full bg-white/[0.05]" />
                    <div className="h-8 w-40 animate-pulse rounded-full bg-white/[0.05]" />
                    <div className="h-8 w-28 animate-pulse rounded-full bg-white/[0.05]" />
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="h-5 w-32 animate-pulse rounded bg-white/[0.08]" />
                <div className="h-3.5 w-full animate-pulse rounded bg-white/[0.05]" />
                <div className="h-3.5 w-11/12 animate-pulse rounded bg-white/[0.05]" />
                <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[0.05]" />
              </div>

              <div className="mt-8 space-y-3">
                <div className="h-5 w-36 animate-pulse rounded bg-white/[0.08]" />
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1.5 size-1.5 shrink-0 animate-pulse rounded-full bg-white/20" />
                    <div className="h-3.5 w-full animate-pulse rounded bg-white/[0.05]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
              <div className="mt-3 h-8 w-40 animate-pulse rounded-lg bg-white/[0.09]" />
              <div className="mt-5 h-11 w-full animate-pulse rounded-lg bg-white/[0.09]" />
              <div className="mt-3 h-11 w-full animate-pulse rounded-lg bg-white/[0.05]" />
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5">
              <div className="h-5 w-32 animate-pulse rounded bg-white/[0.08]" />
              <div className="mt-5 space-y-4">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="size-9 animate-pulse rounded-xl bg-white/[0.06]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/[0.07]" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
