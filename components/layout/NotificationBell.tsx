'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  listNotifications,
  markAllRead,
  markRead,
  type NotificationItem,
} from '@/app/actions/notifications'

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  async function refresh() {
    const { items, unread } = await listNotifications()
    setItems(items)
    setUnread(unread)
  }

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function openPanel() {
    setOpen((v) => !v)
    if (!open && unread > 0) {
      await markAllRead()
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={openPanel}
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:text-ink hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--st-rejected)] px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-[calc(var(--radius-base)+2px)] border border-line bg-surface shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="font-serif text-sm font-semibold text-ink">Notifications</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-soft">You&apos;re all caught up.</p>
            ) : (
              items.map((n) => {
                const body = (
                  <div className="border-b border-line px-4 py-3 last:border-0 hover:bg-surface-2">
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    {n.message && <p className="mt-0.5 text-xs text-ink-soft">{n.message}</p>}
                    <p className="mt-1 text-[11px] text-ink-soft">{timeAgo(n.created_at)}</p>
                  </div>
                )
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => markRead(n.id)}>
                    {body}
                  </Link>
                ) : (
                  <div key={n.id}>{body}</div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
