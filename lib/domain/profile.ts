export interface ProfileInput {
  full_name: string
  semester: number | null
  section: string
  phone: string
  cnic?: string
  linkedin?: string
}

export type ProfileErrors = Partial<Record<keyof ProfileInput, string>>

/**
 * Validates the editable profile fields. Registration number, program, and
 * session are derived from the email and never entered here, so they are not
 * validated. Pure — reused by the server action.
 */
export function validateProfile(input: ProfileInput): ProfileErrors {
  const errors: ProfileErrors = {}

  if (!input.full_name?.trim()) {
    errors.full_name = 'Enter your full name.'
  } else if (input.full_name.trim().length < 3) {
    errors.full_name = 'Name looks too short.'
  }

  if (input.semester == null || Number.isNaN(input.semester)) {
    errors.semester = 'Select your semester.'
  } else if (input.semester < 1 || input.semester > 8) {
    errors.semester = 'Semester must be between 1 and 8.'
  }

  if (!input.section?.trim()) {
    errors.section = 'Enter your section.'
  }

  if (!input.phone?.trim()) {
    errors.phone = 'Enter a phone number.'
  } else if (!/^[0-9+\-\s]{7,15}$/.test(input.phone.trim())) {
    errors.phone = 'Enter a valid phone number.'
  }

  if (input.cnic && !/^\d{5}-?\d{7}-?\d$/.test(input.cnic.trim())) {
    errors.cnic = 'CNIC should be 13 digits (e.g. 36502-1234567-1).'
  }

  return errors
}

export function profileHasErrors(errors: ProfileErrors): boolean {
  return Object.keys(errors).length > 0
}
