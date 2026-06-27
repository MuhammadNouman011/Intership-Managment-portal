import { lookupBySerial } from '@/app/actions/verify'
import { Button } from '@/components/ui/Button'
import { VerifyResult } from '@/components/verify/VerifyResult'

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const { ref = '' } = await searchParams
  const view = ref ? await lookupBySerial(ref) : null

  return (
    <div>
      <p className="eyebrow">Employer verification</p>
      <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">Verify a reference letter</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Scan the seal on the letter, or enter its reference number below.
      </p>

      <form method="get" className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          name="ref"
          defaultValue={ref}
          placeholder="IRMS-2026-000001"
          className="serial h-11 flex-1 rounded-[var(--radius-base)] border border-line bg-surface px-3 text-sm uppercase text-ink placeholder:normal-case placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button type="submit" size="lg">Verify</Button>
      </form>

      {ref && (
        <div className="mt-6">
          <VerifyResult view={view} />
        </div>
      )}
    </div>
  )
}
