import {
  Bookmark,
  Building2,
  ChartLine,
  FileUser,
  Hexagon,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"

type Feature = {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find your ideal job with advanced filters.",
  },
  {
    icon: ChartLine,
    title: "Salary Insights",
    description: "Get real salary data to negotiate confidently.",
  },
  {
    icon: Building2,
    title: "Top Companies",
    description: "Apply to vetted companies that are hiring.",
  },
  {
    icon: Bookmark,
    title: "Saved Jobs",
    description: "Manage apps & favorites on your dashboard.",
  },
  {
    icon: Sparkles,
    title: "One-Click Apply",
    description: "Simplify your job applications for an easier process!",
  },
  {
    icon: FileUser,
    title: "Resume Builder",
    description: "Create professional resumes with modern templates.",
  },
  {
    icon: Hexagon,
    title: "Skill-Based Matching",
    description: "Discover jobs that match your skills and experience.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth Resources",
    description: "Boost your career with quick interview tips.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 bg-black px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Features Job"
          title={
            <>
              Everything you need
              <br />
              to succeed
            </>
          }
        />

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="flex size-[72px] shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-[#151515]">
                <Icon className="size-7 text-violet-400" strokeWidth={1.5} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/55">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
