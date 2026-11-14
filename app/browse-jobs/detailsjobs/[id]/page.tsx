import { cache } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DetailJob, type JobDetailsData } from "@/components/SheareJobs/DetailJob"
import { SiteHeader } from "@/components/SheareHome/site-header"
import type { JobSalary } from "@/lib/Type/job"

/**
 * 📄 app/browse-jobs/detailsjobs/[id]/page.tsx
 * কাজ: একটা job-এর details page। API থেকে data এনে DetailJob component-এ দেয়।
 *
 * Data flow:
 *  /browse-jobs/detailsjobs/:id → GET /DetailsJob/:id → DetailJob
 *
 * Backend বন্ধ থাকলে (বা network error হলে) নিচের demo job-টা দেখায়,
 * যাতে UI ঠিকমতো preview করা যায়। Backend response ঠিক থাকলে সবসময়
 * আসল job data-ই দেখাবে।
 */

// API response-এর shape একেক backend-এ একেক রকম হয়, তাই সব safe ভাবে read করি।
function readSalary(value: unknown): JobSalary {
  const salary =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {}
  const text = (key: string) =>
    typeof salary[key] === "string" ? salary[key] : ""

  return {
    min: text("min"),
    max: text("max"),
    currency: text("currency"),
    period: text("period"),
  }
}

function readOptionalString(
  record: Record<string, unknown>,
  key: string
): string | undefined {
  return typeof record[key] === "string" && record[key]
    ? (record[key] as string)
    : undefined
}

// { result: {...} } / { job: {...} } / direct object — তিনটাই handle করি
function unwrapJob(value: unknown): unknown {
  if (!value || typeof value !== "object") return value

  const record = value as Record<string, unknown>

  if (record.result && typeof record.result === "object") return record.result
  if (record.job && typeof record.job === "object") return record.job
  if (record.data && typeof record.data === "object") return record.data

  return value
}

function toJobDetails(value: unknown): JobDetailsData | null {
  const job = unwrapJob(value)

  if (!job || typeof job !== "object") return null

  const record = job as Record<string, unknown>

  // id আর title ছাড়া details page বানানো যায় না
  if (typeof record._id !== "string" || typeof record.title !== "string")
    return null

  const text = (key: string) =>
    typeof record[key] === "string" ? (record[key] as string) : ""

  return {
    _id: record._id,
    title: record.title,
    company: text("company") || "Unknown company",
    location: text("location") || "Remote",
    category: text("category"),
    jobType: text("jobType") || "Full-time",
    workplace: text("workplace"),
    email: text("email"),
    salary: readSalary(record.salary),
    experience: text("experience"),
    deadline: text("deadline"),
    description: text("description"),
    responsibilities: text("responsibilities"),
    requirements: text("requirements"),
    skills: text("skills"),
    contactEmail: text("contactEmail"),
    website: text("website"),
    companySize: readOptionalString(record, "companySize"),
    founded: readOptionalString(record, "founded"),
    industry: readOptionalString(record, "industry"),
    companyLogo: readOptionalString(record, "companyLogo"),
    companyCover: readOptionalString(record, "companyCover"),
  }
}

// UI preview-এর জন্য image-এর job-টা
const demoJob: JobDetailsData = {
  _id: "demo",
  title: "Senior Product Designer",
  company: "CloudScale AI",
  location: "Remote, USA",
  category: "Design",
  jobType: "Full-time",
  workplace: "Remote",
  email: "careers@cloudscale.ai",
  salary: { min: "80000", max: "120000", currency: "USD", period: "Per year" },
  experience: "5+ Years",
  deadline: "2027-01-31",
  description:
    "At CloudScale AI, we are building the next generation of AI infrastructure monitoring tools. We are looking for a Senior Product Designer who is passionate about transforming complex workflows and data into intuitive, impactful experiences. You will work closely with engineering and product leadership to define the vision for our core platform experience.",
  responsibilities:
    "Lead the end-to-end design process for major features, from discovery to high-fidelity implementation; Collaborate with product and engineering to understand user needs and translate them into functional design requirements; Create wireframes, prototypes, and high-fidelity UI designs; Conduct user research and usability testing; Maintain and evolve our design system",
  requirements:
    "5+ years of experience designing complex SaaS products or data-heavy applications; A strong portfolio demonstrating your design process and problem-solving skills",
  skills: "Figma, Design Systems, Prototyping, User Research",
  contactEmail: "careers@cloudscale.ai",
  website: "https://cloudscale.ai",
  companySize: "201-500 employees",
  founded: "2021",
  industry: "AI / Machine Learning",
}

/**
 * একই request-এ generateMetadata আর page দুটোই data চায়।
 * React cache() থাকায় network call একবারই হবে।
 */
const getJob = cache(async (id: string): Promise<JobDetailsData | null> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  // API URL না থাকলে preview data দেখাই
  if (!apiUrl) return demoJob

  try {
    const response = await fetch(
      `${apiUrl}/DetailsJob/${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      }
    )

    // সত্যিই job নেই → 404 page
    if (response.status === 404) return null

    if (!response.ok) return demoJob

    const data: unknown = await response.json()

    return toJobDetails(data) ?? demoJob
  } catch {
    // backend down / network error → UI preview
    return demoJob
  }
})

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const job = await getJob(id)

  if (!job) return { title: "Job not found | HireLoop" }

  return {
    title: `${job.title} at ${job.company} | HireLoop`,
    description: job.description.slice(0, 160),
  }
}

export default async function DetailsJobPage({ params }: PageProps) {
  const { id } = await params
  const job = await getJob(id)

  if (!job) notFound()

  return (
    <div className="min-h-svh bg-[#050505] text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <DetailJob job={job} />
      </main>
    </div>
  )
}
