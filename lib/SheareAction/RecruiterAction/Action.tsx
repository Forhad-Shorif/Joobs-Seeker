import type { Job, JobsResponse } from "@/lib/Type/job"

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

// backend এখনো যেই shape-ই দিক (array / { jobs } / { data }), সব handle করি



/**
 * GET /jobs — search + filter + pagination।
 * sort hint: "latest" (default) | "oldest"
 * HTTP error হলে throw — caller try/catch-এ toast দেখাবে।
 */
export async function getJobs(query = ""): Promise<JobsResponse> {
  const res = await fetch(`${apiUrl}/jobs?${query}`, { cache: "no-store" })
  return (await res.json()) as JobsResponse
}

// DELETE /DeleteJob/:id — fail হলে throw
export async function Action(_id: string): Promise<void> {
  const res = await fetch(`${apiUrl}/DeleteJob/${encodeURIComponent(_id)}`, {
    method: "DELETE",
  })
}

// POST /PostJobs — fail হলে throw
export async function JobsPost(job: Job): Promise<void> {
  const res = await fetch(`${apiUrl}/PostJobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  })
}