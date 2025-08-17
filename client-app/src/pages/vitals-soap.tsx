import type React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

import { Search, FileText, Activity } from 'lucide-react'
import { type Appointment, type AppointmentStatus } from '../lib/type'
import { type SoapNote } from '../lib/schema'
import SoapNoteDialog from '../components/soap-note-dialog'
import VitalsFormDialog from '../components/vitals-form'
import { useAuthStore } from '../store/auth-store'
import { SoapNoteCard } from '../components/soap-note-card'
import API from '../lib/api'
import { toast } from 'sonner'

interface VitalsSoapNoteProps {
  appointment?: Appointment
  setAppointmentId?: React.Dispatch<React.SetStateAction<string | null>>
}

export default function VitalsSoapPage({
  appointment: propAppointment,
  setAppointmentId,
}: VitalsSoapNoteProps) {
  const { appointmentId: urlAppointmentId } = useParams<{
    appointmentId: string
  }>()
  const location = useLocation()
  const passedAppointment = location.state?.appointment
  
  const [selectedPatient, setSelectedPatient] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const user = useAuthStore((state) => state.user)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_appointmentStatus, setAppointmentStatus] =
    useState<AppointmentStatus>('SCHEDULED')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_hasVitals, setHasVitals] = useState(false)
  const [appointment, setAppointment] = useState<Appointment | null>(
    propAppointment || passedAppointment || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [soapNotes, setSoapNotes] = useState<
    (SoapNote & {
      created_at?: string
      updated_at?: string
      created_by?: {
        id: string
        first_name: string
        last_name: string
        role_title: string
      }
      events?: {
        id: string
        type: string
        created_by_id: string
        appointment_id: string
        created_at: string
        updated_at: string
        created_by: {
          id: string
          first_name: string
          last_name: string
          role_title: string
        }
      }[]
    })[]
  >([])
  const [soapNotesLoading, setSoapNotesLoading] = useState(false)
  
  // Determine default tab - if navigated from appointment detail, show history
  const defaultTab = passedAppointment ? 'history' : 'record-vitals'

  const fetchSoapNotes = async (appointmentId: string) => {
    setSoapNotesLoading(true)
    try {
      const { data } = await API.get(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/provider/soapnotes?appointmentId=${appointmentId}`
      )

      if (data.success && data.data) {
        setSoapNotes(data.data)
      } else {
        setSoapNotes([])
        toast.error('Failed to fetch soap notes:', data?.message)
      }
    } catch (error) {
      console.error('Error fetching soap notes:', error)
      setSoapNotes([])
    } finally {
      setSoapNotesLoading(false)
    }
  }

  useEffect(() => {
    const fetchAppointment = async (appointmentId: string) => {
      setIsLoading(true)
      try {
        // Use the correct appointment endpoint
        const { data } = await API.get(`/api/appointment/${appointmentId}`)

        if (data?.success) {
          setAppointment(data.data)
          fetchSoapNotes(appointmentId)
        } else {
          console.error('Failed to fetch appointment:', data?.message)
          toast.error(data?.message || 'Failed to fetch appointment')
        }
      } catch (error) {
        console.error('Error fetching appointment:', error)
        toast.error('Error fetching appointment data')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (passedAppointment) {
      // Use appointment data passed via navigation state
      setAppointment(passedAppointment)
      if (passedAppointment.id) {
        fetchSoapNotes(passedAppointment.id)
      }
    } else if (urlAppointmentId && !propAppointment) {
      fetchAppointment(urlAppointmentId)
    } else if (propAppointment) {
      setAppointment(propAppointment)

      if (propAppointment.id) {
        fetchSoapNotes(propAppointment.id)
      }
    }
  }, [urlAppointmentId, propAppointment, passedAppointment])

  useEffect(() => {
    if (appointment?.status) {
      setAppointmentStatus(appointment.status)
    }
  }, [appointment?.status])

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              Loading appointment data...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we load the appointment information.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1  space-y-6 p-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vitals & SOAP Notes
          </h1>
          <p className="text-muted-foreground">
            Record patient vitals and clinical documentation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P001">Sarah Johnson (P001)</SelectItem>
              <SelectItem value="P002">Michael Chen (P002)</SelectItem>
              <SelectItem value="P003">Emily Rodriguez (P003)</SelectItem>
              <SelectItem value="P004">Robert Williams (P004)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="record-vitals">Record Vitals</TabsTrigger>
          <TabsTrigger value="soap-notes">SOAP Notes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="record-vitals" className="space-y-4">
          {!appointment || !appointment.id ? (
            <div className="flex-1 space-y-6 p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">
                    No appointment data available
                  </h2>
                  <p className="text-muted-foreground">
                    {urlAppointmentId 
                      ? 'Failed to load appointment data. Please check the appointment ID.' 
                      : 'Please select an appointment to view vitals and SOAP notes.'}
                  </p>
                  {/* Debug info */}
                  <div className="mt-4 text-xs text-gray-500">
                    <p>Debug: appointmentId = {urlAppointmentId || 'null'}</p>
                    <p>Debug: passedAppointment = {passedAppointment ? 'present' : 'null'}</p>
                    <p>Debug: appointment = {appointment ? 'present' : 'null'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Record Vital Signs
                  </CardTitle>
                  <CardDescription>
                    Enter patient vital signs and measurements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VitalsFormDialog
                    appointmentId={appointment.id}
                    setAppointmentId={setAppointmentId || (() => {})}
                    userId={user?.id ?? ''}
                    setHasVitals={setHasVitals}
                    setAppointmentStatus={setAppointmentStatus}
                    showAsDialog={false}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vital Signs Reference</CardTitle>
                  <CardDescription>
                    Normal ranges for adult patients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">Temperature:</span>
                      <span>97.8°F - 99.1°C</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">Blood Pressure:</span>
                      <span>{'<120/80 mmHg'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">Heart Rate:</span>
                      <span>60-100 bpm</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">Respiratory Rate:</span>
                      <span>12-20 breaths/min</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">O2 Saturation:</span>
                      <span>95-100%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">BMI:</span>
                      <span>18.5-24.9</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="soap-notes" className="space-y-4">
          {!appointment || !appointment.id ? (
            <div className="flex-1 space-y-6 p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">
                    No appointment data available
                  </h2>
                  <p className="text-muted-foreground">
                    Please navigate from an appointment to create SOAP notes.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  SOAP Note Documentation
                </CardTitle>
                <CardDescription>
                  Subjective, Objective, Assessment, and Plan documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SoapNoteDialog
                  appointmentId={appointment.id}
                  vitals={appointment.vitals}
                  purposes={
                    appointment.purposes ||
                    appointment.other_purpose
                  }
                  setAppointmentId={setAppointmentId || (() => {})}
                  showAsDialog={false}
                  onSoapNoteSaved={() =>
                    fetchSoapNotes(appointment.id)
                  }
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {!appointment || !appointment.id ? (
            <div className="flex-1 space-y-6 p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">
                    No appointment data available
                  </h2>
                  <p className="text-muted-foreground">
                    Please navigate from an appointment to view SOAP notes history.
                  </p>
                  {/* Debug info */}
                  <div className="mt-4 text-xs text-gray-500">
                    <p>Debug: appointmentId = {urlAppointmentId || 'null'}</p>
                    <p>Debug: passedAppointment = {passedAppointment ? JSON.stringify(passedAppointment).substring(0, 100) + '...' : 'null'}</p>
                    <p>Debug: appointment = {appointment ? JSON.stringify(appointment).substring(0, 100) + '...' : 'null'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Patient Records History</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[300px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent SOAP Notes</CardTitle>
                    <CardDescription>Latest clinical documentation for {appointment.patient?.first_name} {appointment.patient?.last_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {soapNotesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">
                          Loading SOAP notes...
                        </p>
                      </div>
                    ) : soapNotes.length > 0 ? (
                      <div className="space-y-16">
                        {soapNotes.map((note, index) => {
                          const creationEvent = note.events?.find(
                            (event: any) => event.type === 'SOAP_NOTE_RECORDED'
                          )
                          const createdBy = creationEvent?.created_by
                          const createdAt =
                            creationEvent?.created_at || note.created_at

                          return (
                            <SoapNoteCard
                              key={note.appointment_id + index}
                              soapNote={note}
                              created_at={createdAt}
                              updated_at={note.updated_at}
                              created_by={createdBy}
                              onUpdate={() => {
                                if (appointment?.id) {
                                  fetchSoapNotes(appointment.id)
                                }
                              }}
                              onDelete={() => {
                                if (appointment?.id) {
                                  fetchSoapNotes(appointment.id)
                                }
                              }}
                              canEdit={true}
                              canDelete={true}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">
                          No SOAP notes found for this appointment
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentation Templates</CardTitle>
              <CardDescription>
                Pre-built templates for common conditions and procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Annual Physical</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Complete physical examination template
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Hypertension Follow-up
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Blood pressure management visit
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Diabetes Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Diabetic patient assessment
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Acute Care Visit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Urgent care or sick visit
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Preventive Care</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Screening and prevention visit
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Mental Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Mental health assessment
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
