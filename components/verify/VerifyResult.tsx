import { Seal } from '@/components/ui/Seal'
import type { PublicLetterView } from '@/lib/domain/verify'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function VerifyResult({ view }: { view: PublicLetterView | null }) {
  if (!view) {
    return (
      <div className="rounded-[calc(var(--radius-base)+2px)] border border-line bg-surface p-6 text-center">
        <p className="font-serif text-lg font-semibold text-ink">No such letter found</p>
        <p className="mt-1 text-sm text-ink-soft">
          Check the reference number and try again. Genuine letters from this office always verify here.
        </p>
      </div>
    )
  }

  const revoked = view.status === 'revoked'

  return (
    <div className="overflow-hidden rounded-[calc(var(--radius-base)+2px)] border border-line bg-surface">
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{
          background: revoked
            ? 'color-mix(in srgb, var(--st-rejected) 12%, transparent)'
            : 'color-mix(in srgb, var(--st-approved) 12%, transparent)',
        }}
      >
        <Seal size={56} state={revoked ? 'revoked' : 'valid'} />
        <div>
          <p
            className="font-serif text-lg font-semibold"
            style={{ color: revoked ? 'var(--st-rejected)' : 'var(--st-approved)' }}
          >
            {revoked ? 'This letter has been revoked' : 'Valid reference letter'}
          </p>
          <p className="serial text-sm text-ink-soft">{view.serial}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-px bg-line">
        {[
          ['Student', view.studentName],
          ['Registration No.', view.regNumber],
          ['Program', view.program],
          ['Semester', view.semester != null ? `Semester ${view.semester}` : '—'],
          ['Company', view.company],
          ['Issued', fmt(view.issueDate)],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface px-5 py-3">
            <dt className="eyebrow">{label}</dt>
            <dd className="mt-1 text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
