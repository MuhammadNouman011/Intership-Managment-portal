'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn, type ActionResult } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const initial: ActionResult = {}

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initial)

  return (
    <div>
      <p className="eyebrow mb-2">Welcome back</p>
      <h1 className="font-serif text-2xl font-semibold text-ink">Sign in to IRMS</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Use your university account.</p>

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
        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <div className="mt-1.5 text-right">
            <Link href="/forgot" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New here?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
