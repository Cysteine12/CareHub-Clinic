import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignAppointmentProvider,
  createAppointment,
  getAppointment,
  getAppointments,
  getAppointmentsByPatient,
  getAppointmentsByProvider,
  getAppointmentsBySchedule,
  searchAppointmentsByPatientName,
  updateAppointment,
  updateAppointmentStatus,
} from './api'
import type {
  AssignProviderSchema,
  CreateProviderAppointmentSchema,
  UpdateAppointmentStatusSchema,
  UpdateProviderAppointmentSchema,
} from '../schema'
import { useNavigate } from 'react-router'
import type { AxiosError } from 'axios'
import type { APIResponse, IPagination } from '../types'
import { toast } from 'sonner'

const useAppointments = (query: IPagination) => {
  return useQuery({
    queryFn: () => getAppointments(query),
    queryKey: ['appointments', query.page],
  })
}

const useAppointmentsBySchedule = (type: string, query: IPagination) => {
  return useQuery({
    queryFn: () => getAppointmentsBySchedule(type, query),
    queryKey: ['appointments', 'schedule', type],
  })
}

const useAppointmentsByPatient = (id: string, query: IPagination) => {
  return useQuery({
    queryFn: () => getAppointmentsByPatient(id, query),
    queryKey: ['appointments', 'patient', id],
  })
}

const useAppointmentsByProvider = (id: string, query: IPagination) => {
  return useQuery({
    queryFn: () => getAppointmentsByProvider(id, query),
    queryKey: ['appointments', 'provider', id],
  })
}

const useSearchAppointmentsByPatientName = () => {
  return useMutation({
    mutationFn: ({ name, query }: { name: string; query: IPagination }) =>
      searchAppointmentsByPatientName(name, query),
    mutationKey: ['appointments', 'search'],
  })
}

const useAppointment = (id: string | undefined) => {
  return useQuery({
    queryFn: () => getAppointment(id!),
    queryKey: ['appointments', id],
    enabled: !!id,
  })
}

const useCreateAppointment = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProviderAppointmentSchema) =>
      createAppointment(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success(data.message)
      navigate(`/provider/Appointments/${data.data.id}`)
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}

const useUpdateAppointment = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  type UpdateAppointmentMutation = {
    id: string
    payload: UpdateProviderAppointmentSchema
  }

  return useMutation({
    mutationFn: ({ id, payload }: UpdateAppointmentMutation) =>
      updateAppointment(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', data.data.id],
      })
      toast.success(data.message)
      navigate(`/provider/appointments/${data.data.id}`)
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}

const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient()
  type UpdateAppointmentStatusMutation = {
    id: string
    payload: UpdateAppointmentStatusSchema
  }

  return useMutation({
    mutationFn: ({ id, payload }: UpdateAppointmentStatusMutation) =>
      updateAppointmentStatus(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', data.data.id],
      })
      toast.success(data.message)
      return data
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}

const useAssignAppointmentProvider = () => {
  const queryClient = useQueryClient()
  type AssignAppointmentProviderMutation = {
    id: string
    payload: AssignProviderSchema
  }

  return useMutation({
    mutationFn: ({ id, payload }: AssignAppointmentProviderMutation) =>
      assignAppointmentProvider(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', ''] })
      toast.success(data.message)
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}

export {
  useAppointments,
  useAppointmentsBySchedule,
  useAppointmentsByPatient,
  useAppointmentsByProvider,
  useSearchAppointmentsByPatientName,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
  useUpdateAppointmentStatus,
  useAssignAppointmentProvider,
}
