import { useState } from 'react'
import { Bookmark, Save, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSavedFilters } from '@/hooks/useSavedFilters'
import { type FilterState } from '@/lib/filter-storage'

interface Props {
  currentFilter: FilterState
  onApply: (state: FilterState) => void
}

export function SavedFilters({ currentFilter, onApply }: Props) {
  const { savedFilters, save, remove } = useSavedFilters()
  const [open, setOpen] = useState(false)
  const [saveMode, setSaveMode] = useState(false)
  const [name, setName] = useState('')

  const handleSave = () => {
    if (!name.trim()) return
    save(name.trim(), currentFilter)
    setName('')
    setSaveMode(false)
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-2">
        <Bookmark className="h-3.5 w-3.5" />
        Saved Filters
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-64 animate-scale-in rounded-lg border bg-card shadow-xl">
            <div className="border-b px-3 py-2">
              {saveMode ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Filter name..."
                    className="h-7 text-xs"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                  <Button variant="ghost" size="icon-sm" onClick={handleSave}>
                    <Save className="h-3.5 w-3.5 text-emerald-400" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setSaveMode(false)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs" onClick={() => setSaveMode(true)}>
                  <Save className="h-3.5 w-3.5" />
                  Save current filters
                </Button>
              )}
            </div>

            {savedFilters.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                No saved filters yet
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {savedFilters.map((f) => (
                  <div key={f.id} className="flex items-center gap-1 px-2 py-1.5 hover:bg-muted/50">
                    <button
                      className="flex-1 truncate text-left text-xs"
                      onClick={() => { onApply(f.state); setOpen(false) }}
                      title={f.name}
                    >
                      {f.name}
                    </button>
                    <Button variant="ghost" size="icon-sm" onClick={() => remove(f.id)} className="shrink-0">
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
