'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { getAdminClient } from '@/lib/supabase/admin'
import {
  ACTION_TO_STATUS,
  decisionRequiresReason,
  isDecisionAction,
  type DecisionAction,
} from '@/lib/domain/decisions'
import { issueLetter } from '@/lib/letters/issue'
import { sendEmail } from '@/lib/email/send'
import { decisionEmail } from '@/lib/email/templates'

export interface DecisionResult {
  ok?: boolean
  error?: string
}

const NOTIF_TITLE: Record<DecisionAction, string> = {
  approve: 'Reference letter approved',
  reject: 'Request rejected',
  hold: 'Request placed on hold',
  return: 'Request returned for correction',
}

/** Records a coordinator/HOD/admin decision on a request. */
export async function decide(
  requestId: string,
  action: string,
  reason?: string,
  adminNotes?: string,
): Promise<DecisionResult> {
  const user = await getCurrentUser()
  if (!user || !isStaff(user.role)) return { error: 'Not authorized.' }
  if (!isDecisionAction(action)) return { error: 'Unknown action.' }

  const trimmedReason = reason?.trim() ?? ''
  if (decisionRequiresReason(action) && !trimmedReason) {
    return { error: 'A reason is required for this action.' }
  }

  const admin = getAdminClient()

  const update: Record<string, unknown> = {
    status: ACTION_TO_STATUS[action],
    decided_by: user.id,
    decided_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (decisionRequiresReason(action)) update.reject_reason = trimmedReason
  if (adminNotes !== undefined) update.admin_notes = adminNotes.trim() || null

  const { data: updated, error } = await admin
    .from('requests')
    .update(update)
    .eq('id', requestId)
    .select('student_id, profiles(full_name, email), companies(name)')
    .single()
  if (error || !updated) return { error: error?.message ?? 'Could not update request.' }

  const student = Array.isArray(updated.profiles) ? updated.profiles[0] : updated.profiles
  const company = Array.isArray(updated.companies) ? updated.companies[0] : updated.companies

  let issuedSerial: string | undefined
  if (action === 'approve') {
    try {
      const issued = await issueLetter(requestId, user.id)
      issuedSerial = issued.serial_number
    } catch (e) {
      return { error: `Approved, but letter generation failed: ${(e as Error).message}` }
    }
  }

  // Notify the student + audit trail (service role).
  await admin.from('notifications').insert({
    user_id: updated.student_id,
    type: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'return' ? 'returned' : 'submitted',
    title: NOTIF_TITLE[action],
    message: decisionRequiresReason(action) ? trimmedReason : undefined,
    link: `/requests/${requestId}`,
  })
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: `request.${action}`,
    entity_type: 'request',
    entity_id: requestId,
    details: { reason: trimmedReason || null },
  })

  // Best-effort email (no-op if Brevo isn't configured).
  if (student?.email) {
    const email = decisionEmail(action, {
      studentName: student.full_name ?? undefined,
      company: company?.name ?? undefined,
      reason: trimmedReason || undefined,
      serial: issuedSerial,
      link: `/requests/${requestId}`,
    })
    await sendEmail(student.email, email)
  }

  revalidatePath('/staff/requests')
  revalidatePath(`/staff/requests/${requestId}`)
  return { ok: true }
}

/** Approves several pending requests in one go. */
export async function bulkApprove(ids: string[]): Promise<DecisionResult> {
  const user = await getCurrentUser()
  if (!user || !isStaff(user.role)) return { error: 'Not authorized.' }

  let failed = 0
  for (const id of ids) {
    const res = await decide(id, 'approve')
    if (!res.ok) failed++
  }
  revalidatePath('/staff/requests')
  return failed ? { error: `${failed} of ${ids.length} could not be approved.` } : { ok: true }
}
