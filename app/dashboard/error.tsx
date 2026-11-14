"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

/**
 * 📄 app/dashboard/error.tsx
 *
 * কেন: dashboard-এর কোনো page error করলে sidebar/topbar রেখে সুন্দর error দেখাতে
 * কখন: dashboard layout-এর ভিতরের page render হওয়ার সময় error throw করলে
 * কীভাবে: Next.js এটাকে dashboard segment-এর error boundary হিসেবে ব্যবহার করে
 */

type DashboardErrorProps = {
  error: unknown
  retry: () => void
}

export default function DashboardError({
  error,
  retry,
}: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred."

  return (
    <div className="mx-auto flex min-h-[60svh] w-full max-w-2xl items-center justify-center">
      <div
        role="alert"
        className="w-full rounded-3xl border border-white/[0.08] bg-[#101012] p-6 text-center shadow-2xl shadow-black/30 sm:p-10"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
          <AlertTriangle className="size-7" />
        </span>

        <p className="mt-6 text-[11px] font-semibold tracking-[0.2em] text-amber-300/80 uppercase">
          Dashboard error
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          This section couldn&apos;t load.
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
          Something went wrong while loading your dashboard. Try again, or go
          back home while we sort it out.
        </p>

        {process.env.NODE_ENV === "development" && (
          <pre className="mt-5 max-h-28 overflow-auto rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left text-xs leading-6 whitespace-pre-wrap text-rose-200/80">
            {message}
          </pre>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
          >
            <Home className="size-4" />
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
