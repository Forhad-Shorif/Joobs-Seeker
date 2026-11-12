import type { JobFilters } from "@/lib/job"

/**
 * 📄 lib/job-url.ts
 * কাজ: URL searchParams ↔ JobFilters convert করা।
 * Page আর sidebar দুটোই একই helper ব্যবহার করে, তাই logic এক জায়গায় থাকে।
 */

export type SearchParamsRecord = Record<string, string | string[] | undefined>

// একই param একাধিকবার এলে (?jobType=a&jobType=b) প্রথমটা নিই
const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

/** URL searchParams → typed JobFilters */
export function parseJobFilters(params: SearchParamsRecord): JobFilters {
  return {
    search: first(params.search),
    category: first(params.category),
    jobType: first(params.jobType),
    workplace: first(params.workplace),
    experience: first(params.experience),
    location: first(params.location),
    company: first(params.company),
    skills: first(params.skills),
    currency: first(params.currency),
    period: first(params.period),
    minSalary: first(params.minSalary),
    maxSalary: first(params.maxSalary),
    sort: first(params.sort) === "oldest" ? "oldest" : "latest",
    page: first(params.page),
    limit: first(params.limit),
  }
}

/** JobFilters → "search=react&sort=latest" (empty value বাদ যায়) */
export function toJobQuery(filters: JobFilters): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value)
  }

  return params.toString()
}

/** JobFilters → "/browse-jobs?search=react" */
export function buildJobHref(filters: JobFilters): string {
  const query = toJobQuery(filters)
  return query ? `/browse-jobs?${query}` : "/browse-jobs"
}

// sort/page ছাড়া বাকি filter গুলো — "Clear all" দেখানোর জন্য
const FILTER_KEYS = [
  "search",
  "category",
  "jobType",
  "workplace",
  "experience",
  "location",
  "company",
  "skills",
  "currency",
  "period",
  "minSalary",
  "maxSalary",
] as const

export function hasActiveFilters(filters: JobFilters): boolean {
  return FILTER_KEYS.some((key) => Boolean(filters[key]))
}
