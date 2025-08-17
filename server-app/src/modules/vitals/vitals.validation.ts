import { z } from 'zod'

export const VitalsRecordSchema = z.object({
  blood_pressure: z.string().optional(),
  heart_rate: z.string().optional(),
  temperature: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  respiratory_rate: z.string().optional(),
  oxygen_saturation: z.string().optional(),
  bmi: z.string().optional(),
  others: z.string().optional(),
  appointment_id: z.uuid(),
})

export type VitalsRecord = z.infer<typeof VitalsRecordSchema>

export default {
  VitalsRecordSchema,
}
