'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALE_COOKIE, LOCALE_NAMES, type Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/cn'

/** Switches the UI language by setting a cookie and refreshing the server tree. */
export function LanguageToggle({ current }: { current: Locale }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function set(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000`
    startTransition(() => router.refresh())
  }

  return (
    <div className="inline-flex overflow-hidden rounded-full border border-line" aria-busy={pending}>
      {(['en', 'ur'] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          className={cn(
            'px-2.5 py-1 text-xs font-medium transition-colors',
            current === l ? 'bg-primary text-on-primary' : 'bg-surface text-ink-soft hover:text-ink',
          )}
        >
          {LOCALE_NAMES[l]}
        </button>
      ))}
    </div>
  )
}
