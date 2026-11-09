import type { InputHTMLAttributes, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: LucideIcon
  trailing?: ReactNode
}

export function AuthField({ label, icon: Icon, trailing, id, ...props }: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-white/80">
        {label}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />

        <input
          id={id}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pr-11 pl-10 text-sm text-white transition outline-none placeholder:text-white/30 hover:border-white/20 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
          {...props}
        />

        {trailing && (
          <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>
        )}
      </div>
    </div>
  )
}
