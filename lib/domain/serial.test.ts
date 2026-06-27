import { describe, it, expect } from 'vitest'
import { formatSerial } from './serial'

describe('formatSerial', () => {
  it('zero-pads to 6 digits with year', () => {
    expect(formatSerial(2026, 1)).toBe('IRMS-2026-000001')
  })

  it('keeps larger numbers intact', () => {
    expect(formatSerial(2026, 123456)).toBe('IRMS-2026-123456')
  })
})
