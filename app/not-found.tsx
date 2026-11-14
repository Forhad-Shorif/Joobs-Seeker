import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  BriefcaseBusiness,
  Compass,
  Home,
  LayoutDashboard,
  Search,
} from "lucide-react"

/**
 * 📄 app/not-found.tsx
 *
 * কেন: ভুল URL বা না-থাকা page-এর জন্য সুন্দর 404 screen দেখাতে
 * কখন: user এমন route-এ গেলে যেটা নেই, অথবা কোনো page থেকে notFound() call হলে
 * কীভাবে: Next.js নিজেই এই file ধরে fallback UI হিসেবে render করে
 */

export const metadata: Metadata = {
  title: "Page not found | HireLoop",
  description: "The page you are looking for does not exist.",
}

const quickLinks = [
  {
    href: "/browse-jobs",
    label: "Browse jobs",
    description: "Find your next opportunity",
    icon: BriefcaseBusiness,
  },
  {
    href: "/dashboard/seeker",
    label: "Seeker dashboard",
    description: "Track saved jobs and applications",
    icon: LayoutDashboard,
  },
  {
    href: "/browse-jobs?search=remote",
    label: "Remote roles",
    description: "Explore remote-friendly jobs",
    icon: Search,
  },
]

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#050505] px-5 py-16 text-white">
      {/* background glow + subtle grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[130px]" />
        <div className="absolute -right-32 -bottom-40 h-[26rem] w-[26rem] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <div className="relative w-full max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium tracking-wide text-white/55 backdrop-blur">
          <Compass className="size-3.5 text-violet-300" />
          Error 404
        </span>

        <p className="mt-8 bg-gradient-to-b from-white via-white/75 to-white/10 bg-clip-text text-[7rem] leading-none font-bold tracking-tighter text-transparent sm:text-[10rem]">
          404
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          This page took a wrong turn.
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
          The page you are looking for doesn&apos;t exist, was moved, or the
          link is broken. Let&apos;s get you back to the right place.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <Home className="size-4" />
            Back to home
          </Link>

          <Link
            href="/browse-jobs"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
          >
            <BriefcaseBusiness className="size-4" />
            Browse jobs
          </Link>
        </div>

        <div className="mt-12 grid gap-3 text-left sm:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-white/[0.07] bg-[#101012]/80 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-[#141416]"
              >
                <Icon className="size-5 text-white/40 transition group-hover:text-violet-300" />
                <p className="mt-4 text-sm font-medium text-white">{link.label}</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  {link.description}
                </p>
              </Link>
            )
          })}
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1.5 text-xs text-white/35 transition hover:text-white/70"
        >
          <ArrowLeft className="size-3.5" />
          Return to HireLoop
        </Link>
      </div>
    </main>
  )
}
