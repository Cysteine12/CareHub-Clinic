import type { AppointmentStatus } from './types'

export const getBadgeVariant = (status: AppointmentStatus | undefined) => {
  if (!status) return 'default'

  return status === 'COMPLETED'
    ? 'default'
    : status === 'SCHEDULED'
    ? 'secondary'
    : status === 'SUBMITTED'
    ? 'outline'
    : status === 'CANCELLED' || status === 'NO_SHOW'
    ? 'destructive'
    : 'pending'
}
