import type { Metadata } from "next"
import { headers } from "next/headers"

import PostedJobs from "@/components/SheareJobs/PostedJobs"
import { auth } from "@/lib/auth"
import { getRecruiterJobs } from "@/lib/SheareAction/RecruiterAction/Action"
import type { PostedJob } from "@/lib/Type/job"

export const metadata: Metadata = {
    title: "Manage jobs - HireLoop",
    description: "View, edit and manage the jobs you have posted as a recruiter.",
}

/**
 * 📄 ফাইল: app/dashboard/recruiter/jobs/page.tsx
 * কাজ: recruiter-এর email দিয়ে backend থেকে তার posted jobs আনা।
 *
 * Flow:
 * 1. Server-এ Better Auth session check
 * 2. session email দিয়ে GET /GetJobs/:email
 * 3. data গুলো <PostedJobs />-এ পাঠানো
 */
async function loadRecruiterJobs(): Promise<PostedJob[]> {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    const email = session?.user?.email

    if (!email) {
        return []
    }

    try {
        return await getRecruiterJobs(email)
    } catch (error) {
        // backend/session-এ সমস্যা হলে page ভাঙবে না, খালি list দেখাবে
        console.error("GetJobs request failed:", error)
        return []
    }
}

export default async function JobsPage() {
    const jobs = await loadRecruiterJobs()

    return (
        <div className="mx-auto max-w-5xl">
            <PostedJobs jobs={jobs} />
        </div>
    )
}
