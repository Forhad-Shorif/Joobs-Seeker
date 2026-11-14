/**
 * 📄 app/dashboard/seeker/saved/loading.tsx
 *
 * কেন: saved jobs backend থেকে আসার সময় blank screen-এর বদলে card skeleton দেখাতে
 * কখন: user Saved Jobs page খুললে, data load হওয়ার আগে
 * কীভাবে: Next.js এই file-টা saved page-এর loading fallback হিসেবে দেখায়
 */

export default function SavedJobsLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-6xl"
    >
      <span className="sr-only">Loading saved jobs…</span>

      {/* heading + total saved skeleton */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="h-11 w-64 animate-pulse rounded-xl bg-white/[0.09] sm:h-12" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-white/[0.05]" />
        </div>

        <div className="h-[74px] w-[150px] animate-pulse rounded-xl border border-white/[0.07] bg-[#101012]" />
      </div>

      {/* saved job card skeletons */}
      <div className="mt-6 space-y-4">
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
                  <div className="h-8 w-48 animate-pulse rounded-full bg-white/[0.05]" />
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <div className="h-4 w-28 animate-pulse rounded bg-white/[0.05]" />
                <div className="mt-1 flex items-center gap-2">
                  <div className="size-9 animate-pulse rounded-full bg-white/[0.06]" />
                  <div className="h-10 w-28 animate-pulse rounded-lg bg-white/[0.09]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
