import 'server-only'
import { getAdminClient } from '@/lib/supabase/admin'
import { formatSerial } from '@/lib/domain/serial'
import { PROGRAMS, type ProgramCode } from '@/lib/domain/registration'
import { buildLetterPdf } from './pdf'
import { verifyUrl } from './qr'
import { renderTemplateBody } from './template'

const STORAGE_BUCKET = 'letters'

function newToken(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

export interface IssueResult {
  serial_number: string
  qr_token: string
  pdf_path: string
}

/**
 * Issues a reference letter for an approved request: allocates an atomic
 * serial number, generates a QR token + sealed PDF, stores it, and records the
 * letter. Runs with the service role (server-only). Idempotent per request.
 */
export async function issueLetter(requestId: string, issuedBy: string): Promise<IssueResult> {
  const admin = getAdminClient()

  // Already issued? return it.
  const { data: existing } = await admin
    .from('letters')
    .select('serial_number, qr_token, pdf_path')
    .eq('request_id', requestId)
    .maybeSingle()
  if (existing) return existing as IssueResult

  // Load request + student + company.
  const { data: req, error: reqErr } = await admin
    .from('requests')
    .select('id, student_id, position, profiles(full_name, reg_number, program, semester), companies(name)')
    .eq('id', requestId)
    .single()
  if (reqErr || !req) throw new Error(reqErr?.message ?? 'Request not found.')

  const student = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles
  const company = Array.isArray(req.companies) ? req.companies[0] : req.companies
  if (!student) throw new Error('Student profile missing.')

  // Active template.
  const { data: tpl } = await admin
    .from('letter_templates')
    .select('body_html, footer_text, signatory_name, signatory_designation')
    .eq('is_active', true)
    .maybeSingle()

  // Allocate atomic serial.
  const year = new Date().getFullYear()
  const { data: counter, error: serialErr } = await admin.rpc('next_serial', { p_year: year })
  if (serialErr || counter == null) throw new Error(serialErr?.message ?? 'Could not allocate serial.')
  const serial = formatSerial(year, counter as number)

  const token = newToken()
  const programFull = student.program
    ? (PROGRAMS[student.program as ProgramCode] ?? student.program)
    : ''

  const vars: Record<string, string> = {
    full_name: student.full_name ?? '',
    reg_number: student.reg_number ?? '',
    program_full: programFull,
    semester: String(student.semester ?? ''),
    company: company?.name ?? '',
    position: req.position ?? '',
    serial,
  }

  const bodyParagraphs = tpl?.body_html ? renderTemplateBody(tpl.body_html, vars) : undefined

  const pdfBytes = await buildLetterPdf({
    serial,
    issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    fullName: vars.full_name,
    regNumber: vars.reg_number,
    programFull,
    semester: vars.semester,
    company: vars.company,
    position: vars.position,
    verifyUrl: verifyUrl(token),
    signatory: tpl?.signatory_name ?? 'Internship Coordinator',
    signatoryTitle: tpl?.signatory_designation ?? undefined,
    footer: tpl?.footer_text ?? undefined,
    bodyParagraphs,
  })

  // Store the PDF.
  const pdfPath = `${serial}.pdf`
  const { error: upErr } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: true })
  if (upErr) throw new Error(`Storage: ${upErr.message}`)

  // Record the letter.
  const { error: insErr } = await admin.from('letters').insert({
    request_id: requestId,
    student_id: req.student_id,
    serial_number: serial,
    pdf_path: pdfPath,
    qr_token: token,
    issued_by: issuedBy,
  })
  if (insErr) throw new Error(insErr.message)

  return { serial_number: serial, qr_token: token, pdf_path: pdfPath }
}
