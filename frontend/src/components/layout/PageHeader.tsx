import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 sm:items-center sm:gap-4",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          {children}
        </div>
      )}
    </div>
  )
}
