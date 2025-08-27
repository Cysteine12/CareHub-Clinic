import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  cancelAppointment,
} from './api'
import type {
  CreatePatientAppointmentSchema,
  UpdatePatientAppointmentSchema,
} from '../schema'
import type { AxiosError } from 'axios'
import type { APIResponse, IPagination } from '../types'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const useAppointments = (query: IPagination) => {
  return useQuery({
    queryFn: () => getAppointments(query),
    queryKey: ['appointments'],
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePatientAppointmentSchema) =>
      createAppointment(payload),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
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
    payload: UpdatePatientAppointmentSchema
  }

  return useMutation({
    mutationFn: ({ id, payload }: UpdateAppointmentMutation) =>
      updateAppointment(id, payload),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      })
      navigate('/appointments')
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}

const useRescheduleAppointment = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  type UpdateAppointmentStatusMutation = {
    id: string
    payload: UpdatePatientAppointmentSchema
  }

  return useMutation({
    mutationFn: ({ id, payload }: UpdateAppointmentStatusMutation) =>
      rescheduleAppointment(id, payload),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      })
      navigate('/appointments')
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}

const useCancelAppointment = () => {
  const queryClient = useQueryClient()
  type CancelAppointmentMutation = {
    id: string
  }

  return useMutation({
    mutationFn: ({ id }: CancelAppointmentMutation) => cancelAppointment(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      })
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}

export {
  useAppointments,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
  useRescheduleAppointment,
  useCancelAppointment,
}
