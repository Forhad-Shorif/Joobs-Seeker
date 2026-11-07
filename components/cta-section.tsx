import Image from "next/image"
import Link from "next/link"

export function CtaSection() {
  return (
    <section id="cta" className="relative scroll-mt-20 overflow-hidden bg-black">
      <Image
        src="/image/cta-bg.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-top"
      />

      <div className="relative mx-auto flex min-h-[620px] max-w-3xl flex-col items-center justify-start px-6 pt-28 pb-24 text-center md:min-h-[760px] md:pt-40">
        <h2 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-white md:text-6xl">
          Your next role is
          <br />
          already looking for you
        </h2>

        <p className="mt-6 text-sm leading-relaxed text-white/70 md:text-base">
          Build a profile in three minutes. The matches start arriving tomorrow morning.
        </p>

        <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="#"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Create a free account
          </Link>

          <Link
            href="#pricing"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-medium text-white transition hover:bg-white/10"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
