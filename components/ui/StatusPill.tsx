import { cn } from '@/lib/cn'

export type RequestStatus =
  | 'draft'
  | 'pending'
  | 'hold'
  | 'returned'
  | 'rejected'
  | 'approved'
  | 'cancelled'

const META: Record<RequestStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'var(--st-draft)' },
  pending: { label: 'Pending', color: 'var(--st-pending)' },
  hold: { label: 'On Hold', color: 'var(--st-hold)' },
  returned: { label: 'Returned for Correction', color: 'var(--st-returned)' },
  rejected: { label: 'Rejected', color: 'var(--st-rejected)' },
  approved: { label: 'Approved', color: 'var(--st-approved)' },
  cancelled: { label: 'Cancelled', color: 'var(--st-cancelled)' },
}

export function StatusPill({
  status,
  className,
}: {
  status: RequestStatus
  className?: string
}) {
  const { label, color } = META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}
