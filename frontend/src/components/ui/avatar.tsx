import * as React from "react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface AvatarProps {
  src?: string
  name?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  }
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className="h-full w-full object-cover"
        />
      ) : name ? (
        <span>{initials}</span>
      ) : (
        <User className="h-4 w-4" />
      )}
    </div>
  )
}

export { Avatar }
