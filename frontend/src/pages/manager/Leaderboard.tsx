import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import {
  Trophy,
  DollarSign,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Minus,
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
  Cell,
  LabelList,
} from "recharts"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { MagicCard } from "@/components/ui/magic-card"
import type { LeaderboardEntry } from "@/types"

const RANK_ICONS = ["🥇", "🥈", "🥉"]

const CHART_COLORS = ["#34d399", "#22d3ee", "#f59e0b", "#a78bfa", "#f472b6"]

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

function AnimatedProgressBar({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "0px" })

  return (
    <div ref={ref} className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <motion.div
        className="h-full rounded-full bg-emerald-500"
        initial={{ width: "0%" }}
        animate={isInView ? { width: `${Math.min(100, value)}%` } : { width: "0%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </div>
  )
}

function RankChange({ rank }: { rank: number }) {
  if (rank <= 0) return null
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground/50">
      <Minus className="h-3 w-3" />
    </span>
  )
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const podiumColors = [
  "from-amber-500/20 via-amber-500/5 to-transparent",
  "from-slate-300/20 via-slate-300/5 to-transparent",
  "from-orange-500/20 via-orange-500/5 to-transparent",
]

const podiumBorders = [
  "border-amber-700/40",
  "border-slate-500/40",
  "border-orange-700/40",
]

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'deals' | 'commission' | 'rate'>('deals')
  const podiumRef = useRef<HTMLDivElement>(null)
  const podiumInView = useInView(podiumRef, { once: true, margin: "-20px" })

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
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={sectionVariants}>
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
      </motion.div>

      {/* Podium for top 3 */}
      <motion.div
        ref={podiumRef}
        variants={sectionVariants}
        className="grid gap-4 grid-cols-1 sm:grid-cols-3"
      >
        {sorted.slice(0, 3).map((entry, i) => (
          <motion.div
            key={entry.rep_id}
            initial={{ opacity: 0, y: 30 }}
            animate={podiumInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              delay: i * 0.15,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <MagicCard
              mode="gradient"
              gradientSize={300}
              gradientColor="#262626"
              gradientOpacity={0.15}
              className={cn(
                "relative overflow-hidden rounded-xl border",
                podiumBorders[i],
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{entry.rep_name}</CardTitle>
                  <RankBadge rank={entry.rank} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <motion.p
                      className="text-2xl font-bold"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={podiumInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.3 + i * 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {entry.deals_closed}
                    </motion.p>
                    <p className="text-xs text-muted-foreground">Deals Closed</p>
                  </div>
                  <div>
                    <motion.p
                      className="text-2xl font-bold text-emerald-400"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={podiumInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.4 + i * 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      ${entry.total_commission.toLocaleString()}
                    </motion.p>
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
            </MagicCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Full Leaderboard Table */}
      <motion.div variants={sectionVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-400" />
              Full Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile: Card View */}
            {useIsMobile() ? (
              <div className="space-y-3 md:hidden">
                {sorted.map((entry) => (
                  <Card key={entry.rep_id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <RankBadge rank={entry.rank} />
                          <RankChange rank={entry.rank} />
                          <span className="font-medium">{entry.rep_name}</span>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400">
                          {entry.deals_closed} deals
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Leads:</span> {entry.total_leads_assigned}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Calls:</span> {entry.total_calls}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pipeline:</span> {entry.active_pipeline_count}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rate:</span> {entry.success_rate}%
                        </div>
                      </div>
                      <div className="mt-2">
                        <AnimatedProgressBar value={entry.success_rate} />
                      </div>
                      <div className="mt-2 text-right font-medium text-emerald-400">
                        ${entry.total_commission.toLocaleString()} commission
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
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
                    {sorted.map((entry, i) => (
                      <motion.tr
                        key={entry.rep_id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: i * 0.04,
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        className="border-b border-border/40 transition-colors hover:bg-muted/20"
                      >
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <RankBadge rank={entry.rank} />
                            <RankChange rank={entry.rank} />
                          </div>
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
                            <AnimatedProgressBar value={entry.success_rate} className="w-16" />
                            <span className="text-xs">{entry.success_rate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-400">
                          ${entry.total_commission.toLocaleString()}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart */}
      <motion.div variants={sectionVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Deals by Rep</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sorted} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="rep_name" className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  />
                  <Bar dataKey="deals_closed" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Deals" maxBarSize={48}>
                    {sorted.map((_, i) => (
                      <Cell key={`cell-${i}`} fill="url(#barGradient)" />
                    ))}
                    <LabelList dataKey="deals_closed" position="top" className="text-xs font-medium fill-emerald-400" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
