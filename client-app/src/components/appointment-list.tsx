import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import type { Appointment } from '../lib/type'
import AppointmentCard from './appointment-card'

type AppointmentListProps = {
  appointments: Appointment[] | null | undefined
  title: string
}

export default function AppointmentList({
  appointments,
  title,
}: AppointmentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments &&
            appointments?.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
