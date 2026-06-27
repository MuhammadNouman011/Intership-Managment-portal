import { OtpForm } from './OtpForm'

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email = '' } = await searchParams
  return <OtpForm email={email} />
}
