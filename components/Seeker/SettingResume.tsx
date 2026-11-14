"use client"

import { useState } from "react"
import { FileText, Upload, X } from "lucide-react"

/**
 * 📄 components/Seeker/SettingResume.tsx
 *
 * আপাতত শুধু design। file select করলে নাম দেখায়,
 * কিন্তু কোথাও upload/save হয় না।
 */
export default function SettingResume() {
  const [fileName, setFileName] = useState("")

  return (
    <section className="flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0b0e]/80 p-5 shadow-[0_30px_80px_-60px_rgba(139,92,246,0.55)] sm:p-6">
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-violet-300/80 uppercase">
        <FileText className="size-3.5" />
        Resume
      </div>

      <h2 className="mt-2 text-xl font-semibold tracking-tight">Your resume</h2>
      <p className="mt-1 text-sm text-white/45">
        Upload your latest resume for recruiters.
      </p>

      <div className="relative mt-4 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-violet-300/20 bg-gradient-to-b from-violet-500/[0.07] via-white/[0.01] to-transparent p-5 text-center transition hover:border-violet-300/40 hover:from-violet-500/[0.1]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 size-40 -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl"
        />

        <div className="relative">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 text-violet-200 ring-1 ring-violet-400/25 ring-inset">
            <FileText className="size-5" />
          </span>

          <p className="mt-3 text-sm font-medium text-white/85">
            {fileName || "No resume selected"}
          </p>
          <p className="mt-1 text-[11px] text-white/35">
            PDF, DOC or DOCX · max 5MB
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <label
              htmlFor="setting-resume"
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-xs font-medium text-white/80 transition hover:border-violet-400/40 hover:bg-white/10 hover:text-white"
            >
              <Upload className="size-3.5" />
              {fileName ? "Change file" : "Choose file"}
            </label>

            {fileName && (
              <button
                type="button"
                onClick={() => setFileName("")}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2 text-xs text-white/35 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                <X className="size-3.5" />
                Remove
              </button>
            )}
          </div>
        </div>

        <input
          id="setting-resume"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
          className="sr-only"
        />
      </div>

      <p className="mt-4 text-[11px] text-white/30">
        Your resume stays private until you apply.
      </p>
    </section>
  )
}
