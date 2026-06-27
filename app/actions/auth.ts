'use server'

import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { validateSignup, hasErrors, type SignupErrors } from '@/lib/domain/authValidation'
import { parseStudentEmail, buildRegNumber } from '@/lib/domain/registration'

export interface ActionResult {
  error?: string
  fieldErrors?: SignupErrors
  ok?: boolean
}

/**
 * Step 1 of signup: validate the university email + password and ask Supabase
 * to create the account and email a verification OTP. The account is not usable
 * until the OTP is confirmed (see verifySignupOtp).
 */
export async function signUpStudent(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  const fieldErrors = validateSignup(email, password)
  if (hasErrors(fieldErrors)) return { fieldErrors }

  const supabase = await getServerClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: undefined },
  })

  if (error) return { error: error.message }
  redirect(`/verify-otp?email=${encodeURIComponent(email)}`)
}

/** Step 2 of signup: confirm the 6-digit OTP, then create the profile row. */
export async function verifySignupOtp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const token = String(formData.get('token') ?? '').trim()

  if (!/^\d{6}$/.test(token)) return { error: 'Enter the 6-digit code from your email.' }

  const supabase = await getServerClient()
  // signUp() with email confirmation issues a 'signup' OTP; fall back to 'email'
  // (used by signInWithOtp) so either delivery path verifies correctly.
  let { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
  if (error) {
    ;({ data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' }))
  }
  if (error) return { error: error.message }

  const user = data.user
  const parsed = parseStudentEmail(email)
  if (user && parsed) {
    // Create the profile (idempotent) with fields derived from the email.
    const admin = getAdminClient()
    await admin.from('profiles').upsert(
      {
        id: user.id,
        email,
        role: 'student',
        session: parsed.session,
        program: parsed.program,
        roll: parsed.roll,
        reg_number: buildRegNumber(parsed),
        department: 'CS',
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )
  }

  redirect('/dashboard')
}

/** Sign in with email + password. */
export async function signIn(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: 'Enter your email and password.' }

  const supabase = await getServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Incorrect email or password.' }
  redirect('/dashboard')
}

/** Email a password-reset link. */
export async function requestPasswordReset(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return { error: 'Enter your email.' }

  const supabase = await getServerClient()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${site}/login` })
  // Always report success so we don't leak which emails exist.
  return { ok: true }
}

export async function signOut() {
  const supabase = await getServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
