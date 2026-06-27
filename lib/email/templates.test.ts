import { describe, it, expect } from 'vitest'
import { decisionEmail } from './templates'

describe('decisionEmail', () => {
  it('approve email includes the serial', () => {
    const e = decisionEmail('approve', { studentName: 'Ali', company: 'Systems', serial: 'IRMS-2026-000001' })
    expect(e.subject).toMatch(/approved/i)
    expect(e.html).toContain('IRMS-2026-000001')
    expect(e.html).toContain('Ali')
  })

  it('reject email includes the reason', () => {
    const e = decisionEmail('reject', { reason: 'Company not eligible' })
    expect(e.subject).toMatch(/rejected/i)
    expect(e.html).toContain('Company not eligible')
  })

  it('return email asks to resubmit', () => {
    const e = decisionEmail('return', { reason: 'Add HR email' })
    expect(e.html).toMatch(/again/i)
  })
})
