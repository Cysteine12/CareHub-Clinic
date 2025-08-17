import { toast } from 'sonner'
import API from '../../lib/api'
import type { CreateProviderSchema, UpdateProviderSchema } from './schema'
import type { IPagination } from './types'

const getAllProviders = async ({ page, limit }: IPagination) => {
  const { data } = await API.get(`/api/providers?page=${page}&limit=${limit}`)
  return data
}

const getProvidersStats = async () => {
  const { data } = await API.get(`/api/providers/stats`)
  return data
}

const searchProvidersByName = async (
  name: string,
  { page, limit }: IPagination
) => {
  const { data } = await API.get(
    `/api/providers/search?search=${name}&page=${page}&limit=${limit}`
  )
  return data
}

const getProvider = async (id: string) => {
  const { data } = await API.get(`/api/providers/${id}`)
  return data
}

const createProvider = async (payload: CreateProviderSchema) => {
  const { data } = await API.post(`/api/providers`, payload)
  return data
}

const updateProvider = async (id: string, payload: UpdateProviderSchema) => {
  const { data } = await API.put(`/api/providers/${id}`, payload)
  return data
}

const deleteProvider = async (id: string) => {
  const { data } = await API.get(`/api/providers/${id}`)
  return data
}

export {
  getAllProviders,
  getProvidersStats,
  searchProvidersByName,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
}

export const getAppointments = async () => {
  const { data } = await API.get(`/api/appointment/appointments`)

  if (!data?.success) {
    toast.error(data?.message || 'Failed to fetch appointments')
    return
  }

  return data.data
}

export const getProviders = async () => {
  const { data } = await API.get(`/api/providers`)

  if (!data?.success) {
    toast.error(data?.message || 'Failed to fetch providers')
    return
  }

  return data.data
}
