import { z } from 'zod'
import { recordVitalSchema } from '../vital/vital.validation.js'

const subjectiveSchema = z
  .object({
    symptoms: z.array(z.string()),
    purposes_of_appointment: z.array(z.string()).optional(),
    others: z.string(),
  })
  .partial()

const objectiveSchema = z
  .object({
    physical_exam_report: z.array(z.string()).optional(),
    vitals_summary: recordVitalSchema.optional(),
    labs: z.string().optional(),
    others: z.string(),
  })
  .partial()

const assessmentSchema = z
  .object({
    diagnosis: z.array(z.string()),
    differential: z.array(z.string()),
  })
  .partial()

const prescriptionSchema = z.object({
  medication_name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  instructions: z.string(),
  start_date: z.coerce.date(),
})

const planSchema = z
  .object({
    prescriptions: z.array(prescriptionSchema).optional(),
    test_requests: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
    has_referral: z.boolean(),
    referred_provider_name: z.string().optional(),
    others: z.string(),
  })
  .partial()

const recordSoapNoteSchema = z.object({
  appointment_id: z.uuid(),
  subjective: subjectiveSchema.optional(),
  objective: objectiveSchema.optional(),
  assessment: assessmentSchema.optional(),
  plan: planSchema.optional(),
})

export type RecordSoapNoteSchema = z.infer<typeof recordSoapNoteSchema>

export default {
  recordSoapNoteSchema,
}
