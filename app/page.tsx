import { CtaSection } from "@/components/cta-section"
import { FeaturesSection } from "@/components/features-section"
import { Hero } from "@/components/hero"
import { JobsSection } from "@/components/jobs-section"
import { PricingSection } from "@/components/pricing-section"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { StatsSection } from "@/components/stats-section"

export default function Page() {
  return (
    <div className="min-h-svh bg-[#050505] text-white">
      <SiteHeader />

      <main>
        <Hero />
        <StatsSection />
        <JobsSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>

      <SiteFooter />
    </div>
  )
}
