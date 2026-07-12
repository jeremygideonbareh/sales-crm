import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { authApi, leadsApi } from "@/api/client"
import type { UserResponse } from "@/types"

interface AssignRepDialogProps {
  leadIds: number[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssigned: () => void
}

export function AssignRepDialog({
  leadIds,
  open,
  onOpenChange,
  onAssigned,
}: AssignRepDialogProps) {
  const [reps, setReps] = useState<UserResponse[]>([])
  const [selectedRep, setSelectedRep] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      authApi.listUsers().then(setReps).catch(() => {})
    }
  }, [open])

  const handleAssign = async () => {
    if (!selectedRep) return
    setLoading(true)
    try {
      await leadsApi.assign(leadIds, parseInt(selectedRep))
      toast({
        title: `Assigned ${leadIds.length} lead(s)`,
        variant: "success",
      })
      onAssigned()
      onOpenChange(false)
    } catch {
      toast({ title: "Failed to assign leads", variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Leads</DialogTitle>
          <DialogDescription>
            {leadIds.length} lead(s) selected
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <label className="text-sm font-medium">Select Rep</label>
          <Select value={selectedRep} onValueChange={(v) => v && setSelectedRep(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a rep..." />
            </SelectTrigger>
            <SelectContent>
              {reps.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter showCloseButton>
          <Button
            onClick={handleAssign}
            disabled={!selectedRep || loading}
          >
            {loading ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
