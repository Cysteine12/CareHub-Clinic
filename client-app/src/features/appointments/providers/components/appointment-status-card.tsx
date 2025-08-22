import { CheckCircle } from 'lucide-react'
import { Badge } from '../../../../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select'
import type { AppointmentStatus } from '../../types'
import { useUpdateAppointmentStatus } from '../hook'
import { useEffect, useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { getBadgeVariant } from '../../util'

type AppointmentStatusCardProps = {
  appointmentId: string
  appointmentStatus: AppointmentStatus
  appointmentPatientId: string
}

const AppointmentStatusCard = ({
  appointmentId,
  appointmentStatus,
  appointmentPatientId,
}: AppointmentStatusCardProps) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<AppointmentStatus | null>(null)
  const { mutate: updateAppointmentStatus } = useUpdateAppointmentStatus()

  const handleUpdateStatus = async (newStatus: AppointmentStatus) => {
    updateAppointmentStatus({
      id: appointmentId,
      payload: { status: newStatus },
    })
    setStatus(newStatus)
  }

  const filteredStatusList = (): AppointmentStatus[] => {
    switch (status) {
      case 'SUBMITTED':
        return ['SCHEDULED', 'CANCELLED']
      case 'SCHEDULED':
        return ['CHECKED_IN', 'NO_SHOW', 'CANCELLED']
      case 'CHECKED_IN':
        return ['ATTENDED', 'ATTENDING', 'CANCELLED']
      case 'ATTENDING':
        return ['ATTENDED', 'ATTENDING', 'CANCELLED']
      case 'ATTENDED':
        return ['ATTENDING', 'CONFIRMED']
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
          {['CHECKED_IN', 'ATTENDING', 'ATTENDED'].includes(
            appointmentStatus
          ) && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Currently in clinic
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {filteredStatusList().length > 0 ? (
            <Select onValueChange={handleUpdateStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
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
              Book {status === 'COMPLETED' ? 'Follow-up' : 'New'} Appointment
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
export default AppointmentStatusCard
