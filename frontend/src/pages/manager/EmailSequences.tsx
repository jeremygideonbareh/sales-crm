import { useState } from "react"
import { motion } from "motion/react"
import { Plus, Play, Pencil, Trash2, Power, PowerOff, Mail } from "lucide-react"
import { emailSequencesApi } from "@/api/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useEmailSequences } from "@/hooks/useEmailSequences"
import { SequenceBuilder } from "@/components/sequences/SequenceBuilder"
import { SequenceTimeline } from "@/components/sequences/SequenceTimeline"
import type { EmailSequence, SequenceStepItem } from "@/types"

const TRIGGER_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "stage_change", label: "On Stage Change" },
  { value: "lead_assigned", label: "On Lead Assigned" },
]

const TRIGGER_STAGES = [
  "interested", "demo_scheduled", "demo_completed",
  "negotiation", "onboarding", "deposit_paid", "deal_closed",
]

export default function EmailSequences() {
  const { sequences, loading, refetch } = useEmailSequences()
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<EmailSequence | null>(null)
  const [showView, setShowView] = useState<EmailSequence | null>(null)
  const [saving, setSaving] = useState(false)

  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formTrigger, setFormTrigger] = useState("manual")
  const [formTriggerStage, setFormTriggerStage] = useState("")
  const [formSteps, setFormSteps] = useState<SequenceStepItem[]>([])

  const resetForm = () => {
    setFormName("")
    setFormDesc("")
    setFormTrigger("manual")
    setFormTriggerStage("")
    setFormSteps([])
  }

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast({ title: "Name is required", variant: "warning" })
      return
    }
    setSaving(true)
    try {
      await emailSequencesApi.create({
        name: formName,
        description: formDesc || null,
        trigger: formTrigger,
        trigger_stage: formTrigger === "stage_change" ? formTriggerStage : null,
        steps: formSteps as unknown as Record<string, unknown>[],
      })
      toast({ title: "Sequence created", variant: "success" })
      setShowCreate(false)
      resetForm()
      refetch()
    } catch {
      toast({ title: "Failed to create sequence", variant: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (seq: EmailSequence) => {
    try {
      await emailSequencesApi.update(seq.id, { is_active: !seq.is_active })
      toast({ title: seq.is_active ? "Sequence paused" : "Sequence activated", variant: "success" })
      refetch()
    } catch {
      toast({ title: "Failed to update sequence", variant: "error" })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await emailSequencesApi.delete(id)
      toast({ title: "Sequence deleted", variant: "success" })
      refetch()
    } catch {
      toast({ title: "Failed to delete sequence", variant: "error" })
    }
  }

  const openEdit = (seq: EmailSequence) => {
    setShowEdit(seq)
    setFormName(seq.name)
    setFormDesc(seq.description || "")
    setFormTrigger(seq.trigger)
    setFormTriggerStage(seq.trigger_stage || "")
    setFormSteps(seq.steps.map(s => ({ ...s })))
  }

  const handleSaveEdit = async () => {
    if (!showEdit) return
    if (!formName.trim()) {
      toast({ title: "Name is required", variant: "warning" })
      return
    }
    setSaving(true)
    try {
      await emailSequencesApi.update(showEdit.id, {
        name: formName,
        description: formDesc || null,
        trigger: formTrigger,
        trigger_stage: formTrigger === "stage_change" ? formTriggerStage : null,
      })
      await emailSequencesApi.setSteps(showEdit.id, formSteps as unknown as Record<string, unknown>[])
      toast({ title: "Sequence updated", variant: "success" })
      setShowEdit(null)
      resetForm()
      refetch()
    } catch {
      toast({ title: "Failed to update sequence", variant: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Sequences"
        description="Automated email follow-up sequences"
      >
        <Button onClick={() => { resetForm(); setShowCreate(true) }} size="sm">
          <Plus className="h-4 w-4" />
          New Sequence
        </Button>
      </PageHeader>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : sequences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Mail className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No email sequences yet</p>
            <Button variant="outline" onClick={() => { resetForm(); setShowCreate(true) }}>
              <Plus className="h-4 w-4" />
              Create your first sequence
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sequences.map((seq, i) => (
            <motion.div
              key={seq.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <Card className="h-full cursor-pointer hover:border-emerald-800/50 transition-colors"
                onClick={() => setShowView(seq)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{seq.name}</CardTitle>
                    <Badge variant={seq.is_active ? "default" : "secondary"} className="text-xs">
                      {seq.is_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  {seq.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{seq.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {seq.trigger === "manual" ? "Manual" : seq.trigger === "stage_change" ? `On: ${seq.trigger_stage}` : "On assign"}
                    </Badge>
                    <span>{seq.steps?.length || 0} step{(seq.steps?.length || 0) !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleToggleActive(seq)}>
                      {seq.is_active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(seq)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(seq.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Email Sequence</DialogTitle>
            <DialogDescription>Build an automated email follow-up sequence</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sequence Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. 5-Day Follow-up" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Trigger</Label>
                <Select value={formTrigger} onValueChange={(v) => v && setFormTrigger(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formTrigger === "stage_change" && (
                <div>
                  <Label>Trigger Stage</Label>
                  <Select value={formTriggerStage} onValueChange={(v) => v && setFormTriggerStage(v)}>
                    <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                    <SelectContent>
                      {TRIGGER_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <Label className="mb-2 block">Steps</Label>
              <SequenceBuilder steps={formSteps} onChange={setFormSteps} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Creating..." : "Create Sequence"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!showEdit} onOpenChange={(o) => { if (!o) setShowEdit(null); resetForm() }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sequence</DialogTitle>
            <DialogDescription>Update your email sequence</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sequence Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Trigger</Label>
                <Select value={formTrigger} onValueChange={(v) => v && setFormTrigger(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formTrigger === "stage_change" && (
                <div>
                  <Label>Trigger Stage</Label>
                  <Select value={formTriggerStage} onValueChange={(v) => v && setFormTriggerStage(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIGGER_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <Label className="mb-2 block">Steps</Label>
              <SequenceBuilder steps={formSteps} onChange={setFormSteps} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowEdit(null); resetForm() }}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!showView} onOpenChange={(o) => { if (!o) setShowView(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{showView?.name}</DialogTitle>
            <DialogDescription>
              {showView?.description || "No description"}
              <span className="ml-2">
                <Badge variant="outline" className="text-xs">
                  {showView?.trigger === "manual" ? "Manual" : `On: ${showView?.trigger_stage}`}
                </Badge>
              </span>
            </DialogDescription>
          </DialogHeader>
          <SequenceTimeline steps={showView?.steps || []} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
