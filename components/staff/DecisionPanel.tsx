'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { decide } from '@/app/actions/decisions'
import { decisionRequiresReason, type DecisionAction } from '@/lib/domain/decisions'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { RequestStatus } from '@/components/ui/StatusPill'

export function DecisionPanel({
  id,
  status,
  currentReason,
  currentNotes,
}: {
  id: string
  status: RequestStatus
  currentReason: string
  currentNotes: string
}) {
  const [reason, setReason] = useState(currentReason)
  const [notes, setNotes] = useState(currentNotes)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const decided = status === 'approved'

  function run(action: DecisionAction) {
    setError('')
    if (decisionRequiresReason(action) && !reason.trim()) {
      setError('Please write a reason the student will see.')
      return
    }
    startTransition(async () => {
      const res = await decide(id, action, reason, notes)
      if (res.ok) router.refresh()
      else setError(res.error ?? 'Something went wrong.')
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader eyebrow="Decision" title="Take action" />
      <CardBody className="space-y-4">
        {decided && (
          <p className="rounded-md border border-[var(--st-approved)]/30 bg-[var(--st-approved)]/10 px-3 py-2 text-sm text-[var(--st-approved)]">
            This request is approved and the letter is issued.
          </p>
        )}
        {error && (
          <p className="rounded-md border border-[var(--st-rejected)]/30 bg-[var(--st-rejected)]/10 px-3 py-2 text-sm text-[var(--st-rejected)]">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reason" className="text-sm font-medium text-ink">
            Reason <span className="text-ink-soft">(shown to student on reject / return)</span>
          </label>
          <textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={decided}
            className="w-full rounded-[var(--radius-base)] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-ink">
            Internal notes <span className="text-ink-soft">(staff only)</span>
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-[var(--radius-base)] border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {!decided && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="seal" onClick={() => run('approve')} disabled={pending} className="col-span-2">
              {pending ? 'Working…' : 'Approve & issue letter'}
            </Button>
            <Button variant="outline" onClick={() => run('hold')} disabled={pending}>
              Hold
            </Button>
            <Button variant="outline" onClick={() => run('return')} disabled={pending}>
              Return
            </Button>
            <Button variant="danger" onClick={() => run('reject')} disabled={pending} className="col-span-2">
              Reject
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
