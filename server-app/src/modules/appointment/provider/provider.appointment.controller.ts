import { AppointmentStatus, EventType, type Appointment } from '@prisma/client'
import {
  NotFoundError,
  UnauthorizedError,
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
import { endOfToday, startOfToday } from 'date-fns'

const getAppointments = catchAsync(async (req, res) => {
  const user = req.user!
  const query = req.query
  const options = { page: Number(query.page), limit: Number(query.limit) }

  let appointments = []
  if (['ADMIN', 'RECEPTIONIST'].includes(user.roleTitle!)) {
    appointments = await appointmentService.findAppointments({}, options)
  } else {
    appointments = await appointmentProviderService.findAppointmentProviders(
      { provider_id: user.id },
      options
    )
    appointments.map((appointmentProvider) => appointmentProvider.appointment)
  }

  res.status(200).json({
    success: true,
    data: appointments,
  })
})

const getAppointmentsBySchedule = catchAsync(async (req, res) => {
  const user = req.user!
  const { scheduleType } = req.params
  const query = req.query
  const options = { page: Number(query.page), limit: Number(query.limit) }

  let filters
  if (scheduleType === 'today') {
    filters = {
      schedule: { path: ['date'], gte: startOfToday(), lte: endOfToday() },
    }
  } else if (scheduleType === 'upcoming') {
    filters = { schedule: { path: ['date'], gte: startOfToday() } }
  }

  let appointments
  if (['ADMIN', 'RECEPTIONIST'].includes(user.roleTitle!)) {
    appointments = await appointmentService.findAppointments(filters, options)
  } else {
    appointments = await appointmentProviderService.findAppointmentProviders(
      { provider_id: user.id, appointment: filters },
      options
    )
    appointments.map((appointmentProvider) => appointmentProvider.appointment)
  }

  res.status(200).json({
    success: true,
    data: appointments,
  })
})

const searchAppointmentsByPatientName = catchAsync(async (req, res) => {
  const user = req.user!
  const query = req.query
  const options = { page: Number(query.page), limit: Number(query.limit) }

  let appointments = []
  if (['ADMIN', 'RECEPTIONIST'].includes(user.roleTitle!)) {
    appointments = await appointmentService.findAppointments(
      {
        patient: {
          OR: [
            { first_name: { contains: query.search, mode: 'insensitive' } },
            { last_name: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      },
      options
    )
  } else {
    appointments = await appointmentProviderService.findAppointmentProviders(
      {
        provider_id: user.id,
        appointment: {
          patient: {
            OR: [
              { first_name: { contains: query.search, mode: 'insensitive' } },
              { last_name: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
      },
      options
    )
    appointments.map((appointmentProvider) => appointmentProvider.appointment)
  }

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
  const user = req.user!
  const id = req.params.id

  let appointment: Appointment | undefined | null
  if (['ADMIN', 'RECEPTIONIST'].includes(user.roleTitle!)) {
    appointment = await appointmentService.findAppointment({ id })
  } else {
    const apptProvider =
      await appointmentProviderService.findAppointmentProvider({
        appointment_id_provider_id: {
          provider_id: user.id,
          appointment_id: id,
        },
      })
    appointment = apptProvider?.appointment
  }
  if (!appointment) throw new NotFoundError('Appointment not found')

  res.status(200).json({
    success: true,
    data: appointment,
  })
})

const createAppointment = catchAsync(async (req, res) => {
  const provider = req.user!
  const newAppointment: CreateProviderAppointmentSchema = req.body

  const savedAppointment = await appointmentService.createAppointment(
    newAppointment
  )

  res.status(201).json({
    success: true,
    data: savedAppointment,
    message: 'Appointment scheduled successfully',
  })
})

const updateAppointment = catchAsync(async (req, res) => {
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

  if (
    provider.roleTitle &&
    !['ADMIN', 'RECEPTIONIST'].includes(provider.roleTitle)
  ) {
    if (!['ATTENDING', 'ATTENDED'].includes(status)) {
      throw new UnauthorizedError('Not authorized to set this status')
    }
  }

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

  if (status === AppointmentStatus.SCHEDULED) {
    await emailService.sendAppointmentScheduledMail(
      updatedAppointment.patient,
      updatedAppointment.schedule as AppointmentSchedule
    )

    const token = await googleAuthService.findCalendarToken({
      patient_id: updatedAppointment.patient_id,
    })
    if (token) {
      const addMinutesToDate = (iso: string | Date) => {
        const date = new Date(iso)
        date.setMinutes(date.getMinutes() + 30)
        return date.toISOString()
      }
      await calendarService.createCalendarEvent(token.tokens as Credentials, {
        summary: `${config.APP_NAME} Medical Appointment Schedule`,
        description: `Appointment is scheduled for ${updatedAppointment.purposes
          .join(', ')
          .replace('_', ' ')}. \nVisit ${
          config.ORIGIN_URL
        }/appointments for more details.`,
        start: (
          updatedAppointment.schedule as AppointmentSchedule
        ).date.toString(),
        end: addMinutesToDate(
          (updatedAppointment.schedule as AppointmentSchedule).date.toString()
        ),
      })
    }
  }

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
  const user = req.user!
  const { id: appointment_id } = req.params
  const { provider_id }: AssignProviderSchema = req.body

  const isAlreadyAssigned =
    await appointmentProviderService.findAppointmentProvider({
      appointment_id_provider_id: { appointment_id, provider_id },
    })
  if (isAlreadyAssigned) throw new ValidationError('Provider already assigned')

  const appointment =
    await appointmentProviderService.createAppointmentProvider({
      appointment_id: appointment_id,
      provider_id: provider_id,
      events: {
        create: {
          type: EventType.PROVIDER_ASSIGNED,
          appointment_id: appointment_id,
          created_by_id: user.id,
        },
      },
    })
  if (!appointment) throw new NotFoundError('Appointment not found')

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
  getAppointmentsBySchedule,
  searchAppointmentsByPatientName,
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
