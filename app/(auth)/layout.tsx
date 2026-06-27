import Link from 'next/link'
import { Seal } from '@/components/ui/Seal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary px-10 py-9 text-on-primary lg:flex">
        <div className="guilloche absolute inset-0 opacity-[0.18]" aria-hidden />
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="rounded-full bg-on-primary/10 p-1">
            <Seal size={34} state="blank" />
          </span>
          <span className="font-serif text-lg font-semibold">IRMS</span>
        </Link>
        <div className="relative max-w-md">
          <p className="eyebrow !text-on-primary/70">Internship Reference Office</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight">
            Every letter, signed and serialized by the department.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-on-primary/80">
            Request a reference letter, track its approval, and download a sealed PDF
            an employer can verify in seconds.
          </p>
        </div>
        <p className="relative text-xs text-on-primary/70">
          COMSATS University Islamabad, Sahiwal Campus
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Seal size={28} state="blank" />
            <span className="font-serif font-semibold text-ink">IRMS</span>
          </Link>
          <span className="hidden lg:block" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  )
}
