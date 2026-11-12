"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut, Menu, UserRound, X } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { showToast } from "@/lib/toast"

/** Session theke asha user er minimum info */
type HeaderUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

/**
 * 🔵 AVATAR COMPONENT
 * ------------------------------------------------------------------
 * - user.image thakle chobi dekhabe
 * - na thakle name er first letter (initial) dekhabe
 * Ei component header ar dropdown duitatei use hoy.
 */
function UserAvatar({ user, className = "size-9" }: { user: HeaderUser; className?: string }) {
  // Name er prothom letter ber kori. Name na thakle "U" (user).
  const initial = user.name?.trim().charAt(0).toUpperCase() || "U"

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-violet-500 to-blue-500 ${className}`}
    >
      {user.image ? (
        // Data URL / external URL hole Next <Image> kaj kore na, tai normal img use kori
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt={user.name ? `${user.name} profile photo` : "Profile photo"}
          className="size-full object-cover"
        />
      ) : (
        <span className="text-xs font-semibold text-white">{initial}</span>
      )}
    </span>
  )
}
// cosutom navLinks
// এগুলো সব পেজে একই থাকে
const baseNavLinks = [
  { label: "Browse Jobs", href: "/browse-jobs" },
  { label: "Companies", href: "#features" },
  { label: "Pricing", href: "#pricing" },
]

/**
 * 🔵 ACCOUNT MENU (choto dropdown)
 * ------------------------------------------------------------------
 * Click korle nicher menu open hobe:
 *  - User er name + email
 *  - My profile
 *  - Log out
 *
 * Base UI er DropdownMenu use kora hoyeche (components/ui/dropdown-menu.tsx).
 */
function AccountMenu({
  user,
  onProfile,
  onSignOut,
}: {
  user: HeaderUser
  onProfile: () => void
  onSignOut: () => void
}) {
  return (
    <DropdownMenu>
      {/* Trigger = jei element e click korle menu khule */}
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pr-1 pl-3 transition hover:border-white/20 hover:bg-white/[0.06] focus:outline-none"
      >
        {/* Desktop e name dekhabe, mobile e hide hobe */}
        <span className="hidden max-w-[9rem] truncate text-sm font-medium text-white/80 group-hover:text-white sm:block">
          {user.name || "User"}
        </span>
        <UserAvatar user={user} />
      </DropdownMenuTrigger>

      {/* Menu er content */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-xl border border-white/10 bg-[#0b0b0e] p-1.5 text-white shadow-2xl shadow-black/60"
      >
        {/* Name + email section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2 font-normal">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} className="size-10" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.name || "User"}</p>
                <p className="truncate text-xs text-white/45">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-white/10" />

        {/* Profile page e niye jabe */}
        <DropdownMenuItem
          onClick={onProfile}
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-white/70 focus:bg-white/5 focus:text-white"
        >
          <UserRound className="size-4" />
          <span>My profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onSignOut}
          variant="destructive"
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-rose-400 focus:bg-rose-500/10 focus:text-rose-300"
        >
          <LogOut className="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * 🟣 SITE HEADER
 * ------------------------------------------------------------------
 * Logic:
 *  - session theke user pele -> name + avatar + dropdown menu
 *  - user na pele             -> Log in / Sign up button
 *  - mobile e hamburger menu  -> ekhaneo same logic
 */
export function SiteHeader() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // useSession() current login user er data dey.
  // isPending = true mane data ekhono ashe ni (loading).
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user

  // role অনুযায়ী Dashboard link: seeker / recruiter / admin
  const role = user?.role ?? "seeker"
  const navLinks = [
    ...baseNavLinks,
    { label: "Dashboard", href: `/dashboard/${role}` },
  ]

  /** Logout function (header + mobile menu duitai use kore) */
  async function handleSignOut() {
    setIsOpen(false)

    try {
      await authClient.signOut()
      showToast.success("You have been logged out.")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
      showToast.error("Could not log out. Please try again.")
    }
  }

  /** Profile page e jao */
  function goToProfile() {
    setIsOpen(false)
    router.push("/profile")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
        {/* Logo */}
        <Link href="/" aria-label="HireLoop home" className="shrink-0">
          <Image
            src="/image/logo.png"
            alt="HireLoop"
            width={154}
            height={44}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-white/70 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: account menu + mobile hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Loading state: ekta pulse circle */}
          {isPending ? (
            <span className="size-9 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            /* ✅ User ache -> name + avatar dropdown */
            <AccountMenu user={user} onProfile={goToProfile} onSignOut={handleSignOut} />
          ) : (
            /* ❌ User nei -> Log in / Sign up (desktop only) */
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_30px_-8px_rgba(139,92,246,0.9)] transition hover:bg-violet-500"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="border-t border-white/10 bg-[#050505]/95 px-5 py-5 backdrop-blur-xl lg:hidden">
          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {user ? (
            /* User ache -> profile card + profile/logout button */
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <UserAvatar user={user} className="size-11" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{user.name || "User"}</p>
                  <p className="truncate text-xs text-white/45">{user.email}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={goToProfile}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
                >
                  <UserRound className="size-4" />
                  My profile
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-sm font-medium text-rose-300 transition hover:bg-rose-500/15"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </div>
            </div>
          ) : (
            /* User nei -> mobile e Log in / Sign up */
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/sign-in"
                onClick={() => setIsOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm font-medium text-white/80 transition hover:bg-white/5"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl bg-violet-600 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
