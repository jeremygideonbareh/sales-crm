import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { useToast, toast, type Toast } from "@/hooks/useToast"

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  default: Info,
}

const colors = {
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-400",
  default: "border-border bg-card",
}

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: (id: string) => void }) {
  const Icon = icons[t.variant || "default"]
  return (
    <div
      className={cn(
        "animate-slide-in-right flex items-start gap-3 rounded-lg border p-4 text-sm shadow-lg",
        colors[t.variant || "default"]
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{t.title}</p>
        {t.description && (
          <p className="mt-1 text-xs opacity-80">{t.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onDismiss={dismissToast} />
      ))}
    </div>
  )
}

export { toast, useToast }
