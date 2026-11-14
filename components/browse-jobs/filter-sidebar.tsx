import Link from "next/link"
import { Check } from "lucide-react"

import type { JobFilters } from "@/lib/Type/job"
import { jobFilterGroups } from "@/lib/everything/job-options"
import { buildJobHref, hasActiveFilters } from "@/lib/everything/job-url"

/**
 * 📄 components/browse-jobs/filter-sidebar.tsx
 * কাজ: left side filter panel — একাধিক section (salary, category, currency...)
 *
 * ⚠️ প্রতিটা section-এ একবারে একটাই option select হয়।
 * কারণ প্রতিটা option আসলে একটা Link — click করলে URL-এ ওই key-র
 * আগের value replace হয়ে যায় (একই option-এ আবার click করলে filter উঠে যায়)।
 * তবে আলাদা আলাদা section একসাথে active থাকতে পারে।
 */
export function FilterSidebar({ filters }: { filters: JobFilters }) {
  return (
    <aside className="h-fit rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Filters</h2>

        {hasActiveFilters(filters) && (
          <Link
            href="/browse-jobs"
            className="text-xs text-violet-300 transition hover:text-violet-200"
          >
            Clear all
          </Link>
        )}
      </div>

      {/* salary range — এটা select নয়, min/max input */}
      <SalaryFilter filters={filters} />

      {jobFilterGroups.map((group) => (
        <div key={group.key} className="mt-6 border-t border-white/[0.06] pt-5">
          <p className="text-sm font-medium text-white/50">{group.label}</p>

          <div className="mt-3 space-y-1">
            {group.options.map((option) => {
              const active = filters[group.key] === option

              // active option-এ click করলে filter বাদ যাবে (toggle)
              const nextFilters: JobFilters = {
                ...filters,
                page: undefined, // filter বদলালে আবার 1st page
                [group.key]: active ? undefined : option,
              }

              return (
                <Link
                  key={option}
                  href={buildJobHref(nextFilters)}
                  aria-pressed={active}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition ${
                    active
                      ? "bg-white/[0.06] text-white"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white/85"
                  }`}
                >
                  {/* checkbox-এর মতো ছোট box */}
                  <span
                    className={`grid size-4 shrink-0 place-items-center rounded border ${
                      active
                        ? "border-violet-400 bg-violet-500 text-white"
                        : "border-white/20"
                    }`}
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {option}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/* Salary range (min / max)                                            */
/* ------------------------------------------------------------------ */

const inputClass =
  "h-9 w-full rounded-lg border border-white/[0.08] bg-[#151517] px-3 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"

function SalaryFilter({ filters }: { filters: JobFilters }) {
  const hasSalary = Boolean(filters.minSalary || filters.maxSalary)

  // salary form submit করলে বাকি filter গুলোও যাতে থাকে
  const hiddenFields = Object.entries(filters).filter(
    (entry): entry is [string, string] =>
      Boolean(entry[1]) && !["minSalary", "maxSalary", "page"].includes(entry[0])
  )

  return (
    <div className="mt-6 border-t border-white/[0.06] pt-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-white/50">Salary</p>

        {hasSalary && (
          <Link
            href={buildJobHref({
              ...filters,
              minSalary: undefined,
              maxSalary: undefined,
              page: undefined,
            })}
            className="text-xs text-violet-300 transition hover:text-violet-200"
          >
            Clear
          </Link>
        )}
      </div>

      <form action="/browse-jobs" className="mt-3">
        {hiddenFields.map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}

        <div className="flex items-center gap-2">
          <input
            key={`min-${filters.minSalary ?? ""}`}
            type="number"
            name="minSalary"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            defaultValue={filters.minSalary}
            aria-label="Minimum salary"
            className={inputClass}
          />
          <span className="text-white/30">–</span>
          <input
            key={`max-${filters.maxSalary ?? ""}`}
            type="number"
            name="maxSalary"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            defaultValue={filters.maxSalary}
            aria-label="Maximum salary"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="mt-2 h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        >
          Apply salary
        </button>
      </form>
    </div>
  )
}
