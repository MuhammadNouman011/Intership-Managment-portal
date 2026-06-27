import { cn } from '@/lib/cn'

/**
 * The Registry seal — the product's signature element. An embossed official
 * stamp carrying the reference serial, echoing the certified letter the system
 * produces. Used as the brand mark, on issued letters, and on the verify page.
 */
export function Seal({
  serial,
  state = 'valid',
  size = 96,
  className,
}: {
  serial?: string
  state?: 'valid' | 'revoked' | 'blank'
  size?: number
  className?: string
}) {
  const ring =
    state === 'revoked' ? 'var(--st-rejected)' : state === 'valid' ? 'var(--seal)' : 'var(--ink-soft)'
  const arcTop = 'COMSATS · SAHIWAL'
  const arcBottom = 'DEPARTMENT OF CS'

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Official seal">
        <defs>
          <path id="seal-arc-top" d="M 18,50 A 32,32 0 0 1 82,50" fill="none" />
          <path id="seal-arc-bottom" d="M 82,50 A 32,32 0 0 1 18,50" fill="none" />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke={ring} strokeWidth="1" opacity="0.45" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={ring} strokeWidth="2.5" />
        <circle cx="50" cy="50" r="33" fill="none" stroke={ring} strokeWidth="0.75" opacity="0.5" />
        <g fill={ring} style={{ fontFamily: 'var(--font-mono)', fontSize: 6.4, letterSpacing: '0.18em' }}>
          <text>
            <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">
              {arcTop}
            </textPath>
          </text>
          <text>
            <textPath href="#seal-arc-bottom" startOffset="50%" textAnchor="middle">
              {arcBottom}
            </textPath>
          </text>
        </g>
        {/* center monogram */}
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill={ring}
          style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600 }}
        >
          IRMS
        </text>
      </svg>
      {serial && (
        <span
          className="serial absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-surface px-1.5 text-[10px]"
          style={{ color: ring }}
        >
          {serial}
        </span>
      )}
    </div>
  )
}
