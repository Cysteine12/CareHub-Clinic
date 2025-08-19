import {
  EventType,
  type Appointment,
  type InsuranceProvider,
  type Patient,
  type Prisma,
} from '@prisma/client'
import prisma from '../../config/prisma.js'
import { subMonths } from 'date-fns'

export type PatientWhereInput = Prisma.PatientWhereInput
export type PatientFindManyArgs = Prisma.PatientFindManyArgs
export type PatientWhereUniqueInput = Prisma.PatientWhereUniqueInput
export type PatientCreateInput = Prisma.PatientCreateInput
export type PatientUpdateInput = Prisma.PatientUpdateInput
export type AppointmentWhereInput = Prisma.AppointmentWhereInput

const findPatients = async (
  filter?: PatientWhereInput,
  options?: PatientFindManyArgs & {
    page?: number
    limit?: number
  }
): Promise<
  [
    (Omit<Patient, 'password'> & {
      insurance_provider: InsuranceProvider | null
    })[],
    total: number
  ]
> => {
  if (options?.page && options?.limit) {
    options.skip = (options?.page - 1) * options?.limit
  }

  return await prisma.$transaction([
    prisma.patient.findMany({
      where: filter,
      skip: options?.skip || 0,
      take: options?.limit || 20,
      omit: { password: true },
      orderBy: { updated_at: 'desc' },
      include: { insurance_provider: true },
    }),
    prisma.patient.count(),
  ])
}

const findPatientsStats = async (): Promise<[number, number, number]> => {
  return await prisma.$transaction([
    // total patients
    prisma.patient.count(),
    // active patient in last month
    prisma.patient.count({
      where: {
        appointments: {
          some: { updated_at: { gte: subMonths(new Date(), 1) } },
        },
      },
    }),
    // new patient registration this month
    prisma.patient.count({
      where: { created_at: { gte: subMonths(new Date(), 1) } },
    }),
  ])
}

const findPatientStats = async (
  filter: AppointmentWhereInput
): Promise<[Appointment | null, Appointment | null]> => {
  return await prisma.$transaction([
    // last visit date
    prisma.appointment.findFirst({
      where: {
        patient_id: filter.patient_id,
        events: { some: { type: EventType.VITALS_RECORDED } },
      },
      orderBy: { updated_at: 'desc' },
    }),
    // next appointment
    prisma.appointment.findFirst({
      where: {
        patient_id: filter.patient_id,
        schedule: { path: ['date'], gte: new Date() },
      },
      orderBy: { created_at: 'desc' },
    }),
  ])
}

const findPatient = async (
  filter: PatientWhereUniqueInput
): Promise<Patient | null> => {
  return await prisma.patient.findUnique({
    where: filter,
    include: { insurance_provider: true },
  })
}

const createPatient = async (payload: PatientCreateInput): Promise<Patient> => {
  return await prisma.patient.create({
    data: payload,
  })
}

const updatePatient = async (
  filter: PatientWhereUniqueInput,
  payload: PatientUpdateInput
): Promise<Patient | null> => {
  return await prisma.patient.update({
    where: filter,
    data: payload,
  })
}

const deletePatient = async (
  filter: PatientWhereUniqueInput
): Promise<Patient | null> => {
  return await prisma.patient.delete({
    where: filter,
  })
}

export default {
  findPatients,
  findPatientsStats,
  findPatientStats,
  findPatient,
  createPatient,
  updatePatient,
  deletePatient,
}
