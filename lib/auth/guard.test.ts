import { describe, it, expect } from 'vitest'
import { requireRole, isStaff } from './guard'

describe('requireRole', () => {
  it('admin satisfies any staff requirement', () => {
    expect(requireRole(['coordinator'], 'admin')).toBe(true)
    expect(requireRole(['hod'], 'admin')).toBe(true)
  })

  it('hod satisfies a coordinator requirement (hierarchy)', () => {
    expect(requireRole(['coordinator'], 'hod')).toBe(true)
  })

  it('coordinator does NOT satisfy an admin-only requirement', () => {
    expect(requireRole(['admin'], 'coordinator')).toBe(false)
  })

  it('student cannot access a staff route', () => {
    expect(requireRole(['coordinator', 'hod', 'admin'], 'student')).toBe(false)
  })

  it('exact role match passes', () => {
    expect(requireRole('student', 'student')).toBe(true)
  })

  it('no role fails', () => {
    expect(requireRole('student', null)).toBe(false)
  })
})

describe('isStaff', () => {
  it('true for coordinator/hod/admin', () => {
    expect(isStaff('coordinator')).toBe(true)
    expect(isStaff('hod')).toBe(true)
    expect(isStaff('admin')).toBe(true)
  })
  it('false for student/null', () => {
    expect(isStaff('student')).toBe(false)
    expect(isStaff(null)).toBe(false)
  })
})
