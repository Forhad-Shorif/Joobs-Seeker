"use server"

import { revalidatePath } from "next/cache"

/**
 * 📄 ফাইল: lib/actions/delete-job.ts
 * কাজ: recruiter-এর একটা job backend থেকে delete করা।
 *
 * Endpoint: DELETE {NEXT_PUBLIC_API_BASE_URL}/DeleteJob/:id
 */
export async function deleteJob(id: string): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env")
  }

  if (!id) {
    throw new Error("Job id is missing")
  }

  const response = await fetch(`${backendUrl}/DeleteJob/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`)
  }

  // Server page-এর cached data refresh করি
  revalidatePath("/dashboard/recruiter/jobs")
}
