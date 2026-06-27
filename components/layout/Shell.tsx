import Link from 'next/link'
import { Seal } from '@/components/ui/Seal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NavLinks, type NavItem } from './NavLinks'
import { NotificationBell } from './NotificationBell'
import { LanguageToggle } from '@/components/i18n/LanguageToggle'
import { translate, type Locale } from '@/lib/i18n/config'
import { signOut } from '@/app/actions/auth'

export function Shell({
  items,
  userName,
  roleLabel,
  locale,
  children,
}: {
  items: NavItem[]
  userName: string
  roleLabel: string
  locale: Locale
  children: React.ReactNode
}) {
  const t = (k: string) => translate(locale, k)
  return (
    <div className="grid min-h-full lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="hidden flex-col border-r border-line bg-surface lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
          <Seal size={34} state="blank" />
          <div className="leading-tight">
            <p className="font-serif text-base font-semibold text-ink">IRMS</p>
            <p className="text-[11px] text-ink-soft">COMSATS Sahiwal · CS</p>
          </div>
        </Link>
        <div className="flex-1 px-3">
          <NavLinks items={items} />
        </div>
        <div className="border-t border-line px-5 py-4">
          <p className="text-sm font-medium text-ink">{userName}</p>
          <p className="eyebrow">{roleLabel}</p>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-full flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-3">
          {/* mobile nav (simple horizontal scroll) */}
          <div className="flex items-center gap-1 overflow-x-auto lg:hidden">
            <NavLinks items={items} />
          </div>
          <span className="hidden lg:block text-sm text-ink-soft">{t('common.office')}</span>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <LanguageToggle current={locale} />
            <ThemeToggle />
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-[var(--radius-base)] border border-line px-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink hover:bg-surface-2"
              >
                {t('common.signOut')}
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
