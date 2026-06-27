import { describe, it, expect } from 'vitest'
import { toPublicLetterView } from './verify'

const row = {
  serial_number: 'IRMS-2026-000001',
  issue_date: '2026-06-27',
  is_revoked: false,
  profiles: {
    full_name: 'Muhammad Ali',
    reg_number: 'CIIT/FA24-BSE-011/SWL',
    program: 'BSE',
    semester: 5,
    // sensitive fields that must NOT leak even if present:
    phone: '03001234567',
    cnic: '36502-1234567-1',
  },
  requests: { companies: { name: 'Systems Limited' } },
}

describe('toPublicLetterView', () => {
  it('maps to public fields and full program name', () => {
    const v = toPublicLetterView(row)!
    expect(v.studentName).toBe('Muhammad Ali')
    expect(v.program).toBe('BS Software Engineering')
    expect(v.company).toBe('Systems Limited')
    expect(v.status).toBe('valid')
  })

  it('never includes sensitive fields', () => {
    const v = toPublicLetterView(row)! as Record<string, unknown>
    expect(v.phone).toBeUndefined()
    expect(v.cnic).toBeUndefined()
    expect(Object.keys(v).sort()).toEqual(
      ['company', 'issueDate', 'program', 'regNumber', 'semester', 'serial', 'status', 'studentName'].sort(),
    )
  })

  it('maps revoked status', () => {
    expect(toPublicLetterView({ ...row, is_revoked: true })!.status).toBe('revoked')
  })

  it('returns null for missing row', () => {
    expect(toPublicLetterView(null)).toBeNull()
  })
})
