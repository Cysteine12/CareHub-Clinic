import { AppointmentPurpose, AppointmentStatus } from '@prisma/client'
import { z } from 'zod'

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
  appointment_id: z.uuid('Appointment id is invalid'),
  provider_id: z.uuid('Provider id is invalid'),
})

export type AssignProviderSchema = z.infer<typeof assignProviderSchema>

export default {
  createPatientAppointmentSchema,
  updatePatientAppointmentSchema,
  createProviderAppointmentSchema,
  updateProviderAppointmentSchema,
  updateAppointmentStatusSchema,
  followUpAppointmentSchema,
  assignProviderSchema,
}
