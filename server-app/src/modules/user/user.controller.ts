import { AppointmentStatus } from '@prisma/client'
import prisma from '../../config/prisma.js'
import { UserType } from '../../types/index.js'
import catchAsync from '../../utils/catchAsync.js'
import { endOfDay, startOfDay, subMonths } from 'date-fns'

const dashboard = catchAsync(async (req, res) => {
  const { id, type: userType } = req.user!
  const today = new Date()

  let data: any
  if (userType === UserType.PATIENT) {
    const [nextAppointment, lastVital, lastSoapNote, upcomingAppointments] =
      await prisma.$transaction([
        prisma.appointment.findFirst({
          where: {
            patient_id: id,
            schedule: { path: ['appointment_date'], gte: today },
          },
          orderBy: { created_at: 'asc' },
        }),
        prisma.vital.findFirst({
          where: { appointment: { patient_id: id } },
          orderBy: { created_at: 'desc' },
        }),
        prisma.soapNote.findFirst({
          where: { appointment: { patient_id: id } },
          orderBy: { created_at: 'desc' },
        }),
        prisma.appointment.findMany({
          where: {
            patient_id: id,
            schedule: { path: ['appointment_date'], gte: today },
          },
          orderBy: { created_at: 'asc' },
        }),
      ])

    data = { nextAppointment, lastVital, lastSoapNote, upcomingAppointments }
  } else if (userType === UserType.PROVIDER) {
    const [
      todayAppointments,
      totalActivePatientsInLastMonth,
      totalNoShowAppointments,
      totalCheckedInAppointments,
    ] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: {
          AND: [
            {
              schedule: { path: ['appointment_date'], gte: startOfDay(today) },
            },
            { schedule: { path: ['appointment_date'], lte: endOfDay(today) } },
          ],
        },
        include: { patient: { select: { first_name: true, last_name: true } } },
      }),
      prisma.patient.count({
        where: {
          appointments: { some: { updated_at: { gte: subMonths(today, 1) } } },
        },
      }),
      prisma.appointment.count({
        where: { events: { some: { status: AppointmentStatus.NO_SHOW } } },
      }),
      prisma.appointment.count({
        where: { events: { some: { status: AppointmentStatus.CHECKED_IN } } },
      }),
    ])

    const noShowRate =
      (totalNoShowAppointments / totalCheckedInAppointments) * 100

    data = {
      todayAppointments,
      totalActivePatientsInLastMonth,
      noShowRate: noShowRate.toFixed(2),
      waitTimeRate: 0,
    }
  }

  res.status(200).json({
    success: true,
    data: data,
  })
})

export default { dashboard }
