import { useEffect, useState, useRef, useCallback } from "react"
import { Upload, Search, Download, MoreHorizontal } from "lucide-react"
import { leadsApi } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { LeadDetailDialog } from "@/components/leads/LeadDetailDialog"
import { AssignRepDialog } from "@/components/leads/AssignRepDialog"
import { DeleteConfirmDialog } from "@/components/leads/DeleteConfirmDialog"
import { BulkActions } from "@/components/leads/BulkActions"
import { toast } from "@/components/ui/toast"
import { exportToCsv } from "@/lib/export-csv"
import { LEAD_STATUS, cn } from "@/lib/utils"
import type { LeadResponse } from "@/types"

const PAGE_SIZE = 50

const statusOptions = [
  { value: "", label: "All Statuses" },
  ...Object.entries(LEAD_STATUS).map(([value, s]) => ({
    value,
    label: s.label,
  })),
]

export default function Leads() {
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectedLead, setSelectedLead] = useState<LeadResponse | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const data = await leadsApi.list({
        search: search || undefined,
        status: statusFilter || undefined,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      setLeads(data.leads)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    fetchLeads()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await leadsApi.upload(file)
      toast({ title: "Leads imported successfully", variant: "success" })
      fetchLeads()
    } catch {
      toast({ title: "Failed to import leads", variant: "error" })
    }
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleExport = () => {
    if (leads.length === 0) {
      toast({ title: "No leads to export", variant: "warning" })
      return
    }
    exportToCsv(
      leads.map((l) => ({
        ID: l.id,
        Business: l.business_name,
        Contact: l.contact_name,
        Phone: l.phone,
        Email: l.email || "",
        Website: l.website || "",
        Status: l.status,
        Value: l.deal_value || "",
      })),
      `leads-${new Date().toISOString().slice(0, 10)}`
    )
    toast({ title: "Exported to CSV", variant: "success" })
  }

  const handleBulkExport = () => {
    const selected = leads.filter((l) => selectedIds.has(l.id))
    if (selected.length === 0) {
      toast({ title: "No leads selected", variant: "warning" })
      return
    }
    exportToCsv(
      selected.map((l) => ({
        ID: l.id,
        Business: l.business_name,
        Contact: l.contact_name,
        Phone: l.phone,
        Email: l.email || "",
        Website: l.website || "",
        Status: l.status,
        Value: l.deal_value || "",
      })),
      `leads-export-${new Date().toISOString().slice(0, 10)}`
    )
    toast({ title: "Exported selected leads", variant: "success" })
  }

  const handleSaveLead = async (
    leadId: number,
    data: { status: string; notes?: string; deal_value?: number | null }
  ) => {
    try {
      await leadsApi.update(leadId, data)
      toast({ title: "Lead updated", variant: "success" })
      fetchLeads()
    } catch {
      toast({ title: "Failed to update lead", variant: "error" })
    }
  }

  const handleDeleteConfirm = async () => {
    const ids = Array.from(selectedIds)
    try {
      await leadsApi.deleteBulk(ids)
      toast({
        title: `Deleted ${ids.length} lead(s)`,
        variant: "success",
      })
      setSelectedIds(new Set())
      setShowDelete(false)
      setPage(0)
      fetchLeads()
    } catch {
      toast({ title: "Failed to delete leads", variant: "error" })
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)))
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={`${total} total leads`}
      >
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export All
        </Button>
        <input
          type="file"
          ref={fileRef}
          onChange={handleUpload}
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
        <Button onClick={() => fileRef.current?.click()} size="sm">
          <Upload className="h-4 w-4" />
          Upload CSV
        </Button>
      </PageHeader>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="mb-4 flex flex-wrap gap-3"
          >
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search business, contact, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v ?? "")
                setPage(0)
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedIds.size}
            onAssign={() => setShowAssign(true)}
            onDelete={() => setShowDelete(true)}
            onExport={handleBulkExport}
          />

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={
                        leads.length > 0 &&
                        selectedIds.size === leads.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-border bg-transparent"
                    />
                  </TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 opacity-30" />
                        <p>No leads found</p>
                        <p className="text-xs">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((l) => (
                    <TableRow
                      key={l.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedLead(l)
                        setShowDetail(true)
                      }}
                    >
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(l.id)}
                          onChange={() => toggleSelect(l.id)}
                          className="rounded border-border bg-transparent"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {l.business_name}
                      </TableCell>
                      <TableCell>{l.contact_name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {l.phone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            LEAD_STATUS[
                              l.status as keyof typeof LEAD_STATUS
                            ]?.bg,
                            LEAD_STATUS[
                              l.status as keyof typeof LEAD_STATUS
                            ]?.color
                          )}
                        >
                          {LEAD_STATUS[
                            l.status as keyof typeof LEAD_STATUS
                          ]?.label || l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {l.assigned_to || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {l.deal_value
                          ? `$${Number(l.deal_value).toLocaleString()}`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {page * PAGE_SIZE + 1}-
              {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-2">
                Page {page + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={(page + 1) * PAGE_SIZE >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <LeadDetailDialog
        lead={selectedLead}
        open={showDetail}
        onOpenChange={setShowDetail}
        onSave={handleSaveLead}
      />

      <AssignRepDialog
        leadIds={Array.from(selectedIds)}
        open={showAssign}
        onOpenChange={setShowAssign}
        onAssigned={() => {
          setSelectedIds(new Set())
          fetchLeads()
        }}
      />

      <DeleteConfirmDialog
        count={selectedIds.size}
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
