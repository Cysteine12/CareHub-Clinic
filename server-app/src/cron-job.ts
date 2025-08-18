import cron from 'node-cron'
import logger from './middlewares/logger.js'
import prisma from './config/prisma.js'
import {
  AppointmentPurpose,
  AppointmentStatus,
  EventType,
} from '@prisma/client'
import emailService from './services/email.service.js'
import { addDays } from 'date-fns'

export type AppointmentSchedule = {
  appointment_date: string | Date
  appointment_time: string
  change_count: number
}

export type NoShowAppointment = {
  id: string
  schedule: AppointmentSchedule
  purposes: AppointmentPurpose[]
  email: string
  first_name: string
}

const daysFromNow = (days: number) => addDays(new Date(), days)

cron.schedule('0 7 * * *', async () => {
  logger.info('Running appointment reminder cron job at 7:00AM')

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      OR: [
        {
          AND: [
            { schedule: { path: ['appointment_date'], gte: daysFromNow(2) } },
            { schedule: { path: ['appointment_date'], lte: daysFromNow(3) } },
          ],
        },
        {
          AND: [
            { schedule: { path: ['appointment_date'], gte: daysFromNow(0) } },
            { schedule: { path: ['appointment_date'], lte: daysFromNow(1) } },
          ],
        },
      ],
    },
    include: { patient: { select: { email: true, first_name: true } } },
  })

  const upcomingAppointmentsEmailPromises = upcomingAppointments.map(
    (appointment) => {
      return emailService.sendAppointmentReminderMail(appointment, {
        email: appointment.patient.email,
        first_name: appointment.patient.first_name,
      })
    }
  )

  await Promise.all(upcomingAppointmentsEmailPromises)

  logger.info('Appointment reminder cron job executed successfully')
})

cron.schedule('0 19 * * *', async () => {
  logger.info('Running appointment no-show cron job at 7:00PM')

  const noShowAppointments = await prisma.$transaction(async (tx) => {
    const updatedAppointments = await tx.appointment.updateManyAndReturn({
      where: {
        status: AppointmentStatus.SCHEDULED,
        schedule: { path: ['appointment_date'], lte: new Date() },
      },
      data: { status: AppointmentStatus.NO_SHOW },
      select: {
        id: true,
        schedule: true,
        purposes: true,
        patient: { select: { email: true, first_name: true } },
      },
    })
    await tx.event.createMany({
      data: updatedAppointments.map((appointment) => ({
        appointment_id: appointment.id,
        type: EventType.APPOINTMENT_STATUS_CHANGED,
        status: AppointmentStatus.NO_SHOW,
      })),
    })

    return updatedAppointments
  })

  const emailPromises = noShowAppointments.map((appointment) => {
    return emailService.sendAppointmentResheduleRequestMail(appointment, {
      email: appointment.patient.email,
      first_name: appointment.patient.first_name,
    })
  })

  await Promise.all(emailPromises)

  logger.info('Appointment no-show cron job executed successfully')
})
