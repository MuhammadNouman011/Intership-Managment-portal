export type EmailAction = 'approve' | 'reject' | 'hold' | 'return'

export interface EmailContent {
  subject: string
  html: string
}

const HEADING: Record<EmailAction, string> = {
  approve: 'Your reference letter is approved',
  reject: 'Your reference request was rejected',
  hold: 'Your reference request is on hold',
  return: 'Your reference request needs corrections',
}

/** Builds the subject + HTML body for a decision email. Pure. */
export function decisionEmail(
  action: EmailAction,
  ctx: { studentName?: string; company?: string; reason?: string; serial?: string; link?: string },
): EmailContent {
  const name = ctx.studentName?.trim() || 'Student'
  const company = ctx.company ? ` for <strong>${ctx.company}</strong>` : ''
  const lines: string[] = [`<p>Dear ${name},</p>`]

  if (action === 'approve') {
    lines.push(`<p>Good news — your internship reference letter${company} has been approved and issued.</p>`)
    if (ctx.serial) lines.push(`<p>Reference number: <strong>${ctx.serial}</strong></p>`)
    lines.push('<p>You can now download it, print it, and get it stamped at the internship office.</p>')
  } else if (action === 'reject') {
    lines.push(`<p>Your reference request${company} was not approved.</p>`)
    if (ctx.reason) lines.push(`<p><strong>Reason:</strong> ${ctx.reason}</p>`)
  } else if (action === 'return') {
    lines.push(`<p>Your reference request${company} needs some corrections before it can be approved.</p>`)
    if (ctx.reason) lines.push(`<p><strong>What to fix:</strong> ${ctx.reason}</p>`)
    lines.push('<p>Please edit your request and submit it again.</p>')
  } else {
    lines.push(`<p>Your reference request${company} has been placed on hold while it is reviewed.</p>`)
    if (ctx.reason) lines.push(`<p><strong>Note:</strong> ${ctx.reason}</p>`)
  }

  lines.push('<p style="color:#566b66;font-size:12px;margin-top:24px">COMSATS University Islamabad, Sahiwal Campus — Department of Computer Science</p>')

  return { subject: HEADING[action], html: lines.join('\n') }
}
