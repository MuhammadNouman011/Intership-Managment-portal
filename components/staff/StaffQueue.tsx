'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusPill, type RequestStatus } from '@/components/ui/StatusPill'
import { Button } from '@/components/ui/Button'
import { bulkApprove } from '@/app/actions/decisions'
import { cn } from '@/lib/cn'

export interface StaffRow {
  id: string
  position: string
  status: RequestStatus
  created_at: string
  student: string
  reg: string
  semester: number | null
  company: string
  city: string
}

const FILTERS: Array<{ key: 'all' | RequestStatus; label: string }> = [
  { key: 'pending', label: 'Pending' },
  { key: 'hold', label: 'On hold' },
  { key: 'returned', label: 'Returned' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export function StaffQueue({ rows }: { rows: StaffRow[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | RequestStatus>('pending')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false
      if (!q) return true
      return (
        r.student.toLowerCase().includes(q) ||
        r.reg.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        String(r.semester ?? '').includes(q)
      )
    })
  }, [rows, query, filter])

  const selectable = filtered.filter((r) => r.status === 'pending')
  const allSelected = selectable.length > 0 && selectable.every((r) => selected.has(r.id))

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectable.map((r) => r.id)))
  }
  function approveSelected() {
    const ids = [...selected]
    startTransition(async () => {
      await bulkApprove(ids)
      setSelected(new Set())
      router.refresh()
    })
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, reg #, company, semester…"
          className="h-9 w-full rounded-[var(--radius-base)] border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter === f.key
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-line bg-surface text-ink-soft hover:text-ink',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-[var(--radius-base)] border border-primary/30 bg-primary-tint px-4 py-2.5">
          <span className="text-sm text-primary">{selected.size} selected</span>
          <Button size="sm" onClick={approveSelected} disabled={pending}>
            {pending ? 'Approving…' : `Approve ${selected.size}`}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-[calc(var(--radius-base)+2px)] border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all pending" />
              </th>
              <th className="px-4 py-3 font-medium text-ink-soft">Student</th>
              <th className="hidden px-4 py-3 font-medium text-ink-soft md:table-cell">Company</th>
              <th className="hidden px-4 py-3 font-medium text-ink-soft lg:table-cell">Sem</th>
              <th className="hidden px-4 py-3 font-medium text-ink-soft sm:table-cell">Date</th>
              <th className="px-4 py-3 font-medium text-ink-soft">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  {r.status === 'pending' && (
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Select ${r.student}`} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{r.student}</p>
                  <p className="serial text-xs text-ink-soft">{r.reg}</p>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <p className="text-ink">{r.company}</p>
                  <p className="text-xs text-ink-soft">{r.city}</p>
                </td>
                <td className="hidden px-4 py-3 text-ink-soft lg:table-cell">{r.semester ?? '—'}</td>
                <td className="hidden px-4 py-3 text-ink-soft sm:table-cell">{fmtDate(r.created_at)}</td>
                <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/staff/requests/${r.id}`} className="text-sm font-medium text-primary hover:underline">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-soft">
                  Nothing here right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
