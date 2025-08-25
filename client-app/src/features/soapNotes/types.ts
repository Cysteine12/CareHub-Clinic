import type { RecordSoapNoteSchema } from './schema'

export interface APIResponse<T = unknown> {
  success: true
  message?: string
  data?: T
  total?: number
}

export interface IPagination {
  page: number
  limit: number
  total?: number
}

export type SoapNote = RecordSoapNoteSchema & {
  id: string
  created_by_id: string
  created_at: string
  updated_at: string
}
