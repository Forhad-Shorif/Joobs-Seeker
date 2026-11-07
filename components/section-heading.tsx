import type { ReactNode } from "react"

type SectionHeadingProps = {
  eyebrow: string
  title: ReactNode
}

/** Shared eyebrow + big title used by the features, jobs and pricing sections. */
export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="flex items-center justify-center gap-3 font-mono text-xs font-semibold tracking-[0.3em] text-white uppercase">
        <span className="size-2 rounded-[2px] bg-violet-500" />
        {eyebrow}
        <span className="size-2 rounded-[2px] bg-violet-500" />
      </p>

      <h2 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-white md:text-6xl">
        {title}
      </h2>
    </div>
  )
}
