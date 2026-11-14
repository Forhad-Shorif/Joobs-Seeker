import { headers } from "next/headers"

import { SeekerDashboard } from "@/components/Seeker/seeker-dashboard"
import { auth } from "@/lib/auth"
import { SeekerGetSavedJobs } from "@/lib/SheareAction/SeekerAction/Action"

/**
 * 📄 app/dashboard/seeker/page.tsx
 * কাজ: seeker dashboard page। Login user-এর email দিয়ে saved job count আনে,
 * তারপর সব UI component-এ পাঠায়।
 */

// login session (headers) দরকার, তাই page সবসময় request-time-এ render হবে
export const dynamic = "force-dynamic"

export default async function SeekerPage() {
  let email: string | undefined

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    email = session?.user?.email ?? undefined
  } catch (error) {
    // login/session না থাকলেও page যেন ভাঙে না
    console.error("Seeker session load failed:", error)
  }

  const savedJobs = email ? await SeekerGetSavedJobs(email).catch(() => []) : []

  // backend থেকে পাওয়া actual saved job count
  return <SeekerDashboard savedJobsCount={savedJobs.length} />
}
