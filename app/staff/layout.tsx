import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { Shell } from '@/components/layout/Shell'

const NAV = [
  { href: '/staff', label: 'Dashboard' },
  { href: '/staff/requests', label: 'Requests' },
]

const ROLE_LABEL: Record<string, string> = {
  coordinator: 'Coordinator',
  hod: 'Head of Department',
  admin: 'Administrator',
}

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!isStaff(user.role)) redirect('/dashboard')

  return (
    <Shell items={NAV} userName={user.full_name ?? user.email} roleLabel={ROLE_LABEL[user.role] ?? 'Staff'}>
      {children}
    </Shell>
  )
}
