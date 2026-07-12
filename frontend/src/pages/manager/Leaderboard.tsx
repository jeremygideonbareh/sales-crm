import { useEffect, useState } from "react"
import {
  Trophy,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { analyticsApi } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import type { LeaderboardEntry } from "@/types"

const RANK_ICONS = ["🥇", "🥈", "🥉"]

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span className="text-2xl" role="img" aria-label={`Rank ${rank}`}>
        {RANK_ICONS[rank - 1]}
      </span>
    )
  }
  return (
    <Badge variant="secondary" className="font-mono text-sm">
      #{rank}
    </Badge>
  )
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'deals' | 'commission' | 'rate'>('deals')

  useEffect(() => {
    setLoading(true)
    analyticsApi
      .leaderboard()
      .then((data) => setEntries(data.entries))
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'commission': return b.total_commission - a.total_commission
      case 'rate': return b.success_rate - a.success_rate
      default: return b.deals_closed - a.deals_closed
    }
  }).map((e, i) => ({ ...e, rank: i + 1 }))

  if (loading && entries.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description="Who's closing the most deals"
      >
        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === 'deals' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('deals')}
          >
            <Trophy className="h-4 w-4" />
            Deals
          </Button>
          <Button
            variant={sortBy === 'commission' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('commission')}
          >
            <DollarSign className="h-4 w-4" />
            Commission
          </Button>
          <Button
            variant={sortBy === 'rate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('rate')}
          >
            <TrendingUp className="h-4 w-4" />
            Success Rate
          </Button>
        </div>
      </PageHeader>

      {/* Podium for top 3 */}
      <div className="grid gap-4 sm:grid-cols-3">
        {sorted.slice(0, 3).map((entry, i) => (
          <Card key={entry.rep_id} className={`relative overflow-hidden ${
            i === 0 ? 'bg-amber-900/10 border-amber-700/50' :
            i === 1 ? 'bg-slate-700/10 border-slate-600/50' :
            'bg-orange-900/10 border-orange-700/50'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{entry.rep_name}</CardTitle>
                <RankBadge rank={entry.rank} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{entry.deals_closed}</p>
                  <p className="text-xs text-muted-foreground">Deals Closed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    ${entry.total_commission.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Commission</p>
                </div>
                <div>
                  <p className="text-lg font-medium">{entry.total_calls}</p>
                  <p className="text-xs text-muted-foreground">Total Calls</p>
                </div>
                <div>
                  <p className="text-lg font-medium">{entry.success_rate}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-400" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Rep</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Active Pipeline</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((entry) => (
                  <TableRow key={entry.rep_id}>
                    <TableCell>
                      <RankBadge rank={entry.rank} />
                    </TableCell>
                    <TableCell className="font-medium">{entry.rep_name}</TableCell>
                    <TableCell>{entry.total_leads_assigned}</TableCell>
                    <TableCell>{entry.total_calls}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400">
                        {entry.deals_closed}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.active_pipeline_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.min(100, entry.success_rate)}%` }}
                          />
                        </div>
                        <span className="text-xs">{entry.success_rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-400">
                      ${entry.total_commission.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Deals by Rep</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.3} />
                <XAxis dataKey="rep_name" className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Bar dataKey="deals_closed" fill="#34d399" radius={[4, 4, 0, 0]} name="Deals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
