import Link from "next/link"
import { ArrowRight, CircleDollarSign, Layers, MapPin } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"

type Job = {
  title: string
  description: string
  location: string
  type: string
  salary: string
}

const job: Job = {
  title: "Frontend Developer",
  description:
    "Showcase your commitment to diversity and inclusion by highlighting initiatives that make your team unique.",
  location: "New York, USA",
  type: "Hybrid",
  salary: "€25–€40/hour",
}

// Six sample cards — swap this array with real API data later.
const jobs = Array.from({ length: 6 }, () => job)

export function JobsSection() {
  return (
    <section id="jobs" className="relative isolate scroll-mt-20 overflow-hidden bg-[#050505] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-72 w-[720px] max-w-[130vw] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]"
      />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why job seeker"
          title={
            <>
              The roles you&apos;d never
              <br className="hidden sm:block" /> find by searching
            </>
          }
        />

        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {jobs.map((item, index) => (
            <article
              key={index}
              className="group flex min-h-[300px] flex-col rounded-3xl border border-white/[0.07] bg-gradient-to-b from-[#151515] to-[#0e0e0e] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_24px_70px_-30px_rgba(139,92,246,0.5)] sm:min-h-[320px]"
            >
              <h3 className="text-xl font-medium tracking-tight text-white sm:text-2xl">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-white/50">{item.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Tag icon={MapPin} label={item.location} />
                <Tag icon={Layers} label={item.type} />
                <Tag icon={CircleDollarSign} label={item.salary} />
              </div>

              <Link
                href="/sign-up"
                className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-medium text-white"
              >
                Apply Now
                <ArrowRight className="size-4 text-violet-400 transition group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="#"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Explore More Jobs
          </Link>
        </div>
      </div>
    </section>
  )
}

function Tag({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.05] px-3 py-1.5 text-xs text-white/70">
      <Icon className="size-3.5 text-violet-400" strokeWidth={1.5} />
      {label}
    </span>
  )
}
