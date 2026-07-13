import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  loading?: boolean
  loadingRows?: number
  emptyMessage?: string
  mobileCard?: boolean
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  loadingRows = 3,
  emptyMessage = "No data found",
  mobileCard = true,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile()

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <Card key={i} className={cn("overflow-hidden", isMobile ? "block" : "hidden")}>
            <CardContent className="space-y-2 p-4">
              {columns.slice(0, 3).map((col) => (
                <Skeleton key={col.key} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
        <div className={cn("rounded-lg border", isMobile ? "hidden" : "block")}>
          <table className="w-full">
            <tbody>
              {Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={i} className="border-b">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // Mobile card view
  if (isMobile && mobileCard) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <Card key={keyExtractor(item)} className="overflow-hidden">
            <CardContent className="divide-y divide-border/50">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {col.header}
                    </span>
                    <span className={cn("text-right", col.className)}>
                      {col.render(item)}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Desktop table view
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b last:border-0 transition-colors hover:bg-muted/30"
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-sm", col.className)}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
