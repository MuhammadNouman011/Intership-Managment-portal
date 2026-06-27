/**
 * Reference-letter serial numbers, e.g. `IRMS-2026-000001`.
 *
 * The numeric counter is allocated atomically in the database (see
 * `supabase/functions.sql`); this helper only formats the final string.
 */
export function formatSerial(year: number, n: number): string {
  return `IRMS-${year}-${String(n).padStart(6, '0')}`
}
