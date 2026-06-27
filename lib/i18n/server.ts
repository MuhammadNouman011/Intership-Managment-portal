import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, translate, type Locale } from './config'

/** Reads the active locale from the cookie (server components/actions). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const v = store.get(LOCALE_COOKIE)?.value as Locale | undefined
  return v && LOCALES.includes(v) ? v : DEFAULT_LOCALE
}

/** Returns a `t(key)` translator bound to the current locale. */
export async function getT(): Promise<(key: string) => string> {
  const locale = await getLocale()
  return (key: string) => translate(locale, key)
}
