'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { verifySignupOtp, type ActionResult } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const initial: ActionResult = {}

export function OtpForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(verifySignupOtp, initial)

  return (
    <div>
      <p className="eyebrow mb-2">Verify your email</p>
      <h1 className="font-serif text-2xl font-semibold text-ink">Enter your code</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        We sent a 6-digit code to{' '}
        <span className="text-ink">{email || 'your university email'}</span>.
      </p>

      <form action={action} className="mt-7 space-y-4">
        {state.error && (
          <p className="rounded-md border border-[var(--st-rejected)]/30 bg-[var(--st-rejected)]/10 px-3 py-2 text-sm text-[var(--st-rejected)]">
            {state.error}
          </p>
        )}
        <input type="hidden" name="email" value={email} />
        <Input
          label="6-digit code"
          name="token"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          className="serial text-center text-lg tracking-[0.4em]"
          required
        />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? 'Verifying…' : 'Verify & continue'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Wrong email?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Start over
        </Link>
      </p>
    </div>
  )
}
