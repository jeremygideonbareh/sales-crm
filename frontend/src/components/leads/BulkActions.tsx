import { Button } from "@/components/ui/button"
import { Trash2, UserPlus, Download } from "lucide-react"

interface BulkActionsProps {
  selectedCount: number
  onAssign: () => void
  onDelete: () => void
  onExport: () => void
}

export function BulkActions({
  selectedCount,
  onAssign,
  onDelete,
  onExport,
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex animate-fade-in items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <span className="mr-2 text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <Button variant="secondary" size="sm" onClick={onAssign}>
        <UserPlus className="h-3.5 w-3.5" />
        Assign
      </Button>
      <Button variant="secondary" size="sm" onClick={onExport}>
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
    </div>
  )
}
