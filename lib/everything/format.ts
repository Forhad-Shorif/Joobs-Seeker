import type { JobSalary } from "@/lib/Type/job"

/**
 * 📄 lib/format.ts
 * কাজ: job data-কে display-friendly text-এ রূপ দেওয়া
 * (salary, deadline)। UI component থেকে আলাদা রাখা হয়েছে।
 */

// salary object → "USD 500 - 1000 · month" ধরনের text
export function formatSalary(salary?: JobSalary): string {
  if (!salary) return ""

  const currency = salary.currency?.trim()
  const min = salary.min?.trim()
  const max = salary.max?.trim()

  if (!min && !max) return ""

  const range = min && max ? `${min} - ${max}` : min || max
  const amount = [currency, range].filter(Boolean).join(" ")

  return [amount, salary.period].filter(Boolean).join(" · ")
}

// date string → "12 Nov 2026"
export function formatDeadline(deadline: string): string {
  if (!deadline) return ""

  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return deadline

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

// ------------------------------------------------------------------
// 📅 Application-এর সময় দেখানো
// (seeker আর recruiter — দুই page-এ একই format দরকার)
// ------------------------------------------------------------------

/** ISO date → "15 Nov 2026"; খালি/ভুল হলে "—" */
export function formatDate(value?: string | null): string {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

/**
 * ISO date → "15 Nov 2026, 5:32 PM"
 * ⚠️ timeZone UTC — server আর browser-এ একই text (hydration mismatch হয় না)
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date)
}

/** ISO date → "just now" / "5 min ago" / "3 hours ago" / "2 days ago" */
export function formatTimeAgo(value?: string | null): string {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const seconds = Math.round((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`

  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`

  return formatDate(value)
}
