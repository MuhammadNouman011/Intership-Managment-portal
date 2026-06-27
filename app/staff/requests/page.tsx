import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { StaffQueue, type StaffRow } from '@/components/staff/StaffQueue'

export default async function StaffRequestsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!isStaff(user.role)) redirect('/dashboard')

  const supabase = await getServerClient()
  const { data } = await supabase
    .from('requests')
    .select('id, position, status, created_at, profiles(full_name, reg_number, semester), companies(name, city)')
    .order('created_at', { ascending: false })
    .limit(500)

  const rows: StaffRow[] = (data ?? []).map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    const c = Array.isArray(r.companies) ? r.companies[0] : r.companies
    return {
      id: r.id as string,
      position: r.position as string,
      status: r.status as StaffRow['status'],
      created_at: r.created_at as string,
      student: p?.full_name ?? '—',
      reg: p?.reg_number ?? '',
      semester: p?.semester ?? null,
      company: c?.name ?? '—',
      city: c?.city ?? '',
    }
  })

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <p className="eyebrow">Coordination desk</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">Reference requests</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Review, approve, and issue sealed letters. Approving generates the serial and PDF automatically.
        </p>
      </header>
      <StaffQueue rows={rows} />
    </div>
  )
}
