import { type SoapNote, type Prisma, EventType } from '@prisma/client'
import prisma from '../../config/prisma.js'

export type SoapNoteWhereInput = Prisma.SoapNoteWhereInput
export type SoapNoteFindManyArgs = Prisma.SoapNoteFindManyArgs
export type SoapNoteWhereUniqueInput = Prisma.SoapNoteWhereUniqueInput
export type SoapNoteUncheckedCreateInput = Prisma.SoapNoteUncheckedCreateInput
export type SoapNoteUpdateInput = Prisma.SoapNoteUpdateInput

const findSoapNotes = async (
  filter?: SoapNoteWhereInput,
  options?: SoapNoteFindManyArgs & {
    page?: number
    limit?: number
  }
): Promise<[SoapNote[], total: number]> => {
  if (options?.page && options?.limit) {
    options.skip = (options?.page - 1) * options?.limit
  }

  return await prisma.$transaction([
    prisma.soapNote.findMany({
      where: filter,
      skip: options?.skip || 0,
      take: options?.limit || 20,
      orderBy: { updated_at: 'desc' },
    }),
    prisma.soapNote.count(),
  ])
}

const findSoapNote = async (
  filter: SoapNoteWhereUniqueInput
): Promise<SoapNote | null> => {
  return await prisma.soapNote.findUnique({
    where: filter,
  })
}

const updateOrCreateSoapNote = async (
  filter: SoapNoteWhereUniqueInput,
  payload: SoapNoteUncheckedCreateInput
): Promise<SoapNote> => {
  return await prisma.soapNote.upsert({
    where: filter,
    create: {
      ...payload,
      events: {
        create: {
          type: EventType.SOAP_NOTE_RECORDED,
          appointment_id: payload.appointment_id,
          created_by_id: payload.created_by_id,
        },
      },
    },
    update: {
      ...payload,
      events: {
        create: {
          type: EventType.SOAP_NOTE_UPDATED,
          appointment_id: payload.appointment_id,
          created_by_id: payload.created_by_id,
        },
      },
    },
  })
}

const deleteSoapNote = async (
  filter: SoapNoteWhereUniqueInput
): Promise<SoapNote | null> => {
  return await prisma.soapNote.delete({
    where: filter,
  })
}

export default {
  findSoapNotes,
  findSoapNote,
  updateOrCreateSoapNote,
  deleteSoapNote,
}
