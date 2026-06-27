'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { validateProfile, profileHasErrors, type ProfileErrors } from '@/lib/domain/profile'

export interface ProfileActionResult {
  ok?: boolean
  error?: string
  fieldErrors?: ProfileErrors
}

export async function saveProfile(
  _prev: ProfileActionResult,
  formData: FormData,
): Promise<ProfileActionResult> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Your session has expired. Sign in again.' }

  const semesterRaw = String(formData.get('semester') ?? '')
  const input = {
    full_name: String(formData.get('full_name') ?? '').trim(),
    semester: semesterRaw ? Number(semesterRaw) : null,
    section: String(formData.get('section') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    cnic: String(formData.get('cnic') ?? '').trim() || undefined,
    linkedin: String(formData.get('linkedin') ?? '').trim() || undefined,
  }

  const fieldErrors = validateProfile(input)
  if (profileHasErrors(fieldErrors)) return { fieldErrors }

  const supabase = await getServerClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.full_name,
      semester: input.semester,
      section: input.section,
      phone: input.phone,
      cnic: input.cnic ?? null,
      linkedin: input.linkedin ?? null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { ok: true }
}
