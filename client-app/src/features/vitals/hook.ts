import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import type { APIResponse } from './types'
import type { RecordVitalSchema } from './schema'
import { recordVital } from './api'

const useRecordVital = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RecordVitalSchema) => recordVital(payload),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['appointments', id] })
    },
    onError: (data: AxiosError<APIResponse>) => {
      toast.error(data.response?.data?.message)
    },
  })
}

export { useRecordVital }
