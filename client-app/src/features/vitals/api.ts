import API from '../../lib/api'
import type { RecordVitalSchema } from './schema'

const recordVital = async (payload: RecordVitalSchema) => {
  const { data } = await API.post(`/api/vitals`, payload)
  return data
}

export { recordVital }
