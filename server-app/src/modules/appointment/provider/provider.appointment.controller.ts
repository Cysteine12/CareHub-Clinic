import { AppointmentStatus, EventType } from '@prisma/client'
import {
  NotFoundError,
  ValidationError,
} from '../../../middlewares/errorHandler.js'
import catchAsync from '../../../utils/catchAsync.js'
import appointmentService from '../appointment.service.js'
import type {
  AssignProviderSchema,
  CreateProviderAppointmentSchema,
  FollowUpAppointmentSchema,
  UpdateAppointmentStatusSchema,
  UpdateProviderAppointmentSchema,
} from '../appointment.validation.js'
import appointmentProviderService from './appointmentProvider.service.js'
import emailService from '../../../services/email.service.js'
import type { AppointmentSchedule } from '../../../cron-job.js'
import googleAuthService from '../../auth/google/googleAuth.service.js'
import calendarService from '../../../services/calendar.service.js'
import type { Credentials } from 'google-auth-library'
import config from '../../../config/config.js'

const getAppointments = catchAsync(async (req, res) => {
  const query = req.query
  const options = { page: Number(query.page), limit: Number(query.limit) }

  const appointments = await appointmentService.findAppointments({}, options)

  res.status(200).json({
    success: true,
    data: appointments,
  })
})

const getAppointmentsByPatient = catchAsync(async (req, res) => {
  const { patient_id } = req.params
  const query = req.query

  const options = { page: Number(query.page), limit: Number(query.limit) }

  const appointments = await appointmentService.findAppointments(
    { patient_id },
    options
  )

  res.status(200).json({
    success: true,
    data: appointments,
  })
})

const getAppointmentsByProvider = catchAsync(async (req, res) => {
  const { provider_id } = req.params
  const query = req.query

  const options = { page: Number(query.page), limit: Number(query.limit) }

  const appointments = await appointmentService.findAppointments(
    { appointment_providers: { every: { provider_id } } },
    options
  )

  res.status(200).json({
    success: true,
    data: appointments,
  })
})

const getAppointment = catchAsync(async (req, res) => {
  const id = req.params.id

  const appointment = await appointmentService.findAppointment({ id })
  if (!appointment) throw new NotFoundError('Appointment not found')

  res.status(200).json({
    success: true,
    data: appointment,
  })
})

const createAppointment = catchAsync(async (req, res) => {
  const provider = req.user!
  const newAppointment: CreateProviderAppointmentSchema = req.body

  const savedAppointment = await appointmentService.createAppointment({
    ...newAppointment,
    status: AppointmentStatus.SCHEDULED,
    events: {
      create: {
        type: EventType.APPOINTMENT_STATUS_CHANGED,
        created_by_id: provider.id,
      },
    },
  })

  res.status(201).json({
    success: true,
    data: savedAppointment,
    message: 'Appointment scheduled successfully',
  })
})

const updateAppointment = catchAsync(async (req, res) => {
  const provider = req.user!
  const id = req.params.id
  const newAppointment: UpdateProviderAppointmentSchema = req.body

  const updatedAppointment = await appointmentService.updateAppointment(
    { id },
    newAppointment
  )
  if (!updatedAppointment) throw new NotFoundError('Appointment not found')

  res.status(200).json({
    success: true,
    data: updatedAppointment,
    message: 'Appointment updated successfully',
  })
})

const updateAppointmentStatus = catchAsync(async (req, res) => {
  const provider = req.user!
  const id = req.params.id
  const { status }: UpdateAppointmentStatusSchema = req.body

  const updatedAppointment = await appointmentService.updateAppointment(
    { id },
    {
      status,
      events: {
        create: {
          type: EventType.APPOINTMENT_STATUS_CHANGED,
          created_by_id: provider.id,
        },
      },
    }
  )
  if (!updatedAppointment) throw new NotFoundError('Appointment not found')

  res.status(200).json({
    success: true,
    data: updatedAppointment,
    message: 'Appointment status updated successfully',
  })
})

const followUpAppointment = catchAsync(async (req, res) => {
  const provider = req.user!
  const id = req.params.id
  const newAppointment: FollowUpAppointmentSchema = req.body

  const appointment = await appointmentService.findAppointment({ id })
  if (!appointment) throw new NotFoundError('Appointment not found')

  const allowedStatuses = ['COMPLETED', 'CONFIRMED'] as AppointmentStatus[]

  if (!allowedStatuses.includes(appointment.status)) {
    throw new ValidationError(
      `${appointment.status.toLowerCase()} appointments can't have follow-up`
    )
  }

  const updatedAppointment = await appointmentService.updateAppointment(
    { id },
    {
      is_follow_up_required: true,
      follow_up_appointment: {
        create: {
          ...newAppointment,
          status: AppointmentStatus.SCHEDULED,
          patient_id: appointment.patient_id,
          events: {
            create: {
              type: EventType.APPOINTMENT_STATUS_CHANGED,
              created_by_id: provider.id,
            },
          },
        },
      },
    }
  )
  if (!updatedAppointment) throw new NotFoundError('Appointment not found')

  res.status(200).json({
    success: true,
    data: updatedAppointment,
    message: 'Follow up appointment scheduled successfully',
  })
})

const assignAppointmentProvider = catchAsync(async (req, res) => {
  const { appointment_id, provider_id }: AssignProviderSchema = req.body

  const isAlreadyAssigned =
    await appointmentProviderService.findAppointmentProvider({
      appointment_id_provider_id: { appointment_id, provider_id },
    })
  if (isAlreadyAssigned) throw new ValidationError('Provider already assigned')

  const [appointment, alreadyScheduled] =
    await appointmentProviderService.createAppointmentProvider({
      appointment_id: appointment_id,
      provider_id: provider_id,
    })
  if (!appointment) throw new NotFoundError('Appointment not found')

  await emailService.sendAppointmentScheduledMail(
    appointment.patient,
    appointment.schedule as AppointmentSchedule
  )

  if (!alreadyScheduled) {
    const token = await googleAuthService.findCalendarToken({
      patient_id: appointment.patient_id,
    })
    if (token) {
      const addMinutesToDate = (iso: string | Date) => {
        const date = new Date(iso)
        date.setMinutes(date.getMinutes() + 30)
        return date.toISOString()
      }
      await calendarService.createCalendarEvent(token.tokens as Credentials, {
        summary: `${config.APP_NAME} Medical Appointment Schedule`,
        description: `Appointment is scheduled for ${appointment.purposes
          .join(', ')
          .replace('_', ' ')}. \nVisit ${
          config.ORIGIN_URL
        }/appointments for more details.`,
        start: (appointment.schedule as AppointmentSchedule).date.toString(),
        end: addMinutesToDate(
          (appointment.schedule as AppointmentSchedule).date.toString()
        ),
      })
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Appointment provider assigned successfully',
    data: appointment,
  })
})

const deleteAppointment = catchAsync(async (req, res) => {
  const id = req.params.id

  const appointment = await appointmentService.findAppointment({ id })
  if (!appointment) throw new NotFoundError('Appointment not found')

  const allowedStatuses = [
    'SUBMITTED',
    'SCHEDULED',
    'RESCHEDULED',
  ] as AppointmentStatus[]

  if (!allowedStatuses.includes(appointment.status)) {
    throw new ValidationError(
      `${appointment.status.toLowerCase()} appointments can't have follow-up`
    )
  }

  const deletedAppointment = await appointmentService.deleteAppointment({ id })
  if (!deletedAppointment) throw new NotFoundError('Appointment not found')

  res.status(200).json({
    success: true,
    data: deletedAppointment,
    message: 'Appointment deleted successfully',
  })
})

export default {
  getAppointments,
  getAppointmentsByPatient,
  getAppointmentsByProvider,
  getAppointment,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  followUpAppointment,
  assignAppointmentProvider,
  deleteAppointment,
}
