import { useNavigate, useParams } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import { Separator } from '../../../components/ui/separator'
import {
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Printer,
  Activity,
  ArrowLeft,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import SoapNoteDialog from '../../../components/soap-note-dialog'
import VitalsFormDialog from '../../../components/vitals-form'
import { useAuthStore } from '../../../store/auth-store'
import AppointmentProviderList from '../../../features/appointments/providers/components/appointment-provider-list'
import { useAppointment } from '../../../features/appointments/providers/hook'
import type {
  Appointment,
  AppointmentProvider,
} from '../../../features/appointments/types'
import type { SoapNote, Vitals } from '../../../lib/type'
import type { Patient } from '../../../features/patients/types'
import type { Provider } from '../../../features/providers/types'
import AppointmentStatusCard from '../../../features/appointments/providers/components/appointment-status-card'

const AppointmentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const {
    data: appointmentData,
    isLoading,
    error,
    refetch,
  } = useAppointment(id)
  const [appointment, setAppointment] = useState<
    | (Appointment & {
        vital: Vitals
        soap_note: SoapNote
        appointment_providers: (AppointmentProvider & { provider: Provider })[]
        patient: Patient
      })
    | null
  >(null)

  const [soapNoteSaved, setSoapNoteSaved] = useState(false)

  useEffect(() => {
    if (appointmentData?.data) {
      setAppointment(appointmentData.data)
    }
  }, [appointmentData])

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading appointment details...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4 text-2xl">⚠️</div>
            <p className="text-muted-foreground mb-4">
              Error loading appointment: {(error as Error).message}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!appointment && !isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Appointment not found</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="default" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Appointment Details
            </h1>
            <p className="text-muted-foreground">
              {appointment?.patient?.first_name} •{' '}
              {appointment?.patient?.last_name} •{' '}
              {appointment?.schedule?.date
                ? format(new Date(appointment.schedule.date), 'EEE dd')
                : 'N/A'}{' '}
              at {appointment?.schedule?.time}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Status and Quick Actions */}
      {appointment && (
        <AppointmentStatusCard
          appointmentId={appointment.id}
          appointmentStatus={appointment.status}
        />
      )}

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Appointment Details</TabsTrigger>
          <TabsTrigger value="patient">Patient Information</TabsTrigger>
          <TabsTrigger value="vitals">Vitals & Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Appointment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Date:</span>
                <span>
                  {new Date(appointment?.schedule.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time:</span>
                <span>{appointment?.schedule.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type:</span>
                <span>
                  {appointment?.purposes?.map((status: string) =>
                    status
                      .toLowerCase()
                      .split('_')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')
                  )}
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Reason for Visit:</span>
                <p className="text-sm text-muted-foreground">
                  {appointment?.other_purpose
                    ? appointment.other_purpose
                    : 'No comment provided'}
                </p>
              </div>
            </CardContent>
          </Card>

          <AppointmentProviderList
            appointmentId={id}
            appointmentProviders={appointment?.appointment_providers}
          />
        </TabsContent>

        <TabsContent value="patient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Patient ID:</span>
                    <span>{appointment?.patient_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Full Name:</span>
                    <span>
                      {appointment?.patient?.first_name}{' '}
                      {appointment?.patient?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span>
                      {new Date(
                        appointment?.patient?.date_of_birth
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {appointment?.patient?.phone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {appointment?.patient?.email}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Address:</span>
                    <p className="text-sm text-muted-foreground flex ">
                      <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                      {appointment?.patient?.address}
                    </p>
                  </div>
                  <div className="flex items-center justify-between space-y-2">
                    <span className="text-sm font-medium">Insurance:</span>
                    <span>{appointment?.patient?.insurance_coverage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Emergency Contact:
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {appointment?.patient?.emergency_contact_name}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Gender:</span>
                    <p className="text-sm text-muted-foreground">
                      {appointment?.patient?.gender}
                    </p>
                  </div>
                  <div className="flex justify-between items-center space-y-2">
                    <span className="text-sm font-medium">Blood Group:</span>
                    <p className="text-sm text-muted-foreground">
                      {appointment?.patient?.blood_group}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Patient ID:</span>
                    <span>{appointment?.patient_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Full Name:</span>
                    <span>
                      {appointment?.patient?.first_name}{' '}
                      {appointment?.patient?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span>
                      {new Date(
                        appointment?.patient?.date_of_birth
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {appointment?.patient?.phone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {appointment?.patient?.email}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Address:</span>
                    <p className="text-sm text-muted-foreground flex ">
                      <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                      {appointment?.patient?.address}
                    </p>
                  </div>
                  <div className="flex items-center justify-between space-y-2">
                    <span className="text-sm font-medium">Insurance:</span>
                    <span>{appointment?.patient?.insurance_coverage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Emergency Contact:
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {appointment?.patient?.emergency_contact_name}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Gender:</span>
                    <p className="text-sm text-muted-foreground">
                      {appointment?.patient?.gender}
                    </p>
                  </div>
                  <div className="flex justify-between items-center space-y-2">
                    <span className="text-sm font-medium">Blood Group:</span>
                    <p className="text-sm text-muted-foreground">
                      {appointment?.patient?.blood_group}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Vital Signs
                </CardTitle>
                <CardDescription>
                  {appointment?.vital?.created_at
                    ? `Recorded at ${new Date(
                        appointment.vital.created_at
                      ).toLocaleDateString()}`
                    : 'No vitals recorded yet'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.id && appointment?.id ? (
                  <VitalsFormDialog
                    appointmentId={appointment.id}
                    setAppointmentId={() => {}}
                    userId={user.id}
                    setHasVitals={() => {}}
                    setAppointmentStatus={() => {}}
                    showAsDialog={true}
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      {!user?.id
                        ? 'Please log in to record vitals'
                        : 'Loading appointment data...'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Clinical Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!soapNoteSaved ? (
                  <SoapNoteDialog
                    appointmentId={appointment?.id}
                    vitals={appointment?.vital || {}}
                    purposes={appointment?.purposes || []}
                    setAppointmentId={() => {}}
                    appointment={appointment}
                    showAsDialog={false}
                    onSoapNoteSaved={() => setSoapNoteSaved(true)}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">
                        ✅ SOAP Note saved successfully!
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setSoapNoteSaved(false)}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Add Another SOAP Note
                      </Button>
                      <Button className="flex-1">
                        <Activity className="h-4 w-4 mr-2" />
                        View SOAP Notes
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AppointmentDetail
