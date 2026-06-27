import type { Bucket } from '@/lib/reports/aggregate'

const STATUS_COLOR: Record<string, string> = {
  pending: 'var(--st-pending)',
  approved: 'var(--st-approved)',
  rejected: 'var(--st-rejected)',
  hold: 'var(--st-hold)',
  returned: 'var(--st-returned)',
  cancelled: 'var(--st-cancelled)',
  draft: 'var(--st-draft)',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  hold: 'On hold',
  returned: 'Returned',
  cancelled: 'Cancelled',
  draft: 'Draft',
}

/** Horizontal ranked bars with label + value (status / semester / companies). */
export function RankBars({ data, useStatusColors }: { data: Bucket[]; useStatusColors?: boolean }) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-soft">No data yet.</p>
  }
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const color = useStatusColors ? (STATUS_COLOR[d.label] ?? 'var(--primary)') : 'var(--primary)'
        const label = useStatusColors ? (STATUS_LABEL[d.label] ?? d.label) : d.label
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-ink">{label}</span>
              <span className="serial text-ink-soft">{d.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
