import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { PROGRAMS, type ProgramCode } from '@/lib/domain/registration'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await getServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, semester, section, phone, cnic, linkedin, email, reg_number, program, session, roll')
    .eq('id', user.id)
    .single()

  const programFull = profile?.program
    ? (PROGRAMS[profile.program as ProgramCode] ?? profile.program)
    : '—'

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-6">
        <p className="eyebrow">Your record</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">Profile</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Identity fields come from your university email. Fill in the rest once.
        </p>
      </header>

      {/* Derived identity — read only */}
      <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-[calc(var(--radius-base)+2px)] border border-line bg-line sm:grid-cols-3">
        {[
          ['Registration No.', profile?.reg_number ?? '—', true],
          ['Program', programFull, false],
          ['Session', profile?.session ?? '—', true],
          ['Email', profile?.email ?? '—', true],
        ].map(([label, value, mono]) => (
          <div key={label as string} className="bg-surface px-4 py-3">
            <dt className="eyebrow">{label}</dt>
            <dd className={`mt-1 text-sm text-ink ${mono ? 'serial' : ''}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <ProfileForm
        initial={{
          full_name: profile?.full_name ?? '',
          semester: profile?.semester ?? null,
          section: profile?.section ?? '',
          phone: profile?.phone ?? '',
          cnic: profile?.cnic ?? '',
          linkedin: profile?.linkedin ?? '',
        }}
      />
    </div>
  )
}
