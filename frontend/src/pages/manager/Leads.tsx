import { useEffect, useState, useRef, useCallback } from "react"
import { motion } from "motion/react"
import { Upload, Download, MoreHorizontal, Copy, Eye, Phone, Search } from "lucide-react"
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
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { LeadDetailDialog } from "@/components/leads/LeadDetailDialog"
import { AssignRepDialog } from "@/components/leads/AssignRepDialog"
import { DeleteConfirmDialog } from "@/components/leads/DeleteConfirmDialog"
import { BulkActions } from "@/components/leads/BulkActions"
import { FilterBar } from "@/components/leads/FilterBar"
import { toast } from "@/components/ui/toast"
import { exportToCsv } from "@/lib/export-csv"
import { LEAD_STATUS, cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/useMediaQuery"
import type { LeadResponse } from "@/types"

const PAGE_SIZE_OPTIONS = [25, 50, 100]

export default function Leads() {
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectedLead, setSelectedLead] = useState<LeadResponse | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const data = await leadsApi.list({
        search: debouncedSearch || undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        skip: page * pageSize,
        limit: pageSize,
      })
      setLeads(data.leads)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedStatuses, page, pageSize])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard", variant: "success" })
  }

  const totalPages = Math.ceil(total / pageSize)
  const isMobile = useIsMobile()

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

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <FilterBar
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(0) }}
            selectedStatuses={selectedStatuses}
            onStatusesChange={(v) => { setSelectedStatuses(v); setPage(0) }}
            onApply={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current)
              setDebouncedSearch(search)
              setPage(0)
            }}
          />

          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedIds.size}
            onAssign={() => setShowAssign(true)}
            onDelete={() => setShowDelete(true)}
            onExport={handleBulkExport}
          />

          {/* Mobile: Card View */}
          {isMobile && !loading && leads.length > 0 && (
            <div className="space-y-3 md:hidden">
              {leads.map((l) => (
                <Card
                  key={l.id}
                  className="overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedLead(l)
                    setShowDetail(true)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(l.id)}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(l.id) }}
                          className="h-4 w-4 rounded border-border bg-transparent accent-emerald-500"
                        />
                        <div>
                          <p className="font-medium text-sm">{l.business_name}</p>
                          <p className="text-xs text-muted-foreground">{l.contact_name}</p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          LEAD_STATUS[l.status as keyof typeof LEAD_STATUS]?.bg,
                          LEAD_STATUS[l.status as keyof typeof LEAD_STATUS]?.color
                        )}
                      >
                        {LEAD_STATUS[l.status as keyof typeof LEAD_STATUS]?.label || l.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">{l.phone}</span>
                      <span>{l.assigned_to || "Unassigned"}</span>
                    </div>
                    {l.deal_value && (
                      <div className="mt-1 text-right text-xs font-medium text-emerald-400">
                        ${Number(l.deal_value).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Desktop: Table */}
          {!isMobile && (
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
                        className="h-4 w-4 rounded border-border bg-transparent accent-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
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
                    leads.map((l, i) => (
                      <motion.tr
                        key={l.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: i * 0.03,
                          duration: 0.25,
                          ease: "easeOut",
                        }}
                        className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30"
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
                            className="h-4 w-4 rounded border-border bg-transparent accent-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
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
                        <TableCell className="text-right font-medium">
                          {l.deal_value
                            ? `$${Number(l.deal_value).toLocaleString()}`
                            : "—"}
                        </TableCell>
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu
                            align="end"
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedLead(l)
                                setShowDetail(true)
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(l.phone)}
                            >
                              <Phone className="h-3.5 w-3.5" />
                              Copy Phone
                            </DropdownMenuItem>
                            {l.email && (
                              <DropdownMenuItem
                                onClick={() => copyToClipboard(l.email!)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy Email
                              </DropdownMenuItem>
                            )}
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                Showing {page * pageSize + 1}-
                {Math.min((page + 1) * pageSize, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs">Rows</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v))
                    setPage(0)
                  }}
                >
                  <SelectTrigger className="h-7 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                disabled={(page + 1) * pageSize >= total}
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
