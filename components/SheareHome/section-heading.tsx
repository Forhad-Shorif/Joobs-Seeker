import type { ReactNode } from "react"

type SectionHeadingProps = {
  eyebrow: string
  title: ReactNode
  description?: string
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-white/60 uppercase">
        <span className="size-1.5 rounded-[2px] bg-violet-500" />
        {eyebrow}
        <span className="size-1.5 rounded-[2px] bg-violet-500" />
      </p>

      <h2 className="mt-5 text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
