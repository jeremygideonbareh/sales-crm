import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  className,
}: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 isolate z-50">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        ref={ref}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-popover shadow-2xl ring-1 ring-foreground/10 animate-in slide-in-from-bottom duration-300",
          className
        )}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-muted-foreground/20" />
        {title && (
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3">
          {children}
        </div>
      </div>
    </div>
  )
}
