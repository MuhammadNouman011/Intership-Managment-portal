import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { qrPngBytes } from './qr'

export interface LetterData {
  serial: string
  issueDate: string
  fullName: string
  regNumber: string
  programFull: string
  semester: number | string
  company: string
  position: string
  verifyUrl: string
  signatory: string
  signatoryTitle?: string
  footer?: string
  /** Pre-substituted body paragraphs. If omitted, a default body is used. */
  bodyParagraphs?: string[]
}

const TEAL = rgb(0.047, 0.36, 0.337)
const INK = rgb(0.075, 0.125, 0.118)
const SOFT = rgb(0.34, 0.42, 0.4)
const SEAL = rgb(0.66, 0.46, 0.16)

function defaultBody(d: LetterData): string[] {
  return [
    `This is to certify that ${d.fullName}, bearing Registration No. ${d.regNumber}, is a bona fide student of ${d.programFull} (Semester ${d.semester}) at COMSATS University Islamabad, Sahiwal Campus.`,
    `As part of the degree requirement, the student is required to complete a mandatory internship during the summer break. We recommend the student for an internship at ${d.company} for the position of ${d.position}. Your support in providing this opportunity is highly appreciated.`,
    `For verification, scan the seal below or visit our verification portal and enter the reference number ${d.serial}.`,
  ]
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Builds an A4 reference-letter PDF and returns its bytes. */
export async function buildLetterPdf(d: LetterData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page: PDFPage = doc.addPage([595.28, 841.89]) // A4 in points
  const { width, height } = page.getSize()
  const margin = 56
  const contentWidth = width - margin * 2

  const serif = await doc.embedFont(StandardFonts.TimesRoman)
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold)
  const mono = await doc.embedFont(StandardFonts.Courier)

  let y = height - margin

  // Header band
  page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: TEAL })
  page.drawText('COMSATS University Islamabad', { x: margin, y, size: 16, font: serifBold, color: INK })
  y -= 18
  page.drawText('Sahiwal Campus  ·  Department of Computer Science', { x: margin, y, size: 10, font: serif, color: SOFT })
  y -= 12
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: TEAL })
  y -= 28

  // Reference + date row
  page.drawText('REFERENCE', { x: margin, y, size: 7, font: mono, color: SOFT })
  page.drawText('DATE', { x: width - margin - 120, y, size: 7, font: mono, color: SOFT })
  y -= 12
  page.drawText(d.serial, { x: margin, y, size: 11, font: mono, color: INK })
  page.drawText(d.issueDate, { x: width - margin - 120, y, size: 11, font: mono, color: INK })
  y -= 34

  // Title
  page.drawText('TO WHOM IT MAY CONCERN', { x: margin, y, size: 14, font: serifBold, color: INK })
  y -= 26

  // Body
  const bodySize = 11
  const lineGap = 16
  for (const para of d.bodyParagraphs ?? defaultBody(d)) {
    for (const line of wrap(para, serif, bodySize, contentWidth)) {
      page.drawText(line, { x: margin, y, size: bodySize, font: serif, color: INK })
      y -= lineGap
    }
    y -= 8
  }

  // Signature + seal block
  y = Math.min(y, 220)
  page.drawText('_______________________', { x: margin, y, size: 11, font: serif, color: INK })
  y -= 16
  page.drawText(d.signatory, { x: margin, y, size: 11, font: serifBold, color: INK })
  y -= 14
  page.drawText(d.signatoryTitle ?? 'Internship Coordinator, Department of Computer Science', {
    x: margin, y, size: 9, font: serif, color: SOFT,
  })

  // QR seal (bottom-right)
  try {
    const png = await doc.embedPng(await qrPngBytes(d.verifyUrl))
    const qrSize = 92
    const qx = width - margin - qrSize
    const qy = 96
    page.drawImage(png, { x: qx, y: qy, width: qrSize, height: qrSize })
    page.drawText('SCAN TO VERIFY', { x: qx + 6, y: qy - 12, size: 6.5, font: mono, color: SEAL })
  } catch {
    // QR embedding failed — letter still issues without it.
  }

  // Stamp space + footer
  page.drawText('[ Departmental stamp ]', { x: margin, y: 110, size: 9, font: serif, color: SOFT })
  page.drawLine({ start: { x: margin, y: 70 }, end: { x: width - margin, y: 70 }, thickness: 0.5, color: TEAL })
  page.drawText(d.footer ?? 'COMSATS University Islamabad, Sahiwal Campus — Department of Computer Science', {
    x: margin, y: 56, size: 8, font: serif, color: SOFT,
  })

  return doc.save()
}
