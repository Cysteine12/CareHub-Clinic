import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProvider,
  getAllProviders,
  getProvider,
  getProvidersStats,
  searchProvidersByName,
  updateProvider,
} from './api'
import type { CreateProviderSchema, UpdateProviderSchema } from './schema'
import { useNavigate } from 'react-router'
import type { AxiosError } from 'axios'
import type { APIResponse, IPagination } from './types'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/auth-store'

const useProviders = (query: IPagination) => {
  const { user } = useAuthStore()

  return useQuery({
    queryFn: () => getAllProviders(query),
    queryKey: ['providers', query.page],
    enabled: !!(
      user?.role_title && ['ADMIN', 'RECEPTIONIST'].includes(user.role_title)
    ),
  })
}

const useProvidersStats = () => {
  return useQuery({
    queryFn: () => getProvidersStats(),
    queryKey: ['providers-stats'],
  })
}

const useSearchProvidersByName = () => {
  return useMutation({
    mutationFn: ({ name, query }: { name: string; query: IPagination }) =>
      searchProvidersByName(name, query),
    mutationKey: ['searchProviders'],
  })
}

const useProvider = (id: string | undefined) => {
  return useQuery({
    queryFn: () => getProvider(id!),
    queryKey: ['provider', id],
    enabled: !!id,
  })
}

const useCreateProvider = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProviderSchema) => createProvider(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['provider'] })
      toast.success(data.message)
      navigate(`/provider/list`)
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}

const useUpdateProvider = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  type UpdateProviderMutation = { id: string; payload: UpdateProviderSchema }

  return useMutation({
    mutationFn: ({ id, payload }: UpdateProviderMutation) =>
      updateProvider(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['provider', data.data.id] })
      toast.success(data.message)
      navigate(`/provider/list`)
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}
export {
  useProviders,
  useProvidersStats,
  useSearchProvidersByName,
  useProvider,
  useCreateProvider,
  useUpdateProvider,
}
