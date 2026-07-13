import { Clock, Mail, GitBranch, ArrowRight, Bell } from "lucide-react"
import type { SequenceStepItem } from "@/types"
import { cn } from "@/lib/utils"

interface SequenceTimelineProps {
  steps: SequenceStepItem[]
}

const stepIcons: Record<string, React.ElementType> = {
  delay: Clock,
  send_email: Mail,
  condition: GitBranch,
  update_stage: ArrowRight,
  notify: Bell,
}

const stepLabels: Record<string, string> = {
  delay: "Wait",
  send_email: "Send Email",
  condition: "Check Condition",
  update_stage: "Update Stage",
  notify: "Notify",
}

export function SequenceTimeline({ steps }: SequenceTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No steps yet. Add steps to build your sequence.
      </div>
    )
  }

  return (
    <div className="relative">
      {steps.map((step, i) => {
        const Icon = stepIcons[step.step_type] || Mail
        const isLast = i === steps.length - 1

        return (
          <div key={i} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
            )}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                step.step_type === "send_email" && "bg-emerald-900/30 text-emerald-400",
                step.step_type === "delay" && "bg-amber-900/30 text-amber-400",
                step.step_type === "condition" && "bg-sky-900/30 text-sky-400",
                step.step_type === "update_stage" && "bg-purple-900/30 text-purple-400",
                step.step_type === "notify" && "bg-rose-900/30 text-rose-400",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {step.step_order}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  {stepLabels[step.step_type]}
                </span>
              </div>
              {step.step_type === "delay" && step.delay_days && (
                <p className="mt-0.5 text-sm">
                  Wait {step.delay_days} day{step.delay_days !== 1 ? "s" : ""}
                </p>
              )}
              {step.step_type === "send_email" && (
                <div className="mt-0.5">
                  <p className="text-sm font-medium">{step.email_subject || "(no subject)"}</p>
                  {step.email_body && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{step.email_body}</p>
                  )}
                </div>
              )}
              {step.step_type === "condition" && (
                <p className="mt-0.5 text-sm">
                  If {step.condition_field} is {step.condition_value}
                </p>
              )}
              {step.step_type === "update_stage" && (
                <p className="mt-0.5 text-sm">
                  Move to {step.target_stage?.replace("_", " ")}
                </p>
              )}
              {step.step_type === "notify" && (
                <p className="mt-0.5 text-sm">
                  Notify {step.notify_role || "manager"}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
