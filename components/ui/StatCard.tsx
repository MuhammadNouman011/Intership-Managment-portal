import { cn } from '@/lib/cn'

export function StatCard({
  label,
  value,
  accent,
  className,
}: {
  label: string
  value: number | string
  accent?: 'primary' | 'seal' | 'approved' | 'pending' | 'rejected'
  className?: string
}) {
  const color =
    accent === 'seal'
      ? 'var(--seal)'
      : accent === 'approved'
        ? 'var(--st-approved)'
        : accent === 'pending'
          ? 'var(--st-pending)'
          : accent === 'rejected'
            ? 'var(--st-rejected)'
            : 'var(--primary)'

  return (
    <div className={cn('rounded-[calc(var(--radius-base)+2px)] border border-line bg-surface p-5', className)}>
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
