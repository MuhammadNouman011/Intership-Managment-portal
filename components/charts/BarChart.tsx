import type { Bucket } from '@/lib/reports/aggregate'

/** Vertical bar chart (e.g. requests per month). Pure SVG, on-brand. */
export function BarChart({ data, height = 140 }: { data: Bucket[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const barW = 100 / Math.max(1, data.length)

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 22)
          const x = i * barW + barW * 0.2
          const w = barW * 0.6
          return (
            <g key={i}>
              <rect
                x={x}
                y={height - 18 - h}
                width={w}
                height={Math.max(h, d.value > 0 ? 2 : 0)}
                rx={1.5}
                fill="var(--primary)"
              />
              {d.value > 0 && (
                <text x={x + w / 2} y={height - 22 - h} textAnchor="middle" fontSize="6" fill="var(--ink-soft)">
                  {d.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="flex">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-ink-soft">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
