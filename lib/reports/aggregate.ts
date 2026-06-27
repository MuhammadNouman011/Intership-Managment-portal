export interface AggRow {
  status: string
  created_at: string
  semester?: number | null
  company?: string | null
}

export interface Bucket {
  label: string
  value: number
}

/** Count requests per status, in a fixed display order. */
export function countByStatus(rows: AggRow[]): Bucket[] {
  const order = ['pending', 'approved', 'rejected', 'hold', 'returned', 'cancelled', 'draft']
  const counts = new Map<string, number>()
  for (const r of rows) counts.set(r.status, (counts.get(r.status) ?? 0) + 1)
  return order
    .filter((s) => counts.has(s))
    .map((s) => ({ label: s, value: counts.get(s)! }))
}

/** Requests per month for the last `months` months (oldest → newest). */
export function byMonth(rows: AggRow[], months = 6, now = new Date()): Bucket[] {
  const buckets: Bucket[] = []
  const keyToIdx = new Map<string, number>()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    keyToIdx.set(key, buckets.length)
    buckets.push({ label: d.toLocaleString('en-GB', { month: 'short' }), value: 0 })
  }
  for (const r of rows) {
    const d = new Date(r.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const idx = keyToIdx.get(key)
    if (idx != null) buckets[idx].value++
  }
  return buckets
}

/** Requests per semester (1–8). */
export function bySemester(rows: AggRow[]): Bucket[] {
  const counts = new Map<number, number>()
  for (const r of rows) {
    if (r.semester == null) continue
    counts.set(r.semester, (counts.get(r.semester) ?? 0) + 1)
  }
  return [...counts.keys()]
    .sort((a, b) => a - b)
    .map((s) => ({ label: `Sem ${s}`, value: counts.get(s)! }))
}

/** Top companies by request count. */
export function topCompanies(rows: AggRow[], limit = 5): Bucket[] {
  const counts = new Map<string, number>()
  for (const r of rows) {
    if (!r.company) continue
    counts.set(r.company, (counts.get(r.company) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }))
}
