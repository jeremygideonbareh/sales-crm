import { useEffect, useState } from "react"
import {
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Send,
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
import type { DemoRequestResponse, LeadResponse } from "@/types"

const DEMO_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-900/20" },
  scheduled: { label: "Scheduled", color: "text-blue-400", bg: "bg-blue-900/20" },
  completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-900/20" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-900/20" },
}

export default function DemoRequests() {
  const [demos, setDemos] = useState<DemoRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [form, setForm] = useState({
    lead_id: "",
    title: "",
    description: "",
    scheduled_date: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchDemos = async () => {
    setLoading(true)
    try {
      const data = await repsApi.demoRequests.list()
      setDemos(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDemos()
  }, [])

  const openCreate = async () => {
    try {
      const data = await leadsApi.list({ limit: 200 })
      setLeads(data.leads || [])
      setShowCreate(true)
    } catch {
      toast({ title: "Failed to load leads", variant: "error" })
    }
  }

  const handleCreate = async () => {
    if (!form.lead_id || !form.title) {
      toast({ title: "Please fill in required fields", variant: "warning" })
      return
    }
    setSubmitting(true)
    try {
      await repsApi.demoRequests.create({
        lead_id: parseInt(form.lead_id),
        title: form.title,
        description: form.description || undefined,
        scheduled_date: form.scheduled_date || undefined,
        notes: form.notes || undefined,
      })
      toast({ title: "Demo request created", variant: "success" })
      setShowCreate(false)
      setForm({ lead_id: "", title: "", description: "", scheduled_date: "", notes: "" })
      fetchDemos()
    } catch {
      toast({ title: "Failed to create demo request", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (demoId: number, status: string) => {
    try {
      await repsApi.demoRequests.update(demoId, { status })
      toast({ title: `Demo marked as ${status}`, variant: "success" })
      fetchDemos()
    } catch {
      toast({ title: "Failed to update demo", variant: "error" })
    }
  }

  const statusBadge = (status: string) => {
    const cfg = DEMO_STATUS_CONFIG[status] || { label: status, color: "text-muted-foreground", bg: "bg-muted" }
    return <Badge variant="secondary" className={`${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
  }

  if (loading && demos.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Demo Requests" description="Request and manage client demos">
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          New Demo Request
        </Button>
      </PageHeader>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request a Demo Build</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client *</label>
              <Select
                value={form.lead_id}
                onValueChange={(v) => setForm({ ...form, lead_id: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {leads.filter(l => l.status !== 'deal_closed' && l.status !== 'not_interested')
                    .map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.business_name} — {l.contact_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Demo Title *</label>
              <Input
                placeholder="e.g. Website Demo - Homepage & Contact"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="What should the demo include? Key pages, features..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Date</label>
              <Input
                type="datetime-local"
                value={form.scheduled_date}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                placeholder="Any additional notes for the demo builder..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="field-sizing-content min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
            </div>
            <Button onClick={handleCreate} disabled={submitting} className="w-full">
              <Send className="h-4 w-4" />
              Submit Demo Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Demo List */}
      {demos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">No demo requests yet</p>
            <p className="mt-1 text-sm">Create a demo request when a client is interested</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {demos.map((demo) => (
            <Card key={demo.id} className="min-w-0">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg truncate">{demo.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground truncate">
                      {demo.business_name} — {demo.contact_name}
                    </p>
                  </div>
                  {statusBadge(demo.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {demo.description && <p className="text-sm">{demo.description}</p>}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {demo.scheduled_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(demo.scheduled_date).toLocaleDateString()}
                    </span>
                  )}
                  {demo.completed_date && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Completed: {new Date(demo.completed_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {demo.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(demo.id, 'scheduled')} className="min-h-[36px]">
                        <Calendar className="h-3 w-3" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(demo.id, 'cancelled')} className="min-h-[36px]">
                        <XCircle className="h-3 w-3" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {demo.status === 'scheduled' && (
                    <Button size="sm" variant="default" onClick={() => updateStatus(demo.id, 'completed')} className="min-h-[36px]">
                      <CheckCircle2 className="h-3 w-3" />
                      Mark Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
