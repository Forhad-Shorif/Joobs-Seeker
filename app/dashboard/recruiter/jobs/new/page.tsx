import { NewJobForm } from "@/components/SheareJobs/new-job-form"

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase">
          <span className="size-1.5 rounded-full bg-violet-500" />
          Recruiter workspace
        </span>

        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl">
          Post a new job
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45 sm:text-base">
          Share the role, the salary and what makes your team different. Great posts attract
          great candidates.
        </p>
      </div>

      <NewJobForm />
    </div>
  )
}
