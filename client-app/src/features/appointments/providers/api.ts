import API from '../../../lib/api'
import type {
  AssignProviderSchema,
  CreateProviderAppointmentSchema,
  FollowUpAppointmentSchema,
  UpdateAppointmentStatusSchema,
  UpdateProviderAppointmentSchema,
} from '../schema'
import type { IPagination } from '../types'

const getAppointments = async ({ page, limit }: IPagination) => {
  const { data } = await API.get(
    `/api/provider/appointments?page=${page}&limit=${limit}`
  )
  return data
}

const getAppointmentsBySchedule = async (
  scheduleType: string,
  { page, limit }: IPagination
) => {
  const { data } = await API.get(
    `/api/provider/appointments/schedule/${scheduleType}?page=${page}&limit=${limit}`
  )
  return data
}

const searchAppointmentsByPatientName = async (
  name: string,
  { page, limit }: IPagination
) => {
  const { data } = await API.get(
    `/api/provider/appointments/search?search=${name}&page=${page}&limit=${limit}`
  )
  return data
}

const getAppointmentsByPatient = async (
  id: string,
  { page, limit }: IPagination
) => {
  const { data } = await API.get(
    `/api/provider/appointments/patient/${id}?page=${page}&limit=${limit}`
  )
  return data
}

const getAppointmentsByProvider = async (
  id: string,
  { page, limit }: IPagination
) => {
  const { data } = await API.get(
    `/api/provider/appointments/provider/${id}?page=${page}&limit=${limit}`
  )
  return data
}

const getAppointment = async (id: string) => {
  const { data } = await API.get(`/api/provider/appointments/${id}`)
  return data
}

const createAppointment = async (payload: CreateProviderAppointmentSchema) => {
  const { data } = await API.post(`/api/provider/appointments`, payload)
  return data
}

const updateAppointment = async (
  id: string,
  payload: UpdateProviderAppointmentSchema
) => {
  const { data } = await API.patch(`/api/provider/appointments/${id}`, payload)
  return data
}

const updateAppointmentStatus = async (
  id: string,
  payload: UpdateAppointmentStatusSchema
) => {
  const { data } = await API.patch(
    `/api/provider/appointments/${id}/status`,
    payload
  )
  return data
}

const followUpAppointment = async (
  id: string,
  payload: FollowUpAppointmentSchema
) => {
  const { data } = await API.patch(
    `/api/provider/appointments/${id}/followup`,
    payload
  )
  return data
}

const assignAppointmentProvider = async (
  id: string,
  payload: AssignProviderSchema
) => {
  const { data } = await API.patch(
    `/api/provider/appointments/${id}/assign`,
    payload
  )
  return data
}

const deleteAppointment = async (id: string) => {
  const { data } = await API.get(`/api/provider/appointments/${id}`)
  return data
}

export {
  getAppointments,
  getAppointmentsBySchedule,
  searchAppointmentsByPatientName,
  getAppointmentsByPatient,
  getAppointmentsByProvider,
  getAppointment,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  followUpAppointment,
  assignAppointmentProvider,
  deleteAppointment,
}
