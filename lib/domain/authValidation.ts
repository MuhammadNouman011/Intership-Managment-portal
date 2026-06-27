import { isStudentEmail, parseStudentEmail } from './registration'

export interface SignupErrors {
  email?: string
  password?: string
}

/**
 * Validates a student signup. Returns a map of field errors (empty when valid).
 * Pure — no I/O — so it is fully unit-testable and reused by the server action.
 */
export function validateSignup(email: string, password: string): SignupErrors {
  const errors: SignupErrors = {}

  if (!email) {
    errors.email = 'Enter your university email.'
  } else if (!isStudentEmail(email)) {
    errors.email = 'Use your @students.cuisahiwal.edu.pk email.'
  } else if (!parseStudentEmail(email)) {
    errors.email =
      'That email format is not recognized. Expected like fa24-bse-011@students.cuisahiwal.edu.pk (BCS or BSE only).'
  }

  if (!password) {
    errors.password = 'Choose a password.'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  return errors
}

export function hasErrors(errors: SignupErrors): boolean {
  return Object.keys(errors).length > 0
}
