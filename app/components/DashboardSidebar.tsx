"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
    Bookmark,
    BriefcaseBusiness,
    Building2,
    CreditCard,
    FileText,
    Inbox,
    LayoutDashboard,
    LogOut,
    Search,
    Settings,
    UsersRound,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { showToast } from "@/lib/utils/toast"
import { cn } from "@/lib/everything/utils"

// ------------------------------------------------------------------
// 🎭 TYPE
// ------------------------------------------------------------------
type UserRole = "seeker" | "recruiter" | "admin"

type NavItem = {
    label: string
    href: string
    icon: LucideIcon
}

const ROLES: UserRole[] = ["seeker", "recruiter", "admin"]

// ------------------------------------------------------------------
// 🗂️ ROLE অনুযায়ী মেনু
// ------------------------------------------------------------------
// নতুন মেনু যোগ করতে চাইলে শুধু নিচের array-তে একটি object যোগ করুন।
const NAV_ITEMS: Record<UserRole, NavItem[]> = {
    seeker: [
        { label: "Dashboard", href: "/dashboard/seeker", icon: LayoutDashboard },
        { label: "Jobs", href: "/browse-jobs", icon: Search },
        { label: "Saved Jobs", href: "/dashboard/seeker/saved", icon: Bookmark },
        { label: "Applications", href: "/dashboard/seeker/application", icon: FileText },
        { label: "Billing", href: "/payment", icon: CreditCard },
        { label: "Settings", href: "/dashboard/seeker/setting", icon: Settings },
    ],

    recruiter: [
        { label: "Dashboard", href: "/dashboard/recruiter", icon: LayoutDashboard },
        { label: "My Company", href: "/dashboard/recruiter/company", icon: Building2 },
        { label: "Manage Jobs", href: "/dashboard/recruiter/jobs", icon: BriefcaseBusiness },
        { label: "Add Jobs", href: "/dashboard/recruiter/jobs/new", icon: BriefcaseBusiness },
        { label: "Applications", href: "/dashboard/recruiter/applications", icon: Inbox },
        { label: "Settings", href: "/dashboard/recruiter/settings", icon: Settings },
    ],

    admin: [
        { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        { label: "Users", href: "/dashboard/admin/users", icon: UsersRound },
        { label: "Companies", href: "/dashboard/admin/companies", icon: Building2 },
        { label: "Jobs", href: "/dashboard/admin/jobs", icon: BriefcaseBusiness },
        { label: "Payments", href: "/dashboard/admin/payments", icon: CreditCard },
        { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
    ],
}

const ROLE_LABELS: Record<UserRole, string> = {
    seeker: "Seeker",
    recruiter: "Recruiter",
    admin: "Super Admin",
}

// ------------------------------------------------------------------
// 🧰 ছোট helper function
// ------------------------------------------------------------------

// URL থেকে role বের করে: /dashboard/admin → "admin", না পেলে null
function getRoleFromPath(pathname: string): UserRole | null {
    const part = pathname.split("/")[2]
    return ROLES.includes(part as UserRole) ? (part as UserRole) : null
}

// মেনু item-টি এখন active কিনা
function isActiveLink(pathname: string, href: string, dashboardHref: string) {
    // Dashboard root-এ শুধু exact match
    if (href === dashboardHref) return pathname === href

    // অন্য page-এ child route-ও active থাকবে
    return pathname === href || pathname.startsWith(`${href}/`)
}

// ------------------------------------------------------------------
// 🧭 SIDEBAR
// ------------------------------------------------------------------
export function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = authClient.useSession()

    const user = session?.user

    // আগে URL, না পেলে logged-in user-এর role, না পেলে "seeker"
    const role: UserRole = getRoleFromPath(pathname) ?? user?.role ?? "seeker"

    // নাম না থাকলে "Guest" দেখাবে (UI ফাঁকা না লাগার জন্য)
    const name = user?.name?.trim() || "Guest"
    const initial = name.charAt(0).toUpperCase()
    const roleLabel = ROLE_LABELS[role]
    const items = NAV_ITEMS[role]
    const dashboardHref = `/dashboard/${role}`

    async function handleSignOut() {
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

    return (
        <Sidebar className="border-r border-white/[0.06] bg-[#0a0a0c]">
            {/* ---------- উপরের অংশ: লোগো + ইউজার ---------- */}
            <SidebarHeader className="p-5">
                <div>
                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight text-white"
                    >
                        HireLoop
                    </Link>

                    {role === "admin" && (
                        <p className="mt-1 text-[10px] font-medium tracking-[0.14em] text-white/35 uppercase">
                            Admin Console
                        </p>
                    )}
                </div>

                <Link
                    href="/profile"
                    className="mt-8 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 transition hover:bg-white/[0.05]"
                >
                    {/* ছবি থাকলে ছবি, না থাকলে নামের প্রথম অক্ষর */}
                    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-semibold text-white ring-1 ring-white/20">
                        {user?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.image}
                                alt={name}
                                className="size-full object-cover"
                            />
                        ) : (
                            initial
                        )}
                    </span>

                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">
                            {role === "seeker" ? "Seeker Portal" : name}
                        </span>
                        <span className="block truncate text-xs text-white/40">
                            {role === "seeker" ? "Professional Tier" : roleLabel}
                        </span>
                    </span>
                </Link>

                {role === "recruiter" && (
                    <span className="mt-3 inline-flex w-fit rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-white/70">
                        PREMIUM ACCOUNT
                    </span>
                )}
            </SidebarHeader>

            {/* ---------- মেনু ---------- */}
            <SidebarContent className="px-3 py-2">
                <SidebarMenu className="gap-1">
                    {items.map((item) => {
                        const Icon = item.icon
                        const active = isActiveLink(pathname, item.href, dashboardHref)

                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    render={<Link href={item.href} />}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "h-11 gap-3 rounded-lg px-3 text-sm font-medium text-white/50 transition",
                                        "hover:bg-white/[0.05] hover:text-white",
                                        active && "bg-white/[0.07] text-white",
                                    )}
                                >
                                    <Icon className="size-[18px]" />
                                    <span>{item.label}</span>

                                    {/* active মেনুর ডান পাশে ছোট সাদা বার */}
                                    {active && (
                                        <span className="ml-auto h-5 w-0.5 rounded-full bg-white" />
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* ---------- নিচের অংশ: Post Resume + লগআউট ---------- */}
            <SidebarFooter className="p-3 pb-16">
                {role === "seeker" && (
                    <div className="mb-3 border-t border-white/[0.08] pt-4">
                        <Link
                            href="/profile/add-info"
                            className="flex h-11 items-center justify-center rounded-lg bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                        >
                            Post Resume
                        </Link>
                    </div>
                )}

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            type="button"
                            onClick={handleSignOut}
                            className="h-11 gap-3 rounded-lg px-3 text-sm font-medium text-white/50 transition hover:bg-rose-500/10 hover:text-rose-300"
                        >
                            <LogOut className="size-[18px]" />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
