import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  BarChart3,
  Calendar,
  ArrowRightLeft,
  Settings,
} from "lucide-react"

export function MobileBottomNav() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  const isManager = user.role === "manager"

  const items = isManager
    ? [
        { to: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/manager/leads", label: "Leads", icon: Users },
        { to: "/manager/leaderboard", label: "Board", icon: BarChart3 },
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { to: "/rep/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/rep/calling", label: "Calling", icon: PhoneCall },
        { to: "/rep/demos", label: "Demos", icon: Calendar },
        { to: "/rep/handovers", label: "Handover", icon: ArrowRightLeft },
        { to: "/settings", label: "Settings", icon: Settings },
      ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around px-1">
        {items.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium transition-colors",
                "min-h-[56px] min-w-0 flex-1 max-w-[80px]",
                isActive
                  ? "text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="leading-tight text-center">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
