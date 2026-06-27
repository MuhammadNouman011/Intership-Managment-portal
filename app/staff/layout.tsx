import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { Shell } from '@/components/layout/Shell'
import { getLocale } from '@/lib/i18n/server'
import { translate } from '@/lib/i18n/config'

const ROLE_LABEL: Record<string, string> = {
  coordinator: 'Coordinator',
  hod: 'Head of Department',
  admin: 'Administrator',
}

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!isStaff(user.role)) redirect('/dashboard')

  const locale = await getLocale()
  const t = (k: string) => translate(locale, k)
  const nav = [
    { href: '/staff', label: t('nav.dashboard') },
    { href: '/staff/requests', label: t('nav.requests') },
    { href: '/staff/template', label: t('nav.template') },
  ]

  return (
    <Shell items={nav} userName={user.full_name ?? user.email} roleLabel={ROLE_LABEL[user.role] ?? 'Staff'} locale={locale}>
      {children}
    </Shell>
  )
}
