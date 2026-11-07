import { ArrowRight, CircleDollarSign, Layers, MapPin } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

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
    "Showcase your commitment to diversity and inclusion by highlighting initiatives",
  location: "New York, USA",
  type: "Hybrid",
  salary: "€25–€40/hour",
}

// Six identical cards keep this demo section easy to swap with real API data later.
const jobs = Array.from({ length: 6 }, () => job)

export function JobsSection() {
  return (
    <section id="jobs" className="scroll-mt-20 bg-black px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Smart Job Discovery"
          title={
            <>
              The roles you&apos;d never
              <br />
              find by searching
            </>
          }
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((item, index) => (
            <article
              key={index}
              className="group flex min-h-[340px] flex-col rounded-3xl border border-white/5 bg-[#121212] p-6 transition hover:border-white/10 hover:bg-[#161616] md:p-7"
            >
              <h3 className="text-2xl font-medium tracking-tight text-white md:text-[28px]">
                {item.title}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
                {item.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <Tag icon={MapPin} label={item.location} />
                <Tag icon={Layers} label={item.type} />
                <Tag icon={CircleDollarSign} label={item.salary} />
              </div>

              <Link
                href="#"
                className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-white"
              >
                Apply Now
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="#"
            className="inline-flex h-12 items-center rounded-lg bg-white px-6 text-sm font-medium text-black transition hover:bg-white/90"
          >
            View all job open
          </Link>
        </div>
      </div>
    </section>
  )
}

function Tag({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-2 text-sm text-white/90">
      <Icon className="size-4 text-violet-400" strokeWidth={1.5} />
      {label}
    </span>
  )
}
