import Link from 'next/link'
import { Seal } from '@/components/ui/Seal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Seal size={34} state="blank" />
          <div className="leading-tight">
            <p className="font-serif text-base font-semibold text-ink">IRMS Verification</p>
            <p className="text-[11px] text-ink-soft">COMSATS Sahiwal · CS</p>
          </div>
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-6">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-3xl px-6 py-5 text-xs text-ink-soft">
          Genuine internship reference letters issued by the Department of Computer Science verify on this page.
        </div>
      </footer>
    </div>
  )
}
