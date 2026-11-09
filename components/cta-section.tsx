import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function CtaSection() {
  return (
    <section id="cta" className="relative isolate scroll-mt-20 overflow-hidden bg-[#050505]">
      {/* Wireframe dome: a violet gradient masked by the supplied alpha image. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,92,246,0.85),rgba(59,130,246,0.25)_45%,transparent_72%)] [mask-image:url('/image/cta-bg.png')] [mask-position:top] [mask-repeat:no-repeat] [mask-size:cover]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[380px] w-[720px] max-w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050505] to-transparent"
      />

      <div className="relative mx-auto flex min-h-[480px] max-w-3xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8 sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white/70 backdrop-blur">
          <Sparkles className="size-4 text-violet-300" />
          Join 50,000+ job seekers
        </span>

        <h2 className="mt-6 text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-white sm:text-5xl">
          Your next role is
          <br className="hidden sm:block" /> already looking for you
        </h2>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
          Build a profile in three minutes. The matches start arriving tomorrow morning.
        </p>

        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Create a free account
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="#pricing"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-medium text-white transition hover:bg-white/10"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
