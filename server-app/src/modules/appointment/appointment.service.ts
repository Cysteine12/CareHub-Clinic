import type { Appointment, Prisma } from '@prisma/client'
import prisma from '../../config/prisma.js'
import type { AppointmentScheduleSchema } from './appointment.validation.js'
import { ValidationError } from '../../middlewares/errorHandler.js'
import { addMinutes } from 'date-fns'

export type AppointmentWhereInput = Prisma.AppointmentWhereInput
export type AppointmentFindManyArgs = Prisma.AppointmentFindManyArgs
export type AppointmentWhereUniqueInput = Prisma.AppointmentWhereUniqueInput
export type AppointmentUncheckedCreateInput =
  Prisma.AppointmentUncheckedCreateInput
export type AppointmentProviderUncheckedCreateInput =
  Prisma.AppointmentProviderUncheckedCreateInput
export type AppointmentUpdateInput = Prisma.AppointmentUpdateInput

const findAppointments = async (
  filter?: AppointmentWhereInput,
  options?: AppointmentFindManyArgs & {
    page?: number
    limit?: number
  }
): Promise<Appointment[]> => {
  if (options?.page && options?.limit) {
    options.skip = (options?.page - 1) * options?.limit
  }

  return await prisma.appointment.findMany({
    where: filter,
    skip: options?.skip || 0,
    take: options?.limit || 20,
  })
}

const findAppointment = async (
  filter: AppointmentWhereUniqueInput
): Promise<Appointment | null> => {
  return await prisma.appointment.findUnique({
    where: filter,
    include: {
      events: true,
      vital: true,
      appointment_providers: {
        include: {
          provider: {
            select: { first_name: true, last_name: true, role_title: true },
          },
        },
      },
      soap_notes: true,
    },
  })
}

const createAppointment = async (
  payload: AppointmentUncheckedCreateInput & {
    schedule: AppointmentScheduleSchema
  }
): Promise<Appointment> => {
  const [hours, minutes] = payload.schedule.time.split(':')
  if (!hours || !minutes) throw new ValidationError('Invalid Time')

  payload.schedule.date = addMinutes(
    new Date(payload.schedule.date),
    parseInt(hours) * 60 + parseInt(minutes)
  ).toDateString()

  return await prisma.appointment.create({
    data: payload,
  })
}

const updateAppointment = async (
  filter: AppointmentWhereUniqueInput,
  payload: AppointmentUpdateInput & { schedule?: AppointmentScheduleSchema }
): Promise<Appointment | null> => {
  if (payload.schedule) {
    const [hours, minutes] = payload.schedule.time.split(':')
    if (!hours || !minutes) throw new ValidationError('Invalid Time')

    payload.schedule.date = addMinutes(
      new Date(payload.schedule.date),
      parseInt(hours) * 60 + parseInt(minutes)
    ).toDateString()
  }
  return await prisma.appointment.update({
    where: filter,
    data: payload,
  })
}

const deleteAppointment = async (
  filter: AppointmentWhereUniqueInput
): Promise<Appointment> => {
  return await prisma.appointment.delete({
    where: filter,
  })
}

export default {
  findAppointments,
  findAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
}
