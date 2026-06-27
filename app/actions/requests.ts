'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/session'
import {
  validateRequestInput,
  requestHasErrors,
  isEditable,
  type RequestInput,
  type RequestErrors,
} from '@/lib/domain/requests'

export interface RequestActionResult {
  ok?: boolean
  error?: string
  fieldErrors?: RequestErrors
  duplicateWarning?: string
}

function readInput(formData: FormData): RequestInput {
  return {
    company_name: String(formData.get('company_name') ?? '').trim(),
    company_address: String(formData.get('company_address') ?? '').trim(),
    city: String(formData.get('city') ?? '').trim(),
    country: String(formData.get('country') ?? '').trim(),
    hr_name: String(formData.get('hr_name') ?? '').trim() || undefined,
    hr_email: String(formData.get('hr_email') ?? '').trim() || undefined,
    position: String(formData.get('position') ?? '').trim(),
    type: String(formData.get('type') ?? ''),
    duration: String(formData.get('duration') ?? '').trim(),
    expected_joining_date: String(formData.get('expected_joining_date') ?? '').trim(),
    remarks: String(formData.get('remarks') ?? '').trim() || undefined,
  }
}

/** Finds an existing company by name+city or creates one (service role). */
async function upsertCompany(input: RequestInput): Promise<string> {
  const admin = getAdminClient()
  const { data: existing } = await admin
    .from('companies')
    .select('id')
    .ilike('name', input.company_name)
    .ilike('city', input.city)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data: created, error } = await admin
    .from('companies')
    .insert({
      name: input.company_name,
      address: input.company_address,
      city: input.city,
      country: input.country,
      hr_name: input.hr_name ?? null,
      hr_email: input.hr_email ?? null,
    })
    .select('id')
    .single()

  if (error || !created) throw new Error(error?.message ?? 'Could not save company.')
  return created.id
}

/**
 * Creates a request. If the student already has an open/issued request for the
 * same company, returns a duplicateWarning unless `confirm` is set.
 */
export async function createRequest(
  _prev: RequestActionResult,
  formData: FormData,
): Promise<RequestActionResult> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Your session has expired. Sign in again.' }

  const asDraft = formData.get('intent') === 'draft'
  const confirm = formData.get('confirm') === 'true'
  const input = readInput(formData)

  if (!asDraft) {
    const fieldErrors = validateRequestInput(input)
    if (requestHasErrors(fieldErrors)) return { fieldErrors }
  } else if (!input.company_name) {
    return { fieldErrors: { company_name: 'A draft needs at least a company name.' } }
  }

  const companyId = await upsertCompany(input)

  if (!confirm) {
    const supabase = await getServerClient()
    const { data: dup } = await supabase
      .from('requests')
      .select('id')
      .eq('student_id', user.id)
      .eq('company_id', companyId)
      .in('status', ['draft', 'pending', 'hold', 'returned', 'approved'])
      .limit(1)
    if (dup && dup.length > 0) {
      return {
        duplicateWarning:
          'You already have a request for this company. Submit another one anyway?',
      }
    }
  }

  const supabase = await getServerClient()
  const { error } = await supabase.from('requests').insert({
    student_id: user.id,
    company_id: companyId,
    position: input.position,
    type: input.type || null,
    duration: input.duration || null,
    expected_joining_date: input.expected_joining_date || null,
    remarks: input.remarks ?? null,
    status: asDraft ? 'draft' : 'pending',
  })
  if (error) return { error: error.message }

  revalidatePath('/requests')
  redirect('/requests')
}

/** Updates a request while it is still editable. */
export async function updateRequest(
  requestId: string,
  _prev: RequestActionResult,
  formData: FormData,
): Promise<RequestActionResult> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Your session has expired. Sign in again.' }

  const input = readInput(formData)
  const submit = formData.get('intent') !== 'draft'
  if (submit) {
    const fieldErrors = validateRequestInput(input)
    if (requestHasErrors(fieldErrors)) return { fieldErrors }
  }

  const supabase = await getServerClient()
  const { data: current } = await supabase
    .from('requests')
    .select('status')
    .eq('id', requestId)
    .single()
  if (!current || !isEditable(current.status)) {
    return { error: 'This request can no longer be edited.' }
  }

  const companyId = await upsertCompany(input)
  const { error } = await supabase
    .from('requests')
    .update({
      company_id: companyId,
      position: input.position,
      type: input.type || null,
      duration: input.duration || null,
      expected_joining_date: input.expected_joining_date || null,
      remarks: input.remarks ?? null,
      status: submit ? 'pending' : 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('student_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/requests')
  redirect(`/requests/${requestId}`)
}

/** Cancels a pending request. */
export async function cancelRequest(requestId: string): Promise<RequestActionResult> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Your session has expired. Sign in again.' }

  const supabase = await getServerClient()
  const { error } = await supabase
    .from('requests')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('student_id', user.id)
    .in('status', ['draft', 'pending', 'returned'])

  if (error) return { error: error.message }
  revalidatePath('/requests')
  return { ok: true }
}
