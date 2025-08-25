import { CheckCircle, Eye } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import {
  formatDateParts,
  formatPurposeText,
  formatTimeToAmPm,
} from '../../../lib/type'
import type { Appointment, IPagination } from '../types'
import Pagination from '../../../components/ui/pagination'
import { useCancelAppointment } from '../patients/hook'

const recentVisits = [
  {
    id: 1,
    date: '2024-01-10',
    provider: 'Dr. Smith',
    type: 'Consultation',
    diagnosis: 'Hypertension monitoring',
    status: 'completed',
  },
  {
    id: 2,
    date: '2023-12-15',
    provider: 'Dr. Wilson',
    type: 'Lab Results Review',
    diagnosis: 'Normal blood work',
    status: 'completed',
  },
]

type PatientAppointmentListProps = {
  appointments: Appointment[]
  pagination: Required<IPagination>
}

export const PatientAppointmentList = ({
  appointments,
  pagination,
}: PatientAppointmentListProps) => {
  const { mutate: cancelAppointment } = useCancelAppointment()

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments?.length === 0 ? (
              <div className="text-center space-y-1">
                <h1 className="text-lg font-semibold text-muted-foreground">
                  No Scheduled Appointments
                </h1>
                <p className="text-sm text-gray-500">
                  You don't have any appointments yet. Schedule one to get
                  started.
                </p>
              </div>
            ) : (
              appointments?.map((appointment: Appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-muted rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {formatDateParts(appointment.schedule.date).day}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateParts(appointment.schedule.date).month}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {appointment.purposes.includes('OTHERS')
                          ? appointment.other_purpose?.slice(0, 30)
                          : formatPurposeText(appointment.purposes)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTimeToAmPm(appointment.schedule.time)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Main Clinic
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className="uppercase"
                      variant={
                        appointment.status === 'COMPLETED'
                          ? 'default'
                          : appointment.status === 'CANCELLED'
                          ? 'destructive'
                          : appointment.status === 'SUBMITTED'
                          ? 'pending'
                          : 'secondary'
                      }
                    >
                      {appointment.status}
                    </Badge>
                    {['SUBMITTED'].includes(appointment.status) && (
                      <Button onClick={() => {}} variant="outline" size="xs">
                        Edit
                      </Button>
                    )}
                    {['SCHEDULED', 'NO_SHOW'].includes(appointment.status) && (
                      <Button onClick={() => {}} variant="outline" size="xs">
                        Reschedule
                      </Button>
                    )}
                    {['SUBMITTED', 'SCHEDULED', 'NO_SHOW'].includes(
                      appointment.status
                    ) && (
                      <Button
                        onClick={() =>
                          cancelAppointment({ id: appointment.id })
                        }
                        variant="destructive"
                        size="xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
            {pagination.total > 0 && (
              <Pagination
                currentPage={pagination.page}
                perPage={pagination.limit}
                total={pagination.total}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between p-4 border rounded-lg border-muted"
              >
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">{visit.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {visit.date} with {visit.provider}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {visit.diagnosis}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="xs">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
