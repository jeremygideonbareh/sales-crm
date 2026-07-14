import { useEffect, useState, useMemo } from "react"
import {
  Phone,
  PhoneOff,
  XCircle,
  DollarSign,
  Copy,
  CheckCircle2,
  ThumbsUp,
  ChevronRight,
  List,
  Clock,
  Mail,
  Globe,
  Calendar,
  PhoneCall,
  Sparkles,
  Loader2,
} from "lucide-react"
import { repsApi } from "@/api/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShimmerButton } from "@/components/ui/shimmer-button"

import { Confetti } from "@/components/ui/confetti"
import { toast } from "@/components/ui/toast"
import { Drawer } from "@/components/ui/drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { LEAD_STATUS } from "@/lib/utils"
import { formatPhone, formatCurrency, formatDate, formatRelativeTime } from "@/lib/format"
import type { AssignedLeadResponse } from "@/types"

const OUTCOMES = [
  { status: "no_answer", label: "No Answer", icon: PhoneOff, color: "border-amber-700 bg-amber-900/15 hover:bg-amber-900/25 text-amber-300" },
  { status: "not_interested", label: "Not Interested", icon: XCircle, color: "border-red-700 bg-red-900/15 hover:bg-red-900/25 text-red-300" },
  { status: "interested", label: "Interested", icon: ThumbsUp, color: "border-sky-700 bg-sky-900/15 hover:bg-sky-900/25 text-sky-300" },
  { status: "pitching", label: "Pitching", icon: Phone, color: "border-blue-700 bg-blue-900/15 hover:bg-blue-900/25 text-blue-300" },
  { status: "demo_scheduled", label: "Demo Sch.", icon: Calendar, color: "border-purple-700 bg-purple-900/15 hover:bg-purple-900/25 text-purple-300" },
  { status: "negotiation", label: "Negotiation", icon: DollarSign, color: "border-orange-700 bg-orange-900/15 hover:bg-orange-900/25 text-orange-300" },
]

function statusDot(status: string) {
  const cfg = LEAD_STATUS[status as keyof typeof LEAD_STATUS]
  return cfg?.color || "text-muted-foreground"
}

function statusBadgeStyle(status: string) {
  const cfg = LEAD_STATUS[status as keyof typeof LEAD_STATUS]
  return `px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg?.bg || "bg-muted"} ${cfg?.color || "text-muted-foreground"}`
}

export default function CallingView() {
  const [leads, setLeads] = useState<AssignedLeadResponse[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState("")
  const [dealValue, setDealValue] = useState("")
  const [showDealInput, setShowDealInput] = useState(false)
  const [callActive, setCallActive] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"leads" | "outcome" | null>(null)
  const [copied, setCopied] = useState(false)

  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) || null,
    [leads, selectedId]
  )

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const data = await repsApi.assignedLeads()
      setLeads(data)
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOutcome = async (status: string) => {
    if (!selected) return
    setUpdating(true)
    setCallActive(false)
    setDrawerMode(null)
    try {
      const payload: { status: string; notes?: string; deal_value?: number } = {
        status,
        notes: notes || undefined,
      }
      if (status === "deal_closed" && dealValue) {
        payload.deal_value = parseFloat(dealValue)
      }
      await repsApi.updateStatus(selected.id, payload)

      if (status === "deal_closed") {
        setShowConfetti(true)
        toast({
          title: "Deal Closed!",
          description: `${formatCurrency(parseFloat(dealValue || "0"))} deal recorded`,
          variant: "success",
        })
        setTimeout(() => setShowConfetti(false), 3000)
      } else {
        toast({
          title: `Marked as ${status.replace(/_/g, " ")}`,
          variant: "default",
        })
      }

      setNotes("")
      setDealValue("")
      setShowDealInput(false)
      await fetchLeads()
    } catch {
      toast({ title: "Failed to update status", variant: "error" })
    } finally {
      setUpdating(false)
    }
  }

  const selectLead = (id: number) => {
    setSelectedId(id)
    setCallActive(true)
    setNotes("")
    setDealValue("")
    setShowDealInput(false)
    setDrawerMode(null)
  }

  const copyPhone = async () => {
    if (!selected) return
    await navigator.clipboard.writeText(selected.phone)
    setCopied(true)
    toast({ title: "Phone number copied", variant: "success" })
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading state ──
  if (loading && leads.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:p-6">
        <div className="hidden w-64 shrink-0 flex-col gap-2 lg:flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-40 rounded-xl sm:h-48" />
          <Skeleton className="h-28 rounded-xl sm:h-32" />
        </div>
      </div>
    )
  }

  // ── Empty state ──
  if (!loading && leads.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold">All Caught Up!</h2>
            <p className="mt-2 text-muted-foreground">
              No leads assigned yet. Check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lead = selected

  return (
    <>
      <Confetti active={showConfetti} />

      {/* ─── Lead Picker Drawer (mobile) ─── */}
      <Drawer
        open={drawerMode === "leads"}
        onClose={() => setDrawerMode(null)}
        title="All Leads"
      >
        <div className="space-y-1">
          {leads.map((l) => {
            const cfg = LEAD_STATUS[l.status as keyof typeof LEAD_STATUS]
            return (
              <button
                key={l.id}
                onClick={() => selectLead(l.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted ${
                  l.id === selectedId ? "bg-muted ring-1 ring-ring" : ""
                }`}
              >
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDot(l.status)}`} style={{ backgroundColor: "currentColor" }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.business_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{l.contact_name} · {formatPhone(l.phone)}</p>
                </div>
                <Badge variant="secondary" className={`shrink-0 text-[10px] ${cfg?.bg} ${cfg?.color}`}>
                  {cfg?.label || l.status}
                </Badge>
              </button>
            )
          })}
        </div>
      </Drawer>

      {/* ─── Outcome Drawer (mobile) ─── */}
      <Drawer
        open={drawerMode === "outcome"}
        onClose={() => setDrawerMode(null)}
        title="Log Outcome"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {OUTCOMES.map(({ status, label, icon: Icon, color }) => (
              <button
                key={status}
                onClick={() => handleOutcome(status)}
                disabled={updating}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 text-sm font-medium transition-all active:scale-95 disabled:opacity-50 ${color}`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
            <button
              onClick={() => setShowDealInput(true)}
              disabled={updating}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-emerald-900/15 px-3 py-4 text-sm font-medium text-emerald-300 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5" />
              Deal Closed
            </button>
          </div>

          {showDealInput && (
            <div className="animate-fade-in space-y-3 rounded-xl border border-emerald-800 bg-emerald-900/10 p-4">
              <label className="text-sm font-medium">Deal Value ($)</label>
              <Input
                type="number"
                placeholder="5000"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                autoFocus
              />
              <Button
                className="w-full"
                onClick={() => handleOutcome("deal_closed")}
                disabled={!dealValue || updating}
              >
                <DollarSign className="h-4 w-4" />
                Confirm Deal — 20% Commission
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Call Notes</label>
            <textarea
              placeholder="What happened on this call?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="field-sizing-content min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <Button
            className="w-full"
            disabled={updating}
            onClick={() => handleOutcome("no_answer")}
          >
            {updating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Save Outcome
          </Button>
        </div>
      </Drawer>

      {/* ─── Main Layout ─── */}
      <div className="flex min-h-[calc(100vh-8rem)] flex-col lg:h-[calc(100vh-4rem)] lg:flex-row">
        {/* ─── Sidebar Lead List (desktop) ─── */}
        <aside className="hidden w-64 shrink-0 border-r lg:flex lg:flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">My Leads</h2>
            <Badge variant="secondary" className="text-[10px]">{leads.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {leads.map((l) => {
              const cfg = LEAD_STATUS[l.status as keyof typeof LEAD_STATUS]
              return (
                <button
                  key={l.id}
                  onClick={() => selectLead(l.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted ${
                    l.id === selectedId ? "bg-muted ring-1 ring-ring" : ""
                  }`}
                >
                  <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDot(l.status)}`} style={{ backgroundColor: "currentColor" }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.business_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.contact_name}
                      {l.call_count > 0 && ` · ${l.call_count} call${l.call_count > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-opacity ${
                    l.id === selectedId ? "opacity-100" : "opacity-0"
                  }`} />
                </button>
              )
            })}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex flex-1 flex-col overflow-x-hidden lg:overflow-y-auto">
          {/* ─── Header ─── */}
          <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDrawerMode("leads")}
                  className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/80 lg:hidden"
                >
                  <List className="h-3.5 w-3.5" />
                  All Leads
                </button>
                <h1 className="text-base font-semibold lg:text-lg">Calling</h1>
              </div>
              <div className="flex items-center gap-3">
                {lead && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeStyle(lead.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot(lead.status)}`} style={{ backgroundColor: "currentColor" }} />
                    {LEAD_STATUS[lead.status as keyof typeof LEAD_STATUS]?.label || lead.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ─── Content Area ─── */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {lead ? (
              <div className="mx-auto max-w-2xl space-y-4 lg:space-y-5">
                {/* ─── Leads Vertical List (mobile) ─── */}
                <div className="lg:hidden">
                  <div className="space-y-2">
                    {leads.map((l) => {
                      const cfg = LEAD_STATUS[l.status as keyof typeof LEAD_STATUS]
                      return (
                        <button
                          key={l.id}
                          onClick={() => selectLead(l.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all active:scale-95 ${
                            l.id === selectedId
                              ? "border-ring bg-muted ring-1 ring-ring"
                              : "border-border bg-card hover:bg-muted"
                          }`}
                        >
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDot(l.status)}`} style={{ backgroundColor: "currentColor" }} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold">{l.business_name}</span>
                            </div>
                            <span className="truncate text-xs text-muted-foreground">{l.contact_name}</span>
                          </div>
                          <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg?.bg || "bg-muted"} ${cfg?.color || "text-muted-foreground"}`}>
                            {cfg?.label || l.status}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ─── Lead Header (mobile: name only) ─── */}
                <div className="flex items-start gap-3 lg:hidden">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold leading-tight">{lead.business_name}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">{lead.contact_name}</p>
                  </div>
                </div>

                {/* ─── Lead Detail Card ─── */}
                <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm lg:p-5">
                  {/* Phone row */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900/20">
                        <Phone className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-lg font-bold tracking-wider hover:text-emerald-400 transition-colors"
                        >
                          {formatPhone(lead.phone)}
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-[0.97] sm:flex-none"
                      >
                        <PhoneCall className="h-4 w-4" />
                        <span className="lg:hidden">Call Now</span>
                        <span className="hidden lg:inline">Call</span>
                      </a>
                      <button
                        onClick={copyPhone}
                        className="flex items-center justify-center rounded-xl bg-muted px-3 py-3 text-sm transition-colors hover:bg-muted/80"
                      >
                        <Copy className={`h-4 w-4 ${copied ? "text-emerald-400" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-muted-foreground">{lead.email}</span>
                      </a>
                    )}
                    {lead.website && (
                      <a
                        href={`https://${lead.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                      >
                        <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-muted-foreground">{lead.website}</span>
                      </a>
                    )}
                    {(lead.deal_value || lead.deal_value === 0) && (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-900/10 px-3 py-2.5 text-sm">
                        <DollarSign className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span className="font-semibold text-emerald-300">{formatCurrency(lead.deal_value)}</span>
                        {lead.commission && (
                          <span className="text-xs text-muted-foreground">
                            ({(lead.commission / lead.deal_value * 100).toFixed(0)}% comm)
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm">
                      <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {lead.created_at ? formatDate(lead.created_at) : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Last activity + call count */}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {lead.call_count > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                        <PhoneCall className="h-3 w-3" />
                        {lead.call_count} call{lead.call_count > 1 ? "s" : ""}
                      </span>
                    )}
                    {lead.last_call_at && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                        <Clock className="h-3 w-3" />
                        Last: {formatRelativeTime(lead.last_call_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* ─── Notes ─── */}
                {lead.notes && (
                  <div className="rounded-2xl border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Notes</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{lead.notes}</p>
                  </div>
                )}



                {/* ─── Outcome Buttons (desktop) ─── */}
                <div className="hidden lg:block space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Log Outcome</p>
                  <div className="grid grid-cols-3 gap-2">
                    {OUTCOMES.map(({ status, label, icon: Icon, color }) => (
                      <Button
                        key={status}
                        variant="outline"
                        size="lg"
                        disabled={updating}
                        onClick={() => handleOutcome(status)}
                        className={`h-auto min-h-[56px] flex-col gap-1.5 py-3 border-2 ${color}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-semibold">{label}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <ShimmerButton
                      shimmerColor="#34d399"
                      background="rgba(4, 120, 87, 0.2)"
                      borderRadius="0.75rem"
                      className="flex-1 h-auto min-h-[52px] gap-2"
                      disabled={updating}
                      onClick={() => setShowDealInput(true)}
                    >
                      <Sparkles className="h-5 w-5" />
                      <span className="text-sm font-bold">Deal Closed</span>
                    </ShimmerButton>
                  </div>
                  {showDealInput && (
                    <div className="animate-fade-in space-y-3 rounded-2xl border border-emerald-800 bg-emerald-900/10 p-4">
                      <label className="text-sm font-medium">Deal Value ($)</label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={dealValue}
                        onChange={(e) => setDealValue(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleOutcome("deal_closed")}
                          disabled={!dealValue || updating}
                        >
                          <DollarSign className="h-4 w-4" />
                          Confirm Deal — 20% Commission
                        </Button>
                        <Button variant="ghost" onClick={() => setShowDealInput(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Call Notes</label>
                    <textarea
                      placeholder="What happened on this call? Any objections, follow-up items..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="field-sizing-content min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                </div>

                {/* ─── Mobile: Log Outcome FAB ─── */}
                <div className="fixed bottom-4 left-1/2 z-10 -translate-x-1/2 lg:hidden">
                  <button
                    onClick={() => {
                      setDrawerMode("outcome")
                      setShowDealInput(false)
                    }}
                    className="flex items-center gap-2.5 rounded-2xl bg-foreground px-6 py-3.5 text-sm font-bold text-background shadow-lg transition-all active:scale-95"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Log Outcome
                  </button>
                </div>

                {/* ─── Spacer for mobile FAB ─── */}
                <div className="h-20 lg:hidden" />
              </div>
            ) : (
              /* ─── No selection ─── */
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Phone className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select a lead to start calling
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
