import { getServerClient } from '@/lib/supabase/server'
import type { Role } from './guard'

export interface CurrentUser {
  id: string
  email: string
  role: Role
  full_name: string | null
  reg_number: string | null
  program: string | null
  semester: number | null
  is_active: boolean
}

/**
 * Returns the signed-in user joined with their profile row, or null if there
 * is no valid session. Use in server components / actions to gate access.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, reg_number, program, semester, is_active')
    .eq('id', user.id)
    .single()

  if (!profile) return null
  return profile as CurrentUser
}
