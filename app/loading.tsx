import { LoaderCircle } from "lucide-react"

/**
 * 📄 app/loading.tsx
 *
 * কেন: page data load হওয়ার সময় blank screen-এর বদলে সুন্দর skeleton দেখাতে
 * কখন: কোনো route-এর page load হতে দেরি হলে (Next.js Suspense fallback)
 * কীভাবে: Next.js এই file-টা automatically loading UI হিসেবে দেখায়
 */

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="relative min-h-svh overflow-hidden bg-[#050505] px-5 py-8 text-white sm:px-8 sm:py-10"
    >
      <span className="sr-only">Loading HireLoop…</span>

      {/* background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="absolute -right-40 -bottom-52 h-[26rem] w-[26rem] rounded-full bg-blue-600/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        {/* brand + top bar skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03]">
              <LoaderCircle className="size-5 animate-spin text-violet-300" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">HireLoop</p>
              <p className="text-[11px] text-white/35">Preparing your experience…</p>
            </div>
          </div>

          <div className="hidden h-10 w-32 animate-pulse rounded-full bg-white/[0.06] sm:block" />
        </div>

        {/* main content skeleton */}
        <div className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="mt-5 h-12 w-full animate-pulse rounded-xl bg-white/[0.09] sm:h-14" />
            <div className="mt-3 h-12 w-4/5 animate-pulse rounded-xl bg-white/[0.07] sm:h-14" />
            <div className="mt-5 h-4 w-full max-w-lg animate-pulse rounded bg-white/[0.05]" />
            <div className="mt-2 h-4 w-2/3 max-w-md animate-pulse rounded bg-white/[0.05]" />

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="h-12 w-full animate-pulse rounded-xl bg-white/10 sm:w-40" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-white/[0.05] sm:w-36" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#101012]/90 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
              <div className="size-9 animate-pulse rounded-full bg-white/[0.06]" />
            </div>

            <div className="mt-6 space-y-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="size-10 animate-pulse rounded-xl bg-white/[0.06]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-white/[0.08]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* card skeletons */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/[0.07] bg-[#101012]/80 p-5"
            >
              <div className="size-11 animate-pulse rounded-xl bg-white/[0.07]" />
              <div className="mt-5 h-4 w-2/3 animate-pulse rounded bg-white/[0.08]" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/[0.05]" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
