import { CheckCircle } from 'lucide-react'
import { Badge } from '../../../../components/ui/badge'
import { Button } from '../../../../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select'
import type { AppointmentStatus } from '../../types'
import { useUpdateAppointmentStatus } from '../hook'
import { AppointmentStatus as appointmentStatuses } from '../../schema'
import { useEffect, useState } from 'react'

type AppointmentStatusCardProps = {
  appointmentId: string
  appointmentStatus: AppointmentStatus
}

const AppointmentStatusCard = ({
  appointmentId,
  appointmentStatus,
}: AppointmentStatusCardProps) => {
  const [status, setStatus] = useState<AppointmentStatus | null>(null)
  const { mutate: updateAppointmentStatus } = useUpdateAppointmentStatus()

  const handleUpdateStatus = async (newStatus: AppointmentStatus) => {
    updateAppointmentStatus({
      id: appointmentId,
      payload: { status: newStatus },
    })
    setStatus(newStatus)
  }

  useEffect(() => {
    if (status) {
      handleUpdateStatus(status)
    }
  }, [status])

  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-4">
          <Badge
            variant={
              appointmentStatus === 'COMPLETED'
                ? 'default'
                : appointmentStatus === 'SCHEDULED'
                ? 'secondary'
                : appointmentStatus === 'SUBMITTED'
                ? 'outline'
                : appointmentStatus === 'CANCELLED'
                ? 'destructive'
                : 'pending'
            }
            className="text-sm"
          >
            {status}
          </Badge>
          {['CHECKED_IN', 'ATTENDING', 'ATTENDED'].includes(
            appointmentStatus
          ) && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Checked in at []
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {appointmentStatus === 'SCHEDULED' && (
            <Button onClick={() => handleUpdateStatus('CHECKED IN')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Check In Patient
            </Button>
          )}
          <Select value={status || ''} onValueChange={handleUpdateStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(appointmentStatuses).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
export default AppointmentStatusCard
