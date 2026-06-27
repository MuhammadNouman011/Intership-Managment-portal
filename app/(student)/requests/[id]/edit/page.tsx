import { notFound, redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { isEditable } from '@/lib/domain/requests'
import { updateRequest } from '@/app/actions/requests'
import { RequestForm } from '@/components/requests/RequestForm'

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await getServerClient()
  const { data: r } = await supabase
    .from('requests')
    .select('position, type, duration, expected_joining_date, remarks, status, companies(name, city, address, country, hr_name, hr_email)')
    .eq('id', id)
    .eq('student_id', user.id)
    .maybeSingle()

  if (!r) notFound()
  if (!isEditable(r.status)) redirect(`/requests/${id}`)

  const company = Array.isArray(r.companies) ? r.companies[0] : r.companies
  const action = updateRequest.bind(null, id)

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-6">
        <p className="eyebrow">Edit request</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">Update your request</h1>
      </header>
      <RequestForm
        action={action}
        submitLabel="Save & resubmit"
        initial={{
          company_name: company?.name,
          company_address: company?.address,
          city: company?.city,
          country: company?.country,
          hr_name: company?.hr_name,
          hr_email: company?.hr_email,
          position: r.position,
          type: r.type ?? undefined,
          duration: r.duration ?? undefined,
          expected_joining_date: r.expected_joining_date ?? undefined,
          remarks: r.remarks ?? undefined,
        }}
      />
    </div>
  )
}
