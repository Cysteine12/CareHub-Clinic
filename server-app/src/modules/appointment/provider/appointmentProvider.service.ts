import {
  AppointmentStatus,
  type Appointment,
  type AppointmentProvider,
  type Prisma,
} from '@prisma/client'
import prisma from '../../../config/prisma.js'

export type AppointmentProviderWhereUniqueInput =
  Prisma.AppointmentProviderWhereUniqueInput
export type AppointmentProviderUncheckedCreateInput =
  Prisma.AppointmentProviderUncheckedCreateInput

const findAppointmentProvider = async (
  filter: AppointmentProviderWhereUniqueInput
): Promise<AppointmentProvider | null> => {
  return await prisma.appointmentProvider.findUnique({
    where: filter,
  })
}

const createAppointmentProvider = async (
  payload: AppointmentProviderUncheckedCreateInput
): Promise<
  [
    (Appointment & { patient: { first_name: string; email: string } }) | null,
    boolean
  ]
> => {
  const alreadyScheduled = await prisma.appointmentProvider.findFirst({
    where: { appointment_id: payload.appointment_id },
  })

  if (!alreadyScheduled) {
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: payload.appointment_id },
        data: { status: AppointmentStatus.SCHEDULED },
      }),
      prisma.appointmentProvider.create({ data: payload }),
    ])
  }

  return [
    await prisma.appointment.findUnique({
      where: { id: payload.appointment_id },
      include: {
        appointment_providers: {
          include: {
            provider: { select: { first_name: true, last_name: true } },
          },
        },
        patient: { select: { first_name: true, email: true } },
      },
    }),
    !!alreadyScheduled,
  ]
}

export default {
  findAppointmentProvider,
  createAppointmentProvider,
}
