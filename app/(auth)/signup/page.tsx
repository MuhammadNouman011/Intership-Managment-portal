'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUpStudent, type ActionResult } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const initial: ActionResult = {}

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUpStudent, initial)

  return (
    <div>
      <p className="eyebrow mb-2">Students only</p>
      <h1 className="font-serif text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        We&apos;ll email a 6-digit code to verify it&apos;s you.
      </p>

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
          hint="Only @students.cuisahiwal.edu.pk emails (BCS / BSE) can register."
          error={state.fieldErrors?.email}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={state.fieldErrors?.password}
          required
        />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? 'Sending code…' : 'Send verification code'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
