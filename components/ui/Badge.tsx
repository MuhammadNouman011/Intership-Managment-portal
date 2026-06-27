import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'primary' | 'seal'

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-soft border-line',
  primary: 'bg-primary-tint text-primary border-primary/20',
  seal: 'bg-seal-tint text-seal border-seal/25',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
