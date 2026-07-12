import { type LucideIcon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { NumberTicker } from "@/components/ui/number-ticker"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: number
  icon: LucideIcon
  format?: "number" | "currency" | "percentage"
  trend?: { value: number; positive: boolean }
  colorClass: string
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  format = "number",
  trend,
  colorClass,
}: KpiCardProps) {
  const [bgClass, iconClass] = colorClass.split(" ")
  const prefix = format === "currency" ? "$" : ""
  const suffix = format === "percentage" ? "%" : ""

  return (
    <Card className="group relative overflow-hidden">
      <div className={cn("absolute inset-0 opacity-[0.03]", bgClass)} />
      <CardHeader className="flex-row items-center gap-3 space-y-0 p-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            bgClass
          )}
        >
          <Icon className={cn("h-5 w-5", iconClass)} />
        </div>
        <div className="min-w-0 flex-1">
          <CardDescription className="text-xs">{title}</CardDescription>
          <CardTitle className="text-2xl">
            <NumberTicker
              value={value}
              prefix={prefix}
              suffix={suffix}
            />
          </CardTitle>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.positive
                ? "bg-emerald-900/20 text-emerald-400"
                : "bg-red-900/20 text-red-400"
            )}
          >
            <span>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </CardHeader>
    </Card>
  )
}
