import { PROVIDER_ROLES, UserType } from '../../types/index.js'
import vitalsService from '../vital/vital.service.js'
import soapnoteService from '../soapnote/soapNote.service.js'
import { EventType } from '@prisma/client'
import { logEvent } from '../events/events.utils.js'
import { isSameDay } from 'date-fns'
import appointmentService from './appointment.service.js'

export function authorizeUserForViewingAppointment(
  appointment: any,
  user: any
) {
  if (!user) throw new Error('User not authenticated')

  if (user.type === UserType.PATIENT) {
    if (appointment.patient_id !== user.id) {
      throw new Error('Access denied: Not your appointment')
    }
  } else if (user.type === UserType.PROVIDER) {
    if (user.roleTitle === 'ADMIN' || user.roleTitle === 'RECEPTIONIST') {
      return
    } else {
      const isAssignedProvider = appointment.appointment_providers?.some(
        (p: any) => p.provider_id === user.id
      )
      if (!isAssignedProvider) {
        throw new Error('Access denied: Not assigned to this appointment')
      }
    }
  } else {
    throw new Error('Unauthorized user type')
  }
}

export function getLoggedInUser(req: any) {
  const user = req.user
  // console.log('getLoggedInUser req.user:', req.user);

  if (!user || !user.type) {
    const err: any = new Error('User not authenticated')
    err.statusCode = 401
    throw err
  }

  return user
}

export function authorizeSensitiveAppointmentFields(req: any, updateData: any) {
  const loggedInUser = getLoggedInUser(req)
  const sensitiveFields = [
    'vitals',
    'soap_note',
    'appointment_providers',
    'follow_up',
    'status',
  ]

  if (
    loggedInUser &&
    loggedInUser.type === UserType.PATIENT &&
    updateData.status === 'CANCELLED'
  ) {
    return
  }

  for (const field of sensitiveFields) {
    if (updateData[field]) {
      if (
        !loggedInUser?.roleTitle ||
        !PROVIDER_ROLES.includes(loggedInUser.roleTitle)
      ) {
        const err: any = new Error(
          `Only providers with valid roles can update ${field.replace(
            /_/g,
            ' '
          )}`
        )
        err.statusCode = 403
        throw err
      }

      if (field === 'vitals') {
        updateData.vitals = vitalsService.buildVitals(
          updateData.vitals,
          loggedInUser
        )
      }

      if (field === 'soap_note') {
        updateData.soap_note = soapnoteService.buildSoapNoteNestedCreateInput(
          updateData.soap_note,
          loggedInUser
        )
      }

      if (field === 'appointment_providers') {
        updateData.appointment_providers =
          appointmentService.buildProvidersCreate(
            updateData.appointment_providers
          )
      }
    }
  }
}

interface AppointmentEventOptions {
  userId: string
  appointmentId: string
  statusChanged?: boolean
  vitalsId?: string | null
  soapNoteId?: string | null
  soapNoteUpdated?: boolean
}

export async function logAppointmentEvents({
  userId,
  appointmentId,
  statusChanged = false,
  vitalsId,
  soapNoteId,
  soapNoteUpdated = false,
}: AppointmentEventOptions) {
  if (statusChanged) {
    await logEvent({
      type: EventType.APPOINTMENT_STATUS_CHANGED,
      created_by_id: userId,
      appointment_id: appointmentId,
    })
  }

  if (vitalsId) {
    await logEvent({
      type: EventType.VITALS_RECORDED,
      created_by_id: userId,
      appointment_id: appointmentId,
      vitals_id: vitalsId,
    })
  }

  if (soapNoteId) {
    await logEvent({
      type: soapNoteUpdated
        ? EventType.SOAP_NOTE_UPDATED
        : EventType.SOAP_NOTE_RECORDED,
      created_by_id: userId,
      appointment_id: appointmentId,
      soap_note_id: soapNoteId,
    })
  }
}

// Prevent same day appointment booking within working hours
const CLINIC_START_HOUR = 8
const CLINIC_START_MINUTE = 0
const CLINIC_END_HOUR = 16
const CLINIC_END_MINUTE = 45

export function isWithinClinicHours(date: Date): boolean {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date object passed to isWithinClinicHours')
  }

  const totalMinutes = date.getHours() * 60 + date.getMinutes()
  const startMinutes = CLINIC_START_HOUR * 60 + CLINIC_START_MINUTE
  const endMinutes = CLINIC_END_HOUR * 60 + CLINIC_END_MINUTE
  return totalMinutes >= startMinutes && totalMinutes <= endMinutes
}

export function canScheduleAppointment(
  newAppointment: Date,
  existingAppointments: Date[]
): {
  allowed: boolean
  reason?: string
} {
  const sameDayExists = existingAppointments.some((appt) =>
    isSameDay(appt, newAppointment)
  )

  if (sameDayExists) {
    return {
      allowed: false,
      reason:
        'An appointment already EXISTS for this day. Please choose another day.',
    }
  }

  if (!isWithinClinicHours(newAppointment)) {
    return {
      allowed: false,
      reason: 'Appointment time must be BETWEEN 8:00 AM and 4:45 PM.',
    }
  }

  return { allowed: true }
}

// Appointment wait time tracking for a provider
export function calculateWaitTimeMinutes(
  checkedInTime: Date | undefined,
  attendingTime: Date | undefined
): number | null {
  if (!checkedInTime || !attendingTime) {
    return null
  }

  const diffMs = attendingTime.getTime() - checkedInTime.getTime()
  if (diffMs < 0) {
    return null
  }

  const diffMinutes = diffMs / 1000 / 60

  return diffMinutes
}

// Appointment no show rates
export function calculateNoShowRate(
  appointments: { status: string }[]
): number {
  if (appointments.length === 0) return 0
  const noShowCount = appointments.filter(
    (app) => app.status === 'NO_SHOW'
  ).length
  const rate = (noShowCount / appointments.length) * 100
  return parseFloat(rate.toFixed(2))
}
