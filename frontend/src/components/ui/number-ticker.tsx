"use client"
import { useEffect, useRef } from "react"
import { useInView } from "motion/react"
import { cn } from "@/lib/utils"

function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  prefix = "",
  suffix = "",
}: {
  value: number
  direction?: "up" | "down"
  delay?: number
  className?: string
  prefix?: string
  suffix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    if (!isInView) return
    const startTime = Date.now() + delay * 1000
    const duration = 1500
    const endValue = value

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(endValue * eased)

      if (ref.current) {
        ref.current.textContent = `${prefix}${current.toLocaleString()}${suffix}`
      }
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, value, delay, prefix, suffix])

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}0{suffix}
    </span>
  )
}

export { NumberTicker }
