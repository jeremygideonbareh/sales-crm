import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/format"
import {
  Phone,
  PhoneOff,
  DollarSign,
  CalendarCheck,
  XCircle,
  Clock,
  ThumbsUp,
  Monitor,
  Settings,
  FileCheck,
  Hammer,
  Rocket,
} from "lucide-react"
interface HistoryItem {
  id: number
  status: string
  business_name: string
  contact_name?: string
  deal_value?: number | null
}

const statusConfig: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  uncalled: {
    label: "Uncalled",
    icon: Phone,
    color: "text-muted-foreground bg-muted",
  },
  no_answer: {
    label: "No Answer",
    icon: PhoneOff,
    color: "text-amber-400 bg-amber-900/20",
  },
  not_interested: {
    label: "Not Interested",
    icon: XCircle,
    color: "text-red-400 bg-red-900/20",
  },
  interested: {
    label: "Interested",
    icon: ThumbsUp,
    color: "text-sky-400 bg-sky-900/20",
  },
  demo_scheduled: {
    label: "Demo Scheduled",
    icon: CalendarCheck,
    color: "text-purple-400 bg-purple-900/20",
  },
  demo_completed: {
    label: "Demo Completed",
    icon: Monitor,
    color: "text-indigo-400 bg-indigo-900/20",
  },
  negotiation: {
    label: "Negotiation",
    icon: Settings,
    color: "text-orange-400 bg-orange-900/20",
  },
  onboarding: {
    label: "Onboarding",
    icon: FileCheck,
    color: "text-teal-400 bg-teal-900/20",
  },
  deposit_paid: {
    label: "Deposit Paid",
    icon: DollarSign,
    color: "text-emerald-400 bg-emerald-900/20",
  },
  in_progress: {
    label: "In Progress",
    icon: Hammer,
    color: "text-blue-400 bg-blue-900/20",
  },
  pitching: {
    label: "Pitching",
    icon: Rocket,
    color: "text-blue-400 bg-blue-900/20",
  },
  deal_closed: {
    label: "Deal Closed!",
    icon: DollarSign,
    color: "text-emerald-400 bg-emerald-900/20",
  },
}

interface CallHistoryProps {
  history: HistoryItem[]
}

export function CallHistory({ history }: CallHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Phone className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No calls logged yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.map((h, i) => {
          const config =
            statusConfig[h.status] || {
              label: h.status,
              icon: Phone,
              color: "text-muted-foreground bg-muted",
            }
          const Icon = config.icon
          return (
            <div
              key={h.id}
              className="flex animate-fade-in items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5 transition-colors hover:bg-muted"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {h.business_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {h.contact_name}
                </p>
              </div>
              <div className="text-right">
                <Badge
                  variant="secondary"
                  className={`${config.color} border-0`}
                >
                  {config.label}
                </Badge>
                {h.deal_value && (
                  <p className="mt-1 text-xs font-medium text-emerald-400">
                    ${Number(h.deal_value).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
