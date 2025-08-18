import { AppointmentStatus } from '@prisma/client'
import {
  NotFoundError,
  ValidationError,
} from '../../../middlewares/errorHandler.js'
import catchAsync from '../../../utils/catchAsync.js'
import appointmentService from '../appointment.service.js'
import type {
  CreatePatientAppointmentSchema,
  UpdatePatientAppointmentSchema,
} from '../appointment.validation.js'

const getAppointments = catchAsync(async (req, res) => {
  const user = req.user!
  const query = req.query
  const options = { page: Number(query.page), limit: Number(query.limit) }

  const appointments = await appointmentService.findAppointments(
    { patient_id: user.id },
    options
  )

  res.status(200).json({
    success: true,
    data: appointments,
  })
})

const getAppointment = catchAsync(async (req, res) => {
  const user = req.user!
  const id = req.params.id

  const appointment = await appointmentService.findAppointment({
    id,
    patient_id: user.id,
  })
  if (!appointment) throw new NotFoundError('Appointment not found')

  res.status(200).json({
    success: true,
    data: appointment,
  })
})

const createAppointment = catchAsync(async (req, res) => {
  const user = req.user!
  const newAppointment: CreatePatientAppointmentSchema = req.body

  const savedAppointment = await appointmentService.createAppointment({
    ...newAppointment,
    patient_id: user.id,
    status: AppointmentStatus.SUBMITTED,
  })

  res.status(201).json({
    success: true,
    data: savedAppointment,
    message: 'Appointment submitted successfully',
  })
})

const updateAppointment = catchAsync(async (req, res) => {
  const user = req.user!
  const id = req.params.id
  const newAppointment: UpdatePatientAppointmentSchema = req.body

  const appointment = await appointmentService.findAppointment({
    id,
    patient_id: user.id,
  })
  if (!appointment) throw new NotFoundError('Appointment not found')
  if (appointment.status !== AppointmentStatus.SUBMITTED) {
    throw new ValidationError(`
      Appointment already ${appointment.status.toLowerCase()}.
      Reschedule or book new appointment.
    `)
  }

  const updatedAppointment = await appointmentService.updateAppointment(
    { id, patient_id: user.id },
    { ...newAppointment, status: AppointmentStatus.SUBMITTED }
  )

  res.status(200).json({
    success: true,
    data: updatedAppointment,
    message: 'Appointment updated successfully',
  })
})

const rescheduleAppointment = catchAsync(async (req, res) => {
  const user = req.user!
  const id = req.params.id
  const newAppointment: UpdatePatientAppointmentSchema = req.body

  const appointment = await appointmentService.findAppointment({
    id,
    patient_id: user.id,
  })
  if (!appointment) throw new NotFoundError('Appointment not found')

  const allowedStatuses = ['SCHEDULED', 'RESCHEDULED', 'NO_SHOW']

  if (!allowedStatuses.includes(appointment.status)) {
    throw new ValidationError(
      `Appointment already ${appointment.status.toLowerCase()}. Reschedule or book new appointment.`
    )
  }

  const rescheduledAppointment = await appointmentService.updateAppointment(
    { id, patient_id: user.id },
    {
      ...newAppointment,
      status: AppointmentStatus.RESCHEDULED,
    }
  )

  res.status(200).json({
    success: true,
    data: rescheduledAppointment,
    message: 'Appointment rescheduled successfully',
  })
})

const cancelAppointment = catchAsync(async (req, res) => {
  const user = req.user!
  const id = req.params.id

  const appointment = await appointmentService.findAppointment({
    id,
    patient_id: user.id,
  })
  if (!appointment) throw new NotFoundError('Appointment not found')

  const allowedStatuses = ['SUBMITTED', 'SCHEDULED', 'RESCHEDULED', 'NO_SHOW']

  if (!allowedStatuses.includes(appointment.status)) {
    throw new ValidationError(
      `Appointment already ${appointment.status.toLowerCase()}`
    )
  }

  const cancelledAppointment = await appointmentService.updateAppointment(
    { id, patient_id: user.id },
    { status: AppointmentStatus.CANCELLED }
  )

  res.status(200).json({
    success: true,
    data: cancelledAppointment,
    message: 'Appointment cancelled successfully',
  })
})

export default {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  cancelAppointment,
}
