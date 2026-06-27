import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequestsTable, type RequestRow } from '@/components/requests/RequestsTable'

export default async function MyRequestsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await getServerClient()
  const { data } = await supabase
    .from('requests')
    .select('id, position, status, created_at, companies(name, city)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  const rows: RequestRow[] = (data ?? []).map((r) => {
    const company = Array.isArray(r.companies) ? r.companies[0] : r.companies
    return {
      id: r.id as string,
      position: r.position as string,
      status: r.status as RequestRow['status'],
      created_at: r.created_at as string,
      company: company?.name ?? '—',
      city: company?.city ?? '',
    }
  })

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your applications</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">My requests</h1>
        </div>
        <Link href="/requests/new">
          <Button>New request</Button>
        </Link>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="No requests yet"
          description="Request your first internship reference letter — it only takes a minute."
          action={
            <Link href="/requests/new">
              <Button>Request a letter</Button>
            </Link>
          }
        />
      ) : (
        <RequestsTable rows={rows} />
      )}
    </div>
  )
}
