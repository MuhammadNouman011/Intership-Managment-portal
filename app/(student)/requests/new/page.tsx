import { createRequest } from '@/app/actions/requests'
import { RequestForm } from '@/components/requests/RequestForm'

export default function NewRequestPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-6">
        <p className="eyebrow">New request</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
          Request a reference letter
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Tell us where you&apos;re applying. The coordinator reviews it and issues a sealed letter.
        </p>
      </header>
      <RequestForm action={createRequest} />
    </div>
  )
}
