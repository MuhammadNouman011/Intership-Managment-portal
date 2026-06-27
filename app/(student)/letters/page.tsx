import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Seal } from '@/components/ui/Seal'

function fmt(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function LettersPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await getServerClient()
  const { data: letters } = await supabase
    .from('letters')
    .select('id, serial_number, issue_date, is_revoked, requests(position, companies(name)), download_history(downloaded_at)')
    .eq('student_id', user.id)
    .order('issue_date', { ascending: false })

  const rows = letters ?? []

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-6">
        <p className="eyebrow">Issued documents</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">My letters</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Download, print, and get your letter stamped at the internship office.
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="No letters yet"
          description="Once a request is approved, your sealed reference letter appears here."
          action={
            <Link href="/requests/new">
              <Button>Request a letter</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {rows.map((l) => {
            const req = Array.isArray(l.requests) ? l.requests[0] : l.requests
            const company = req && (Array.isArray(req.companies) ? req.companies[0] : req.companies)
            const downloads = Array.isArray(l.download_history) ? l.download_history.length : 0
            return (
              <Card key={l.id}>
                <CardBody className="flex items-center gap-5">
                  <Seal size={64} state={l.is_revoked ? 'revoked' : 'valid'} />
                  <div className="min-w-0 flex-1">
                    <p className="serial text-sm text-ink">{l.serial_number}</p>
                    <p className="mt-0.5 font-medium text-ink">{company?.name ?? '—'}</p>
                    <p className="text-xs text-ink-soft">
                      {req?.position} · Issued {fmt(l.issue_date)}
                      {downloads > 0 && ` · Downloaded ${downloads}×`}
                    </p>
                  </div>
                  {l.is_revoked ? (
                    <span className="text-sm text-[var(--st-rejected)]">Revoked</span>
                  ) : (
                    <a href={`/api/letters/${l.id}/download`}>
                      <Button variant="seal">{downloads > 0 ? 'Download again' : 'Download'}</Button>
                    </a>
                  )}
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
