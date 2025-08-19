import { Search, ArrowLeft, CheckCircle, Eye, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs'
import { toast } from 'sonner'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert } from '../../components/ui/alert'
import {
  formatDateParts,
  formatPurposeText,
  formatTimeToAmPm,
  type Appointment,
} from '../../lib/type'
import API from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import PatientAppointmentForm from '../../features/appointments/components/patient-appointment-form'

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

export default function PatientAppointments() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      const { data } = await API.get(`/api/patient/appointments`)

      if (!data?.success) {
        toast.error(data?.message || 'Failed to fetch appointments')
      }
      setAppointments(data?.data ?? [])
      setLoading(false)
    }
    fetchAppointments()
  }, [tab])

  const AppointmentListSkeleton = () => (
    <div className="grid gap-6">
      {[1, 2].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-muted rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const AppointmentList = () => (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
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
              appointments?.map((appointment) => (
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
                          ? appointment.other_purpose.slice(0, 30)
                          : formatPurposeText(appointment.purposes)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTimeToAmPm(appointment.schedule.time)}
                        {appointment?.appointment_providers?.length > 0 && (
                          <>
                            {' '}
                            with{' '}
                            {appointment?.appointment_providers
                              .map((ap) => {
                                const p = ap?.provider
                                return `${p?.first_name} ${p?.last_name}`
                              })
                              .join(', ')}
                          </>
                        )}
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
                          : 'secondary'
                      }
                    >
                      {appointment.status}
                    </Badge>
                    {['SUBMITTED', 'SCHEDULED', 'NO_SHOW'].includes(
                      appointment.status
                    ) && (
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))
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
                <Button variant="outline" size="sm">
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

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className=""
        >
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>

        <Search className="w-6 h-6" />
      </div>

      <TabsList className="mb-4 border-background">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="form" className="ml-auto">
          Schedule Appointment
        </TabsTrigger>
      </TabsList>

      {/* Tab content below */}
      <TabsContent value="all">
        {loading ? <AppointmentListSkeleton /> : <AppointmentList />}
      </TabsContent>

      <TabsContent value="form">
        <Card className="max-w-4xl mx-auto">
          <PatientAppointmentForm onCompleteSubmit={() => setTab('all')} />
        </Card>
        <Alert
          variant="destructive"
          className="text-sm text-yellow-800 bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded-md flex gap-2 items-center max-w-lg w-full mx-auto mt-8"
        >
          <AlertCircle className="size-4" />
          <p>
            Appointments are subject to review by a healthcare administrator.
            You will be notified once it is confirmed.
          </p>
        </Alert>
      </TabsContent>
    </Tabs>
  )
}
