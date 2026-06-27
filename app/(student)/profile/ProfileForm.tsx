'use client'

import { useActionState } from 'react'
import { saveProfile, type ProfileActionResult } from '@/app/actions/profile'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'

interface Initial {
  full_name: string
  semester: number | null
  section: string
  phone: string
  cnic: string
  linkedin: string
}

const initialState: ProfileActionResult = {}

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState(saveProfile, initialState)

  return (
    <Card>
      <CardBody>
        <form action={action} className="space-y-4">
          {state.ok && (
            <p className="rounded-md border border-[var(--st-approved)]/30 bg-[var(--st-approved)]/10 px-3 py-2 text-sm text-[var(--st-approved)]">
              Profile saved.
            </p>
          )}
          {state.error && (
            <p className="rounded-md border border-[var(--st-rejected)]/30 bg-[var(--st-rejected)]/10 px-3 py-2 text-sm text-[var(--st-rejected)]">
              {state.error}
            </p>
          )}

          <Input
            label="Full name"
            name="full_name"
            defaultValue={initial.full_name}
            error={state.fieldErrors?.full_name}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="semester" className="text-sm font-medium text-ink">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                defaultValue={initial.semester ?? ''}
                className="h-10 w-full rounded-[var(--radius-base)] border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              >
                <option value="" disabled>
                  Select
                </option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.semester && (
                <p className="text-xs text-[var(--st-rejected)]">{state.fieldErrors.semester}</p>
              )}
            </div>
            <Input
              label="Section"
              name="section"
              defaultValue={initial.section}
              error={state.fieldErrors?.section}
              required
            />
          </div>

          <Input
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={initial.phone}
            placeholder="03001234567"
            error={state.fieldErrors?.phone}
            required
          />
          <Input
            label="CNIC (optional)"
            name="cnic"
            defaultValue={initial.cnic}
            placeholder="36502-1234567-1"
            error={state.fieldErrors?.cnic}
          />
          <Input
            label="LinkedIn (optional)"
            name="linkedin"
            defaultValue={initial.linkedin}
            placeholder="https://linkedin.com/in/…"
          />

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
