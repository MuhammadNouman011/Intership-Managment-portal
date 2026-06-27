import { cn } from '@/lib/cn'

/**
 * An empty screen is an invitation to act — pair a clear line with the next
 * step the person can take.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[calc(var(--radius-base)+2px)] ' +
          'border border-dashed border-line-strong bg-surface px-6 py-14 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint text-primary">
          {icon}
        </div>
      )}
      <p className="font-serif text-lg font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
