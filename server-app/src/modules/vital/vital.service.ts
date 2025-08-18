import { type Vital, type Prisma, EventType } from '@prisma/client'
import prisma from '../../config/prisma.js'

export type VitalWhereInput = Prisma.VitalWhereInput
export type VitalFindManyArgs = Prisma.VitalFindManyArgs
export type VitalWhereUniqueInput = Prisma.VitalWhereUniqueInput
export type VitalUncheckedCreateInput = Prisma.VitalUncheckedCreateInput
export type VitalUpdateInput = Prisma.VitalUpdateInput

const findVitals = async (
  filter?: VitalWhereInput,
  options?: VitalFindManyArgs & {
    page?: number
    limit?: number
  }
): Promise<[Vital[], total: number]> => {
  if (options?.page && options?.limit) {
    options.skip = (options?.page - 1) * options?.limit
  }

  return await prisma.$transaction([
    prisma.vital.findMany({
      where: filter,
      skip: options?.skip || 0,
      take: options?.limit || 20,
      orderBy: { updated_at: 'desc' },
    }),
    prisma.vital.count(),
  ])
}

const findVital = async (
  filter: VitalWhereUniqueInput
): Promise<Vital | null> => {
  return await prisma.vital.findUnique({
    where: filter,
  })
}

const updateOrCreateVital = async (
  filter: VitalWhereUniqueInput,
  payload: VitalUncheckedCreateInput
): Promise<Vital> => {
  return await prisma.vital.upsert({
    where: filter,
    create: {
      ...payload,
      events: {
        create: {
          type: EventType.VITALS_RECORDED,
          appointment_id: payload.appointment_id,
          created_by_id: payload.created_by_id,
        },
      },
    },
    update: {
      ...payload,
      events: {
        create: {
          type: EventType.VITALS_UPDATED,
          appointment_id: payload.appointment_id,
          created_by_id: payload.created_by_id,
        },
      },
    },
  })
}

const deleteVital = async (
  filter: VitalWhereUniqueInput
): Promise<Vital | null> => {
  return await prisma.vital.delete({
    where: filter,
  })
}

export default {
  findVitals,
  findVital,
  updateOrCreateVital,
  deleteVital,
}
