import API from '../../../lib/api'
import type {
  CreatePatientAppointmentSchema,
  UpdatePatientAppointmentSchema,
} from '../schema'
import type { IPagination } from '../types'

const getAppointments = async ({ page, limit }: IPagination) => {
  const { data } = await API.get(
    `/api/patient/appointments?page=${page}&limit=${limit}`
  )
  return data
}

const getAppointment = async (id: string) => {
  const { data } = await API.get(`/api/patient/appointments/${id}`)
  return data
}

const createAppointment = async (payload: CreatePatientAppointmentSchema) => {
  const { data } = await API.post(`/api/patient/appointments`, payload)
  return data
}

const updateAppointment = async (
  id: string,
  payload: UpdatePatientAppointmentSchema
) => {
  const { data } = await API.patch(`/api/patient/appointments/${id}`, payload)
  return data
}

const rescheduleAppointment = async (
  id: string,
  payload: UpdatePatientAppointmentSchema
) => {
  const { data } = await API.patch(
    `/api/patient/appointments/${id}/reschedule`,
    payload
  )
  return data
}

const cancelAppointment = async (id: string) => {
  const { data } = await API.patch(`/api/patient/appointments/${id}/cancel`)
  return data
}

export {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  cancelAppointment,
}
