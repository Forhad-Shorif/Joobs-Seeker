import type { Metadata } from "next"
import { headers } from "next/headers"

import Application from "@/components/Seeker/Application"
import { auth } from "@/lib/auth"
import { ApplicationGetData } from "@/lib/SheareAction/SeekerAction/Action"
import type { JobApplication } from "@/lib/Type/application"

export const metadata: Metadata = {
  title: "My applications - HireLoop",
  description: "Track your job applications and interview progress.",
}

// session (headers) দরকার, তাই page request-time-এ render হবে
export const dynamic = "force-dynamic"

/**
 * 📄 app/dashboard/seeker/application/page.tsx
 *
 * কেন: login করা seeker-এর সব application দেখাতে
 * কীভাবে: session থেকে email নিয়ে GET /ApplicationGet/:email call করি
 *
 * Data flow:
 *  এই page → Action.tsx → backend → <Application /> (client component)
 */
export default async function ApplicationPage() {
  // শুরুতে list খালি
  let applications: JobApplication[] = []

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const email = session?.user?.email

    if (email) {
      applications = await ApplicationGetData(email)
    }
  } catch (error) {
    // backend/session-এ সমস্যা হলে page ভাঙবে না, খালি list দেখাবে
    console.error("Applications load failed:", error)
  }

  return <Application applications={applications} />
}
