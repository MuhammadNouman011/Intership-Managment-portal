import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

const fieldClass =
  'h-10 w-full rounded-[var(--radius-base)] border border-line bg-surface px-3 text-sm text-ink ' +
  'placeholder:text-ink-soft/60 transition-colors focus:border-primary focus:outline-none ' +
  'focus:ring-2 focus:ring-primary/30 disabled:opacity-60'

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={cn(fieldClass, error && 'border-[var(--st-rejected)] focus:ring-[var(--st-rejected)]/30', className)}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[var(--st-rejected)]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  )
})
