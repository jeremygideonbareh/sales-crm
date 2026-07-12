import { cn } from "@/lib/utils"

function ProgressiveBlur({
  direction = "bottom",
  className,
}: {
  direction?: "top" | "bottom"
  className?: string
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 h-8",
        direction === "top"
          ? "top-0 bg-gradient-to-b from-background to-transparent"
          : "bottom-0 bg-gradient-to-t from-background to-transparent",
        className
      )}
    />
  )
}

export { ProgressiveBlur }
