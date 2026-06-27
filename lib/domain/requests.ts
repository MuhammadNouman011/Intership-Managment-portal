export const INTERNSHIP_TYPES = ['onsite', 'hybrid', 'remote'] as const
export type InternshipType = (typeof INTERNSHIP_TYPES)[number]

export interface RequestInput {
  company_name: string
  company_address: string
  city: string
  country: string
  hr_name?: string
  hr_email?: string
  position: string
  type: string
  duration: string
  expected_joining_date: string
  remarks?: string
}

export type RequestErrors = Partial<Record<keyof RequestInput, string>>

/** Validates a new/edited reference-letter request. Pure. */
export function validateRequestInput(input: RequestInput): RequestErrors {
  const errors: RequestErrors = {}

  if (!input.company_name?.trim()) errors.company_name = 'Enter the company name.'
  if (!input.company_address?.trim()) errors.company_address = 'Enter the company address.'
  if (!input.city?.trim()) errors.city = 'Enter the city.'
  if (!input.country?.trim()) errors.country = 'Enter the country.'
  if (!input.position?.trim()) errors.position = 'Enter the internship position.'

  if (!input.type) {
    errors.type = 'Choose an internship type.'
  } else if (!INTERNSHIP_TYPES.includes(input.type as InternshipType)) {
    errors.type = 'Choose a valid internship type.'
  }

  if (!input.duration?.trim()) errors.duration = 'Enter the duration.'
  if (!input.expected_joining_date?.trim()) {
    errors.expected_joining_date = 'Pick an expected joining date.'
  }

  if (input.hr_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.hr_email.trim())) {
    errors.hr_email = 'Enter a valid email or leave it blank.'
  }

  return errors
}

export function requestHasErrors(errors: RequestErrors): boolean {
  return Object.keys(errors).length > 0
}

/** A request can be edited or cancelled by the student only while open. */
export function isEditable(status: string): boolean {
  return status === 'draft' || status === 'pending' || status === 'returned'
}

/** Normalizes a company name+city for duplicate detection / upsert matching. */
export function companyKey(name: string, city: string): string {
  return `${name.trim().toLowerCase()}|${city.trim().toLowerCase()}`
}
