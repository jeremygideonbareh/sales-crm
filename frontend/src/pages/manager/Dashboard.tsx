import { useEffect, useState } from "react"
import {
  PhoneCall,
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { analyticsApi, pipelineApi } from "@/api/client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/layout/PageHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { TrendChart } from "@/components/dashboard/TrendChart"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardData, RepMetric, PipelineOverviewResponse } from "@/types"
import { LEAD_STATUS } from "@/lib/utils"

const COLORS = ["#64748b", "#fbbf24", "#f87171", "#60a5fa", "#34d399"]

const mockTrendData = [
  { name: "Mon", value: 12 },
  { name: "Tue", value: 18 },
  { name: "Wed", value: 15 },
  { name: "Thu", value: 24 },
  { name: "Fri", value: 20 },
  { name: "Sat", value: 8 },
  { name: "Sun", value: 14 },
]

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [dateRange, setDateRange] = useState(30)
  const [loading, setLoading] = useState(true)
  const [pipelineOverview, setPipelineOverview] = useState<PipelineOverviewResponse | null>(null)

  useEffect(() => {
    setLoading(true)
    analyticsApi
      .dashboard()
      .then(setData)
      .finally(() => setLoading(false))

    pipelineApi
      .overview()
      .then(setPipelineOverview)
      .catch(() => {})
  }, [])

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  // Build mock recent activity from rep data
  const recentActivity: Array<{
    id: number
    type: "call" | "deal" | "lost" | "followup"
    repName: string
    businessName: string
    timestamp: string
  }> = []
  if (data.by_rep.length > 0) {
    data.by_rep.forEach((r: RepMetric) => {
      recentActivity.push({
        id: r.rep_id * 10,
        type: "call" as const,
        repName: r.rep_name,
        businessName: `${r.rep_name}'s Client`,
        timestamp: new Date(
          Date.now() - Math.random() * 86400000
        ).toISOString(),
      })
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your agency at a glance"
      >
        <div className="w-full sm:w-auto">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Calls"
          value={data.kpi.total_calls}
          icon={PhoneCall}
          colorClass="bg-emerald-900/30 text-emerald-400"
          trend={{ value: 12, positive: true }}
        />
        <KpiCard
          title="Success Rate"
          value={data.kpi.success_rate}
          icon={TrendingUp}
          format="percentage"
          colorClass="bg-blue-900/30 text-blue-400"
          trend={{ value: 3, positive: true }}
        />
        <KpiCard
          title="Deals Closed"
          value={data.kpi.total_deals}
          icon={BarChart3}
          colorClass="bg-amber-900/30 text-amber-400"
          trend={{ value: 8, positive: true }}
        />
        <KpiCard
          title="Commissions Owed"
          value={data.kpi.total_commission_owed}
          icon={DollarSign}
          format="currency"
          colorClass="bg-purple-900/30 text-purple-400"
          trend={{ value: 5, positive: false }}
        />
      </div>

      {/* Charts + Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart - Rep Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calls by Rep</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.by_rep}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="rep_name"
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Bar
                    dataKey="total_calls"
                    fill="#34d399"
                    radius={[4, 4, 0, 0]}
                    name="Calls"
                  />
                  <Bar
                    dataKey="deals_closed"
                    fill="#60a5fa"
                    radius={[4, 4, 0, 0]}
                    name="Deals"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed activities={recentActivity} />
      </div>

      {/* Trend + Pie Charts */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={mockTrendData} color="#34d399" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={data.status_distribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ payload }) => payload.status}
                  >
                    {data.status_distribution.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rep Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            <CardTitle>Rep Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card View */}
          <div className="space-y-2 md:hidden">
            {data.by_rep.map((r) => (
              <div key={r.rep_id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.rep_name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{r.leads_assigned} leads</span>
                    <span>{r.total_calls} calls</span>
                    <span>{r.deals_closed} deals</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400 text-xs">
                    {r.success_rate}%
                  </Badge>
                  <span className="text-xs font-medium text-emerald-400">
                    ${r.commission_owed.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.by_rep.map((r) => (
                  <TableRow key={r.rep_id}>
                    <TableCell className="font-medium">
                      {r.rep_name}
                    </TableCell>
                    <TableCell>{r.leads_assigned}</TableCell>
                    <TableCell>{r.total_calls}</TableCell>
                    <TableCell>{r.deals_closed}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30"
                      >
                        {r.success_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-emerald-400">
                      ${r.commission_owed.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Overview */}
      {pipelineOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {pipelineOverview.stages.map((stage) => {
                const statusConfig = LEAD_STATUS[stage.status as keyof typeof LEAD_STATUS]
                return (
                  <Card key={stage.status} className="border-border/50 min-w-0">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-muted-foreground truncate">
                          {stage.label}
                        </p>
                        <Badge variant="secondary" className={`shrink-0 ${
                          `${statusConfig?.bg || 'bg-muted'} ${statusConfig?.color || ''}`
                        }`}>
                          {stage.count}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {(stage.leads as any[]).slice(0, 3).map((lead: any) => (
                          <p key={lead.id} className="truncate text-xs text-muted-foreground">
                            {lead.business_name}
                          </p>
                        ))}
                        {(stage.leads as any[]).length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{(stage.leads as any[]).length - 3} more
                          </p>
                        )}
                        {(stage.leads as any[]).length === 0 && (
                          <p className="text-xs text-muted-foreground italic">Empty</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
