import { headers } from "next/headers"

import { SavedJobsView } from "@/components/Seeker/saved-jobs-view"
import { auth } from "@/lib/auth"
import type { SavedJob } from "@/lib/Type/job"
import { SeekerGetSavedJobs } from "@/lib/SheareAction/SeekerAction/Action"

/**
 * 📄 app/dashboard/seeker/saved/page.tsx
 *
 * কেন: login করা user-এর saved jobs দেখাতে
 * কখন: Sidebar-এ "Saved Jobs" click করলে
 * কীভাবে: session থেকে email নিয়ে backend-এর GET /SeekerGet/:email call করি
 *
 * Data flow:
 * এই page → Action.tsx → backend → SavedJobsView
 *
 * এখানে কোনো demo data নেই। backend যা দেয়, শুধু সেটাই দেখায়।
 */

// login session (headers) দরকার, তাই page সবসময় request-time-এ render হবে
export const dynamic = "force-dynamic"

export default async function SavedJobsPage() {
  // শুরুতে list খালি
  let jobs: SavedJob[] = []

  try {
    // browser-এর cookie/header নিয়ে login user খুঁজি
    const session = await auth.api.getSession({ headers: await headers() })

    // session থাকলে email পাব
    const email = session?.user?.email

    // email থাকলে backend থেকে saved jobs আনি
    if (email) {
      jobs = await SeekerGetSavedJobs(email)
    }
  } catch (error) {
    // backend/session-এ সমস্যা হলে page ভাঙবে না, খালি list দেখাবে
    console.error("Saved jobs load failed:", error)
  }

  // পাওয়া list টা UI component-এ পাঠাই
  return <SavedJobsView jobs={jobs} />
}
