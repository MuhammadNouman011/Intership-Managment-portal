import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { RankBars } from '@/components/charts/RankBars'
import { countByStatus } from '@/lib/reports/aggregate'

export default async function StudentDashboard() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await getServerClient()
  const { data: requests } = await supabase
    .from('requests')
    .select('status')
    .eq('student_id', user.id)

  const all = requests ?? []
  const count = (s: string) => all.filter((r) => r.status === s).length

  const profileIncomplete = !user.full_name

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Welcome</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
            {user.full_name ?? 'Your dashboard'}
          </h1>
        </div>
        <Link href="/requests/new">
          <Button>New request</Button>
        </Link>
      </header>

      {profileIncomplete && (
        <Card className="mb-6 border-[var(--st-pending)]/30">
          <CardBody className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-ink">Complete your profile first</p>
              <p className="text-sm text-ink-soft">
                Your name and semester appear on every reference letter.
              </p>
            </div>
            <Link href="/profile">
              <Button variant="outline">Go to profile</Button>
            </Link>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total requests" value={all.length} />
        <StatCard label="Approved" value={count('approved')} accent="approved" />
        <StatCard label="Pending" value={count('pending')} accent="pending" />
        <StatCard label="Rejected" value={count('rejected')} accent="rejected" />
      </div>

      {all.length > 0 && (
        <Card className="mt-6">
          <CardHeader eyebrow="Breakdown" title="Your requests by status" />
          <CardBody>
            <RankBars data={countByStatus(all.map((r) => ({ status: r.status, created_at: '' })))} useStatusColors />
          </CardBody>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/requests" className="group">
          <Card className="transition-colors group-hover:border-primary/40">
            <CardBody>
              <p className="font-serif text-lg font-semibold text-ink">My requests</p>
              <p className="mt-1 text-sm text-ink-soft">Track status and edit pending requests.</p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/letters" className="group">
          <Card className="transition-colors group-hover:border-primary/40">
            <CardBody>
              <p className="font-serif text-lg font-semibold text-ink">My letters</p>
              <p className="mt-1 text-sm text-ink-soft">Download your sealed reference letters.</p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  )
}
