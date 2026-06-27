'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/Input'
import type { CompanySuggestion } from '@/app/api/companies/suggest/route'

/** Sets an uncontrolled sibling input's value (so React/form picks it up). */
function setSibling(form: HTMLFormElement | null, name: string, value: string) {
  const el = form?.querySelector<HTMLInputElement>(`[name="${name}"]`)
  if (el && !el.value) el.value = value
}

export function CompanyAutocomplete({
  defaultValue,
  error,
}: {
  defaultValue?: string
  error?: string
}) {
  const [value, setValue] = useState(defaultValue ?? '')
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([])
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/companies/suggest?q=${encodeURIComponent(value)}`, {
          signal: ctrl.signal,
        })
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
        setOpen(true)
      } catch {
        /* aborted or offline — ignore */
      }
    }, 200)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [value])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function pick(s: CompanySuggestion) {
    setValue(s.name)
    const form = wrapRef.current?.closest('form') ?? null
    setSibling(form, 'city', s.city ?? '')
    setSibling(form, 'company_address', s.address ?? '')
    setSibling(form, 'country', s.country ?? '')
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        label="Company name"
        name="company_name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        error={error}
        required
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-[var(--radius-base)] border border-line bg-surface shadow-[var(--shadow-md)]">
          {suggestions.map((s, i) => (
            <li key={`${s.name}-${i}`}>
              <button
                type="button"
                onClick={() => pick(s)}
                className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-surface-2"
              >
                <span className="text-sm text-ink">{s.name}</span>
                {s.city && <span className="text-xs text-ink-soft">{s.city}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
