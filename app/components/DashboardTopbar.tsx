"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Mail, Search } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

// ------------------------------------------------------------------
// 🔝 DASHBOARD TOP BAR
// ------------------------------------------------------------------
// এখানে search box, notification bell আর ইউজারের নাম/ছবি দেখানো হয়।
export function DashboardTopbar() {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()
  const user = session?.user

  // seeker dashboard-এ আলাদা placeholder আর mail icon দেখাই
  const isSeeker = pathname.startsWith("/dashboard/seeker")

  // session না থাকলে ডেমো নাম দেখাবে
  const name = user?.name?.trim() || "Forhad Shorif"
  const initial = name.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center gap-4 border-b border-white/[0.06] bg-[#08080a]/90 px-4 backdrop-blur-xl sm:px-8">
      {/* মোবাইলে sidebar খোলার বাটন */}
      <SidebarTrigger className="-ml-1 text-white/60 hover:bg-white/5 hover:text-white md:hidden" />

      {/* ---------- সার্চ ---------- */}
      <label className="relative hidden min-w-0 max-w-3xl flex-1 sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          placeholder={
            isSeeker ? "Search for opportunities..." : "Search applications, jobs, or talent..."
          }
          aria-label="Search applications, jobs, or talent"
          className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#121214] pr-4 pl-11 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
        />
      </label>

      <div className="ml-auto flex shrink-0 items-center gap-4">
        {/* ---------- seeker-এর জন্য message icon ---------- */}
        {isSeeker && (
          <button
            type="button"
            aria-label="Messages"
            className="relative grid size-10 place-items-center rounded-full text-white/60 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Mail className="size-[18px]" />
            <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-rose-500 ring-2 ring-[#08080a]" />
          </button>
        )}

        {/* ---------- নোটিফিকেশন ---------- */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
        >
          <Bell className="size-[18px]" />
          <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-rose-500 ring-2 ring-[#08080a]" />
        </button>

        <span className="hidden h-8 w-px bg-white/10 sm:block" />

        {/* ---------- ইউজার ---------- */}
        <Link href="/profile" className="flex items-center gap-3">
          {!isSeeker && (
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-medium text-white">{name}</span>
              <span className="block text-[11px] text-white/40">
                TechFlow Inc.
              </span>
            </span>
          )}

          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-semibold text-white">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={name} className="size-full object-cover" />
            ) : (
              initial
            )}
          </span>
        </Link>
      </div>
    </header>
  )
}
