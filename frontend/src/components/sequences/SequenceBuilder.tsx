import { useState } from "react"
import { Plus, GripVertical, Trash2, ChevronUp, ChevronDown } from "lucide-react"
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
import type { SequenceStepItem } from "@/types"

const STEP_TYPES = [
  { value: "delay", label: "Wait / Delay" },
  { value: "send_email", label: "Send Email" },
  { value: "condition", label: "Check Condition" },
  { value: "update_stage", label: "Update Lead Stage" },
  { value: "notify", label: "Send Notification" },
] as const

const STAGE_OPTIONS = [
  "interested", "demo_scheduled", "demo_completed",
  "negotiation", "onboarding", "deposit_paid", "deal_closed",
] as const

interface SequenceBuilderProps {
  steps: SequenceStepItem[]
  onChange: (steps: SequenceStepItem[]) => void
}

export function SequenceBuilder({ steps, onChange }: SequenceBuilderProps) {
  const addStep = () => {
    const newStep: SequenceStepItem = {
      step_order: steps.length + 1,
      step_type: "send_email",
    }
    onChange([...steps, newStep])
  }

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_order: i + 1 }))
    onChange(updated)
  }

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= steps.length) return
    const updated = [...steps]
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    onChange(updated.map((s, i) => ({ ...s, step_order: i + 1 })))
  }

  const updateStep = (index: number, field: string, value: unknown) => {
    const updated = steps.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Step {i + 1}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => moveStep(i, -1)} disabled={i === 0}>
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1}>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => removeStep(i)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Step Type</Label>
              <Select
                value={step.step_type}
                onValueChange={(v) => updateStep(i, "step_type", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STEP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {step.step_type === "delay" && (
              <div>
                <Label className="text-xs">Days to wait</Label>
                <Input
                  type="number"
                  min={0}
                  value={step.delay_days ?? ""}
                  onChange={(e) => updateStep(i, "delay_days", e.target.value ? parseInt(e.target.value) : null)}
                  className="mt-1"
                  placeholder="e.g. 3"
                />
              </div>
            )}

            {step.step_type === "send_email" && (
              <>
                <div>
                  <Label className="text-xs">Email Subject</Label>
                  <Input
                    value={step.email_subject ?? ""}
                    onChange={(e) => updateStep(i, "email_subject", e.target.value || null)}
                    className="mt-1"
                    placeholder="e.g. Following up with {{business_name}}"
                  />
                </div>
                <div>
                  <Label className="text-xs">Email Body</Label>
                  <textarea
                    value={step.email_body ?? ""}
                    onChange={(e) => updateStep(i, "email_body", e.target.value || null)}
                    className="mt-1 min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="Hi {{contact_name}},&#10;&#10;We'd love to help {{business_name}}..."
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Available variables: {'{{'}business_name{'}}'}, {'{{'}contact_name{'}}'}, {'{{'}rep_name{'}}'}
                  </p>
                </div>
              </>
            )}

            {step.step_type === "condition" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Field</Label>
                  <Select
                    value={step.condition_field ?? ""}
                    onValueChange={(v) => updateStep(i, "condition_field", v || null)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="deal_value">Deal Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input
                    value={step.condition_value ?? ""}
                    onChange={(e) => updateStep(i, "condition_value", e.target.value || null)}
                    className="mt-1"
                    placeholder="e.g. interested"
                  />
                </div>
              </div>
            )}

            {step.step_type === "update_stage" && (
              <div>
                <Label className="text-xs">Target Stage</Label>
                <Select
                  value={step.target_stage ?? ""}
                  onValueChange={(v) => updateStep(i, "target_stage", v || null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step.step_type === "notify" && (
              <div>
                <Label className="text-xs">Notify</Label>
                <Select
                  value={step.notify_role ?? ""}
                  onValueChange={(v) => updateStep(i, "notify_role", v || null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Who to notify?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="rep">Assigned Rep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addStep} className="w-full">
        <Plus className="h-4 w-4" />
        Add Step
      </Button>
    </div>
  )
}
