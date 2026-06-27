import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client. Bypasses RLS — use ONLY in trusted server
 * code (server actions / route handlers) for operations that must cross the
 * normal access rules: issuing letters, allocating serials, upserting
 * companies, writing audit logs and notifications.
 *
 * NEVER import this into a client component.
 */
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
