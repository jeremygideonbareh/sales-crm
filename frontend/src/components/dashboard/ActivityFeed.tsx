import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AnimatedList } from "@/components/ui/animated-list"
import { formatRelativeTime } from "@/lib/format"
import {
  PhoneCall,
  DollarSign,
  XCircle,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react"

interface Activity {
  id: number
  type: "call" | "deal" | "lost" | "followup"
  repName: string
  businessName: string
  timestamp: string
}

const activityIcons: Record<
  Activity["type"],
  { icon: LucideIcon; color: string }
> = {
  call: { icon: PhoneCall, color: "text-blue-400" },
  deal: { icon: DollarSign, color: "text-emerald-400" },
  lost: { icon: XCircle, color: "text-red-400" },
  followup: { icon: CalendarCheck, color: "text-amber-400" },
}

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          <AnimatedList>
            {activities.map((a) => {
              const { icon: Icon, color } = activityIcons[a.type]
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted ${color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{a.repName}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        {a.type === "deal"
                          ? "closed"
                          : a.type === "lost"
                            ? "lost"
                            : a.type === "followup"
                              ? "followed up with"
                              : "called"}{" "}
                      </span>
                      <span className="font-medium">
                        {a.businessName}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(a.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </AnimatedList>
        )}
      </CardContent>
    </Card>
  )
}
