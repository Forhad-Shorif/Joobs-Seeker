import { CtaSection } from "@/components/SheareHome/cta-section"
import { FeaturesSection } from "@/components/SheareHome/features-section"
import { Hero } from "@/components/SheareHome/hero"
import { JobsSection } from "@/components/SheareJobs/jobs-section"
import { PricingSection } from "@/components/SheareHome/pricing-section"
import { SiteFooter } from "@/components/SheareHome/site-footer"
import { SiteHeader } from "@/components/SheareHome/site-header"
import { StatsSection } from "@/components/SheareHome/stats-section"

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
