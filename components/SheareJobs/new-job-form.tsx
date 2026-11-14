"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type {
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock,
  FileText,
  Globe,
  Layers,
  Mail,
  MapPin,
  Send,
  Sparkles,
  Tag,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { showToast } from "@/lib/utils/toast"
import type { Job } from "@/lib/Type/job"
import { authClient } from "@/lib/auth-client"
import { JobsPost } from "@/lib/SheareAction/RecruiterAction/Action"

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 pl-10 pr-3.5 text-sm text-white transition outline-none placeholder:text-white/25 hover:border-white/20 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"

const inputClass = `${fieldClass} bg-white/[0.04]`
const selectClass = `${fieldClass} bg-[#0e0e0e]`

const categories = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Finance",
  "Support",
]
const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"]
const workplaces = ["On-site", "Hybrid", "Remote"]
const currencies = ["USD", "EUR", "GBP", "BDT"]
const periods = ["Per year", "Per month", "Per hour"]
const levels = ["Entry level", "Mid level", "Senior level", "Lead"]
const tips = [
  "Use a clear, searchable job title.",
  "Add a salary range to attract better matches.",
  "Keep the requirements short and specific.",
  "Mention your workplace type up front.",
]

type FieldProps = {
  label: string
  icon: LucideIcon
  hint?: string
  children: ReactNode
}

function Field({ label, icon: Icon, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/75">
        {label}
      </span>

      <span className="relative block">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/30" />
        {children}
      </span>

      {hint && (
        <span className="mt-1.5 block text-[11px] text-white/30">{hint}</span>
      )}
    </label>
  )
}

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: LucideIcon
  hint?: string
}

function InputField({
  label,
  icon,
  hint,
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <Field label={label} icon={icon} hint={hint}>
      <input className={`${inputClass} ${className}`} {...props} />
    </Field>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  icon: LucideIcon
  options: string[]
}

function SelectField({
  label,
  icon,
  options,
  className = "",
  ...props
}: SelectFieldProps) {
  return (
    <Field label={label} icon={icon}>
      <select
        className={`${selectClass} appearance-none pr-9 [color-scheme:dark] ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[#0e0e0e] text-white"
          >
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-white/35" />
    </Field>
  )
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
}

function TextareaField({
  label,
  hint,
  className = "",
  ...props
}: TextareaFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/75">
        {label}
      </span>
      <textarea
        rows={4}
        className={`w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white transition outline-none placeholder:text-white/25 hover:border-white/20 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10 ${className}`}
        {...props}
      />
      {hint && (
        <span className="mt-1.5 block text-[11px] text-white/30">{hint}</span>
      )}
    </label>
  )
}

function Section({
  step,
  title,
  description,
  children,
}: {
  step: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-white/[0.06] pt-8 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-xs font-semibold text-violet-300">
          {step}
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-white/35">{description}</p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  )
}

export function NewJobForm() {
  const router = useRouter()

  // 💡 Hook component-এর body-তে থাকবে, event handler-এর ভিতরে না।
  const { data: session } = authClient.useSession()

  // এই function-টাই form-এর main logic.
  // async দেওয়া আছে, যাতে পরে backend-এ await fetch() ব্যবহার করা যায়.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // page reload বন্ধ করে.

    const email = session?.user?.email
    if (!email) {
      showToast.error("Please sign in to post a job.")
      return
    }

    // FormData সব input-এর value একসাথে নাম দিয়ে নিয়ে আসে.
    const formData = new FormData(event.currentTarget)
    const text = (key: string) => String(formData.get(key) ?? "").trim()

    // 💡 `Job` type দেওয়ায় field বাদ পড়লে বা ভুল হলে TypeScript ধরবে.
    const job: Job = {
      title: text("title"),
      company: text("company"),
      location: text("location"),
      category: text("category"),
      jobType: text("jobType"),
      workplace: text("workplace"),
      email,
      salary: {
        min: text("salaryMin"),
        max: text("salaryMax"),
        currency: text("currency"),
        period: text("salaryPeriod"),
      },
      experience: text("experience"),
      deadline: text("deadline"),
      description: text("description"),
      responsibilities: text("responsibilities"),
      requirements: text("requirements"),
      skills: text("skills"),
      contactEmail: text("contactEmail"),
      website: text("website"),
      _id: ""
    }

    // const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    try {
      // const response = await fetch(`${backendUrl}/PostJobs`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(job),
      // })
      await JobsPost(job)

      showToast.success("Job posted successfully")

      // list page-এ নিয়ে যাই → নতুন job সাথে সাথে দেখা যাবে
      router.push("/dashboard/recruiter/jobs")
    } catch (error) {
      console.error("Job save failed:", error)
      showToast.error(
        error instanceof Error ? error.message : "Could not save job."
      )
    }
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8"
      >
        <Section
          step="1"
          title="Job basics"
          description="Start with the details candidates see first."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Job title"
              name="title"
              icon={BriefcaseBusiness}
              placeholder="Senior Frontend Developer"
              required
            />
            <InputField
              label="Company name"
              name="company"
              icon={Building2}
              placeholder="Northstar Labs"
              required
            />
            <InputField
              label="Location"
              name="location"
              icon={MapPin}
              placeholder="New York, USA"
              required
            />
            <SelectField
              label="Category"
              name="category"
              icon={Layers}
              options={categories}
            />
            <SelectField
              label="Employment type"
              name="jobType"
              icon={Clock}
              options={jobTypes}
            />

            <div>
              <span className="mb-2 block text-sm font-medium text-white/75">
                Workplace
              </span>
              <div className="grid grid-cols-3 gap-2">
                {workplaces.map((workplace) => (
                  <label key={workplace} className="cursor-pointer">
                    <input
                      type="radio"
                      name="workplace"
                      value={workplace}
                      defaultChecked={workplace === "Remote"}
                      className="peer sr-only"
                    />
                    <span className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/50 transition peer-checked:border-violet-400/60 peer-checked:bg-violet-500/15 peer-checked:text-white hover:border-white/20">
                      {workplace}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          step="2"
          title="Compensation & timeline"
          description="Salary and deadlines help candidates decide faster."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Minimum salary"
              name="salaryMin"
              icon={CircleDollarSign}
              type="number"
              min={0}
              placeholder="2500"
            />
            <InputField
              label="Maximum salary"
              name="salaryMax"
              icon={CircleDollarSign}
              type="number"
              min={0}
              placeholder="4000"
            />
            <SelectField
              label="Currency"
              name="currency"
              icon={Globe}
              options={currencies}
            />
            <SelectField
              label="Salary period"
              name="salaryPeriod"
              icon={Clock}
              options={periods}
              defaultValue="Per month"
            />
            <SelectField
              label="Experience level"
              name="experience"
              icon={Users}
              options={levels}
              defaultValue="Mid level"
            />
            <InputField
              label="Application deadline"
              name="deadline"
              icon={CalendarDays}
              type="date"
            />
          </div>
        </Section>

        <Section
          step="3"
          title="Role details"
          description="Explain the work, expectations and required skills."
        >
          <div className="space-y-4">
            <TextareaField
              label="About the role"
              name="description"
              placeholder="Tell candidates what the role is about and why it matters."
              rows={5}
              required
            />
            <InputField
              label="Responsibilities"
              name="responsibilities"
              icon={FileText}
              placeholder="Build and maintain user interfaces"
            />
            <InputField
              label="Requirements"
              name="requirements"
              icon={CheckCircle2}
              placeholder="3+ years of experience with React"
            />
            <InputField
              label="Skills"
              name="skills"
              icon={Tag}
              placeholder="React, TypeScript, Tailwind CSS"
              hint="Separate skills with commas."
            />
          </div>
        </Section>

        <Section
          step="4"
          title="Contact details"
          description="Where should applications and questions go?"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Contact email"
              name="contactEmail"
              icon={Mail}
              type="email"
              placeholder="hiring@company.com"
              required
            />
            <InputField
              label="Company website (optional)"
              name="website"
              icon={Globe}
              type="url"
              placeholder="https://company.com"
            />
          </div>
        </Section>

        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/30">
            Publish করলে job handshake-এর মতো সাথে সাথে list-এ চলে আসবে।
          </p>

          <div className="flex gap-3">
            <Link
              href="/dashboard/recruiter/jobs"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10 sm:flex-none"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-medium text-white shadow-[0_0_35px_-12px_rgba(139,92,246,1)] transition hover:bg-violet-500 sm:flex-none"
            >
              Publish job
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </form>

      <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e0e] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="size-4 text-violet-300" />
            Tips for a great post
          </h2>
          <ul className="mt-4 space-y-3">
            {tips.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2.5 text-xs leading-relaxed text-white/50"
              >
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-violet-400" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-blue-600/5 p-5">
          <p className="text-sm font-medium text-white">
            Jobs with a salary range get 2× more applications.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            A clear range helps candidates self-qualify before they apply.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e0e] p-5">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/35 uppercase">
            <FileText className="size-3.5" />
            Data preview
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Publish করার সাথে সাথেই job list page-এ দেখা যাবে।
          </p>
          <code className="mt-3 block rounded-lg bg-black/40 p-3 text-[11px] text-violet-200">
            POST /PostJobs → /dashboard/recruiter/jobs
          </code>
        </div>
      </aside>
    </div>
  )
}
