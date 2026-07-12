import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

const RANGES = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "All", value: 0 },
] as const

interface DateRangeFilterProps {
  value: number
  onChange: (value: number) => void
}

export function DateRangeFilter({
  value,
  onChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex rounded-lg border bg-muted/30 p-0.5">
        {RANGES.map(({ label, value: v }) => (
          <Button
            key={v}
            variant={value === v ? "default" : "ghost"}
            size="xs"
            onClick={() => onChange(v)}
            className="rounded-md"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
