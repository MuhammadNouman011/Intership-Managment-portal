import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { Shell } from '@/components/layout/Shell'
import { getLocale } from '@/lib/i18n/server'
import { translate } from '@/lib/i18n/config'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (isStaff(user.role)) redirect('/staff')

  const locale = await getLocale()
  const t = (k: string) => translate(locale, k)
  const nav = [
    { href: '/dashboard', label: t('nav.dashboard') },
    { href: '/requests/new', label: t('nav.newRequest') },
    { href: '/requests', label: t('nav.myRequests') },
    { href: '/letters', label: t('nav.myLetters') },
    { href: '/profile', label: t('nav.profile') },
  ]

  return (
    <Shell items={nav} userName={user.full_name ?? user.email} roleLabel="Student" locale={locale}>
      {children}
    </Shell>
  )
}
