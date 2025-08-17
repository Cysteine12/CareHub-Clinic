import type { Vitals, Prisma } from '@prisma/client'
import prisma from '../../config/prisma.js'
import type { VitalsRecord } from '../vitals/vitals.validation.js'
import { EventType } from '@prisma/client'

export type VitalsCreateInput = Prisma.VitalsCreateInput

// for nested vitals in appointment create
function buildVitals(
  payload: VitalsRecord | undefined,
  createdById: string
):
  | {
      create: Omit<VitalsRecord, 'events'> & {
        events: { create: { type: EventType; created_by_id: string }[] }
      }
    }
  | undefined {
  if (!payload) return undefined

  const { events, ...rest } = payload

  return {
    create: {
      ...rest,
      events: {
        create: [
          {
            type: EventType.VITALS_RECORDED,
            created_by_id: createdById,
          },
        ],
      },
    },
  }
}

async function recordVitals(
  payload: Prisma.VitalsCreateInput
): Promise<Vitals> {
  const { appointment, ...rest } = payload

  const { created_by_id, ...vitalsData } = rest as any

  return prisma.vitals.create({
    data: {
      ...vitalsData,
      created_by: {
        connect: { id: created_by_id },
      },
      appointment,
      events: {
        create: [
          {
            type: EventType.VITALS_RECORDED,
            created_by: {
              connect: { id: created_by_id },
            },
          },
        ],
      },
    },
  })
}

async function getVitalsByAppointmentId(appointmentId: string) {
  return prisma.vitals.findMany({
    where: {
      appointment_id: appointmentId,
    },
    include: {
      created_by: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          role_title: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })
}

export default {
  buildVitals,
  recordVitals,
  getVitalsByAppointmentId,
}
