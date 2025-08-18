import type { RecordVitalSchema } from './vital.validation.js'
import vitalService from './vital.service.js'
import catchAsync from '../../utils/catchAsync.js'

const getVitalByAppointment = catchAsync(async (req, res) => {
  const { id } = req.params
  const user = req.user!

  const vitals = await vitalService.findVital({
    appointment_id: id,
    appointment: { appointment_providers: { some: { provider_id: user.id } } },
  })

  res.status(200).json({
    success: true,
    data: vitals,
  })
})

const getVital = catchAsync(async (req, res) => {
  const { id } = req.params
  const user = req.user!

  const vitals = await vitalService.findVital({ id })

  res.status(200).json({
    success: true,
    data: vitals,
  })
})

const recordVital = catchAsync(async (req, res) => {
  const newVital: RecordVitalSchema = req.body
  const provider_id = req.user!.id

  const savedVital = await vitalService.updateOrCreateVital(
    { appointment_id: newVital.appointment_id },
    { created_by_id: provider_id, ...newVital }
  )

  res.status(201).json({
    success: true,
    message: 'Vitals recorded successfully',
    data: savedVital,
  })
})

export default {
  getVitalByAppointment,
  getVital,
  recordVital,
}
