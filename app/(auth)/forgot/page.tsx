'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset, type ActionResult } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const initial: ActionResult = {}

export default function ForgotPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial)

  return (
    <div>
      <p className="eyebrow mb-2">Account recovery</p>
      <h1 className="font-serif text-2xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Enter your email and we&apos;ll send a reset link.
      </p>

      {state.ok ? (
        <div className="mt-7 rounded-md border border-[var(--st-approved)]/30 bg-[var(--st-approved)]/10 px-4 py-3 text-sm text-[var(--st-approved)]">
          If an account exists for that email, a reset link is on its way. Check your inbox.
        </div>
      ) : (
        <form action={action} className="mt-7 space-y-4">
          {state.error && (
            <p className="rounded-md border border-[var(--st-rejected)]/30 bg-[var(--st-rejected)]/10 px-3 py-2 text-sm text-[var(--st-rejected)]">
              {state.error}
            </p>
          )}
          <Input
            label="University email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="fa24-bse-011@students.cuisahiwal.edu.pk"
            required
          />
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
