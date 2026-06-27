import { describe, it, expect } from 'vitest'
import { countByStatus, byMonth, bySemester, topCompanies, type AggRow } from './aggregate'

const rows: AggRow[] = [
  { status: 'approved', created_at: '2026-06-10', semester: 5, company: 'Systems' },
  { status: 'approved', created_at: '2026-06-12', semester: 5, company: 'Systems' },
  { status: 'pending', created_at: '2026-05-01', semester: 6, company: 'Netsol' },
  { status: 'rejected', created_at: '2026-06-01', semester: 5, company: 'Netsol' },
]

describe('countByStatus', () => {
  it('counts in display order', () => {
    expect(countByStatus(rows)).toEqual([
      { label: 'pending', value: 1 },
      { label: 'approved', value: 2 },
      { label: 'rejected', value: 1 },
    ])
  })
})

describe('byMonth', () => {
  it('buckets into the last N months ending at `now`', () => {
    const out = byMonth(rows, 3, new Date('2026-06-15'))
    expect(out).toHaveLength(3)
    expect(out[out.length - 1].value).toBe(3) // June: 3 requests
    expect(out[out.length - 2].value).toBe(1) // May: 1
  })
})

describe('bySemester', () => {
  it('counts per semester sorted', () => {
    expect(bySemester(rows)).toEqual([
      { label: 'Sem 5', value: 3 },
      { label: 'Sem 6', value: 1 },
    ])
  })
})

describe('topCompanies', () => {
  it('ranks by count', () => {
    expect(topCompanies(rows, 2)).toEqual([
      { label: 'Systems', value: 2 },
      { label: 'Netsol', value: 2 },
    ])
  })
})
