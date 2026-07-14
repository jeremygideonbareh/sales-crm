import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/ui/notification-bell"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface MobileHeaderProps {
  title?: string
  onMenuClick: () => void
}

export function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-3 py-2.5 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="h-9 w-9 shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {title && (
          <h1 className="truncate text-sm font-semibold">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  )
}
