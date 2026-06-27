import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { isEditable } from '@/lib/domain/requests'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatusPill, type RequestStatus } from '@/components/ui/StatusPill'
import { CancelRequestButton } from '@/components/requests/CancelRequestButton'

function fmt(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await getServerClient()
  const { data: r } = await supabase
    .from('requests')
    .select(
      'id, position, type, duration, expected_joining_date, remarks, status, reject_reason, created_at, companies(name, city, address, country), letters(serial_number, is_revoked)',
    )
    .eq('id', id)
    .eq('student_id', user.id)
    .maybeSingle()

  if (!r) notFound()

  const company = Array.isArray(r.companies) ? r.companies[0] : r.companies
  const letter = Array.isArray(r.letters) ? r.letters[0] : r.letters
  const status = r.status as RequestStatus
  const editable = isEditable(status)

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link href="/requests" className="text-sm text-ink-soft hover:text-ink">
        ← Back to requests
      </Link>

      <header className="mt-3 mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Request</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">{company?.name ?? '—'}</h1>
          <p className="mt-1 text-sm text-ink-soft">{r.position}</p>
        </div>
        <StatusPill status={status} />
      </header>

      {(status === 'rejected' || status === 'returned') && r.reject_reason && (
        <div className="mb-6 rounded-md border border-[var(--st-rejected)]/30 bg-[var(--st-rejected)]/10 px-4 py-3 text-sm text-[var(--st-rejected)]">
          <p className="font-medium">
            {status === 'returned' ? 'Returned for correction' : 'Rejected'}
          </p>
          <p className="mt-0.5">{r.reject_reason}</p>
        </div>
      )}

      {status === 'approved' && letter && (
        <Card className="mb-6 border-[var(--st-approved)]/30">
          <CardBody className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Issued letter</p>
              <p className="serial mt-1 text-sm text-ink">{letter.serial_number}</p>
            </div>
            <Link href={`/letters`}>
              <Button variant="seal">Download letter</Button>
            </Link>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader eyebrow="Details" title="Application" />
        <CardBody className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Field label="Company" value={company?.name} />
          <Field label="City" value={company?.city} />
          <Field label="Country" value={company?.country} />
          <Field label="Position" value={r.position} />
          <Field label="Type" value={r.type} className="capitalize" />
          <Field label="Duration" value={r.duration} />
          <Field label="Expected joining" value={fmt(r.expected_joining_date)} />
          <Field label="Submitted" value={fmt(r.created_at)} />
          {r.remarks && <Field label="Remarks" value={r.remarks} className="col-span-full" />}
        </CardBody>
      </Card>

      {editable && (
        <div className="mt-6 flex items-center justify-end gap-3">
          <CancelRequestButton id={r.id} />
          <Link href={`/requests/${r.id}/edit`}>
            <Button variant="outline">Edit request</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  className,
}: {
  label: string
  value?: string | null
  className?: string
}) {
  return (
    <div className={className}>
      <p className="eyebrow">{label}</p>
      <p className="mt-1 text-ink">{value || '—'}</p>
    </div>
  )
}
