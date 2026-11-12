import type { JobFilters } from "@/lib/job"

/**
 * 📄 lib/job-options.ts
 * কাজ: browse-jobs page-এর left sidebar filter group আর sort option।
 * Values গুলো project-এর Job field (data/jobs-seed.json) থেকে নেওয়া।
 */

// left sidebar-এ যে field গুলো filter করা যাবে
export type JobFilterKey =
  | "category"
  | "jobType"
  | "workplace"
  | "experience"
  | "currency"
  | "period"

export type JobFilterGroup = {
  key: JobFilterKey
  label: string
  options: readonly string[]
}

export const jobFilterGroups: readonly JobFilterGroup[] = [
  {
    key: "category",
    label: "Category",
    options: ["Engineering", "Design", "Product", "Marketing", "Sales", "Finance", "Support"],
  },
  {
    key: "jobType",
    label: "Employment type",
    options: ["Full-time", "Part-time", "Contract", "Internship"],
  },
  {
    key: "workplace",
    label: "Workplace",
    options: ["Remote", "Hybrid", "On-site"],
  },
  {
    key: "experience",
    label: "Experience",
    options: ["Entry level", "Mid level", "Senior level", "Lead"],
  },
  {
    key: "currency",
    label: "Currency",
    options: ["USD", "EUR", "GBP", "BDT"],
  },
  {
    key: "period",
    label: "Salary period",
    options: ["Per year", "Per month", "Per hour"],
  },
]

// backend sort support করে: latest | oldest
export type JobSort = NonNullable<JobFilters["sort"]>

export const jobSortOptions = [
  { value: "latest", label: "Most recent" },
  { value: "oldest", label: "Oldest" },
] as const satisfies readonly { value: JobSort; label: string }[]
