import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Seal } from '@/components/ui/Seal'
import { StatusPill } from '@/components/ui/StatusPill'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/i18n/LanguageToggle'
import { getLocale } from '@/lib/i18n/server'
import { translate } from '@/lib/i18n/config'

export default async function Home() {
  const locale = await getLocale()
  const t = (k: string) => translate(locale, k)

  return (
    <main className="flex min-h-full flex-col">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Seal size={36} state="blank" />
          <div className="leading-tight">
            <p className="font-serif text-base font-semibold text-ink">IRMS</p>
            <p className="text-[11px] text-ink-soft">COMSATS Sahiwal · CS</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/verify">
            <Button variant="ghost" size="sm">
              {t('common.verifyLetter')}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              {t('common.signIn')}
            </Button>
          </Link>
          <LanguageToggle current={locale} />
          <ThemeToggle />
        </nav>
      </header>

      {/* Hero — the certified letter is the thesis */}
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow mb-4">{t('landing.eyebrow')}</p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">
            {t('landing.title1')} <span className="text-primary">{t('landing.titleAccent')}</span>{' '}
            {t('landing.title2')}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
            {t('landing.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button size="lg">{t('landing.ctaRequest')}</Button>
            </Link>
            <Link href="/verify">
              <Button variant="outline" size="lg">
                {t('landing.ctaVerify')}
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-ink-soft">
            {t('landing.signupHint')}{' '}
            <span className="serial text-ink">@students.cuisahiwal.edu.pk</span> {t('landing.email')}
          </p>
        </div>

        {/* A specimen letter, sealed */}
        <div className="relative">
          <div className="guilloche absolute -inset-3 rounded-2xl opacity-70" aria-hidden />
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <p className="eyebrow">Reference</p>
                <p className="serial text-sm text-ink">IRMS-2026-000128</p>
              </div>
              <StatusPill status="approved" />
            </div>
            <div className="space-y-3 px-6 py-6">
              <p className="font-serif text-lg font-semibold text-ink">To Whom It May Concern</p>
              <p className="text-sm leading-relaxed text-ink-soft">
                This is to certify that <span className="text-ink">Muhammad Ali</span>,
                Registration No. <span className="serial text-ink">CIIT/FA24-BSE-011/SWL</span>,
                is a bona fide student of BS Software Engineering, recommended for an
                internship at <span className="text-ink">Systems Limited</span>.
              </p>
              <div className="h-px bg-line" />
              <div className="flex items-end justify-between pt-1">
                <div className="text-xs text-ink-soft">
                  <p className="text-ink">Internship Coordinator</p>
                  <p>Department of Computer Science</p>
                </div>
                <Seal serial="" size={72} state="valid" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — a real sequence, so numbered steps carry meaning */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: '01', t: t('landing.step1Title'), d: t('landing.step1Desc') },
            { n: '02', t: t('landing.step2Title'), d: t('landing.step2Desc') },
            { n: '03', t: t('landing.step3Title'), d: t('landing.step3Desc') },
          ].map((s) => (
            <div key={s.n} className="rounded-[calc(var(--radius-base)+2px)] border border-line bg-surface p-5">
              <p className="serial text-seal">{s.n}</p>
              <p className="mt-3 font-serif text-lg font-semibold text-ink">{s.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 text-xs text-ink-soft">
          {t('landing.footer')}
        </div>
      </footer>
    </main>
  )
}
