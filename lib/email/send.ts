import 'server-only'
import type { EmailContent } from './templates'

/**
 * Sends a transactional email via the Brevo HTTP API. No-ops (and returns
 * false) when BREVO_API_KEY / EMAIL_FROM are not configured, so callers never
 * break when email isn't set up. Best-effort: never throws.
 */
export async function sendEmail(to: string, content: EmailContent): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from || !to) return false

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: from, name: 'IRMS — COMSATS Sahiwal' },
        to: [{ email: to }],
        subject: content.subject,
        htmlContent: `<div style="font-family:Arial,sans-serif;color:#13201e">${content.html}</div>`,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
