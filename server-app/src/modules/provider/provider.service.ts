import type { Provider, Prisma, Appointment } from '@prisma/client'
import prisma from '../../config/prisma.js'
import { subMonths } from 'date-fns'

export type ProviderWhereInput = Prisma.ProviderWhereInput
export type ProviderFindManyArgs = Prisma.ProviderFindManyArgs
export type ProviderWhereUniqueInput = Prisma.ProviderWhereUniqueInput
export type ProviderUncheckedCreateInput = Prisma.ProviderUncheckedCreateInput
export type ProviderUpdateInput = Prisma.ProviderUpdateInput

const findProviders = async (
  filter?: ProviderWhereInput,
  options?: ProviderFindManyArgs & {
    page?: number
    limit?: number
  }
): Promise<[Omit<Provider, 'password'>[], total: number]> => {
  if (options?.page && options?.limit) {
    options.skip = (options?.page - 1) * options?.limit
  }

  return await prisma.$transaction([
    prisma.provider.findMany({
      where: filter,
      skip: options?.skip || 0,
      take: options?.limit || 20,
      omit: { password: true },
      orderBy: { updated_at: 'desc' },
    }),
    prisma.provider.count(),
  ])
}

const findProvidersStats = async (): Promise<[number, number, number]> => {
  return await prisma.$transaction([
    // total providers
    prisma.provider.count(),
    // active provider in last month
    prisma.provider.count({
      where: {
        appointment_providers: {
          some: { created_at: { gte: subMonths(new Date(), 1) } },
        },
      },
    }),
    // new provider registration this month
    prisma.provider.count({
      where: { created_at: { gte: subMonths(new Date(), 1) } },
    }),
  ])
}

const findProviderStats = async (filter: {
  provider_id: string
}): Promise<[Appointment | null, Appointment | null]> => {
  return await prisma.$transaction([
    // last appointment
    prisma.appointment.findFirst({
      where: {
        appointment_providers: { some: { provider_id: filter.provider_id } },
        schedule: { path: ['date'], lte: new Date() },
      },
      orderBy: { updated_at: 'desc' },
    }),
    // next appointment
    prisma.appointment.findFirst({
      where: {
        appointment_providers: { some: { provider_id: filter.provider_id } },
        schedule: { path: ['date'], gte: new Date() },
      },
      orderBy: { created_at: 'desc' },
    }),
  ])
}

const findProvider = async (
  filter: ProviderWhereUniqueInput
): Promise<Provider | null> => {
  return await prisma.provider.findUnique({
    where: filter,
  })
}

const createProvider = async (
  payload: ProviderUncheckedCreateInput
): Promise<Provider> => {
  return await prisma.provider.create({
    data: payload,
  })
}

const updateProvider = async (
  filter: ProviderWhereUniqueInput,
  payload: ProviderUpdateInput
): Promise<Provider | null> => {
  return await prisma.provider.update({
    where: filter,
    data: payload,
  })
}

const deleteProvider = async (
  filter: ProviderWhereUniqueInput
): Promise<Provider | null> => {
  return await prisma.provider.delete({
    where: filter,
  })
}

export default {
  findProviders,
  findProvidersStats,
  findProviderStats,
  findProvider,
  createProvider,
  updateProvider,
  deleteProvider,
}
