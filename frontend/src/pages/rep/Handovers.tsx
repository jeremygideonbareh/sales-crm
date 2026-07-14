import { useEffect, useState } from "react"
import {
  Send,
  FileText,
  DollarSign,
  UserCheck,
} from "lucide-react"
import { repsApi, leadsApi } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import type { HandoverResponse, LeadResponse } from "@/types"

export default function Handovers() {
  const [handovers, setHandovers] = useState<HandoverResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [form, setForm] = useState({
    lead_id: "",
    client_brief: "",
    requirements: "",
    design_preferences: "",
    budget: "",
    timeline_notes: "",
    notes: "",
    handover_details: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchHandovers = async () => {
    setLoading(true)
    try {
      const data = await repsApi.handovers.list()
      setHandovers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHandovers()
  }, [])

  const openCreate = async () => {
    const data = await leadsApi.list({ limit: 200 })
    // Show leads that are in pipeline stages suitable for handover
    const pipelineLeads = (data.leads || []).filter(
      (l: LeadResponse) => ['onboarding', 'deposit_paid', 'negotiation', 'interested', 'demo_completed'].includes(l.status)
    )
    setLeads(pipelineLeads)
    setShowCreate(true)
  }

  const handleCreate = async () => {
    if (!form.lead_id) {
      toast({ title: "Please select a client", variant: "warning" })
      return
    }
    setSubmitting(true)
    try {
      await repsApi.handovers.create({
        lead_id: parseInt(form.lead_id),
        client_brief: form.client_brief || undefined,
        requirements: form.requirements || undefined,
        design_preferences: form.design_preferences || undefined,
        budget: form.budget ? parseInt(form.budget) : undefined,
        timeline_notes: form.timeline_notes || undefined,
        notes: form.notes || undefined,
        handover_details: form.handover_details || undefined,
      })
      toast({ title: "Client handed over to dev team!", variant: "success" })
      setShowCreate(false)
      setForm({
        lead_id: "", client_brief: "", requirements: "", design_preferences: "",
        budget: "", timeline_notes: "", notes: "", handover_details: "",
      })
      fetchHandovers()
    } catch {
      toast({ title: "Failed to create handover", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && handovers.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Client Handovers" description="Handover clients to the development team">
        <Button onClick={openCreate} size="sm">
          <Send className="h-4 w-4" />
          New Handover
        </Button>
      </PageHeader>

      {/* Create Handover Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Handover Client to Dev Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client *</label>
              <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v ?? "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client to handover" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.business_name} — {l.contact_name} (${l.deal_value || 'TBD'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Brief</label>
                <textarea
                  placeholder="Describe the client, their business, goals..."
                  value={form.client_brief}
                  onChange={(e) => setForm({ ...form, client_brief: e.target.value })}
                  className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Technical Requirements</label>
                <textarea
                  placeholder="Tech stack, integrations, features needed..."
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Design Preferences</label>
                <textarea
                  placeholder="Colors, style, references, examples..."
                  value={form.design_preferences}
                  onChange={(e) => setForm({ ...form, design_preferences: e.target.value })}
                  className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeline Notes</label>
                <textarea
                  placeholder="Deadlines, milestones, priorities..."
                  value={form.timeline_notes}
                  onChange={(e) => setForm({ ...form, timeline_notes: e.target.value })}
                  className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget ($)</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Notes</label>
                <textarea
                  placeholder="Anything else the dev team should know..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="field-sizing-content min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>
            </div>

            <Button onClick={handleCreate} disabled={submitting} className="w-full">
              <UserCheck className="h-4 w-4" />
              Handover to Dev Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Handover List */}
      {handovers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">No handovers yet</p>
            <p className="mt-1 text-sm">Handover clients to the dev team once they're ready</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {handovers.map((h) => (
            <Card key={h.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{h.business_name || `Client #${h.lead_id}`}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{h.contact_name}</p>
                  </div>
                  <Badge variant="secondary" className={
                    h.status === 'completed'
                      ? 'bg-emerald-900/20 text-emerald-400'
                      : 'bg-amber-900/20 text-amber-400'
                  }>
                    {h.status === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {h.client_brief && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client Brief</p>
                      <p className="text-sm">{h.client_brief}</p>
                    </div>
                  )}
                  {h.requirements && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requirements</p>
                      <p className="text-sm">{h.requirements}</p>
                    </div>
                  )}
                  {h.budget && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-medium">Budget: ${h.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {h.timeline_notes && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline</p>
                      <p className="text-sm">{h.timeline_notes}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Created: {h.created_at ? new Date(h.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
