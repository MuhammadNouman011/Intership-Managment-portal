import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { BarChart } from '@/components/charts/BarChart'
import { RankBars } from '@/components/charts/RankBars'
import { countByStatus, byMonth, bySemester, topCompanies, type AggRow } from '@/lib/reports/aggregate'

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
  const { data } = await supabase
    .from('requests')
    .select('status, created_at, profiles(semester), companies(name)')
    .limit(5000)

  const all: AggRow[] = (data ?? []).map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    const c = Array.isArray(r.companies) ? r.companies[0] : r.companies
    return {
      status: r.status as string,
      created_at: r.created_at as string,
      semester: p?.semester ?? null,
      company: c?.name ?? null,
    }
  })
  const count = (s: string) => all.filter((r) => r.status === s).length
  const today = all.filter((r) => isToday(r.created_at)).length

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

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[calc(var(--radius-base)+2px)] border border-line bg-surface px-5 py-4">
        <div className="mr-auto">
          <p className="font-serif text-base font-semibold text-ink">Export reports</p>
          <p className="text-sm text-ink-soft">Download all requests for your records.</p>
        </div>
        <a href="/api/reports/requests?format=csv">
          <Button variant="outline" size="sm">Export CSV</Button>
        </a>
        <a href="/api/reports/requests?format=pdf">
          <Button variant="outline" size="sm">Export PDF</Button>
        </a>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Trend" title="Requests per month" />
          <CardBody>
            <BarChart data={byMonth(all, 6)} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Breakdown" title="By status" />
          <CardBody>
            <RankBars data={countByStatus(all)} useStatusColors />
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Cohorts" title="By semester" />
          <CardBody>
            <RankBars data={bySemester(all)} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Employers" title="Top companies" />
          <CardBody>
            <RankBars data={topCompanies(all, 5)} />
          </CardBody>
        </Card>
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
