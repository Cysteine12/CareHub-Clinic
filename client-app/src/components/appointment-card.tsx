import { useNavigate } from 'react-router'
import { User, Phone, Mail, Clock, Eye } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  formatDateParts,
  formatPurposeText,
  type Appointment,
} from '../lib/type'
import { formatTextWithSize } from '../lib/utils'

interface AppointmentCardProps {
  appointment: Appointment
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between p-4 border border-muted rounded-lg">
      <div className="flex items-center space-x-4">
        {/* Date and Duration */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {formatDateParts(appointment.schedule.date).month}
          </div>
          <div className="text-lg font-semibold">
            {formatDateParts(appointment.schedule.date).day}
          </div>
          <div className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 inline mr-1" />
            30 min
          </div>
        </div>

        {/* Appointment Details */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {appointment?.patient ? (
                <>
                  {appointment.patient?.first_name}{' '}
                  {appointment.patient?.last_name}
                </>
              ) : (
                'No patient info'
              )}
            </span>
            <Badge
              variant={
                appointment?.status === 'COMPLETED'
                  ? 'default'
                  : appointment?.status === 'SCHEDULED'
                  ? 'secondary'
                  : appointment?.status === 'SUBMITTED'
                  ? 'outline'
                  : appointment?.status === 'CANCELLED'
                  ? 'destructive'
                  : 'pending'
              }
            >
              {appointment?.status}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              {appointment?.purposes?.includes('OTHERS')
                ? formatTextWithSize(appointment?.other_purpose, 30)
                : formatPurposeText(appointment?.purposes)}
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {appointment?.patient?.phone}
              </span>
              <span className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {appointment?.patient?.email}
              </span>
            </div>
            <div className="text-xs italic">
              {formatTextWithSize(appointment?.notes, 50)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <Button
        size="sm"
        variant="default"
        onClick={() => navigate(`/provider/appointments/${appointment?.id}`)}
      >
        <Eye />
        View Details
      </Button>
    </div>
  )
}
