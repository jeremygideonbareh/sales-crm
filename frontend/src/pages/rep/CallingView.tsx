import { useEffect, useState, useCallback } from "react"
import {
  Phone,
  PhoneOff,
  XCircle,
  DollarSign,
  Copy,
  SkipForward,
  CheckCircle2,
  ClipboardList,
  ThumbsUp,
} from "lucide-react"
import { repsApi } from "@/api/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { PulsatingButton } from "@/components/ui/pulsating-button"
import { PageHeader } from "@/components/layout/PageHeader"
import { CallTimer } from "@/components/rep/CallTimer"
import { CallHistory } from "@/components/rep/CallHistory"
import { Confetti } from "@/components/ui/confetti"
import { toast } from "@/components/ui/toast"
import { Tooltip } from "@/components/ui/tooltip"
import type { NextLeadResponse, LeadResponse } from "@/types"

interface HistoryItem {
  id: number
  status: string
  business_name: string
  contact_name: string
  deal_value: number | null
}

const OUTCOMES = [
  {
    status: "no_answer",
    label: "No Answer",
    icon: PhoneOff,
    variant: "secondary" as const,
  },
  {
    status: "not_interested",
    label: "Not Interested",
    icon: XCircle,
    variant: "destructive" as const,
  },
  {
    status: "interested",
    label: "Interested",
    icon: ThumbsUp,
    variant: "default" as const,
  },
  {
    status: "pitching",
    label: "Pitching",
    icon: Phone,
    variant: "default" as const,
  },
]

export default function CallingView() {
  const [current, setCurrent] = useState<NextLeadResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState("")
  const [dealValue, setDealValue] = useState("")
  const [showDealInput, setShowDealInput] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [callActive, setCallActive] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchNext = useCallback(async () => {
    setLoading(true)
    setCallActive(false)
    setShowDealInput(false)
    setNotes("")
    setDealValue("")
    try {
      const data = await repsApi.nextLead()
      setCurrent(data)
      if (data.lead) {
        setCallActive(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNext()
    repsApi.callLogs.list().then((logs) => {
      setHistory(
        logs.map((l: any) => ({
          id: l.id,
          status: l.status_after,
          business_name: l.business_name,
          contact_name: "",
          deal_value: null,
        }))
      )
    }).catch(() => {})
  }, [fetchNext])

  const handleDurationChange = useCallback((_seconds: number) => {
    // Could store duration for logging
  }, [])

  const handleOutcome = async (status: string) => {
    if (!current?.lead) return
    setUpdating(true)
    setCallActive(false)
    try {
      const payload: {
        status: string
        notes?: string
        deal_value?: number
      } = { status, notes: notes || undefined }
      if (status === "deal_closed" && dealValue) {
        payload.deal_value = parseFloat(dealValue)
      }
      const updated = await repsApi.updateStatus(
        current.lead.id,
        payload
      )
      setHistory((prev) => [
        {
          id: updated.id,
          status: updated.status,
          business_name: updated.business_name,
          contact_name: updated.contact_name,
          deal_value: updated.deal_value,
        },
        ...prev,
      ].slice(0, 50))

      if (status === "deal_closed") {
        setShowConfetti(true)
        toast({
          title: "Deal Closed! 🎉",
          description: `$${parseFloat(dealValue || "0").toLocaleString()} deal recorded`,
          variant: "success",
        })
        setTimeout(() => setShowConfetti(false), 3000)
      } else {
        toast({
          title: `Marked as ${status.replace("_", " ")}`,
          variant: "default",
        })
      }

      setNotes("")
      setDealValue("")
      setShowDealInput(false)
      await fetchNext()
    } catch {
      toast({
        title: "Failed to update status",
        variant: "error",
      })
    } finally {
      setUpdating(false)
    }
  }

  const copyPhone = async () => {
    if (current?.lead) {
      await navigator.clipboard.writeText(current.lead.phone)
      setCopied(true)
      toast({ title: "Phone number copied", variant: "success" })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading && !current) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!current?.lead) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
            <h2 className="text-xl font-semibold">All Caught Up!</h2>
            <p className="mt-1 text-muted-foreground">
              No leads in your queue. Great work!
            </p>
            <PulsatingButton
              className="mt-4"
              onClick={fetchNext}
              variant="pulse"
            >
              Check Again
            </PulsatingButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lead = current.lead

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Confetti active={showConfetti} />

      <PageHeader title="Calling Queue">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <CallTimer
            active={callActive}
            onDurationChange={handleDurationChange}
          />
          <Badge variant="secondary">
            {current.queue_remaining} remaining
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <ClipboardList className="h-4 w-4" />
            History
          </Button>
        </div>
      </PageHeader>

      {/* Call History (toggleable) */}
      {showHistory && (
        <CallHistory history={history} />
      )}

      {/* Lead Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {lead.business_name}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {lead.contact_name}
              </p>
              {lead.website && (
                <a
                  href={`https://${lead.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm text-emerald-400 hover:underline"
                >
                  {lead.website}
                </a>
              )}
            </div>
            <Badge variant="outline">ID: {lead.id}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3 sm:p-4">
            <Phone className="h-6 w-6 shrink-0 text-emerald-400" />
            <span className="text-xl sm:text-2xl font-bold tracking-wider break-all">
              {lead.phone}
            </span>
            <Tooltip content={copied ? "Copied!" : "Copy phone number"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyPhone}
                className="h-9 w-9 shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {/* Interested CTA */}
      {lead.status === "interested" && (
        <Card className="border-sky-800 bg-sky-900/10">
          <CardContent className="flex items-center gap-3 py-4">
            <ThumbsUp className="h-5 w-5 text-sky-400" />
            <div className="flex-1">
              <p className="text-sm font-medium">Client is interested!</p>
              <p className="text-xs text-muted-foreground">
                Go to Demo Requests to schedule a demo for them
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/rep/demos'}>
              Create Demo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call Outcome */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Log Call Outcome
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">
            {OUTCOMES.map(
              ({ status, label, icon: Icon, variant }) => (
                <Button
                  key={status}
                  variant={variant}
                  size="lg"
                  className="h-auto min-h-[56px] flex-col gap-1 py-3 sm:py-4"
                  disabled={updating}
                  onClick={() => handleOutcome(status)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">
                    {label}
                  </span>
                </Button>
              )
            )}
            <ShimmerButton
              shimmerColor="#34d399"
              background="rgba(4, 120, 87, 0.3)"
              borderRadius="0.75rem"
              className="h-auto min-h-[56px] flex-col gap-1 py-3 sm:py-4"
              disabled={updating}
              onClick={() => setShowDealInput(true)}
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-xs font-semibold">
                Deal Closed
              </span>
            </ShimmerButton>
          </div>

          {/* Deal Input */}
          {showDealInput && (
            <div className="animate-fade-in space-y-3 rounded-lg border border-emerald-800 bg-emerald-900/10 p-4">
              <label className="text-sm font-medium">
                Deal Value ($)
              </label>
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
                  Confirm Deal &mdash; 20% Commission
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDealInput(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              placeholder="What happened on this call? Any objections, follow-up items..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="field-sizing-content min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skip */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={fetchNext}
          disabled={updating}
        >
          <SkipForward className="h-4 w-4" />
          Skip / Refresh Queue
        </Button>
        {lead.status === "no_answer" && (
          <PulsatingButton
            variant="pulse"
            onClick={() => handleOutcome("no_answer")}
            disabled={updating}
          >
            Log Callback Attempt
          </PulsatingButton>
        )}
      </div>
    </div>
  )
}
