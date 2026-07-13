import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LEAD_STATUS } from "@/lib/utils"
import type { LeadResponse } from "@/types"

interface LeadDetailDialogProps {
  lead: LeadResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (
    leadId: number,
    data: { status: string; notes?: string; deal_value?: number | null }
  ) => void
}

export function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
  onSave,
}: LeadDetailDialogProps) {
  const [status, setStatus] = useState(lead?.status || "uncalled")
  const [dealValue, setDealValue] = useState(
    lead?.deal_value?.toString() || ""
  )
  const [notes, setNotes] = useState(lead?.notes || "")

  if (!lead) return null

  const handleSave = async () => {
    try {
      await onSave?.(lead.id, {
        status,
        notes: notes || undefined,
        deal_value: dealValue ? parseFloat(dealValue) : null,
      })
    } catch {
      return
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead.business_name}</DialogTitle>
          <DialogDescription>
            Lead #{lead.id} &mdash; {lead.contact_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Business</Label>
              <p className="text-sm font-medium">{lead.business_name}</p>
            </div>
            <div className="space-y-1">
              <Label>Contact</Label>
              <p className="text-sm font-medium">{lead.contact_name}</p>
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <a href={`tel:${lead.phone}`} className="font-mono text-sm hover:text-emerald-400 transition-colors">{lead.phone}</a>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <p className="text-sm">{lead.email || "—"}</p>
            </div>
            <div className="space-y-1">
              <Label>Website</Label>
              <p className="text-sm">{lead.website || "—"}</p>
            </div>
            <div className="space-y-1">
              <Label>Created</Label>
              <p className="text-sm">
                {lead.created_at
                  ? new Date(lead.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dlg-status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => v && setStatus(v)}
            >
              <SelectTrigger className="w-full" id="dlg-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_STATUS).map(([value, cfg]) => (
                  <SelectItem key={value} value={value}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dlg-deal-value">Deal Value ($)</Label>
            <Input
              id="dlg-deal-value"
              type="number"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dlg-notes">Notes</Label>
            <textarea
              id="dlg-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Add notes..."
            />
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
