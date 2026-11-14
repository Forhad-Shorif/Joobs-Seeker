import {
  Bookmark,
  Building2,
  ChartLine,
  FileUser,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { SectionHeading } from "@/components/SheareHome/section-heading"

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
    description: "Manage applications and favourites in one place.",
  },
  {
    icon: Sparkles,
    title: "One-Click Apply",
    description: "Simplify every application with a single profile.",
  },
  {
    icon: FileUser,
    title: "Resume Builder",
    description: "Create professional resumes with modern templates.",
  },
  {
    icon: Users,
    title: "Skill Matching",
    description: "Discover jobs that match your skills and experience.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description: "Boost your career with quick interview tips.",
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-y border-white/[0.06] bg-[#0a0a0a] px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Features Job"
          title={
            <>
              Everything you need
              <br className="hidden sm:block" /> to succeed
            </>
          }
        />

        <div className="mt-12 grid gap-x-8 gap-y-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="group flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] transition duration-300 group-hover:border-violet-400/30 group-hover:bg-violet-500/10">
                <Icon className="size-5 text-violet-300" strokeWidth={1.5} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/45">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
