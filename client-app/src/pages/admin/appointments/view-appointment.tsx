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
import { Calendar, FileText, Printer, Activity, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import VitalsFormDialog from '../../../features/vitals/components/vitals-form'
import AppointmentProviderList from '../../../features/appointments/providers/components/appointment-provider-list'
import { useAppointment } from '../../../features/appointments/providers/hook'
import type {
  Appointment,
  AppointmentProvider,
} from '../../../features/appointments/types'
import { formatTimeToAmPm } from '../../../lib/type'
import type { Patient } from '../../../features/patients/types'
import type { Provider } from '../../../features/providers/types'
import AppointmentStatusCard from '../../../features/appointments/providers/components/appointment-status-card'
import AppointmentPatientCard from '../../../features/appointments/providers/components/appointment-patient-card'
import type { Vital } from '../../../features/vitals/types'
import { formatDate, formatDateIntl } from '../../../lib/utils'
import VitalCard from '../../../features/vitals/components/vital-card'
import SoapNoteFormDialog from '../../../features/soapNotes/components/soap-note-form'
import type { SoapNote } from '../../../features/soapNotes/types'
import { useAuthStore } from '../../../store/auth-store'
import SoapNoteList from '../../../features/soapNotes/components/soap-note-list'

const AppointmentDetail = () => {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const {
    data: appointmentData,
    isLoading,
    error,
    refetch,
  } = useAppointment(id)
  const [appointment, setAppointment] = useState<
    | (Appointment & {
        vital: Vital
        soap_notes: SoapNote[]
        appointment_providers: (AppointmentProvider & { provider: Provider })[]
        patient: Patient
      })
    | null
  >(null)

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
              {appointment?.patient?.first_name}{' '}
              {appointment?.patient?.last_name} •{' '}
              {formatDate(appointment?.schedule?.date)} at{' '}
              {formatTimeToAmPm(appointment?.schedule?.time)}
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
          appointmentPatientId={appointment.patient.id}
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
                <span>{formatDateIntl(appointment?.schedule?.date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time:</span>
                <span>{formatTimeToAmPm(appointment?.schedule?.time)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Purpose:</span>
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
              <div className="flex items-center justify-between space-y-2">
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
            appointmentStatus={appointment?.status}
            appointmentProviders={appointment?.appointment_providers}
          />
        </TabsContent>

        <TabsContent value="patient" className="space-y-4">
          <AppointmentPatientCard patient={appointment?.patient} />
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Vital Signs
                    </CardTitle>
                    <CardDescription>
                      {appointment?.vital
                        ? `Last recorded on ${formatDate(
                            appointment.vital.updated_at
                          )} at ${formatTimeToAmPm(
                            appointment.vital.updated_at
                          )}`
                        : 'No vitals recorded yet'}
                    </CardDescription>
                  </div>
                  {appointment &&
                    ['CHECKED_IN', 'ATTENDING', 'ATTENDED'].includes(
                      appointment.status
                    ) && (
                      <VitalsFormDialog
                        appointmentId={appointment.id}
                        appointmentVital={appointment.vital}
                      />
                    )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointment?.vital && <VitalCard vital={appointment.vital} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Clinical Notes
                    </CardTitle>
                    <CardDescription>
                      {appointment?.vital
                        ? `${appointment.soap_notes.length} note(s) recorded`
                        : 'No notes recorded yet'}
                    </CardDescription>
                  </div>
                  {appointment &&
                    ['CHECKED_IN', 'ATTENDING', 'ATTENDED'].includes(
                      appointment.status
                    ) && (
                      <SoapNoteFormDialog
                        appointmentId={appointment.id}
                        appointmentVital={appointment.vital}
                        appointmentPurposes={appointment.purposes}
                        appointmentSoapNote={
                          appointment.soap_notes.filter(
                            (soap_note) => soap_note.created_by_id === user?.id
                          )[0]
                        }
                      />
                    )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointment?.vital && (
                  <SoapNoteList
                    soapNotes={appointment.soap_notes}
                    appointmentProviders={appointment.appointment_providers}
                  />
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
