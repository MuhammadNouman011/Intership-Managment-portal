import { describe, it, expect } from 'vitest'
import { validateSignup, hasErrors } from './authValidation'

describe('validateSignup', () => {
  it('accepts a valid student email + password', () => {
    const e = validateSignup('fa24-bse-011@students.cuisahiwal.edu.pk', 'secret12')
    expect(hasErrors(e)).toBe(false)
  })

  it('rejects a non-university domain', () => {
    const e = validateSignup('someone@gmail.com', 'secret12')
    expect(e.email).toContain('@students.cuisahiwal.edu.pk')
  })

  it('rejects an unsupported program code', () => {
    const e = validateSignup('fa24-eee-011@students.cuisahiwal.edu.pk', 'secret12')
    expect(e.email).toBeDefined()
  })

  it('rejects a short password', () => {
    const e = validateSignup('fa24-bcs-011@students.cuisahiwal.edu.pk', 'short')
    expect(e.password).toContain('8 characters')
  })

  it('flags both fields when empty', () => {
    const e = validateSignup('', '')
    expect(e.email).toBeDefined()
    expect(e.password).toBeDefined()
  })
})
