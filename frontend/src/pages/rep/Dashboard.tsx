import { useEffect, useState } from "react"
import {
  PhoneCall,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { repsApi } from "@/api/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/PageHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { Skeleton } from "@/components/ui/skeleton"
import { LEAD_STATUS } from "@/lib/utils"
import type { RepDashboardResponse } from "@/types"

const COLORS = ["#64748b", "#fbbf24", "#f87171", "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#22d3ee", "#fb923c", "#4ade80", "#38bdf8"]

export default function RepDashboard() {
  const [data, setData] = useState<RepDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    repsApi
      .dashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const stageChartData = data.pipeline_stages.map((s) => ({
    name: LEAD_STATUS[s.status as keyof typeof LEAD_STATUS]?.label || s.status,
    count: s.count,
    fill: COLORS[Object.keys(LEAD_STATUS).indexOf(s.status) % COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description={`${data.rep_name} — Track your sales progress`}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Calls"
          value={data.total_calls}
          icon={PhoneCall}
          colorClass="bg-emerald-900/30 text-emerald-400"
        />
        <KpiCard
          title="Success Rate"
          value={data.success_rate}
          icon={TrendingUp}
          format="percentage"
          colorClass="bg-blue-900/30 text-blue-400"
        />
        <KpiCard
          title="Deals Closed"
          value={data.total_deals}
          icon={BarChart3}
          colorClass="bg-amber-900/30 text-amber-400"
        />
        <KpiCard
          title="Commission"
          value={data.commission_owed}
          icon={DollarSign}
          format="currency"
          colorClass="bg-purple-900/30 text-purple-400"
        />
      </div>

      {/* Pipeline Stages Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            My Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stageChartData.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No pipeline data yet. Start calling leads!
            </p>
          ) : (
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.3} />
                  <XAxis dataKey="name" className="text-xs text-muted-foreground" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Leads">
                    {stageChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Stages List */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data.pipeline_stages.map((stage) => {
          const statusConfig = LEAD_STATUS[stage.status as keyof typeof LEAD_STATUS]
          return (
            <Card key={stage.status} className="min-w-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-medium truncate">{statusConfig?.label || stage.status}</CardTitle>
                  <Badge variant="secondary" className={`${statusConfig?.bg || 'bg-muted'} ${statusConfig?.color || 'text-muted-foreground'} shrink-0`}>
                    {stage.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${statusConfig?.color.replace('text-', 'bg-') || 'bg-muted'}`}
                    style={{
                      width: `${Math.min(100, (stage.count / Math.max(1, data.leads_assigned)) * 100)}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent_activity.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {data.recent_activity.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${
                      LEAD_STATUS[a.status as keyof typeof LEAD_STATUS]?.color || 'text-muted-foreground'
                    } bg-current`} />
                    <span className="text-sm font-medium truncate">{a.business_name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="secondary" className={`shrink-0 ${
                      `${LEAD_STATUS[a.status as keyof typeof LEAD_STATUS]?.bg || 'bg-muted'} ${
                      LEAD_STATUS[a.status as keyof typeof LEAD_STATUS]?.color || 'text-muted-foreground'}`
                    }`}>
                      {LEAD_STATUS[a.status as keyof typeof LEAD_STATUS]?.label || a.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
