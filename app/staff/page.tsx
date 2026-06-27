import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'

function isToday(iso: string) {
  const d = new Date(iso)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

export default async function StaffDashboard() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!isStaff(user.role)) redirect('/dashboard')

  const supabase = await getServerClient()
  const { data } = await supabase.from('requests').select('status, created_at').limit(2000)
  const all = data ?? []
  const count = (s: string) => all.filter((r) => r.status === s).length
  const today = all.filter((r) => isToday(r.created_at as string)).length

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Coordination desk</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">Overview</h1>
        </div>
        <Link href="/staff/requests">
          <Button>Open request queue</Button>
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total" value={all.length} />
        <StatCard label="Pending" value={count('pending')} accent="pending" />
        <StatCard label="Approved" value={count('approved')} accent="approved" />
        <StatCard label="Rejected" value={count('rejected')} accent="rejected" />
        <StatCard label="Today" value={today} accent="seal" />
      </div>

      {count('pending') > 0 && (
        <div className="mt-6 rounded-[calc(var(--radius-base)+2px)] border border-[var(--st-pending)]/30 bg-[var(--st-pending)]/10 px-5 py-4">
          <p className="text-sm text-[var(--st-pending)]">
            {count('pending')} request{count('pending') === 1 ? '' : 's'} waiting for review.{' '}
            <Link href="/staff/requests" className="font-medium underline">
              Review now
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
