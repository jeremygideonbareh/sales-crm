import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  LogOut,
  ChevronLeft,
  X,
  BarChart3,
  Calendar,
  ArrowRightLeft,
  Settings,
  Shield,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isMobile = useIsMobile()

  if (!user) return null

  const isManager = user.role === "manager"

  const navItems = isManager
    ? [
        { to: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/manager/leads", label: "Leads", icon: Users },
        { to: "/manager/leaderboard", label: "Leaderboard", icon: BarChart3 },
        { to: "/manager/sequences", label: "Sequences", icon: Mail },
        { to: "/admin/users", label: "Users", icon: Shield },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { to: "/rep/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/rep/calling", label: "Calling", icon: PhoneCall },
        { to: "/rep/demos", label: "Demo Requests", icon: Calendar },
        { to: "/rep/handovers", label: "Handovers", icon: ArrowRightLeft },
        { to: "/settings", label: "Settings", icon: Settings },
      ]

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/30">
            <PhoneCall className="h-4 w-4 text-emerald-400" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold">Sales CRM</span>
          )}
        </div>
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMobileClose}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon-sm" onClick={onToggle}>
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => isMobile && onMobileClose?.()}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              location.pathname === to
                ? "bg-emerald-900/30 text-emerald-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t px-3 py-3">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}
        >
          <Avatar name={user.full_name} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.full_name}
              </p>
              <p className="truncate text-xs capitalize text-muted-foreground">
                {user.role}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <>
            <div className="mt-2 flex items-center gap-1">
              <ThemeToggle />
              <span className="text-xs text-muted-foreground">Toggle theme</span>
            </div>
            <Button
              variant="ghost"
              className="mt-1 w-full justify-start text-sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </>
        )}
      </div>
    </div>
  )

  // Mobile: overlay sidebar (controlled by parent via mobileOpen prop)
  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={onMobileClose}
            />
            <aside className="relative h-full w-64 animate-slide-in-right border-r bg-card">
              {sidebarContent}
            </aside>
          </div>
        )}
      </>
    )
  }

  // Desktop: collapsible sidebar
  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {sidebarContent}
    </aside>
  )
}
