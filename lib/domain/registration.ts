/**
 * Domain logic for COMSATS Sahiwal student identity.
 *
 * A student email looks like `fa24-bse-011@students.cuisahiwal.edu.pk`, which
 * encodes the session (`FA24`), program (`BSE`), and roll number (`011`). From
 * these we derive the registration number `CIIT/FA24-BSE-011/SWL`.
 */

export const STUDENT_EMAIL_DOMAIN = 'students.cuisahiwal.edu.pk'

/** Campus suffix on every registration number. */
export const CAMPUS_CODE = 'SWL'

/** Supported CS program codes mapped to their full degree names. */
export const PROGRAMS = {
  BCS: 'BS Computer Science',
  BSE: 'BS Software Engineering',
} as const

export type ProgramCode = keyof typeof PROGRAMS

export interface ParsedStudentEmail {
  session: string
  program: ProgramCode
  roll: string
}

/** True when the email belongs to the university student domain. */
export function isStudentEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith('@' + STUDENT_EMAIL_DOMAIN)
}

/**
 * Parses a student email into its components, or returns null if the email is
 * not a valid student email for a supported program.
 */
export function parseStudentEmail(email: string): ParsedStudentEmail | null {
  const normalized = email.trim().toLowerCase()
  if (!isStudentEmail(normalized)) return null

  const local = normalized.split('@')[0]
  // session: 2 letters + 2 digits (fa24), program: 3 letters, roll: 1-4 digits
  const match = local.match(/^([a-z]{2}\d{2})-([a-z]{3})-(\d{1,4})$/)
  if (!match) return null

  const session = match[1].toUpperCase()
  const program = match[2].toUpperCase()
  const roll = match[3]

  if (!(program in PROGRAMS)) return null

  return { session, program: program as ProgramCode, roll }
}

/** Builds the canonical registration number, e.g. `CIIT/FA24-BSE-011/SWL`. */
export function buildRegNumber(p: {
  session: string
  program: string
  roll: string
}): string {
  return `CIIT/${p.session}-${p.program}-${p.roll}/${CAMPUS_CODE}`
}
