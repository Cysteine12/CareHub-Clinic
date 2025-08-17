import type { VitalsRecord } from './vitals.validation.js'
import vitalsService from './vitals.service.js'
import catchAsync from '../../utils/catchAsync.js'
import { getLoggedInUser } from '../appointment/appointment.utils.js'
import prisma from '../../config/prisma.js'
import { UserType } from '../../types/index.js'

const recordVitals = catchAsync(async (req, res) => {
  const newVitals: VitalsRecord = req.body
  const providerId = req.user!.id

  const appointmentId = newVitals.appointment_id
  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      message: 'appointment_id is required to record vitals',
    })
  }

  const { appointment_id, ...restVitals } = newVitals

  const prismaCreateInput = {
    ...{ ...restVitals, created_by_id: providerId },
    appointment: {
      connect: { id: appointmentId },
    },
  }

  const savedVitals = await vitalsService.recordVitals(prismaCreateInput)

  res.status(201).json({
    success: true,
    message: 'Vitals recorded successfully',
    data: savedVitals,
  })
})

const getVitalsByAppointmentId = catchAsync(async (req, res) => {
  const { appointmentId } = req.params
  const { loggedInUser } = getLoggedInUser(req)

  if (!appointmentId) {
    return res
      .status(400)
      .json({ success: false, message: 'appointmentId is required' })
  }

  if (loggedInUser?.type === UserType.PATIENT) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { patient_id: true },
    })

    if (!appointment || appointment.patient_id !== loggedInUser.id) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }
  }

  if (loggedInUser?.type === UserType.PROVIDER) {
    if (
      !(
        loggedInUser.role_title === 'ADMIN' ||
        loggedInUser.role_title === 'RECEPTIONIST'
      )
    ) {
      const assigned = await prisma.appointmentProviders.findFirst({
        where: {
          appointment_id: appointmentId,
          provider_id: loggedInUser.id,
        },
      })

      if (!assigned) {
        return res
          .status(403)
          .json({ success: false, message: 'Access denied' })
      }
    }
  }

  const vitals = await vitalsService.getVitalsByAppointmentId(appointmentId)

  res.status(200).json({
    success: true,
    data: vitals,
  })
})

export default {
  recordVitals,
  getVitalsByAppointmentId,
}
