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
