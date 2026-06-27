'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

/** Recent notifications for the current user, plus the unread count. */
export async function listNotifications(): Promise<{ items: NotificationItem[]; unread: number }> {
  const user = await getCurrentUser()
  if (!user) return { items: [], unread: 0 }

  const supabase = await getServerClient()
  const { data } = await supabase
    .from('notifications')
    .select('id, type, title, message, link, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const items = (data ?? []) as NotificationItem[]
  return { items, unread: items.filter((n) => !n.is_read).length }
}

export async function markRead(id: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return
  const supabase = await getServerClient()
  await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user.id)
}

export async function markAllRead(): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return
  const supabase = await getServerClient()
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
}
