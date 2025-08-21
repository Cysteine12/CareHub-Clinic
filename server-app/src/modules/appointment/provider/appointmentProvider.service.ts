import type { AppointmentProvider, Prisma, Appointment } from '@prisma/client'
import prisma from '../../../config/prisma.js'

export type AppointmentProviderWhereInput = Prisma.AppointmentProviderWhereInput
export type AppointmentProviderWhereUniqueInput =
  Prisma.AppointmentProviderWhereUniqueInput
export type AppointmentProviderFindManyArgs =
  Prisma.AppointmentProviderFindManyArgs
export type AppointmentProviderUncheckedCreateInput =
  Prisma.AppointmentProviderUncheckedCreateInput

const findAppointmentProviders = async (
  filter: AppointmentProviderWhereInput,
  options?: AppointmentProviderFindManyArgs & {
    page?: number
    limit?: number
  }
): Promise<(AppointmentProvider & { appointment: Appointment })[]> => {
  if (options?.page && options?.limit) {
    options.skip = (options?.page - 1) * options?.limit
  }

  return await prisma.appointmentProvider.findMany({
    where: filter,
    skip: options?.skip || 0,
    take: options?.limit || 20,
    include: {
      appointment: { include: { patient: { omit: { password: true } } } },
    },
  })
}

const findAppointmentProvider = async (
  filter: AppointmentProviderWhereUniqueInput
): Promise<(AppointmentProvider & { appointment: Appointment }) | null> => {
  return await prisma.appointmentProvider.findUnique({
    where: filter,
    include: {
      appointment: {
        include: {
          patient: { omit: { password: true } },
          events: true,
          vital: true,
          soap_notes: true,
          appointment_providers: {
            include: { provider: { omit: { password: true } } },
          },
        },
      },
    },
  })
}

const createAppointmentProvider = async (
  payload: AppointmentProviderUncheckedCreateInput
): Promise<AppointmentProvider> => {
  return await prisma.appointmentProvider.create({ data: payload })
}

export default {
  findAppointmentProviders,
  findAppointmentProvider,
  createAppointmentProvider,
}
