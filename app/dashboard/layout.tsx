import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { DashboardSidebar } from "../components/DashboardSidebar"
import { DashboardTopbar } from "../components/DashboardTopbar"

// ------------------------------------------------------------------
// 🧱 DASHBOARD LAYOUT
// ------------------------------------------------------------------
// বাম দিকে sidebar, ডান দিকে top bar + page content।
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarProvider>
            <DashboardSidebar />
            
            <SidebarInset>
                <DashboardTopbar />

                <main className="flex-1 p-5 sm:p-8">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default DashboardLayout
