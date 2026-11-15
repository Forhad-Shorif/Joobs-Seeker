/**
 * 📄 lib/SheareAction/RecruiterAction/Action.tsx
 * ==================================================================
 * 📌 কী: RECRUITER-এর সব data logic এক জায়গায় (job + application)।
 *    UI component শুধু এই functions call করবে — কোনো fetch/হিসাব ওখানে নয়।
 *
 * 📌 কোথায় কী লাগে:
 *    - job post / delete / list      → নিচের "JOBS" অংশ
 *    - কে apply করেছে, কতজন, কখন     → "APPLICATIONS" অংশ
 *    - reject / interview / offered  → "STATUS UPDATE" অংশ
 *
 * ==================================================================
 * 🔌 BACKEND CONTRACT (backend বানানোর সময় ঠিক এই shape রাখো)
 * ==================================================================
 *
 *  [JOBS]
 *   GET    /GetJobs/:email
 *          → [{ ...job, _id }]              // এই recruiter-এর post করা job
 *
 *   GET    /DetailsJob/:id
 *          → { ...job, _id }                 // edit page-এ form ভরতে
 *
 *   PATCH  /UpdateJob/:id
 *          body: { ...job } (⚠️ `_id` ছাড়া, `email` = যিনি post করেছেন)
 *          → 200 { ...updatedJob }
 *          // backend শুধু ওই recruiter-এর job-ই update করবে
 *
 *   POST   /PostJobs
 *          body: { title, company, location, category, jobType, workplace,
 *                  email, salary:{min,max,currency,period}, experience,
 *                  deadline, description, responsibilities, requirements,
 *                  skills, contactEmail, website }
 *          ⚠️ body-তে `_id` কখনো পাঠানো হয় না (MongoDB নিজে বানাবে)
 *          → 201 { _id, ...job }
 *
 *   DELETE /DeleteJob/:id
 *          → 200 { deletedCount: 1 }
 *
 *   GET    /jobs?search=&jobType=&page=...   (public list — browse/jobs page)
 *
 *  [APPLICATIONS — recruiter side]
 *   GET    /RecruiterApplications/:email
 *          → [{ _id, jobId?, name, email, city, nationality, dateOfBirth,
 *               skills[], experience, gender, title, company, workplace,
 *               applyAdt, status, statusUpdatedAt?, statusHistory[]? }]
 *          // = GetJobs(:email)-এর প্রতিটা job-এর সব application
 *          // backend join করবে jobId দিয়ে; পুরনো ডেটায় jobId না থাকলে
 *          // title + company দিয়ে মিলাবে
 *
 *   GET    /JobApplications/:jobId        (fallback / এক job দেখার সময়)
 *          → [{ ...application }]         // ওই job-এর সব application
 *
 *   PATCH  /ApplicationStatus/:id
 *          body: { status: "Review" | "Shortlisted" | "Interview"
 *                         | "Offered" | "Rejected",
 *                  note?: string, by?: string (recruiter email) }
 *          backend করবে:
 *            1. status = body.status
 *            2. statusUpdatedAt = new Date()
 *            3. statusHistory.push({ status, at: new Date(), by, note })
 *          → 200 { ...updatedApplication }
 *
 *   GET    /UserInfoGet/:email            (applicant profile — optional)
 *          → { headline, skills[], experience, status, city, ... }
 *
 *  [SEEKER side — দেখো lib/SheareAction/SeekerAction/Action.tsx]
 *   POST   /ApplicationPost               → apply save (status: "Applied")
 *   GET    /ApplicationGet/:email         → নিজের application (status সহ)
 *   GET    /ApplicationGet/count/:email   → { count }
 *
 *  ✅ recruiter status বদলালে seeker-এর page আলাদা কিছু করে না —
 *     সে একই `Application` document পড়ে, তাই নতুন status নিজেই দেখায়।
 * ==================================================================
 */

import type { Job, JobsResponse, PostedJob } from "@/lib/Type/job"
import type {
  ApplicationStatus,
  JobApplication,
  JobApplicationsGroup,
  RecruiterApplication,
  RecruiterApplicationStats,
  RecruiterDecision,
} from "@/lib/Type/application"

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

/** কত দিনের application-কে "new" ধরা হবে */
export const NEW_APPLICATION_DAYS = 7

// ------------------------------------------------------------------
// 🧰 ছোট helper (সব function এগুলো ব্যবহার করে)
// ------------------------------------------------------------------

/** status সহ HTTP error — caller 404 নাকি অন্য error বুঝতে পারে */
class HttpError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "HttpError"
    this.status = status
  }
}

/**
 * backend error দিলে (status 4xx/5xx) সেটা পড়ার মতো message-এ বদলাই।
 * নাহলে UI "success" toast দেখিয়ে দিত, অথচ কিছুই save হয়নি।
 */
async function readError(
  res: Response,
  fallback = `Request failed (${res.status})`
): Promise<string> {
  try {
    const body = (await res.text()).trim()
    if (!body) return fallback

    // backend { error } / { message } দিলে সেটাই দেখাই
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>
      const message = parsed.error ?? parsed.message ?? parsed.msg
      if (typeof message === "string" && message) return message
    } catch {
      // JSON না — text-ই দেখাব
    }

    return body
  } catch {
    return fallback
  }
}

/** একবার GET — fail হলে HttpError (status সহ) throw করে */
async function getJson<T>(path: string, fallback: string): Promise<T> {
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env")
  }

  const res = await fetch(`${apiUrl}${path}`, { cache: "no-store" })

  if (!res.ok) {
    throw new HttpError(await readError(res, fallback), res.status)
  }

  return (await res.json()) as T
}

/** response array / { jobs } / { data } — যাই হোক array বের করে আনি */
function toList<T>(data: unknown, keys: readonly string[]): T[] {
  if (Array.isArray(data)) return data as T[]

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>

    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key] as T[]
    }
  }

  return []
}

/** title/company তুলনা — case আর extra space এড়াতে normalize */
function normalizeText(value?: string | null): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase()
}

/** date → timestamp; ভুল date হলে 0 (sort-এ শেষে যাবে) */
function timeOf(value?: string | Date | null): number {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

/** শেষ `days` দিনে apply করা কি না */
function isNewApplication(
  application: JobApplication,
  days = NEW_APPLICATION_DAYS
): boolean {
  const applied = timeOf(application.applyAdt)
  if (!applied) return false

  return Date.now() - applied <= days * 24 * 60 * 60 * 1000
}

// ==================================================================
// 🧾 JOBS
// ==================================================================

/**
 * GET /jobs — public job list (search + filter + pagination)।
 * sort hint: "latest" (default) | "oldest"
 * HTTP error হলে throw — caller try/catch-এ toast দেখাবে।
 */
export async function getJobs(query = ""): Promise<JobsResponse> {
  return getJson<JobsResponse>(`/jobs?${query}`, "Jobs load করা যায়নি।")
}

/**
 * GET /GetJobs/:email — এই recruiter যতগুলো job post করেছে।
 *
 * ⚠️ backend array না দিয়ে `{ jobs: [...] }` / `{ data: [...] }` দিলেও
 *    array বের করে আনি — নাহলে "job নেই" ভেবে list খালি দেখাত।
 */
export async function getRecruiterJobs(email: string): Promise<PostedJob[]> {
  if (!email) {
    throw new Error("Recruiter email is required.")
  }

  const data = await getJson<unknown>(
    `/GetJobs/${encodeURIComponent(email)}`,
    "Recruiter jobs load করা যায়নি।"
  )

  return toList<PostedJob>(data, ["jobs", "result", "data", "items"])
}

/**
 * GET /DetailsJob/:id — এক job-এর পুরো data (edit form ভরার জন্য)।
 * job না পাওয়া গেলে backend 404 দেবে → এখানে throw হবে।
 */
export async function getJobById(id: string): Promise<PostedJob> {
  if (!id) {
    throw new Error("Job id is required.")
  }

  return getJson<PostedJob>(
    `/DetailsJob/${encodeURIComponent(id)}`,
    "Job load করা যায়নি।"
  )
}

/**
 * PATCH /UpdateJob/:id — recruiter নিজের job update করে।
 *
 * 🔁 কী পাঠায়: পুরো job object, `_id` ছাড়া।
 *    `email` (যিনি post করেছেন) অপরিবর্তিত রাখা হয়, তাই job অন্য
 *    recruiter-এর list-এ চলে যায় না।
 *
 * 🔁 backend যা করবে:
 *    ১. `_id` = :id
 *    ২. body-র field গুলো দিয়ে `updateOne` (শুধু ওই email-এর job হলে)
 *    ৩. updated document ফেরত
 */
export async function UpdateJob(
  id: string,
  job: Job
): Promise<PostedJob | null> {
  if (!id) {
    throw new Error("Job id is required.")
  }

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env")
  }

  // `_id` কখনো body-তে যায় না — URL-এর :id-ই আসল id
  const payload = { ...job }
  delete payload._id

  const res = await fetch(`${apiUrl}/UpdateJob/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new HttpError(await readError(res), res.status)
  }

  const text = (await res.text()).trim()
  if (!text) return null

  try {
    return JSON.parse(text) as PostedJob
  } catch {
    return null
  }
}

/**
 * POST /PostJobs — নতুন job।
 * ⚠️ `_id` পাঠানো হয় না; MongoDB নিজেই বানায়। client-এর `_id: ""`
 *    একবার DB-তে ঢুকে গেলে পরে সব post duplicate key-তে fail করত।
 */
export async function JobsPost(job: Job): Promise<void> {
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env")
  }

  const payload = { ...job }
  delete payload._id

  const res = await fetch(`${apiUrl}/PostJobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new HttpError(await readError(res), res.status)
  }
}

/** DELETE /DeleteJob/:id — fail হলে throw */
export async function Action(_id: string): Promise<void> {
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env")
  }

  const res = await fetch(`${apiUrl}/DeleteJob/${encodeURIComponent(_id)}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new HttpError(await readError(res), res.status)
  }
}

// ==================================================================
// 📨 APPLICATIONS — recruiter-এর job-গুলোর ওপর
// ==================================================================

/**
 * Recruiter-এর select box-এর option।
 * এখানে যোগ/বাদ দিলে UI-ও বদলে যাবে (UI-তে hardcode করা নেই)।
 */
export const RECRUITER_DECISIONS: readonly {
  value: RecruiterDecision
  label: string
  description: string
}[] = [
  {
    value: "Review",
    label: "Under review",
    description: "Application পড়া হচ্ছে",
  },
  {
    value: "Shortlisted",
    label: "Shortlisted",
    description: "পরের ধাপের জন্য বাছাই করা হয়েছে",
  },
  {
    value: "Interview",
    label: "Interview",
    description: "Interview-এর জন্য ডাকা হয়েছে",
  },
  {
    value: "Offered",
    label: "Offered",
    description: "Job offer দেওয়া হয়েছে",
  },
  {
    value: "Rejected",
    label: "Rejected",
    description: "এই job-এর জন্য নেওয়া হয়নি",
  },
]

/** status → UI-তে দেখানোর নাম */
const STATUS_LABEL: Record<ApplicationStatus, string> = {
  Applied: "Applied",
  Review: "Under review",
  "Under Review": "Under review",
  Shortlisted: "Shortlisted",
  Interview: "Interview",
  Offered: "Offered",
  Rejected: "Rejected",
}

/**
 * backend-এর পুরনো/ভুল বানানের status → canonical status।
 * (পুরনো ডেটায় "checking", "interviewing", "under review" ইত্যাদি থাকতে পারে)
 */
export function normalizeApplicationStatus(
  value?: string | null
): ApplicationStatus {
  const text = (value ?? "").trim().toLowerCase()

  if (!text || text === "applied") return "Applied"
  if (text.includes("reject")) return "Rejected"
  if (text.includes("offer")) return "Offered"
  if (text.includes("interview")) return "Interview"
  if (text.includes("shortlist") || text.includes("short list")) return "Shortlisted"
  if (text.includes("review") || text.includes("check")) return "Review"

  return "Applied"
}

/** status-এর display নাম */
export function applicationStatusLabel(value?: string | null): string {
  return STATUS_LABEL[normalizeApplicationStatus(value)]
}

/** value টা recruiter-এর দেওয়া যায় এমন status কি না */
export function isRecruiterDecision(value: string): value is RecruiterDecision {
  return RECRUITER_DECISIONS.some((decision) => decision.value === value)
}

/** rejected / offered — এই দুই status-এ আর কিছু করার নেই */
export function isFinalStatus(value?: string | null): boolean {
  const status = normalizeApplicationStatus(value)
  return status === "Rejected" || status === "Offered"
}

/**
 * application-এর সাথে jobId জুড়ে দিই।
 * নতুন record-এ jobId থাকলে সেটাই; পুরনো record-এ শুধু title + company
 * থাকে — তখন recruiter-এর job list-এর সাথে মিলিয়ে বসাই।
 */
function attachJobIds(
  jobs: PostedJob[],
  applications: JobApplication[]
): RecruiterApplication[] {
  return applications.map((application) => {
    if (application.jobId) {
      return { ...application, jobId: application.jobId }
    }

    const matched = jobs.find(
      (job) =>
        normalizeText(job.title) === normalizeText(application.title) &&
        normalizeText(job.company) === normalizeText(application.company)
    )

    // job না পেলেও application হারায় না — jobId খালি থাকে
    return { ...application, jobId: matched?._id ?? "" }
  })
}

/** নতুন apply আগে — recruiter list-এ সেটাই আগে দেখা উচিত */
export function sortApplicationsNewestFirst(
  applications: RecruiterApplication[]
): RecruiterApplication[] {
  return [...applications].sort((a, b) => timeOf(b.applyAdt) - timeOf(a.applyAdt))
}

/**
 * GET /RecruiterApplications/:email
 * → recruiter-এর job-গুলোর সব application।
 */
async function fetchRecruiterApplications(
  recruiterEmail: string
): Promise<JobApplication[]> {
  const data = await getJson<unknown>(
    `/RecruiterApplications/${encodeURIComponent(recruiterEmail)}`,
    "Recruiter applications load করা যায়নি।"
  )

  return toList<JobApplication>(data, ["applications", "data", "items", "results"])
}

/**
 * GET /JobApplications/:jobId
 * → এক job-এর সব application (fallback + এক job দেখার সময়)।
 */
async function fetchApplicationsForJob(jobId: string): Promise<JobApplication[]> {
  const data = await getJson<unknown>(
    `/JobApplications/${encodeURIComponent(jobId)}`,
    "Job applications load করা যায়নি।"
  )

  return toList<JobApplication>(data, ["applications", "data", "items", "results"])
}

/**
 * Recruiter-এর সব application আনে (job info সহ)।
 *
 * 🔁 ধাপ:
 *   ১. jobs না দেওয়া থাকলে GET /GetJobs/:email
 *   ২. GET /RecruiterApplications/:email
 *      → endpoint এখনো না থাকলে (404/405) প্রতিটা job-এর জন্য
 *        GET /JobApplications/:jobId  (fallback)
 *   ৩. প্রতিটা application-এ jobId বসাই
 *   ৪. নতুন apply আগে সাজাই
 */
export async function getRecruiterApplications(
  recruiterEmail: string,
  jobs?: PostedJob[]
): Promise<RecruiterApplication[]> {
  if (!recruiterEmail) {
    throw new Error("Recruiter email is required.")
  }

  const recruiterJobs = jobs ?? (await getRecruiterJobs(recruiterEmail))

  let raw: JobApplication[]

  try {
    raw = await fetchRecruiterApplications(recruiterEmail)
  } catch (error) {
    // endpoint নেই → job ধরে ধরে application আনি
    const notFound =
      error instanceof HttpError && (error.status === 404 || error.status === 405)

    if (!notFound) throw error

    const perJob = await Promise.all(
      recruiterJobs.map((job) =>
        fetchApplicationsForJob(job._id).catch(() => [] as JobApplication[])
      )
    )

    raw = perJob.flat()
  }

  return sortApplicationsNewestFirst(attachJobIds(recruiterJobs, raw))
}

/** এক job-এর application (recruiter একটা job card খুললে) */
export async function getApplicationsForJob(
  jobId: string
): Promise<RecruiterApplication[]> {
  if (!jobId) {
    throw new Error("Job id is required.")
  }

  const applications = await fetchApplicationsForJob(jobId)

  return sortApplicationsNewestFirst(
    applications.map((application) => ({ ...application, jobId }))
  )
}

/**
 * Details panel-এর জন্য applicant-এর extra profile (headline, skills...)।
 * Application-এর ভিতরেই মূল তথ্য থাকে; এটা extra।
 *
 * ⚠️ fail করলে throw করে না — profile না পেলেও application দেখা যাবে।
 */
export async function getApplicantProfile(email: string) {
  if (!email) return null

  try {
    return await getJson<{
      headline?: string
      skills?: string[]
      experience?: string
      status?: string
      city?: string
      nationality?: string
      gender?: string
      dateOfBirth?: string
    }>(
      `/UserInfoGet/${encodeURIComponent(email)}`,
      "Applicant profile load করা যায়নি।"
    )
  } catch (error) {
    console.error("Applicant profile load failed:", error)
    return null
  }
}

/**
 * recruiter-এর job list + সব application → job ধরে ধরে group।
 *
 * 🔁 নিয়ম:
 *   - প্রতিটা job-এর জন্য একটা group (কেউ apply না করলেও `total: 0`)
 *   - application আগে jobId দিয়ে মেলাই, না পেলে title + company দিয়ে
 *   - একই seeker (একই email) একবারই গণ্য
 *   - group-এর ভিতরে application নতুন থেকে পুরনো
 */
export function groupApplicationsByJob(
  jobs: PostedJob[],
  applications: RecruiterApplication[]
): JobApplicationsGroup[] {
  return jobs.map((job) => {
    const matches = applications.filter((application) => {
      if (application.jobId) return application.jobId === job._id

      return (
        normalizeText(application.title) === normalizeText(job.title) &&
        normalizeText(application.company) === normalizeText(job.company)
      )
    })

    // একই email-এর duplicate application একবার
    const uniqueByEmail = new Map<string, RecruiterApplication>()
    for (const application of matches) {
      const key = normalizeText(application.email) || application._id
      if (!uniqueByEmail.has(key)) uniqueByEmail.set(key, application)
    }

    const unique = sortApplicationsNewestFirst([...uniqueByEmail.values()])

    return {
      job,
      applications: unique,
      total: unique.length,
      newCount: unique.filter((application) => isNewApplication(application)).length,
    }
  })
}

/**
 * Recruiter dashboard-এর summary সংখ্যা — সবই আসল application থেকে।
 * (Total jobs / applicants / active jobs / closed — সব এখান থেকেই)
 */
export function buildRecruiterApplicationStats(
  jobs: PostedJob[],
  applications: RecruiterApplication[]
): RecruiterApplicationStats {
  const byStatus: Record<ApplicationStatus, number> = {
    Applied: 0,
    Review: 0,
    "Under Review": 0,
    Shortlisted: 0,
    Interview: 0,
    Offered: 0,
    Rejected: 0,
  }

  const applicants = new Set<string>()

  for (const application of applications) {
    byStatus[normalizeApplicationStatus(application.status)] += 1
    applicants.add(normalizeText(application.email) || application._id)
  }

  const jobsWithApplicants = jobs.filter((job) =>
    applications.some((application) => {
      if (application.jobId) return application.jobId === job._id

      return (
        normalizeText(application.title) === normalizeText(job.title) &&
        normalizeText(application.company) === normalizeText(job.company)
      )
    })
  ).length

  return {
    totalJobs: jobs.length,
    jobsWithApplicants,
    totalApplications: applications.length,
    uniqueApplicants: applicants.size,
    newApplications: applications.filter((application) => isNewApplication(application))
      .length,
    byStatus,
  }
}

// ==================================================================
// 🏢 DASHBOARD HELPERS — job state + company summary
// (recruiter dashboard-এ সব সংখ্যা এখান থেকেই আসে — কোনো hardcoded নেই)
// ==================================================================

/**
 * job এখনো খোলা কিনা।
 * - deadline না থাকলে → open
 * - "2026-12-20" হলে ওই দিনের শেষ পর্যন্ত open
 * - deadline পার হলে → closed
 */
export function isJobOpen(job: PostedJob, now: Date = new Date()): boolean {
  if (!job.deadline) return true

  const deadline = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(job.deadline)
      ? `${job.deadline}T23:59:59.999`
      : job.deadline
  )

  if (Number.isNaN(deadline.getTime())) return true

  return deadline.getTime() >= now.getTime()
}

/** dashboard-এর "Top Companies" এক row */
export type CompanySummary = {
  name: string
  location: string
  category: string
  /** এই company-র মোট job post */
  jobs: number
  /** deadline না পার হওয়া job কতগুলো */
  openJobs: number
}

/**
 * recruiter-এর job গুলো company ধরে group করে।
 * একই company-র একাধিক job থাকলে এক row-তেই যোগ হয়।
 */
export function groupJobsByCompany(jobs: PostedJob[]): CompanySummary[] {
  const map = new Map<string, CompanySummary>()

  for (const job of jobs) {
    const name = job.company?.trim() || "Unnamed company"
    const key = name.toLowerCase()
    const existing = map.get(key)

    if (existing) {
      existing.jobs += 1
      if (isJobOpen(job)) existing.openJobs += 1
      if (!existing.location && job.location) existing.location = job.location
      continue
    }

    map.set(key, {
      name,
      location: job.location ?? "",
      category: job.category ?? "",
      jobs: 1,
      openJobs: isJobOpen(job) ? 1 : 0,
    })
  }

  return [...map.values()].sort(
    (a, b) => b.jobs - a.jobs || a.name.localeCompare(b.name)
  )
}

// ==================================================================
// ✏️ STATUS UPDATE — recruiter decision
// ==================================================================

export type ApplicationStatusUpdate = {
  status: RecruiterDecision
  /** recruiter-এর ছোট note (optional) — seeker-ও দেখতে পাবে */
  note?: string
  /** কে বদলালো — recruiter-এর email; backend `statusHistory.by`-তে রাখবে */
  reviewer?: string
}

/**
 * PATCH /ApplicationStatus/:id
 *
 * Body: { status, note, by }
 *
 * backend যা করবে:
 *   ১. `Application` document-এর `status` বদলাবে
 *   ২. `statusUpdatedAt` = এখন
 *   ৩. `statusHistory`-তে { status, at, by, note } push করবে
 *   ৪. updated document ফেরত দেবে
 *
 * ⚠️ timestamp client বানাবে না — backend-এর clock-ই ঠিক।
 * ⚠️ UI-তে optimistic update দিলে fail করলে আগের status-এ ফেরত নাও।
 */
export async function updateApplicationStatus(
  applicationId: string,
  update: ApplicationStatusUpdate
): Promise<JobApplication | null> {
  if (!applicationId) {
    throw new Error("Application id is required.")
  }

  if (!isRecruiterDecision(update.status)) {
    throw new Error(`Unknown application status: ${update.status}`)
  }

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env")
  }

  const res = await fetch(
    `${apiUrl}/ApplicationStatus/${encodeURIComponent(applicationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: update.status,
        note: update.note ?? "",
        by: update.reviewer ?? "",
      }),
    }
  )

  if (!res.ok) {
    throw new HttpError(
      await readError(res),
      res.status
    )
  }

  // backend updated document না দিলেও সমস্যা নেই — caller নিজের state বদলাবে
  const text = (await res.text()).trim()
  if (!text) return null

  try {
    return JSON.parse(text) as JobApplication
  } catch {
    return null
  }
}
