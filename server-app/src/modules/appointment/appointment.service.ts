import type { Appointment, Patient, Prisma } from '@prisma/client'
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
): Promise<[Appointment[], number]> => {
  if (options?.page && options?.limit) {
    options.skip = (options?.page - 1) * options?.limit
  }

  return await prisma.$transaction([
    prisma.appointment.findMany({
      where: filter,
      skip: options?.skip || 0,
      take: options?.limit || 20,
      include: { patient: { omit: { password: true } } },
    }),
    prisma.appointment.count({ where: filter }),
  ])
}

const findAppointment = async (
  filter: AppointmentWhereUniqueInput
): Promise<Appointment | null> => {
  return await prisma.appointment.findUnique({
    where: filter,
    include: {
      patient: { omit: { password: true } },
      events: true,
      vital: true,
      soap_notes: true,
      appointment_providers: {
        include: { provider: { omit: { password: true } } },
      },
      follow_up_appointment: true,
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
  ).toISOString()

  return await prisma.appointment.create({
    data: payload,
  })
}

const updateAppointment = async (
  filter: AppointmentWhereUniqueInput,
  payload: AppointmentUpdateInput & { schedule?: AppointmentScheduleSchema }
): Promise<(Appointment & { patient: Omit<Patient, 'password'> }) | null> => {
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
    include: {
      patient: { omit: { password: true } },
      follow_up_appointment: true,
    },
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
