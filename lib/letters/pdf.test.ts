import { describe, it, expect } from 'vitest'
import { buildLetterPdf } from './pdf'

describe('buildLetterPdf', () => {
  it('produces a non-empty PDF byte stream', async () => {
    const bytes = await buildLetterPdf({
      serial: 'IRMS-2026-000001',
      issueDate: '27 Jun 2026',
      fullName: 'Muhammad Ali',
      regNumber: 'CIIT/FA24-BSE-011/SWL',
      programFull: 'BS Software Engineering',
      semester: 5,
      company: 'Systems Limited',
      position: 'Software Engineering Intern',
      verifyUrl: 'http://localhost:3000/verify/abc123',
      signatory: 'Dr. Coordinator',
    })
    expect(bytes.length).toBeGreaterThan(800)
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe('%PDF')
  })
})
