import type { Metadata } from "next"
import { headers } from "next/headers"

import RecruiterApplications from "@/components/Recruiter/recruiter-applications"
import { auth } from "@/lib/auth"
import {
  buildRecruiterApplicationStats,
  getRecruiterApplications,
  getRecruiterJobs,
  groupApplicationsByJob,
} from "@/lib/SheareAction/RecruiterAction/Action"
import type { RecruiterApplication } from "@/lib/Type/application"
import type { PostedJob } from "@/lib/Type/job"

export const metadata: Metadata = {
  title: "Applications - HireLoop",
  description: "See who applied to your jobs and update their status.",
}

// session (headers) দরকার, তাই প্রতিবার request-time-এ render
export const dynamic = "force-dynamic"

/**
 * 📄 app/dashboard/recruiter/applications/page.tsx
 * ==================================================================
 * 📌 কী: recruiter-এর Applications page।
 *
 * 📦 data কোথা থেকে (সব আসল, কোনো demo data নেই):
 *   ১. session → recruiter-এর email
 *   ২. GET /GetJobs/:email            → নিজের post করা job
 *   ৩. GET /RecruiterApplications/:email
 *      (endpoint না থাকলে GET /JobApplications/:jobId fallback)
 *      → ওই job-গুলোর সব application
 *   ৪. groupApplicationsByJob()       → কোন job-এ কতজন
 *      buildRecruiterApplicationStats() → summary সংখ্যা
 *
 * ⚠️ status বদলানো client component করে — PATCH /ApplicationStatus/:id
 *    (দেখো: components/Recruiter/recruiter-applications.tsx)
 * ==================================================================
 */

export default async function RecruiterApplicationsPage() {
  let jobs: PostedJob[] = []
  let applications: RecruiterApplication[] = []

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const email = session?.user?.email

    if (email) {
      jobs = await getRecruiterJobs(email).catch((error) => {
        console.error("Recruiter jobs load failed:", error)
        return [] as PostedJob[]
      })

      if (jobs.length > 0) {
        applications = await getRecruiterApplications(email, jobs).catch(
          (error) => {
            console.error("Recruiter applications load failed:", error)
            return [] as RecruiterApplication[]
          }
        )
      }
    }
  } catch (error) {
    console.error("Applications page load failed:", error)
  }

  const groups = groupApplicationsByJob(jobs, applications)
  const stats = buildRecruiterApplicationStats(jobs, applications)

  return <RecruiterApplications groups={groups} stats={stats} />
}
