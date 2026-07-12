import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
}

let toastListeners: ((toast: Toast) => void)[] = []
let toastId = 0

export function toast(toastData: Omit<Toast, "id">) {
  const id = String(++toastId)
  const newToast = { ...toastData, id }
  toastListeners.forEach((listener) => listener(newToast))
  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  // Register listener on mount
  useState(() => {
    toastListeners.push(addToast)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast)
    }
  })

  return { toasts, dismissToast }
}
