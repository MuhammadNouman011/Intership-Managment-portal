import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatusPill, type RequestStatus } from '@/components/ui/StatusPill'
import { DecisionPanel } from '@/components/staff/DecisionPanel'

function fmt(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function StaffRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!isStaff(user.role)) redirect('/dashboard')

  const supabase = await getServerClient()
  const { data: r } = await supabase
    .from('requests')
    .select(
      'id, position, type, duration, expected_joining_date, remarks, status, reject_reason, admin_notes, created_at, profiles(full_name, reg_number, program, semester, section, phone, email), companies(name, city, address, country, hr_name, hr_email), letters(serial_number)',
    )
    .eq('id', id)
    .maybeSingle()

  if (!r) notFound()

  const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
  const c = Array.isArray(r.companies) ? r.companies[0] : r.companies
  const letter = Array.isArray(r.letters) ? r.letters[0] : r.letters
  const status = r.status as RequestStatus

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link href="/staff/requests" className="text-sm text-ink-soft hover:text-ink">
        ← Back to queue
      </Link>

      <header className="mt-3 mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Review request</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">{p?.full_name ?? '—'}</h1>
          <p className="serial mt-1 text-sm text-ink-soft">{p?.reg_number}</p>
        </div>
        <StatusPill status={status} />
      </header>

      {letter?.serial_number && (
        <p className="mb-6 rounded-md border border-[var(--st-approved)]/30 bg-[var(--st-approved)]/10 px-4 py-2.5 text-sm text-[var(--st-approved)]">
          Letter issued · <span className="serial">{letter.serial_number}</span>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader eyebrow="Applicant" title="Student details" />
            <CardBody className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Program" value={p?.program} />
              <Field label="Semester" value={p?.semester != null ? `Semester ${p.semester}` : '—'} />
              <Field label="Section" value={p?.section} />
              <Field label="Phone" value={p?.phone} />
              <Field label="Email" value={p?.email} className="col-span-full" mono />
            </CardBody>
          </Card>
          <Card>
            <CardHeader eyebrow="Application" title="Internship" />
            <CardBody className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Company" value={c?.name} />
              <Field label="City" value={c?.city} />
              <Field label="Address" value={c?.address} className="col-span-full" />
              <Field label="Position" value={r.position} />
              <Field label="Type" value={r.type} className="capitalize" />
              <Field label="Duration" value={r.duration} />
              <Field label="Expected joining" value={fmt(r.expected_joining_date)} />
              <Field label="HR contact" value={c?.hr_name ? `${c.hr_name}${c.hr_email ? ` · ${c.hr_email}` : ''}` : '—'} className="col-span-full" />
              {r.remarks && <Field label="Remarks" value={r.remarks} className="col-span-full" />}
            </CardBody>
          </Card>
        </div>

        <DecisionPanel
          id={r.id}
          status={status}
          currentReason={r.reject_reason ?? ''}
          currentNotes={r.admin_notes ?? ''}
        />
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  className,
  mono,
}: {
  label: string
  value?: string | number | null
  className?: string
  mono?: boolean
}) {
  return (
    <div className={className}>
      <p className="eyebrow">{label}</p>
      <p className={`mt-1 text-ink ${mono ? 'serial' : ''}`}>{value || '—'}</p>
    </div>
  )
}
