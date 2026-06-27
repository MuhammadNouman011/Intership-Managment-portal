'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { toPublicLetterView, type PublicLetterView } from '@/lib/domain/verify'

const SELECT =
  'serial_number, issue_date, is_revoked, profiles(full_name, reg_number, program, semester), requests(companies(name))'

/** Public lookup by QR token. Returns only whitelisted fields, or null. */
export async function lookupByToken(token: string): Promise<PublicLetterView | null> {
  if (!token) return null
  const admin = getAdminClient()
  const { data } = await admin.from('letters').select(SELECT).eq('qr_token', token).maybeSingle()
  return toPublicLetterView(data)
}

/** Public lookup by printed reference (serial) number. */
export async function lookupBySerial(serial: string): Promise<PublicLetterView | null> {
  const ref = serial.trim().toUpperCase()
  if (!ref) return null
  const admin = getAdminClient()
  const { data } = await admin.from('letters').select(SELECT).eq('serial_number', ref).maybeSingle()
  return toPublicLetterView(data)
}
