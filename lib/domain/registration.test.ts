import { describe, it, expect } from 'vitest'
import {
  parseStudentEmail,
  buildRegNumber,
  isStudentEmail,
  PROGRAMS,
} from './registration'

describe('parseStudentEmail', () => {
  it('parses a valid student email', () => {
    expect(parseStudentEmail('fa24-bse-011@students.cuisahiwal.edu.pk')).toEqual({
      session: 'FA24',
      program: 'BSE',
      roll: '011',
    })
  })

  it('is case-insensitive and uppercases session/program', () => {
    expect(parseStudentEmail('FA24-BSE-011@students.cuisahiwal.edu.pk')).toEqual({
      session: 'FA24',
      program: 'BSE',
      roll: '011',
    })
  })

  it('parses BCS too', () => {
    expect(parseStudentEmail('sp23-bcs-007@students.cuisahiwal.edu.pk')).toEqual({
      session: 'SP23',
      program: 'BCS',
      roll: '007',
    })
  })

  it('rejects unknown program codes', () => {
    expect(parseStudentEmail('fa24-eee-011@students.cuisahiwal.edu.pk')).toBeNull()
  })

  it('rejects wrong domain', () => {
    expect(parseStudentEmail('fa24-bse-011@gmail.com')).toBeNull()
  })

  it('rejects malformed local part', () => {
    expect(parseStudentEmail('hello@students.cuisahiwal.edu.pk')).toBeNull()
  })
})

describe('buildRegNumber', () => {
  it('builds CIIT/FA24-BSE-011/SWL', () => {
    expect(buildRegNumber({ session: 'FA24', program: 'BSE', roll: '011' })).toBe(
      'CIIT/FA24-BSE-011/SWL',
    )
  })
})

describe('isStudentEmail', () => {
  it('true for university domain', () => {
    expect(isStudentEmail('fa24-bcs-099@students.cuisahiwal.edu.pk')).toBe(true)
  })

  it('false otherwise', () => {
    expect(isStudentEmail('x@example.com')).toBe(false)
  })
})

describe('PROGRAMS', () => {
  it('maps codes to full names', () => {
    expect(PROGRAMS.BSE).toBe('BS Software Engineering')
    expect(PROGRAMS.BCS).toBe('BS Computer Science')
  })
})
