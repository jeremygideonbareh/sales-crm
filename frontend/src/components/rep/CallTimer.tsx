import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface CallTimerProps {
  active: boolean
  onDurationChange?: (seconds: number) => void
}

export function CallTimer({
  active,
  onDurationChange,
}: CallTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (active && startRef.current === null) {
      startRef.current = Date.now()
      const interval = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - startRef.current!) / 1000
        )
        setSeconds(elapsed)
        onDurationChange?.(elapsed)
      }, 1000)
      return () => clearInterval(interval)
    }
    if (!active) {
      startRef.current = null
      setSeconds(0)
    }
  }, [active, onDurationChange])

  const format = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  if (!active) return null

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-sm ring-1",
        seconds > 120
          ? "bg-red-900/20 text-red-400 ring-red-500/20"
          : seconds > 30
            ? "bg-amber-900/20 text-amber-400 ring-amber-500/20"
            : "bg-emerald-900/20 text-emerald-400 ring-emerald-500/20"
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{format(seconds)}</span>
    </div>
  )
}
