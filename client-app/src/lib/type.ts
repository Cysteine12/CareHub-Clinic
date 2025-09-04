export type Patient = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  insurance_provider_id?: string
}

export type Provider = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role_title: string
  created_at: string // ISO date string
  updated_at: string // ISO date string
}

export const formatPurposeText = (purposes: string[] | undefined): string => {
  if (!purposes) return ''
  return purposes
    .map((purpose) =>
      purpose
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    )
    .join(', ')
}

export function formatTimeToAmPm(time24: string | undefined): string {
  if (!time24) return ''
  const [hourStr, minute] = time24.split(':')
  let hour = parseInt(hourStr, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'

  hour = hour % 12 || 12 // convert 0 -> 12 and 13..23 -> 1..11
  return `${hour}:${minute} ${ampm}`
}

export const formatDateParts = (isoDate: string) => {
  const date = new Date(isoDate)

  const day = date.getDate() // e.g., 1
  const month = date.toLocaleString('en-US', { month: 'short' }) // e.g., "Aug"

  return { day, month }
}

export const providerRoles = new Set([
  'GENERAL_PRACTIONER',
  'NURSE',
  'PHARMACIST',
  'LAB_TECHNICIAN',
  'PAEDIATRICIAN',
  'GYNAECOLOGIST',
])

export type EventType =
  | 'VITALS_RECORDED'
  | 'VITALS_UPDATED'
  | 'SOAP_NOTE_RECORDED'
  | 'SOAP_NOTE_UPDATED'
  | 'PROVIDER_ASSIGNED'
  | 'APPOINTMENT_STATUS_CHANGED'

export type Event = {
  id: string
  status: string | null
  created_at: Date
  updated_at: Date
  type: EventType
  appointment_id: string
  created_by_id: string | null
  appointment_provider_id: string | null
  vital_id: string | null
  soap_note_id: string | null
}
