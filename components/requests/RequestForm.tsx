'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { CompanyAutocomplete } from './CompanyAutocomplete'
import type { RequestActionResult } from '@/app/actions/requests'

type FormAction = (prev: RequestActionResult, fd: FormData) => Promise<RequestActionResult>

export interface RequestInitial {
  company_name?: string
  company_address?: string
  city?: string
  country?: string
  hr_name?: string
  hr_email?: string
  position?: string
  type?: string
  duration?: string
  expected_joining_date?: string
  remarks?: string
}

const empty: RequestActionResult = {}

export function RequestForm({
  action,
  initial = {},
  submitLabel = 'Submit request',
}: {
  action: FormAction
  initial?: RequestInitial
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, empty)
  const [confirm, setConfirm] = useState(false)
  const e = state.fieldErrors

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-md border border-[var(--st-rejected)]/30 bg-[var(--st-rejected)]/10 px-3 py-2 text-sm text-[var(--st-rejected)]">
          {state.error}
        </p>
      )}
      {state.duplicateWarning && (
        <div className="rounded-md border border-[var(--st-pending)]/40 bg-[var(--st-pending)]/10 px-3 py-2.5 text-sm text-[var(--st-pending)]">
          {state.duplicateWarning}
          <label className="mt-2 flex items-center gap-2 text-ink">
            <input type="checkbox" checked={confirm} onChange={(ev) => setConfirm(ev.target.checked)} />
            Yes, submit another request for this company.
          </label>
        </div>
      )}
      <input type="hidden" name="confirm" value={confirm ? 'true' : 'false'} />

      <Card>
        <CardHeader eyebrow="Where you're applying" title="Company information" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <CompanyAutocomplete defaultValue={initial.company_name} error={e?.company_name} />
          <Input label="City" name="city" defaultValue={initial.city} error={e?.city} required />
          <Input label="Address" name="company_address" defaultValue={initial.company_address} error={e?.company_address} required className="sm:col-span-2" />
          <Input label="Country" name="country" defaultValue={initial.country ?? 'Pakistan'} error={e?.country} required />
          <div />
          <Input label="HR name (optional)" name="hr_name" defaultValue={initial.hr_name} />
          <Input label="HR email (optional)" name="hr_email" type="email" defaultValue={initial.hr_email} error={e?.hr_email} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader eyebrow="About the internship" title="Internship details" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input label="Position" name="position" defaultValue={initial.position} error={e?.position} required />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="type" className="text-sm font-medium text-ink">Type</label>
            <select
              id="type"
              name="type"
              defaultValue={initial.type ?? ''}
              className="h-10 w-full rounded-[var(--radius-base)] border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="" disabled>Select</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
            {e?.type && <p className="text-xs text-[var(--st-rejected)]">{e.type}</p>}
          </div>
          <Input label="Duration" name="duration" placeholder="e.g. 8 weeks" defaultValue={initial.duration} error={e?.duration} required />
          <Input label="Expected joining date" name="expected_joining_date" type="date" defaultValue={initial.expected_joining_date} error={e?.expected_joining_date} required />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="remarks" className="text-sm font-medium text-ink">Remarks (optional)</label>
            <textarea
              id="remarks"
              name="remarks"
              rows={3}
              defaultValue={initial.remarks}
              className="w-full rounded-[var(--radius-base)] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" name="intent" value="draft" variant="outline" disabled={pending}>
          Save draft
        </Button>
        <Button type="submit" name="intent" value="submit" disabled={pending}>
          {pending ? 'Submitting…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
