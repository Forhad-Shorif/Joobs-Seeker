"use client"
import { useRouter } from "next/navigation"

import { jobSortOptions, type JobSort } from "@/lib/job-options"
import { ChangeEvent } from "react"


/** sort বদলালেই URL update → server page নতুন data আনে */
export function SortSelect({ value }: { value: JobSort }) {
  const router = useRouter()

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(window.location.search)
    params.set("sort", event.target.value)
    params.delete("page") // sort বদলালে আবার 1st page
    router.push(`/browse-jobs?${params.toString()}`)
  }

  return (
    <label className="flex items-center gap-2 text-xs text-white/40">
      Sort by:
      <select
        value={value}
        onChange={handleChange}
        aria-label="Sort jobs"
        className="rounded-md border border-white/[0.08] bg-[#101012] px-2.5 py-1.5 text-xs text-white/70 outline-none"
      >
        {jobSortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
