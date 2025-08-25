import API from '../../lib/api'
import type { RecordSoapNoteSchema } from './schema'

const recordSoapNote = async (payload: RecordSoapNoteSchema) => {
  const { data } = await API.post(`/api/soap-notes`, payload)
  return data
}

export { recordSoapNote }
