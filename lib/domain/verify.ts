import { PROGRAMS, type ProgramCode } from './registration'

/** The only fields ever exposed on the public verification page. */
export interface PublicLetterView {
  serial: string
  studentName: string
  regNumber: string
  program: string
  semester: number | null
  company: string
  issueDate: string
  status: 'valid' | 'revoked'
}

/**
 * Maps a raw joined letter row to the public view, exposing ONLY whitelisted
 * fields (never phone, CNIC, email, etc.). Returns null for a missing row.
 */
export function toPublicLetterView(row: RawLetterRow | null | undefined): PublicLetterView | null {
  if (!row) return null
  const student = pickOne(row.profiles)
  const request = pickOne(row.requests)
  const company = request ? pickOne(request.companies) : null
  const programCode = student?.program as ProgramCode | undefined

  return {
    serial: row.serial_number,
    studentName: student?.full_name ?? '—',
    regNumber: student?.reg_number ?? '—',
    program: programCode ? (PROGRAMS[programCode] ?? programCode) : '—',
    semester: student?.semester ?? null,
    company: company?.name ?? '—',
    issueDate: row.issue_date,
    status: row.is_revoked ? 'revoked' : 'valid',
  }
}

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null
  return v ?? null
}

export interface RawLetterRow {
  serial_number: string
  issue_date: string
  is_revoked: boolean
  profiles?: { full_name?: string; reg_number?: string; program?: string; semester?: number | null } | Array<{ full_name?: string; reg_number?: string; program?: string; semester?: number | null }> | null
  requests?: { companies?: { name?: string } | Array<{ name?: string }> | null } | Array<{ companies?: { name?: string } | Array<{ name?: string }> | null }> | null
}
