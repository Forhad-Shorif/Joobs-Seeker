import Image from "next/image"
import { BriefcaseBusiness, Building2, Star, Users } from "lucide-react"

const stats = [
  { icon: BriefcaseBusiness, value: "50K", label: "Active Jobs" },
  { icon: Building2, value: "12K", label: "Companies" },
  { icon: Users, value: "2M", label: "Job Seekers" },
  { icon: Star, value: "97%", label: "Satisfaction Rate" },
]

export function StatsSection() {
  return (
    <section id="stats" className="relative scroll-mt-20 overflow-hidden bg-[#e400c8]">
      {/* The black circle creates the curved "horizon" behind the globe. */}
      <div className="absolute top-[17%] left-1/2 aspect-square w-[260%] -translate-x-1/2 rounded-full bg-black md:w-[180%]" />

      <div className="relative aspect-[1440/1882] min-h-[820px] w-full">
        <Image
          src="/image/globe.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />

        <div className="absolute inset-x-0 bottom-[8%] px-6 text-center md:bottom-[21%]">
          <h2 className="mx-auto max-w-2xl text-2xl leading-snug font-medium text-balance text-white/90 md:text-3xl">
            Assisting over 15,000 job seekers find their dream positions.
          </h2>

          <div className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-4 text-left md:grid-cols-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex min-h-[150px] flex-col justify-between rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 backdrop-blur-md md:min-h-[190px] lg:min-h-[230px] lg:p-6"
              >
                <Icon className="size-5 text-white/70" strokeWidth={1.5} />

                <div>
                  <p className="text-3xl font-medium tracking-tight text-white md:text-4xl lg:text-5xl">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-white/60 md:text-sm">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
