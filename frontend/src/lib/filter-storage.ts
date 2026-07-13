export interface FilterState {
  search: string
  statuses: string[]
}

export interface SavedFilter {
  id: string
  name: string
  state: FilterState
  createdAt: string
}

const STORAGE_KEY = 'saved-filters'

export function getSavedFilters(): SavedFilter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveFilter(name: string, state: FilterState): SavedFilter[] {
  const filters = getSavedFilters()
  const newFilter: SavedFilter = {
    id: crypto.randomUUID(),
    name,
    state,
    createdAt: new Date().toISOString(),
  }
  const updated = [...filters, newFilter]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function deleteFilter(id: string): SavedFilter[] {
  const filters = getSavedFilters().filter((f) => f.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  return filters
}
