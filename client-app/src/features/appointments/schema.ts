import { z } from 'zod'

export const AppointmentPurpose = {
  ROUTINE_HEALTH_CHECKUP: 'ROUTINE HEALTH CHECKUP',
  MEDICAL_CONSULTATION_AND_TREATMENT: 'MEDICAL CONSULTATION AND TREATMENT',
  FOLLOWUP_APPOINTMENT: 'FOLLOWUP APPOINTMENT',
  MATERNAL_CHILD_HEALTH: 'MATERNAL & CHILD HEALTH',
  IMMUNIZATIONS_AND_VACCINATIONS: 'IMMUNIZATIONS AND VACCINATIONS',
  FAMILY_PLANNING: 'FAMILY PLANNING',
  HIV_AIDS_COUNSELING_AND_TESTING: 'HIV AIDS COUNSELING AND TESTING',
  TUBERCULOSIS_SCREENING_AND_TREATMENT: 'TUBERCULOSIS SCREENING AND TREATMENT',
  NUTRITION_COUNSELING_AND_SUPPORT: 'NUTRITION COUNSELING AND SUPPORT',
  CHRONIC_DISEASE_MANAGEMENT: 'CHRONIC DISEASE MANAGEMENT',
  MENTAL_HEALTH_SUPPORT_OR_COUNSELING: 'MENTAL HEALTH SUPPORT OR COUNSELING',
  HEALTH_EDUCATION_AND_AWARENESS: 'HEALTH EDUCATION AND AWARENESS',
  ANTENATAL_OR_POSTNATAL_CARE: 'ANTENATAL OR POSTNATAL CARE',
  SEXUAL_AND_REPRODUCTIVE_HEALTH_SERVICES:
    'SEXUAL AND REPRODUCTIVE HEALTH SERVICES',
  MALARIA_DIAGNOSIS_AND_TREATMENT: 'MALARIA DIAGNOSIS AND TREATMENT',
  HEALTH_SCREENING_CAMPAIGNS: 'HEALTH SCREENING CAMPAIGNS',
  DRUG_OR_SUBSTANCE_ABUSE_COUNSELING: 'DRUG OR SUBSTANCE ABUSE COUNSELING',
  DENTAL_CARE: 'DENTAL CARE',
  REFERRAL: 'REFERRAL',
  OTHERS: 'OTHERS',
} as const

export const AppointmentStatus = {
  SUBMITTED: 'SUBMITTED',
  SCHEDULED: 'SCHEDULED',
  CHECKED_IN: 'CHECKED_IN',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
  ATTENDING: 'ATTENDING',
  ATTENDED: 'ATTENDED',
  NO_SHOW: 'NO_SHOW',
  COMPLETED: 'COMPLETED',
  CONFIRMED: 'CONFIRMED',
} as const

const appointmentScheduleSchema = z.object({
  date: z.iso.datetime('Invalid date format'),
  time: z.iso.time('Invalid time format'),
  change_count: z.number('Change count is invalid').optional(),
})

export type AppointmentScheduleSchema = z.infer<
  typeof appointmentScheduleSchema
>

const createPatientAppointmentSchema = z.object({
  purposes: z.array(z.enum(AppointmentPurpose, 'Purpose is invalid')),
  other_purpose: z.string('Purpose description is invalid').nullable(),
  schedule: appointmentScheduleSchema,
})

export type CreatePatientAppointmentSchema = z.infer<
  typeof createPatientAppointmentSchema
>

const updatePatientAppointmentSchema = createPatientAppointmentSchema.optional()

export type UpdatePatientAppointmentSchema = z.infer<
  typeof updatePatientAppointmentSchema
>

const createProviderAppointmentSchema = z.object({
  patient_id: z.uuid('Patient ID is invalid'),
  purposes: z.array(z.enum(AppointmentPurpose, 'Purpose is invalid')),
  other_purpose: z.string('Purpose description is invalid').nullable(),
  has_insurance: z.boolean().optional(),
  schedule: appointmentScheduleSchema,
})

export type CreateProviderAppointmentSchema = z.infer<
  typeof createProviderAppointmentSchema
>

const updateProviderAppointmentSchema = createProviderAppointmentSchema.omit({
  patient_id: true,
})

export type UpdateProviderAppointmentSchema = z.infer<
  typeof updateProviderAppointmentSchema
>

const updateAppointmentStatusSchema = z.object({
  status: z.enum(AppointmentStatus, 'Status is invalid'),
})

export type UpdateAppointmentStatusSchema = z.infer<
  typeof updateAppointmentStatusSchema
>

const followUpAppointmentSchema = createProviderAppointmentSchema.omit({
  patient_id: true,
})

export type FollowUpAppointmentSchema = z.infer<
  typeof followUpAppointmentSchema
>

const assignProviderSchema = z.object({
  provider_id: z.uuid('Provider id is invalid'),
})

export type AssignProviderSchema = z.infer<typeof assignProviderSchema>

export {
  createPatientAppointmentSchema,
  updatePatientAppointmentSchema,
  createProviderAppointmentSchema,
  updateProviderAppointmentSchema,
  updateAppointmentStatusSchema,
  followUpAppointmentSchema,
  assignProviderSchema,
}
