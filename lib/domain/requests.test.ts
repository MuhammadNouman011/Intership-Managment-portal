import { describe, it, expect } from 'vitest'
import {
  validateRequestInput,
  requestHasErrors,
  isEditable,
  companyKey,
  type RequestInput,
} from './requests'

const valid: RequestInput = {
  company_name: 'Systems Limited',
  company_address: '123 Tech Park',
  city: 'Lahore',
  country: 'Pakistan',
  position: 'Software Engineering Intern',
  type: 'onsite',
  duration: '8 weeks',
  expected_joining_date: '2026-07-01',
}

describe('validateRequestInput', () => {
  it('accepts a valid request', () => {
    expect(requestHasErrors(validateRequestInput(valid))).toBe(false)
  })

  it('flags missing required fields', () => {
    const e = validateRequestInput({ ...valid, company_name: '', position: '' })
    expect(e.company_name).toBeDefined()
    expect(e.position).toBeDefined()
  })

  it('rejects an invalid internship type', () => {
    expect(validateRequestInput({ ...valid, type: 'flexible' }).type).toBeDefined()
  })

  it('rejects a bad HR email but allows empty', () => {
    expect(validateRequestInput({ ...valid, hr_email: 'nope' }).hr_email).toBeDefined()
    expect(validateRequestInput({ ...valid, hr_email: 'hr@co.com' }).hr_email).toBeUndefined()
  })
})

describe('isEditable', () => {
  it('is true while open', () => {
    expect(isEditable('pending')).toBe(true)
    expect(isEditable('draft')).toBe(true)
    expect(isEditable('returned')).toBe(true)
  })
  it('is false once decided', () => {
    expect(isEditable('approved')).toBe(false)
    expect(isEditable('rejected')).toBe(false)
    expect(isEditable('cancelled')).toBe(false)
  })
})

describe('companyKey', () => {
  it('normalizes case and whitespace', () => {
    expect(companyKey('  Systems Limited ', 'Lahore')).toBe(companyKey('systems limited', 'lahore'))
  })
})
