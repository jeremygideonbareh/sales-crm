import { cn } from "@/lib/utils"

function BorderBeam({
  className,
  size = 200,
  duration = 3,
  colorFrom = "#34d399",
  colorTo = "#059669",
}: {
  className?: string
  size?: number
  duration?: number
  colorFrom?: string
  colorTo?: string
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [border-radius:inherit]",
        className
      )}
    >
      <div
        className="absolute inset-0 animate-shimmer-slide"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0%, ${colorFrom} 25%, ${colorTo} 50%, transparent 75%)`,
          filter: "blur(4px)",
          animationDuration: `${duration}s`,
          WebkitMask:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, black 70%)",
          mask: "radial-gradient(ellipse at 50% 50%, transparent 40%, black 70%)",
        }}
      />
    </div>
  )
}

export { BorderBeam }
