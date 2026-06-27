'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

export interface NavItem {
  href: string
  label: string
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-[var(--radius-base)] px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary-tint text-primary'
                : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
