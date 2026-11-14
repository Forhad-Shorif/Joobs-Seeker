import Link from "next/link"
import { ArrowLeft, FileQuestion } from "lucide-react"

/**
 * 📄 applicationdetails/[id]/not-found.tsx
 * কাজ: application না পাওয়া গেলে (ভুল id / অন্য user-এর data) সুন্দর message
 *      + applications page-এ ফেরার back button দেখায়।
 */
export default function ApplicationNotFound() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link
        href="/dashboard/seeker/application"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to applications
      </Link>

      <div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#101012] p-10 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-[#171719] text-white/60">
          <FileQuestion className="size-5" />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-white">
          Application not found
        </h1>
        <p className="mt-1 text-sm text-white/45">
          This application does not exist or it belongs to another account.
        </p>
      </div>
    </div>
  )
}
