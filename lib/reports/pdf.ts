import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const TEAL = rgb(0.047, 0.36, 0.337)
const INK = rgb(0.075, 0.125, 0.118)
const SOFT = rgb(0.34, 0.42, 0.4)

export interface ReportRow {
  student: string
  reg: string
  company: string
  status: string
  date: string
}

/** A simple landscape A4 report listing requests. */
export async function buildRequestsReportPdf(
  rows: ReportRow[],
  title: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const pageW = 841.89
  const pageH = 595.28
  const margin = 40
  const cols = [
    { label: 'Student', x: margin, w: 170 },
    { label: 'Reg #', x: margin + 175, w: 170 },
    { label: 'Company', x: margin + 350, w: 200 },
    { label: 'Status', x: margin + 555, w: 90 },
    { label: 'Date', x: margin + 650, w: 110 },
  ]

  let page = doc.addPage([pageW, pageH])
  let y = pageH - margin

  function header() {
    page.drawText('COMSATS Sahiwal · CS — ' + title, { x: margin, y, size: 13, font: bold, color: INK })
    y -= 18
    page.drawText(`Generated ${new Date().toLocaleString('en-GB')}  ·  ${rows.length} records`, {
      x: margin, y, size: 9, font, color: SOFT,
    })
    y -= 18
    page.drawLine({ start: { x: margin, y }, end: { x: pageW - margin, y }, thickness: 1, color: TEAL })
    y -= 16
    for (const c of cols) page.drawText(c.label, { x: c.x, y, size: 8, font: bold, color: SOFT })
    y -= 14
  }

  function clip(s: string, max: number) {
    return s.length > max ? s.slice(0, max - 1) + '…' : s
  }

  header()
  for (const r of rows) {
    if (y < margin + 20) {
      page = doc.addPage([pageW, pageH])
      y = pageH - margin
      header()
    }
    const cells = [clip(r.student, 30), clip(r.reg, 28), clip(r.company, 34), r.status, r.date]
    cells.forEach((val, i) => {
      page.drawText(val, { x: cols[i].x, y, size: 9, font, color: INK })
    })
    y -= 15
  }

  return doc.save()
}
