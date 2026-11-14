import { KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react"

/**
 * 📄 components/Seeker/SettingPassword.tsx
 *
 * দুটো field:
 * 1. Current password — password change করার সময়
 * 2. New password — নতুন password
 *
 * Password ভুলে গেলে "Forgot password?" reset link ব্যবহার করবে।
 * আপাতত শুধু design; API connect করা নেই।
 */
export default function SettingPassword() {
  const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pr-3.5 pl-10 text-sm text-white caret-violet-400 outline-none placeholder:text-white/30 focus:border-violet-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/10"

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0b0e]/80 p-5 shadow-[0_30px_80px_-60px_rgba(59,130,246,0.55)] sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-10 size-56 rounded-full bg-blue-500/10 blur-[90px]"
      />

      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-center">
        {/* Left: intro */}
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-violet-300/80 uppercase">
            <LockKeyhole className="size-3.5" />
            Security
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Reset password
          </h2>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-white/45">
            Change your password using your current password.
          </p>

          <div className="mt-4 inline-flex items-start gap-2.5 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] px-3 py-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />
            <p className="text-[11px] leading-relaxed text-white/45">
              Forgot your password? Use the reset link below.
            </p>
          </div>
        </div>

        {/* Right: fields */}
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-white/80"
              >
                Current password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
                <input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-white/80"
              >
                New password
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
                <input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  className={inputClass}
                />
              </div>
              <p className="text-[11px] text-white/35">
                Use at least 8 characters.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 text-sm font-semibold text-white shadow-[0_12px_35px_-18px_rgba(139,92,246,1)] transition hover:brightness-110"
            >
              <ShieldCheck className="size-4" />
              Update password
            </button>

            <button
              type="button"
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-white/65 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
            >
              <Mail className="size-3.5" />
              Forgot password?
            </button>
          </div>

          <p className="mt-3 text-[11px] text-white/30">
            Use a strong password you don&apos;t use anywhere else.
          </p>
        </div>
      </div>
    </section>
  )
}
