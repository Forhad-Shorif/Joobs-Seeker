import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

/**
 * 📄 components/job-meta.tsx
 * কাজ: job card-এর ছোট info chip (icon + text)।
 * PostedJobs.tsx থেকে আলাদা করা, তাই card ফাইল ছোট থাকে।
 */

export type JobMetaProps = {
  /** lucide-react icon (shadcn-এর standard icon set) */
  icon: LucideIcon
  children: ReactNode
}

export function JobMeta({ icon: Icon, children }: JobMetaProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/55">
      <Icon className="size-3 shrink-0 text-violet-300/70" strokeWidth={1.7} />
      {children}
    </span>
  )
}
