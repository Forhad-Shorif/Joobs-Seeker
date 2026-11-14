import Image from "next/image"
import { BriefcaseBusiness, Building2, Send, Star } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Stat = {
  icon: LucideIcon
  value: string
  label: string
}

const stats: Stat[] = [
  { icon: BriefcaseBusiness, value: "50K", label: "Job Seekers" },
  { icon: Building2, value: "12K", label: "Employers" },
  { icon: Send, value: "2M", label: "Applications" },
  { icon: Star, value: "97%", label: "Success Rate" },
]

export function StatsSection() {
  return (
    <section id="stats" className="relative isolate overflow-hidden bg-[#050505]">
      <div className="relative h-[600px] w-full sm:h-[680px] lg:h-[780px]">
        <Image
          src="/image/globe.png"
          alt=""
          width={1440}
          height={1882}
          className="pointer-events-none absolute top-1/2 left-1/2 w-[820px] max-w-none -translate-x-1/2 -translate-y-[58%] sm:w-[1100px] lg:w-[1280px]"
        />

        {/* Blend the globe into the black background at the top and bottom. */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#050505] to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-end px-5 pb-6 text-center sm:px-8 sm:pb-8">
          <h2 className="max-w-2xl text-xl leading-snug font-medium text-balance text-white/85 sm:text-2xl lg:text-3xl">
            Assisting over 15,000 job seekers find their dream positions.
          </h2>

          <div className="mt-6 grid w-full grid-cols-2 gap-3 text-left sm:mt-8 sm:gap-4 lg:grid-cols-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="group flex min-h-[116px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-md transition duration-300 hover:border-violet-400/30 hover:bg-white/[0.07] sm:min-h-[150px] sm:p-5 lg:min-h-[180px]"
              >
                <Icon
                  className="size-5 text-violet-300/80 transition group-hover:text-violet-300"
                  strokeWidth={1.5}
                />

                <div>
                  <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-white/50 sm:text-sm">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
