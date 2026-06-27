/** Template variables substituted into a letter body. */
export interface TemplateVars {
  full_name: string
  reg_number: string
  program_full: string
  semester: string
  company: string
  position: string
  serial: string
}

/** Splits a (lightly HTML) template body into clean text paragraphs. */
export function stripHtml(html: string): string[] {
  return html
    .replace(/<\/(p|h2|h3|div|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/** Replaces {{placeholder}} tokens with values. Unknown tokens become ''. */
export function fill(text: string, vars: Partial<TemplateVars>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => (vars as Record<string, string>)[k] ?? '')
}

/**
 * Produces the substituted body paragraphs for a letter, dropping the
 * "TO WHOM IT MAY CONCERN" heading (the PDF renders that itself).
 */
export function renderTemplateBody(bodyHtml: string, vars: Partial<TemplateVars>): string[] {
  return stripHtml(bodyHtml)
    .map((p) => fill(p, vars))
    .filter((p) => !/^TO WHOM/i.test(p))
}

/** Sample data for the editor's live preview. */
export const SAMPLE_VARS: TemplateVars = {
  full_name: 'Muhammad Ali',
  reg_number: 'CIIT/FA24-BSE-011/SWL',
  program_full: 'BS Software Engineering',
  semester: '5',
  company: 'Systems Limited',
  position: 'Software Engineering Intern',
  serial: 'IRMS-2026-000001',
}
