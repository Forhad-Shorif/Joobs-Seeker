import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  DollarSign,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  Laptop,
  MapPin,
  PiggyBank,
  Users,
  Wallet,
} from "lucide-react"

import type { JobSalary, PostedJob } from "@/lib/job"

/**
 * 📄 components/DetailJob.tsx
 * কাজ: একটা job-এর full details view — image reference অনুযায়ী
 * header + 4টা info card + description/responsibilities/requirements/benefits
 * + right side company overview.
 *
 * Data গুলো page থেকে prop হিসেবে আসে, তাই component-টা pure server component।
 */

// backend শুধু Job field গুলোই দেয়। Company overview-এর extra field গুলো
// optional রাখা হয়েছে — DB-তে থাকলে সেটাই দেখাবে, না থাকলে safe fallback।
export type JobDetailsData = PostedJob & {
  companySize?: string
  founded?: string
  industry?: string
  companyLogo?: string
  companyCover?: string
  benefits?: string | string[]
}

type Benefit = {
  icon: LucideIcon
  label: string
}

const benefits: readonly Benefit[] = [
  { icon: HeartPulse, label: "Full Health Coverage" },
  { icon: Wallet, label: "Competitive Salary" },
  { icon: PiggyBank, label: "401(k) Matching" },
  { icon: Laptop, label: "Remote-Friendly" },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

// Responsibilities / requirements backend-এ semicolon বা newline দিয়ে আসে।
function splitLines(value?: string | string[] | null): string[] {
  if (!value) return []

  const items = Array.isArray(value) ? value : value.split(/\r?\n|;|•/)

  return items.map((item) => item.trim()).filter(Boolean)
}

// Skills comma দিয়ে আসে, তবে semicolon/newline-ও handle করা হয়।
function splitSkills(value?: string | string[] | null): string[] {
  if (!value) return []

  const items = Array.isArray(value) ? value : value.split(/\r?\n|,|;|•/)

  return items.map((item) => item.trim()).filter(Boolean)
}

// description-এর blank line গুলো আলাদা paragraph হিসেবে দেখাই
function splitParagraphs(value?: string | null): string[] {
  if (!value) return []

  return value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

// 80000 → "80k", 1200000 → "1.2m"
function compactNumber(value: string): string {
  const cleaned = value.replace(/,/g, "").trim()
  const number = Number(cleaned.replace(/[^\d.]/g, ""))

  if (!Number.isFinite(number) || number <= 0) return cleaned

  const trim = (result: number) =>
    Number.isInteger(result) ? String(result) : result.toFixed(1)

  if (number >= 1_000_000) return `${trim(number / 1_000_000)}m`
  if (number >= 1_000) return `${trim(number / 1_000)}k`

  return String(number)
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  BDT: "৳",
  INR: "₹",
}

// image-এর মতো compact salary: "$80k - $120k"
function formatSalaryRange(salary?: JobSalary): string {
  if (!salary) return ""

  const currency = salary.currency?.trim().toUpperCase() ?? ""
  const symbol = currencySymbols[currency] ?? (currency ? `${currency} ` : "")
  const min = salary.min ? compactNumber(salary.min) : ""
  const max = salary.max ? compactNumber(salary.max) : ""

  if (min && max) return `${symbol}${min} - ${symbol}${max}`
  if (min) return `${symbol}${min}+`
  if (max) return `Up to ${symbol}${max}`

  return ""
}

/* ------------------------------------------------------------------ */
/* Small shared UI                                                    */
/* ------------------------------------------------------------------ */

const cardClass = "rounded-2xl border border-white/[0.07] bg-[#101012]"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[17px] font-semibold tracking-tight text-white">
      {children}
    </h2>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className={`${cardClass} flex items-center gap-3 p-4`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/50">
        <Icon className="size-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-medium tracking-[0.14em] text-white/35 uppercase">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-white/85">
          {value}
        </p>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-[10px] font-medium tracking-[0.12em] text-white/35 uppercase">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="max-w-[62%] text-right text-xs font-medium text-white/70">
        {value}
      </dd>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export function DetailJob({ job }: { job: JobDetailsData }) {
  const salary = formatSalaryRange(job.salary)
  const description = splitParagraphs(job.description)
  const responsibilities = splitLines(job.responsibilities)
  const requirements = splitLines(job.requirements)
  const skills = splitSkills(job.skills)

  const companyInitial = job.company.trim().charAt(0).toUpperCase() || "C"
  const website = job.website?.trim()

  return (
    <div className="space-y-4">
      {/* ---------- Job header ---------- */}
      <header className={`${cardClass} p-5 sm:p-7`}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <Link
              href="/browse-jobs"
              aria-label="Back to browse jobs"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/55 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {job.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="text-white/50">{job.company}</span>
                <span aria-hidden className="text-white/25">
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.9)]" />
                  Actively hiring
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Save ${job.title}`}
              className="grid size-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:border-white/[0.16] hover:text-white"
            >
              <Bookmark className="size-4" />
            </button>

            <button
              type="button"
              className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Save Job
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Quick info ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Salary Range"
          value={salary || "Competitive"}
        />
        <StatCard
          icon={MapPin}
          label="Location"
          value={job.location || "Remote"}
        />
        <StatCard
          icon={BriefcaseBusiness}
          label="Job Type"
          value={job.jobType || "Full-time"}
        />
        <StatCard
          icon={GraduationCap}
          label="Experience"
          value={job.experience || "Not specified"}
        />
      </div>

      {/* ---------- Content + company overview ---------- */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className={`${cardClass} p-6 sm:p-7`}>
          {/* Job Description */}
          <section>
            <SectionTitle>Job Description</SectionTitle>

            <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/50">
              {description.length > 0 ? (
                description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p>No description provided for this role.</p>
              )}
            </div>
          </section>

          {/* Responsibilities */}
          {responsibilities.length > 0 && (
            <section className="mt-8">
              <SectionTitle>Responsibilities</SectionTitle>

              <ul className="mt-4 space-y-2.5">
                {responsibilities.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex gap-3 text-sm leading-relaxed text-white/50"
                  >
                    <span className="mt-[7px] size-1 shrink-0 rounded-full bg-white/35" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Requirements */}
          {(skills.length > 0 || requirements.length > 0) && (
            <section className="mt-8">
              <SectionTitle>Requirements</SectionTitle>

              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-white/60"
                    >
                      <Check className="size-3 text-emerald-400/80" />
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {requirements.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {requirements.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex gap-3 text-sm leading-relaxed text-white/50"
                    >
                      <span className="mt-[7px] size-1 shrink-0 rounded-full bg-white/35" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Benefits */}
          <section className="mt-8">
            <SectionTitle>Benefits</SectionTitle>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {benefits.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-white/55"
                >
                  <Icon className="size-4 shrink-0 text-white/40" />
                  {label}
                </div>
              ))}
            </div>
          </section>
        </article>

        {/* ---------- Company overview ---------- */}
        <aside className={`${cardClass} p-5 sm:p-6`}>
          <h2 className="text-[17px] font-semibold tracking-tight text-white">
            Company Overview
          </h2>

          <div className="relative mt-4 h-36 overflow-hidden rounded-xl border border-white/[0.06] bg-[#08080b]">
            {/* cover - image না থাকলে premium gradient দেখাবে */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(120%_120%_at_15%_0%,rgba(139,92,246,0.35),transparent_55%),radial-gradient(120%_120%_at_100%_100%,rgba(59,130,246,0.28),transparent_55%)]"
            />
            <div
              aria-hidden
              className="absolute inset-0 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:26px_26px] opacity-[0.13]"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-lg font-semibold text-white shadow-lg shadow-black/40">
                {companyInitial}
              </span>
              <p className="mt-2.5 max-w-full truncate text-sm font-medium text-white/85">
                {job.company}
              </p>
              <p className="mt-0.5 text-[11px] text-white/35">
                Company workspace
              </p>
            </div>
          </div>

          <dl className="mt-5 space-y-4">
            <InfoRow
              icon={Users}
              label="Size"
              value={job.companySize || "201-500 employees"}
            />
            <InfoRow
              icon={CalendarDays}
              label="Founded"
              value={job.founded || "2021"}
            />
            <InfoRow
              icon={Building2}
              label="Industry"
              value={job.industry || job.category || "Technology"}
            />
          </dl>

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/65 transition hover:text-white"
            >
              Visit Website
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </aside>
      </div>
    </div>
  )
}

export default DetailJob
