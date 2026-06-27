import Link from 'next/link'
import { lookupByToken } from '@/app/actions/verify'
import { VerifyResult } from '@/components/verify/VerifyResult'

export default async function VerifyTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const view = await lookupByToken(token)

  return (
    <div>
      <p className="eyebrow">Scanned letter</p>
      <h1 className="mt-1 mb-6 font-serif text-2xl font-semibold text-ink">Verification result</h1>
      <VerifyResult view={view} />
      <p className="mt-6 text-sm text-ink-soft">
        Have a reference number instead?{' '}
        <Link href="/verify" className="font-medium text-primary hover:underline">
          Verify manually
        </Link>
      </p>
    </div>
  )
}
