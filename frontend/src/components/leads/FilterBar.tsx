import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SavedFilters } from './SavedFilters'
import { LEAD_STATUS } from '@/lib/utils'
import type { FilterState } from '@/lib/filter-storage'

interface Props {
  search: string
  onSearchChange: (value: string) => void
  selectedStatuses: string[]
  onStatusesChange: (statuses: string[]) => void
  onApply: () => void
}

const statusOptions = Object.entries(LEAD_STATUS).map(([value, s]) => ({
  value,
  label: s.label,
}))

export function FilterBar({ search, onSearchChange, selectedStatuses, onStatusesChange, onApply }: Props) {
  const toggleStatus = (value: string) => {
    if (selectedStatuses.includes(value)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== value))
    } else {
      onStatusesChange([...selectedStatuses, value])
    }
  }

  const handleApplyFilter = (state: FilterState) => {
    onSearchChange(state.search)
    onStatusesChange(state.statuses)
  }

  const clearAll = () => {
    onSearchChange('')
    onStatusesChange([])
  }

  const hasFilters = search || selectedStatuses.length > 0

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="relative w-full sm:min-w-[200px] sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search business, contact, or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="relative group flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
                Status
                {selectedStatuses.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
              <div className="absolute left-0 top-full z-50 mt-1 hidden min-w-48 animate-scale-in rounded-lg border bg-card shadow-xl group-focus-within:block group-hover:block">
                <div className="p-2">
                  {statusOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(opt.value)}
                        onChange={() => toggleStatus(opt.value)}
                        className="h-4 w-4 rounded border-border bg-transparent accent-emerald-500"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" variant="secondary" size="sm" onClick={onApply} className="flex-shrink-0">
              Search
            </Button>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 text-xs flex-shrink-0">
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <SavedFilters currentFilter={{ search, statuses: selectedStatuses }} onApply={handleApplyFilter} />
        </div>
      </div>

      {/* Active filter badges */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {search && (
            <Badge variant="secondary" className="text-xs">
              Search: "{search}"
              <button onClick={() => onSearchChange('')} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedStatuses.map((s) => {
            const status = LEAD_STATUS[s as keyof typeof LEAD_STATUS]
            return (
              <Badge key={s} variant="secondary" className="text-xs">
                {status?.label || s}
                <button onClick={() => toggleStatus(s)} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
