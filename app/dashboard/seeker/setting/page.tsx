import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Settings2, ShieldCheck } from "lucide-react"

import SettingDetails from "@/components/Seeker/SettingDetails"
import SettingPassword from "@/components/Seeker/SettingPassword"
import SettingProfile from "@/components/Seeker/SettingProfile"
import SettingResume from "@/components/Seeker/SettingResume"
import { getUserInfo } from "@/lib/SheareAction/ProfileAction/userinfo"
import { emptyProfileDetails } from "@/lib/Type/user-info"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Settings - HireLoop",
  description: "Manage your profile, resume and professional details.",
}

// session (headers) দরকার, তাই page request-time-এ render হবে
export const dynamic = "force-dynamic"

/**
 * 📄 app/dashboard/seeker/setting/page.tsx
 *
 * Layout:
 * - উপরে বাম: Profile Information
 * - উপরে ডান: Resume
 * - নিচে full width: Professional Details
 * - সবার নিচে: Reset Password
 */
export default async function SettingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect("/sign-in?redirect=/dashboard/seeker/setting")
  }

  let initialDetails = emptyProfileDetails

  try {
    initialDetails =
      (await getUserInfo(session.user.email)) ?? emptyProfileDetails
  } catch (error) {
    // Backend unavailable হলেও form খালি state-এ render হবে
    console.error("Could not load profile details:", error)
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      {/* soft background glow — dashboard card-গুলোর পেছনে depth আনে */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/3 size-80 rounded-full bg-violet-600/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-0 size-72 rounded-full bg-blue-600/[0.06] blur-[120px]"
      />

      <div className="relative space-y-6">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-violet-300/80 uppercase backdrop-blur">
              <Settings2 className="size-3.5" />
              Account settings
            </span>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Settings
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
              Keep your profile, resume and professional details up to date.
            </p>
          </div>

          <div className="hidden items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 shadow-[0_20px_50px_-40px_rgba(139,92,246,0.7)] sm:flex">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20 ring-inset">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-white/80">
                Private & secure
              </p>
              <p className="mt-0.5 text-[10px] text-white/35">
                Only you can update this
              </p>
            </div>
          </div>
        </header>

        {/* Profile + Resume */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.75fr)] xl:items-start">
          <SettingProfile
            initialUser={{
              name: session.user.name || "",
              email: session.user.email,
              image: session.user.image || "",
              coverImage: session.user.coverImage || "",
            }}
          />

          <SettingResume />
        </div>

        {/* Details form — ProfileForm-এর নিজের header আছে */}
        <SettingDetails
          email={session.user.email}
          initialDetails={initialDetails}
        />

        {/* Security */}
        <SettingPassword />
      </div>
    </div>
  )
}
