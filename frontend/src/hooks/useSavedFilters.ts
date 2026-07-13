import { useState, useEffect, useCallback } from 'react'
import { getSavedFilters, saveFilter, deleteFilter, type SavedFilter, type FilterState } from '@/lib/filter-storage'

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])

  useEffect(() => {
    setSavedFilters(getSavedFilters())
  }, [])

  const save = useCallback((name: string, state: FilterState) => {
    const updated = saveFilter(name, state)
    setSavedFilters(updated)
  }, [])

  const remove = useCallback((id: string) => {
    const updated = deleteFilter(id)
    setSavedFilters(updated)
  }, [])

  return { savedFilters, save, remove }
}
