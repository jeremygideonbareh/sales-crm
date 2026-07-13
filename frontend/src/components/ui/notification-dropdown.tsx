import { useEffect, useState } from 'react'
import { CheckCheck, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notificationsApi } from '@/api/client'
import type { NotificationResponse } from '@/types'

interface Props {
  onClose: () => void
  onRead: () => void
}

const typeIcons: Record<string, string> = {
  demo_created: '📅',
  demo_completed: '✅',
  demo_scheduled: '📆',
  handover_created: '🤝',
  handover_completed: '✔️',
  deal_closed: '💰',
  lead_assigned: '📋',
}

export function NotificationDropdown({ onClose, onRead }: Props) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationsApi.list()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      onRead()
    } catch {
      // silent
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      onRead()
    } catch {
      // silent
    }
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 animate-scale-in rounded-lg border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="h-4 w-4" />
          Notifications
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="ghost" size="icon-sm" onClick={handleMarkAllRead} title="Mark all as read">
            <CheckCheck className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`flex w-full gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                !n.is_read ? 'border-l-2 border-emerald-400 bg-emerald-900/10' : ''
              }`}
            >
              <span className="mt-0.5 shrink-0">{typeIcons[n.type] || '🔔'}</span>
              <div className="min-w-0 flex-1">
                <p className={`truncate ${!n.is_read ? 'font-medium' : ''}`}>{n.title}</p>
                {n.message && <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.message}</p>}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
