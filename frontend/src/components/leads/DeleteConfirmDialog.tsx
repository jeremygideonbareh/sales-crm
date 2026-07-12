import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmDialogProps {
  count: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading?: boolean
}

export function DeleteConfirmDialog({
  count,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <DialogTitle>Delete {count} lead(s)?</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? "Deleting..."
              : `Delete ${count} lead${count > 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
