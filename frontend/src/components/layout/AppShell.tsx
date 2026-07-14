import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { MobileBottomNav } from "./MobileBottomNav"
import { MobileHeader } from "./MobileHeader"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { NotificationBell } from "@/components/ui/notification-bell"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <Sidebar
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header with hamburger */}
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Desktop top bar */}
        {!isMobile && (
          <div className="flex items-center justify-end gap-2 px-4 py-2 sm:px-6 lg:px-8">
            <NotificationBell />
          </div>
        )}

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300",
            "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface via-background to-background",
            isMobile && "pb-20" // space for bottom nav
          )}
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  )
}
