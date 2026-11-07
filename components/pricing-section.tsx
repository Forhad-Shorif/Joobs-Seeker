"use client"

import { useState } from "react"
import { ArrowRight, ChartColumn, Crown, Plus, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { SectionHeading } from "@/components/section-heading"

type Plan = {
  name: string
  icon: LucideIcon
  monthlyPrice: number
  features: string[]
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: "Starter",
    icon: Crown,
    monthlyPrice: 0,
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
  },
  {
    name: "Growth",
    icon: ChartColumn,
    monthlyPrice: 17,
    featured: true,
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
  },
  {
    name: "Premium",
    icon: Zap,
    monthlyPrice: 99,
    features: [
      "Everything in Pro",
      "Multi-profile career portfolios",
      "Shared talent rooms",
      "Recruiter view (read-only)",
    ],
  },
]

const YEARLY_DISCOUNT = 0.75

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="scroll-mt-20 bg-black px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Pay for the leverage,
              <br />
              not the listings
            </>
          }
        />

        {/* Monthly / Yearly switch */}
        <div className="mt-10 flex justify-center">
          <div className="flex items-center rounded-full border border-white/30 bg-neutral-300 p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${
                isYearly ? "text-black/50" : "bg-white text-black"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition ${
                isYearly ? "bg-white text-black" : "text-black/50"
              }`}
            >
              Yearly
              <span className="rounded-full bg-fuchsia-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                25%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} isYearly={isYearly} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PlanCard({ plan, isYearly }: { plan: Plan; isYearly: boolean }) {
  const { icon: Icon, name, monthlyPrice, features, featured } = plan
  const price = isYearly ? Math.round(monthlyPrice * YEARLY_DISCOUNT) : monthlyPrice

  return (
    <article
      className={`flex flex-col rounded-2xl border p-6 md:p-7 lg:min-h-[520px] ${
        featured
          ? "border-white/20 bg-[#141414] shadow-[0_0_80px_-20px_rgba(139,92,246,0.45)]"
          : "border-white/10 bg-[#101010]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/5">
            <Icon className="size-5 text-violet-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-medium text-white">{name}</h3>
        </div>

        <p className="text-3xl font-semibold tracking-tight text-white">
          ${price}
          <span className="ml-1 text-xs font-normal text-white/40">/month</span>
        </p>
      </div>

      <p className="mt-8 text-sm font-medium text-white">Start building your insights hub:</p>

      <ul className="mt-5 space-y-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-white/10">
              <Plus className="size-3 text-white" />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="#"
        className={`mt-10 flex h-12 items-center justify-between rounded-lg px-5 text-sm font-medium transition lg:mt-auto ${
          featured
            ? "bg-white text-black hover:bg-white/90"
            : "bg-white/10 text-white hover:bg-white/15"
        }`}
      >
        Choose This Plan
        <ArrowRight className="size-4" />
      </Link>
    </article>
  )
}
