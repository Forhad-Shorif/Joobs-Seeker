'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'

import type { JobApplication } from '@/lib/Type/application'

/**
 * 📄 components/Seeker/Application.tsx
 *
 * কেন: seeker-এর সব application list আকারে দেখাতে।
 * কখন: /dashboard/seeker/application page-এ।
 * data কোথা থেকে: server page → GET /ApplicationGet/:email → props
 *
 * এখানে শুধু simple client-side search + tab filter আছে।
 */

type ApplicationProps = {
  applications: JobApplication[]
}

type Tab = 'active' | 'archived'

// status অনুযায়ী badge-এর রঙ
const STATUS_STYLES: Record<string, string> = {
  Applied: 'border-white/25 bg-white/[0.06] text-white/80',
  Review: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  'Under Review': 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  Shortlisted: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  Interview: 'border-sky-400/40 bg-sky-400/10 text-sky-300',
  Rejected: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
  Offered: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
}

function statusClass(status: string) {
  return STATUS_STYLES[status] ?? 'border-white/20 bg-white/[0.04] text-white/60'
}

// ISO date → "13 Nov 2026"
function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

const Application = ({ applications }: ApplicationProps) => {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('active')

  // stats — backend data থেকেই হিসাব হয়
  const total = applications.length
  const shortlisted = applications.filter((app) =>
    app.status?.toLowerCase().includes('shortlist')
  ).length
  const interviews = applications.filter((app) =>
    app.status?.toLowerCase().includes('interview')
  ).length
  const offered = applications.filter(
    (app) => app.status?.toLowerCase() === 'offered'
  ).length
  const successRate = total
    ? `${Math.round(((shortlisted + offered) / total) * 100)}%`
    : '0%'

  // tab + search একসাথে apply হয়
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()

    return applications.filter((app) => {
      const isArchived = app.status?.toLowerCase() === 'rejected'
      if (tab === 'archived' ? !isArchived : isArchived) return false

      if (!text) return true
      return (
        app.title?.toLowerCase().includes(text) ||
        app.company?.toLowerCase().includes(text)
      )
    })
  }, [applications, query, tab])

  const stats = [
    { label: 'Total Applied', value: String(total) },
    { label: 'Shortlisted', value: String(shortlisted) },
    { label: 'Interviews', value: String(interviews) },
    { label: 'Success Rate', value: successRate, accent: true },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          My Applications
        </h1>
        <p className="mt-2 text-sm text-white/45">
          Track your job applications and interview progress in real-time.
        </p>
      </div>

      {/* stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/[0.07] bg-[#101012] p-5"
          >
            <p className="text-sm text-white/55">{stat.label}</p>
            <p
              className={`mt-4 text-3xl font-semibold tracking-tight ${
                stat.accent ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* search + tabs */}
      <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search applications..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pr-3.5 pl-10 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>

        <div className="inline-flex w-fit rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(['active', 'archived'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`h-8 rounded-lg px-4 text-xs font-medium capitalize transition ${
                tab === value
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/45 hover:text-white/80'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      {/* applications table */}
      {filtered.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#101012] p-10 text-center">
          <p className="text-white/60">
            {applications.length === 0
              ? 'You have not applied to any job yet.'
              : 'No applications match your search.'}
          </p>
          {applications.length === 0 && (
            <Link
              href="/browse-jobs"
              className="mt-2 inline-block text-sm text-violet-300 hover:text-violet-200"
            >
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#101012]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/[0.07] text-xs text-white/45">
              <tr>
                <th className="px-5 py-4 font-medium">Job Title</th>
                <th className="px-5 py-4 font-medium">Company</th>
                <th className="px-5 py-4 font-medium">Applied</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((app) => (
                <tr
                  key={app._id}
                  className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.02]"
                >
                  {/* job title + workplace */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-[#171719] font-semibold text-white/80">
                        {app.company?.charAt(0).toUpperCase() || '?'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-white">{app.title}</p>
                        <p className="mt-0.5 text-xs text-white/40">
                          {app.workplace || '—'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-white/60">{app.company}</td>
                  <td className="px-5 py-4 text-white/60">
                    {formatDate(app.applyAdt)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                        app.status
                      )}`}
                    >
                      {app.status || 'Applied'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/seeker/application/applicationdetails/${app._id}`}
                      className="inline-flex items-center gap-1 text-sm text-white/60 transition hover:text-white"
                    >
                      Details
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* footer count */}
          <div className="border-t border-white/[0.07] px-5 py-3 text-xs text-white/40">
            Showing {filtered.length} of {total} applications
          </div>
        </div>
      )}
    </div>
  )
}

export default Application
