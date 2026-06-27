import { describe, it, expect } from 'vitest'
import { validateProfile, profileHasErrors, type ProfileInput } from './profile'

const valid: ProfileInput = {
  full_name: 'Muhammad Ali',
  semester: 5,
  section: 'A',
  phone: '03001234567',
}

describe('validateProfile', () => {
  it('accepts a valid profile', () => {
    expect(profileHasErrors(validateProfile(valid))).toBe(false)
  })

  it('rejects empty name', () => {
    expect(validateProfile({ ...valid, full_name: '' }).full_name).toBeDefined()
  })

  it('rejects out-of-range semester', () => {
    expect(validateProfile({ ...valid, semester: 9 }).semester).toContain('between 1 and 8')
    expect(validateProfile({ ...valid, semester: null }).semester).toBeDefined()
  })

  it('rejects a bad phone number', () => {
    expect(validateProfile({ ...valid, phone: 'abc' }).phone).toBeDefined()
  })

  it('rejects a malformed CNIC but allows empty', () => {
    expect(validateProfile({ ...valid, cnic: '123' }).cnic).toBeDefined()
    expect(validateProfile({ ...valid, cnic: '36502-1234567-1' }).cnic).toBeUndefined()
  })
})
