/**
 * Role-based access control.
 *
 * Roles form a hierarchy where a higher role inherits the permissions of the
 * lower staff roles:  admin > hod > coordinator > student.
 *
 * `student` is special: only an explicit `student` requirement matches a
 * student. Staff requirements are satisfied by any role at or above the
 * required staff level.
 */
export type Role = 'student' | 'coordinator' | 'hod' | 'admin'

const RANK: Record<Role, number> = {
  student: 0,
  coordinator: 1,
  hod: 2,
  admin: 3,
}

const STAFF_ROLES: Role[] = ['coordinator', 'hod', 'admin']

/** True when the role is one of the staff roles. */
export function isStaff(role: Role | null | undefined): boolean {
  return !!role && STAFF_ROLES.includes(role)
}

/**
 * Returns true when `role` satisfies at least one of the `required` roles,
 * honoring the staff hierarchy (a higher staff role satisfies a lower one).
 */
export function requireRole(
  required: Role | Role[],
  role: Role | null | undefined,
): boolean {
  if (!role) return false
  const reqs = Array.isArray(required) ? required : [required]
  return reqs.some((req) => {
    if (req === 'student') return role === 'student'
    // staff requirement: caller must be staff and rank >= required rank
    return isStaff(role) && RANK[role] >= RANK[req]
  })
}
