import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { EditJobForm } from "@/components/SheareJobs/new-job-form"
import { auth } from "@/lib/auth"
import { getJobById } from "@/lib/SheareAction/RecruiterAction/Action"
import type { PostedJob } from "@/lib/Type/job"

export const metadata: Metadata = {
  title: "Edit job - HireLoop",
  description: "Update the details of a job you posted.",
}

// session (headers) দরকার, তাই প্রতিবার request-time-এ render
export const dynamic = "force-dynamic"

type PageProps = {
  // Next 16-এ params একটা Promise
  params: Promise<{ id: string }>
}

/**
 * 📄 app/dashboard/recruiter/jobs/[id]/edit/page.tsx
 *
 * কেন: Manage jobs-এর pencil icon-এ click করলে পুরনো job edit করতে।
 * কীভাবে:
 *   ১. session থেকে recruiter-এর email
 *   ২. GET /DetailsJob/:id → পুরনো job data
 *   ৩. job-এর email আর session email না মিললে 404 (অন্যের job edit নয়)
 *   ৪. <EditJobForm job={job} /> → submit করলে PATCH /UpdateJob/:id
 */
export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  const email = session?.user?.email

  let job: PostedJob | null = null

  try {
    const found = await getJobById(id)

    // শুধু নিজের post করা job edit করা যাবে
    if (email) {
      const owner = (found.email ?? "").toLowerCase()

      // owner খালি হলে (পুরনো job) অনুমতি দিই, নাহলে email মিলতেই হবে
      if (!owner || owner === email.toLowerCase()) {
        job = found
      }
    }
  } catch (error) {
    console.error("Edit job load failed:", error)
  }

  if (!job) notFound()

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/dashboard/recruiter/jobs"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to manage jobs
      </Link>

      <div className="mt-5 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase">
          <span className="size-1.5 rounded-full bg-violet-500" />
          Recruiter workspace
        </span>

        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl">
          Edit job
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45 sm:text-base">
          Update <span className="text-white/70">{job.title}</span> at{" "}
          {job.company}. Save করলে Manage jobs list-এ নতুন data দেখা যাবে।
        </p>
      </div>

      <EditJobForm job={job} />
    </div>
  )
}
