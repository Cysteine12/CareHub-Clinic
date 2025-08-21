import type {
  AppointmentStatus,
  CreatePatientAppointmentSchema,
} from './schema'

export type AppointmentSchedule = {
  date: string | Date
  time: string
  change_count: number
}

export type ProviderCreateAppointment = {
  patient_id: string
  schedule: AppointmentSchedule
  purposes: string
  has_insurance?: boolean | undefined
  other_purpose: string
}

export interface APIResponse<T = unknown> {
  success: true
  message?: string
  data?: T
  total?: number
}

export interface IPagination {
  page: number
  limit: number
  total?: number
}

export type Appointment = CreatePatientAppointmentSchema & {
  id: string
  status: (typeof AppointmentStatus)[keyof typeof AppointmentStatus]
  created_at: string
  updated_at: string
}
