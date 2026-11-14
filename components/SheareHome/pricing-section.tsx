"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ChartColumn, Check, Crown, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { SectionHeading } from "@/components/SheareHome/section-heading"

type Plan = {
  name: string
  icon: LucideIcon
  price: number
  features: string[]
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: "Starter",
    icon: Crown,
    price: 0,
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "Unlimited one-click apply",
    ],
  },
  {
    name: "Growth",
    icon: ChartColumn,
    price: 17,
    featured: true,
    features: [
      "Everything in Starter",
      "Priority recruiter visibility",
      "Advanced skill matching",
      "Weekly career coaching",
    ],
  },
  {
    name: "Premium",
    icon: Zap,
    price: 99,
    features: [
      "Everything in Growth",
      "Multi-profile portfolios",
      "Shared talent rooms",
      "Recruiter view (read-only)",
    ],
  },
]

const YEARLY_DISCOUNT = 0.75

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-[#050505] px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Pay for the leverage,
              <br className="hidden sm:block" /> not the listings
            </>
          }
        />

        <div className="mt-9 flex justify-center">
          <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              aria-pressed={!isYearly}
              className={`rounded-full px-5 py-2 text-sm font-medium transition sm:px-6 ${
                isYearly ? "text-white/50 hover:text-white/80" : "bg-white text-black"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setIsYearly(true)}
              aria-pressed={isYearly}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition sm:px-6 ${
                isYearly ? "bg-white text-black" : "text-white/50 hover:text-white/80"
              }`}
            >
              Yearly
              <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                25%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-14 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} isYearly={isYearly} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PlanCard({ plan, isYearly }: { plan: Plan; isYearly: boolean }) {
  const { icon: Icon, name, price, features, featured } = plan
  const currentPrice = isYearly ? Math.round(price * YEARLY_DISCOUNT) : price

  return (
    <article
      className={`relative flex flex-col rounded-3xl border p-6 transition duration-300 sm:p-7 ${
        featured
          ? "border-violet-400/30 bg-[#121018] shadow-[0_0_80px_-25px_rgba(139,92,246,0.55)]"
          : "border-white/[0.08] bg-[#0e0e0e] hover:border-white/15"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/5">
            <Icon className="size-5 text-violet-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-medium text-white">{name}</h3>
        </div>

        <p className="text-3xl font-semibold tracking-tight text-white">
          ${currentPrice}
          <span className="ml-1 text-xs font-normal text-white/40">/month</span>
        </p>
      </div>

      {featured && (
        <span className="mt-4 w-fit rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-violet-200 uppercase">
          Most popular
        </span>
      )}

      <p className="mt-6 text-sm font-medium text-white">Start building your insights hub:</p>

      <ul className="mt-5 mb-8 space-y-3.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-white/60">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10">
              <Check className="size-3 text-violet-300" strokeWidth={2.5} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="/sign-up"
        className={`mt-auto flex h-11 items-center justify-between rounded-xl px-5 text-sm font-medium transition ${
          featured
            ? "bg-white text-black hover:bg-white/90"
            : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
        }`}
      >
        Choose This Plan
        <ArrowRight className="size-4" />
      </Link>
    </article>
  )
}
