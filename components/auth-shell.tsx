import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import type { ReactNode } from "react"

const highlights = [
  "Curated roles from world-class companies",
  "One profile, unlimited applications",
  "Real salary insights before you apply",
]

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-[#050505] text-white lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-white/[0.07] px-10 py-12 lg:flex lg:flex-col xl:px-14">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="absolute -top-40 -left-24 size-[460px] rounded-full bg-violet-600/25 blur-[130px]" />
        </div>

        <Image
          src="/image/globe.png"
          alt=""
          width={1440}
          height={1882}
          className="pointer-events-none absolute -bottom-52 left-1/2 w-[720px] max-w-none -translate-x-1/2 opacity-60 [mask-image:linear-gradient(to_top,black_25%,transparent_90%)]"
        />

        <div className="relative z-10">
          <Link href="/" aria-label="HireLoop home">
            <Image
              src="/image/logo.png"
              alt="HireLoop"
              width={154}
              height={44}
              className="h-8 w-auto"
            />
          </Link>

          <div className="mt-20 max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase backdrop-blur">
              50,000+ members
            </span>

            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance xl:text-5xl">
              Your next role is closer than you think.
            </h1>

            <p className="mt-5 text-sm leading-relaxed text-white/50 xl:text-base">
              Join HireLoop to discover curated opportunities, compare real salaries and apply
              with confidence.
            </p>

            <ul className="mt-8 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/65">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15 ring-1 ring-violet-400/20">
                    <Check className="size-3 text-violet-300" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <figure className="relative z-10 mt-auto max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <blockquote className="text-sm leading-relaxed text-white/70">
            “HireLoop matched me with a role that actually fits my skills. I had three interviews
            in my first week.”
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-semibold">
              AR
            </span>
            <div>
              <p className="text-sm font-medium text-white">Ayesha Rahman</p>
              <p className="text-xs text-white/40">Product Designer at Northstar</p>
            </div>
          </figcaption>
        </figure>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-svh flex-col px-5 py-7 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between lg:hidden">
          <Link href="/" aria-label="HireLoop home">
            <Image
              src="/image/logo.png"
              alt="HireLoop"
              width={154}
              height={44}
              priority
              className="h-7 w-auto"
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10 lg:py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <p className="text-center text-[11px] text-white/25">
          © 2026 HireLoop. All rights reserved.
        </p>
      </main>
    </div>
  )
}
