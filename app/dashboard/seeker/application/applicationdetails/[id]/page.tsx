import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react"

import { auth } from "@/lib/auth"
import { ApplicationGetData } from "@/lib/SheareAction/SeekerAction/Action"
import type { JobApplication } from "@/lib/Type/application"

export const metadata: Metadata = {
  title: "Application details - HireLoop",
}

export const dynamic = "force-dynamic"

type PageProps = {
  // Next 16-এ params একটা Promise
  params: Promise<{ id: string }>
}

// ISO date → "13 Nov 2026"
function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

// একটা label + value row
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-right text-sm text-white/85">{value || "—"}</span>
    </div>
  )
}

/**
 * 📄 app/dashboard/seeker/application/applicationdetails/[id]/page.tsx
 *
 * কেন: user application table-এ "Details" click করলে
 *      apply করার সময় কী কী submit করেছিল সব দেখাতে।
 * কীভাবে: session email দিয়ে application list এনে `_id` মিলিয়ে একটা নিই
 *         (backend-এ single-application route নেই, তাই এই সহজ পথ)।
 */
export default async function ApplicationDetailsPage({ params }: PageProps) {
  const { id } = await params

  let application: JobApplication | null = null

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const email = session?.user?.email

    if (email) {
      const applications = await ApplicationGetData(email)
      application = applications.find((item) => item._id === id) ?? null
    }
  } catch (error) {
    console.error("Application details load failed:", error)
  }

  // application না পাওয়া গেলে 404 page
  if (!application) notFound()

  const status = application.status || "Applied"

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* back button */}
      <Link
        href="/dashboard/seeker/application"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to applications
      </Link>

      {/* job header */}
      <section className="mt-5 rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-[#171719] text-lg font-semibold text-white">
              {application.company?.charAt(0).toUpperCase() || "?"}
            </span>

            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {application.title}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                <Building2 className="size-4" />
                {application.company}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
                <CalendarDays className="size-3.5" />
                Applied on {formatDate(application.applyAdt)}
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {status}
          </span>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* applicant / personal details */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <UserRound className="size-4 text-violet-300" />
            Your submitted details
          </h2>

          <div className="mt-4 divide-y divide-white/[0.06]">
            <InfoRow label="Full name" value={application.name} />
            <InfoRow label="Email" value={application.email} />
            <InfoRow label="Date of birth" value={formatDate(application.dateOfBirth)} />
            <InfoRow label="Gender" value={application.gender} />
            <InfoRow label="Nationality" value={application.nationality} />
            <InfoRow label="City" value={application.city} />
          </div>
        </section>

        {/* job + professional details */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <BriefcaseBusiness className="size-4 text-violet-300" />
            Job details
          </h2>

          <div className="mt-4 divide-y divide-white/[0.06]">
            <InfoRow label="Job title" value={application.title} />
            <InfoRow label="Company" value={application.company} />
            <InfoRow label="Workplace" value={application.workplace} />
            <InfoRow label="Experience" value={application.experience} />
          </div>

          {/* skills */}
          <div className="mt-5">
            <p className="flex items-center gap-1.5 text-xs text-white/40">
              <Sparkles className="size-3.5 text-violet-300" />
              Skills
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {application.skills?.length ? (
                application.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-violet-500/15 px-2 py-1 text-xs font-medium text-violet-100 ring-1 ring-violet-400/25 ring-inset"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-white/45">—</span>
              )}
            </div>
          </div>

          {/* contact shortcut */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {application.email}
            </span>
            {application.city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {application.city}
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
