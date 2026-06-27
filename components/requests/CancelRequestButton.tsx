'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelRequest } from '@/app/actions/requests'
import { Button } from '@/components/ui/Button'

export function CancelRequestButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function onCancel() {
    startTransition(async () => {
      const res = await cancelRequest(id)
      if (res.ok) router.refresh()
    })
  }

  if (!confirming) {
    return (
      <Button variant="ghost" onClick={() => setConfirming(true)}>
        Cancel request
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-ink-soft">Are you sure?</span>
      <Button variant="danger" size="sm" onClick={onCancel} disabled={pending}>
        {pending ? 'Cancelling…' : 'Yes, cancel'}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        No
      </Button>
    </div>
  )
}
