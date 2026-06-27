import { cn } from '@/lib/cn'

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[calc(var(--radius-base)+2px)] border border-line bg-surface shadow-[var(--shadow-sm)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  eyebrow,
  action,
}: {
  title: React.ReactNode
  eyebrow?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
      </div>
      {action}
    </div>
  )
}

export function CardBody({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}
