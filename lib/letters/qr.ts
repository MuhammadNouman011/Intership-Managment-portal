import QRCode from 'qrcode'

/** Public verification URL a QR code points to. */
export function verifyUrl(token: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return `${site.replace(/\/$/, '')}/verify/${token}`
}

/** PNG bytes of a QR code, for embedding in the PDF. */
export async function qrPngBytes(text: string): Promise<Uint8Array> {
  const buf = await QRCode.toBuffer(text, { margin: 1, width: 256, errorCorrectionLevel: 'M' })
  return new Uint8Array(buf)
}

/** Data URL of a QR code, for rendering in the browser. */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 256, errorCorrectionLevel: 'M' })
}
