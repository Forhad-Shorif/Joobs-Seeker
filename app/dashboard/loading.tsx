/**
 * 📄 app/dashboard/loading.tsx
 *
 * কেন: dashboard page load হওয়ার সময় sidebar/topbar রেখে content-এর skeleton দেখাতে
 * কখন: dashboard-এর কোনো page data load করলে
 * কীভাবে: dashboard layout-এর ভিতরে Next.js এই loading UI দেখায়
 */

export default function DashboardLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-6xl space-y-6"
    >
      <span className="sr-only">Loading dashboard…</span>

      {/* heading skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-8 w-52 animate-pulse rounded-lg bg-white/[0.09]" />
          <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-white/[0.05]" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-xl bg-white/[0.06]" />
      </div>

      {/* stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="h-4 w-24 animate-pulse rounded bg-white/[0.07]" />
              <div className="size-5 animate-pulse rounded bg-white/[0.06]" />
            </div>
            <div className="mt-6 h-10 w-16 animate-pulse rounded-lg bg-white/[0.09]" />
          </div>
        ))}
      </div>

      {/* profile + status skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
          <div className="flex items-center gap-5">
            <div className="size-20 shrink-0 animate-pulse rounded-full bg-white/[0.08] sm:size-24" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-2/3 animate-pulse rounded-lg bg-white/[0.09]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.05]" />
            </div>
          </div>

          <div className="mt-6 h-11 w-36 animate-pulse rounded-lg bg-white/[0.07]" />
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-3 w-16 animate-pulse rounded bg-white/[0.05]" />
          </div>

          <div className="mt-6 space-y-5">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item}>
                <div className="flex items-center justify-between gap-3">
                  <div className="h-3.5 w-24 animate-pulse rounded bg-white/[0.07]" />
                  <div className="h-3.5 w-8 animate-pulse rounded bg-white/[0.05]" />
                </div>
                <div className="mt-2 h-2 w-full animate-pulse rounded-full bg-white/[0.05]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom cards skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6"
          >
            <div className="h-5 w-40 animate-pulse rounded bg-white/[0.08]" />
            <div className="mt-5 space-y-3">
              <div className="h-3.5 w-full animate-pulse rounded bg-white/[0.05]" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-white/[0.05]" />
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/[0.05]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
