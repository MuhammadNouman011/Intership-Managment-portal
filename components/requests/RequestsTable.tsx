'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { StatusPill, type RequestStatus } from '@/components/ui/StatusPill'
import { cn } from '@/lib/cn'

export interface RequestRow {
  id: string
  position: string
  status: RequestStatus
  created_at: string
  company: string
  city: string
}

const FILTERS: Array<{ key: 'all' | RequestStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'draft', label: 'Drafts' },
]

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function RequestsTable({ rows }: { rows: RequestRow[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | RequestStatus>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false
      if (!q) return true
      return r.company.toLowerCase().includes(q) || r.position.toLowerCase().includes(q)
    })
  }, [rows, query, filter])

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or position…"
          className="h-9 w-full rounded-[var(--radius-base)] border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-xs"
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

      <div className="overflow-hidden rounded-[calc(var(--radius-base)+2px)] border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-3 font-medium text-ink-soft">Company</th>
              <th className="px-4 py-3 font-medium text-ink-soft">Position</th>
              <th className="hidden px-4 py-3 font-medium text-ink-soft sm:table-cell">Date</th>
              <th className="px-4 py-3 font-medium text-ink-soft">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{r.company}</p>
                  {r.city && <p className="text-xs text-ink-soft">{r.city}</p>}
                </td>
                <td className="px-4 py-3 text-ink-soft">{r.position}</td>
                <td className="hidden px-4 py-3 text-ink-soft sm:table-cell">{fmtDate(r.created_at)}</td>
                <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/requests/${r.id}`} className="text-sm font-medium text-primary hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-soft">
                  No requests match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
