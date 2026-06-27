'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { getAdminClient } from '@/lib/supabase/admin'

export interface TemplateActionResult {
  ok?: boolean
  error?: string
}

export async function saveTemplate(
  _prev: TemplateActionResult,
  formData: FormData,
): Promise<TemplateActionResult> {
  const user = await getCurrentUser()
  if (!user || !isStaff(user.role)) return { error: 'Not authorized.' }

  const id = String(formData.get('id') ?? '')
  const body_html = String(formData.get('body_html') ?? '').trim()
  const signatory_name = String(formData.get('signatory_name') ?? '').trim()
  const signatory_designation = String(formData.get('signatory_designation') ?? '').trim()
  const footer_text = String(formData.get('footer_text') ?? '').trim()

  if (!body_html) return { error: 'The letter body cannot be empty.' }

  const admin = getAdminClient()
  const payload = {
    body_html,
    signatory_name,
    signatory_designation,
    footer_text,
    is_active: true,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  let error
  if (id) {
    ;({ error } = await admin.from('letter_templates').update(payload).eq('id', id))
  } else {
    ;({ error } = await admin.from('letter_templates').insert({ name: 'Default Internship Reference', ...payload }))
  }
  if (error) return { error: error.message }

  revalidatePath('/staff/template')
  return { ok: true }
}
