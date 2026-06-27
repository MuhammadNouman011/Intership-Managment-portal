import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { Shell } from '@/components/layout/Shell'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/requests/new', label: 'New request' },
  { href: '/requests', label: 'My requests' },
  { href: '/letters', label: 'My letters' },
  { href: '/profile', label: 'Profile' },
]

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (isStaff(user.role)) redirect('/staff')

  return (
    <Shell items={NAV} userName={user.full_name ?? user.email} roleLabel="Student">
      {children}
    </Shell>
  )
}
