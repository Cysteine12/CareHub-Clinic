import { Calendar, CheckCircle } from 'lucide-react'
import { Badge } from '../../../../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select'
import type { AppointmentProviderStatus, AppointmentStatus } from '../../types'
import {
  useUpdateAppointmentProviderStatus,
  useUpdateAppointmentStatus,
} from '../hook'
import { useEffect, useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { getBadgeVariant } from '../../util'
import { useAuthStore } from '../../../../store/auth-store'

type AppointmentStatusCardProps = {
  appointmentId: string
  appointmentStatus: AppointmentStatus
  appointmentPatientId: string
  providerStatus: AppointmentProviderStatus | undefined
}

const AppointmentStatusCard = ({
  appointmentId,
  appointmentStatus,
  appointmentPatientId,
  providerStatus,
}: AppointmentStatusCardProps) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [status, setStatus] = useState<
    AppointmentStatus | AppointmentProviderStatus | null
  >(null)
  const { mutate: updateAppointmentStatus, isPending } =
    useUpdateAppointmentStatus()
  const { mutate: updateAppointmentProviderStatus, isPending: isPending2 } =
    useUpdateAppointmentProviderStatus()

  const handleUpdateStatus = async (newStatus: AppointmentStatus) => {
    if (
      user?.role_title &&
      ['ADMIN', 'RECEPTIONIST'].includes(user.role_title)
    ) {
      updateAppointmentStatus({
        id: appointmentId,
        payload: { status: newStatus as AppointmentStatus },
      })
      setStatus(newStatus)
    } else {
      updateAppointmentProviderStatus({
        id: appointmentId,
        payload: { status: newStatus as AppointmentProviderStatus },
      })
    }
  }

  const filteredStatusList = (): (
    | AppointmentStatus
    | AppointmentProviderStatus
  )[] => {
    // Status list for non admin/receptionst providers
    if (
      user?.role_title &&
      !['ADMIN', 'RECEPTIONIST'].includes(user.role_title)
    ) {
      switch (providerStatus) {
        case 'ASSIGNED':
          return ['ATTENDING']
        case 'ATTENDING':
          return ['ATTENDED']
        case 'ATTENDED':
          return ['ATTENDING']
        default:
          return []
      }
    }

    // Status list for admin & receptionst providers
    switch (status) {
      case 'SUBMITTED':
        return ['SCHEDULED', 'CANCELLED']
      case 'SCHEDULED':
        return ['CHECKED_IN', 'NO_SHOW', 'CANCELLED']
      case 'CHECKED_IN':
        return ['CONFIRMED', 'CANCELLED']
      case 'CONFIRMED':
        return ['COMPLETED']
      default:
        return []
    }
  }

  useEffect(() => {
    if (appointmentStatus) {
      setStatus(appointmentStatus)
    }
  }, [appointmentStatus])

  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-4">
          <span>STATUS</span>
          <Badge
            variant={getBadgeVariant(appointmentStatus)}
            className="text-sm"
          >
            {status?.replace('_', ' ')}
          </Badge>
          {appointmentStatus === 'CHECKED_IN' && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Currently in clinic
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {filteredStatusList().length > 0 ? (
            <Select
              onValueChange={(val) => {
                if (val !== 'placeholder')
                  handleUpdateStatus(val as AppointmentStatus)
              }}
              value="placeholder"
              disabled={isPending || isPending2}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'placeholder'} disabled>
                  {isPending || isPending2
                    ? 'Updating status'
                    : 'Update Status'}
                </SelectItem>
                {filteredStatusList().map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Button
              onClick={() =>
                navigate(
                  `/provider/appointments/new/${appointmentPatientId}${
                    status === 'COMPLETED' && `?followedUpId=${appointmentId}`
                  }`
                )
              }
            >
              <Calendar className="w-3 h-3" />
              {status === 'COMPLETED' ? 'Book Follow-up' : 'Reschedule'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
export default AppointmentStatusCard
