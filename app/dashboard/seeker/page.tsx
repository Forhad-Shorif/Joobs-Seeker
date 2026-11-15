import { headers } from "next/headers"

import {
  SeekerDashboard,
  type RecentApplication,
  type StatusCount,
} from "@/components/Seeker/seeker-dashboard"
import { auth } from "@/lib/auth"
import {
  ApplicationGetData,
  SeekerGetSavedJobs,
} from "@/lib/SheareAction/SeekerAction/Action"
import type { JobApplication } from "@/lib/Type/application"

/**
 * 📄 app/dashboard/seeker/page.tsx
 * ==================================================================
 * 📌 কী: seeker dashboard-এর server page।
 *
 * 📦 data কোথা থেকে (সব আসল — কোনো demo/fake data নেই):
 *      - login user   → better-auth session (name / email / image)
 *      - saved jobs   → GET /SeekerGet/:email
 *      - applications → GET /ApplicationGet/:email
 *
 * 🔁 কী করে:
 *      ১. session থেকে email / name / image নেয়
 *      ২. saved jobs আর applications আনে (fail করলে খালি list)
 *      ৩. applications থেকে count বের করে —
 *         total applied / interview / offered / shortlisted / rejected / under review
 *      ৪. সবচেয়ে নতুন ৩টা application থেকে Recent Activity বানায়
 *      ৫. সব <SeekerDashboard />-এ prop আকারে পাঠায়
 *
 * ⚠️ আগে এই page-এ 24 / 3 / 1 ইত্যাদি লিখে রাখা ছিল — সেগুলো সরানো হয়েছে।
 * ==================================================================
 */

// session (headers) দরকার, তাই প্রতিবার request-time-এ render হবে
export const dynamic = "force-dynamic"

// status ছোট হাতের অক্ষরে নিয়ে compare করি (backend-এ value যেভাবেই থাকুক)
function statusOf(app: JobApplication): string {
  return (app.status ?? "").toLowerCase()
}

// ISO date → "2 hours ago" / "3 days ago"; পুরোনো হলে তারিখ
function timeAgo(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const seconds = Math.round((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`

  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export default async function SeekerPage() {
  let email: string | undefined
  let userName: string | undefined
  let userImage: string | undefined

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    email = session?.user?.email ?? undefined
    userName = session?.user?.name ?? undefined
    userImage = session?.user?.image ?? undefined
  } catch (error) {
    // login/session না থাকলেও page যেন ভাঙে না
    console.error("Seeker session load failed:", error)
  }

  // আসল backend data; কোনোটা fail করলে খালি list দেখাবে
  const savedJobs = email ? await SeekerGetSavedJobs(email).catch(() => []) : []
  const applications: JobApplication[] = email
    ? await ApplicationGetData(email).catch(() => [])
    : []

  const total = applications.length

  // design-এর ৫টা bar — সবই আসল application status থেকে
  const statusCounts: StatusCount[] = [
    { label: "Applied", count: total },
    {
      label: "Under Review",
      count: applications.filter((app) => statusOf(app).includes("review"))
        .length,
    },
    {
      label: "Shortlisted",
      count: applications.filter((app) => statusOf(app).includes("shortlist"))
        .length,
    },
    {
      label: "Rejected",
      count: applications.filter((app) => statusOf(app).includes("reject"))
        .length,
    },
    {
      label: "Offered",
      count: applications.filter((app) => statusOf(app).includes("offer"))
        .length,
    },
  ]

  // সবচেয়ে নতুন ৩টা application → Recent Activity
  const recentApplications: RecentApplication[] = [...applications]
    .sort((a, b) => new Date(b.applyAdt).getTime() - new Date(a.applyAdt).getTime())
    .slice(0, 3)
    .map((app) => ({
      id: app._id,
      title: app.title,
      company: app.company,
      status: app.status || "Applied",
      time: timeAgo(app.applyAdt),
    }))

  return (
    <SeekerDashboard
      userName={userName}
      userEmail={email}
      userImage={userImage}
      savedJobsCount={savedJobs.length}
      applicationsCount={total}
      interviewsCount={
        applications.filter((app) => statusOf(app).includes("interview")).length
      }
      offersCount={
        applications.filter((app) => statusOf(app).includes("offer")).length
      }
      statusCounts={statusCounts}
      recentApplications={recentApplications}
    />
  )
}
