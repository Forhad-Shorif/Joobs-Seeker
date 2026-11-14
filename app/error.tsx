"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Home,
  LifeBuoy,
  RefreshCw,
} from "lucide-react"

/**
 * 📄 app/error.tsx
 *
 * কেন: page render হওয়ার সময় unexpected error হলে app crash না করে সুন্দর fallback দেখাতে
 * কখন: root layout-এর নিচের কোনো page/segment error throw করলে
 * কীভাবে: Next.js এটাকে React Error Boundary হিসেবে ব্যবহার করে
 *
 * মনে রাখো: error boundary file সবসময় Client Component হতে হয়।
 * তাই উপরে "use client" আছে।
 */

type ErrorPageProps = {
  error: unknown
  retry: () => void
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  // debugging-এর জন্য error টা console-এ রাখি
  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred."

  return (
    <main
      role="alert"
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#050505] px-5 py-16 text-white"
    >
      {/* background glow + subtle grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute -right-32 -bottom-40 h-[26rem] w-[26rem] rounded-full bg-rose-500/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="rounded-3xl border border-white/[0.08] bg-[#101012]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-10">
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <AlertTriangle className="size-7" />
            </span>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-amber-300/80 uppercase">
                Something broke
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                We hit an unexpected error.
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-white/50">
            This page couldn&apos;t load properly. Your data is safe — try
            again, or head back to a stable page.
          </p>

          {/* development-এ আসল error message দেখাই, production-এ নয় */}
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-5 max-h-32 overflow-auto rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left text-xs leading-6 whitespace-pre-wrap text-rose-200/80">
              {message}
            </pre>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              <RefreshCw className="size-4" />
              Try again
            </button>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <Home className="size-4" />
              Back home
            </Link>

            <Link
              href="/browse-jobs"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white/60 transition hover:text-white"
            >
              <BriefcaseBusiness className="size-4" />
              Browse jobs
            </Link>
          </div>

          <div className="mt-7 flex items-start gap-2 border-t border-white/[0.06] pt-5 text-xs leading-5 text-white/30">
            <LifeBuoy className="mt-0.5 size-3.5 shrink-0" />
            <p>
              If this keeps happening, refresh the page or try again in a
              moment.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-xs text-white/30 transition hover:text-white/60"
        >
          <ArrowLeft className="size-3.5" />
          Return to HireLoop
        </Link>
      </div>
    </main>
  )
}
