import type { Metadata } from "next"
import { headers } from "next/headers"

import PostedJobs from "@/components/PostedJobs"
import { auth } from "@/lib/auth"
import type { PostedJob } from "@/lib/job"

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
async function getRecruiterJobs(): Promise<PostedJob[]> {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!backendUrl) {
        return []
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    const email = session?.user?.email

    if (!email) {
        return []
    }

    try {
        const response = await fetch(
            `${backendUrl}/GetJobs/${encodeURIComponent(email)}`,
            {
                // প্রতিবার সরাসরি ব্যাকএন্ড থেকে তাজা ডাটা আনি
                cache: "no-store",
            }
        )

        // backend error দিলে (500 + text body) json parse করলে page crash করবে
        if (!response.ok) {
            return []
        }

        const result = await response.json()

        // backend array না দিলে (যেমন { message: ... }) list render ভেঙে যাবে
        if (!Array.isArray(result)) {
            return []
        }

        return result as PostedJob[]
    } catch (error) {
        console.error("GetJobs request failed:", error)
        return []
    }
}

export default async function JobsPage() {
    const jobs = await getRecruiterJobs()

    return (
        <div className="mx-auto max-w-5xl">
            <PostedJobs jobs={jobs} />
        </div>
    )
}
