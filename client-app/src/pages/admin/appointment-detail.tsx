import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs'
import { Separator } from '../../components/ui/separator'
import {
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Save,
  CheckCircle,
  Printer,
  Stethoscope,
  Activity,
  ArrowLeft,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import API from '../../lib/api'
import type { Provider } from '../../features/providers/types'
import { useProviders } from '../../features/providers/hook'
import SoapNoteDialog from '../../components/soap-note-dialog'
import VitalsFormDialog from '../../components/vitals-form'
import { useAuthStore } from '../../store/auth-store'
//import { SoapNoteDialog } from '../../components/soap-note-dialog'

// Mock appointment data - in real app, this would come from API

const statusOptions = [
  'Scheduled',
  'Submitted',
  'Confirmed',
  'Checked_In',
  'Completed',
  'Cancelled',
  'No_Show',
  'Rescheduled',
  'Attending',
].map((status) => status.toUpperCase())

const AppointmentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [assignedProvider, setAssignedProvider] = useState('')
  const user = useAuthStore((state) => state.user)
  
  // Only fetch providers for admin users to avoid 403 error
  const { data: providersData } = useQuery({
    queryKey: ['providers', 1],
    queryFn: () => API.get('/api/providers?page=1&limit=200').then(res => res.data),
    enabled: user?.role_title === 'ADMIN',
  })
  
  const [soapNoteSaved, setSoapNoteSaved] = useState(false)

  const fetchAppointment = async (id: string) => {
    console.log('Fetching appointment with ID:', id)
    const { data } = await API.get(`/api/appointment/${id}`)

    if (!data || !data.success) {
      console.error('Failed to fetch appointment:', data)
      toast.error(data.message || 'Failed to fetch appointment')
      return
    }
    console.log('Appointment data fetched successfully:', data.data)
    setStatus(data.data.status)
    setProviderId(data.data.appointment_providers[0]?.provider_id)
    return data.data
  }
  
  const {
    data: appointment,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => fetchAppointment(id!),
    enabled: !!id,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })

  const [status, setStatus] = useState(appointment?.status || '')
  const [providerId, setProviderId] = useState()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'attending':
        return 'secondary'
      case 'scheduled':
        return 'secondary'
      case 'checked in':
        return 'default'
      case 'in progress':
        return 'default'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'destructive'
      case 'no show':
        return 'destructive'
      case 'rescheduled':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const fetchProvider = async (providerId: string) => {
    const { data } = await API.get(`/api/providers/${providerId}`)

    if (!data?.success) {
      throw new Error('Failed to fetch provider')
    }

    return data.data
  }

  const { data: provider } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => fetchProvider(providerId!),
    enabled: !!providerId, // prevents firing if ID is undefined
  })

  const handleStatusChange = async (newStatus: string) => {
    try {
      // Optionally, update in d
      const { data } = await API.patch(`/api/appointment/${appointment.id}`, {
        status: newStatus,
      })

      if (!data || !data.success) {
        toast.error(data.message)
        return
      }

      setStatus(newStatus)
      toast.success('Appointment status updated')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update status')
    }
  }

  useEffect(() => {
    if (status && status !== '') {
      handleStatusChange(status)
    }
  }, [status])

  // Refetch appointment data when component mounts or ID changes
  useEffect(() => {
    if (id) {
      console.log('Component mounted/ID changed, invalidating and refetching appointment:', id)
      // Invalidate the query to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: ['appointment', id] })
      refetch()
    }
  }, [id, refetch, queryClient])

  // Debug appointment data changes
  useEffect(() => {
    console.log('Appointment data changed:', { appointment, isLoading, error })
  }, [appointment, isLoading, error])

  // Handle when user navigates back to this page
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused, invalidating appointment query')
      queryClient.invalidateQueries({ queryKey: ['appointment', id] })
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [id, queryClient])

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const { data } = await API.patch(`/api/appointment/${appointmentId}`, {
        status: 'CHECKED_IN',
      })

      if (!data || !data.success) {
        toast.error(data?.message || 'Failed to check in appointment.')
        return
      }

      toast.success('Patient successfully checked in.')
      setStatus('CHECKED_IN')
    } catch (error) {
      console.error('Check-in error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred during check-in.'
      )
      return null
    }
  }

  const handleRecordVitals = async () => {
    const getValue = (id: string) => {
      return (document.getElementById(id) as HTMLInputElement).value || ''
    }

    const formData = {
      blood_pressure: getValue('blood_pressure'),
      heart_rate: getValue('heart_rate'),
      temperature: getValue('temperature'),
      height: getValue('height'),
      weight: getValue('weight'),
      respiratory_rate: getValue('respiratory_rate'),
      oxygen_saturation: getValue('oxygen_saturation'),
      bmi: getValue('bmi'),
      others: getValue('others'),
      appointment_id: appointment?.id,
    }

    const { data } = await API.post('/api/vitals/record', formData)
    if (!data?.success) {
      toast.error('Vitals not recorded: ' + data?.message)
    }
    toast.success(data.message)
  }

  const handleAssignProvider = async () => {
    if (!assignedProvider) {
      toast.error('Please select a provider')
      return
    }

    const formData = {
      appointment_id: appointment?.id,
      provider_id: assignedProvider,
    }

    const { data } = await API.patch(
      '/api/provider/appointment/assign-provider',
      formData
    )
    if (!data?.success) {
      toast.error('Provider not assigned: ' + data?.message)
    }
    toast.success(data.message)
  }

  const handleViewSoapNotes = () => {
    navigate(`/provider/vitals/${appointment?.id}`, {
      state: { appointment }
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading appointment details...</p>
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

  if (!appointment) {
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
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Appointment Details
            </h1>
            <p className="text-muted-foreground">
              {appointment?.patient?.first_name} •{' '}
              {appointment?.schedule?.appointment_date
                ? format(
                    new Date(appointment.schedule.appointment_date),
                    'EEE dd'
                  )
                : 'N/A'}{' '}
              at {appointment?.schedule?.appointment_time}
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
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            <Badge variant={getStatusColor(status)} className="text-sm">
              {status}
            </Badge>
            {appointment?.checkedIn && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Checked in at {appointment?.checkedInTime}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!appointment?.checkedIn && appointment?.status !== 'Completed' && (
              <Button onClick={() => handleCheckIn(appointment?.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check In Patient
              </Button>
            )}
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <form
          onSubmit={handleAssignProvider}
          className="flex items-center justify-between space-y-4 py-2"
        >
          <div className="block">
            <Label htmlFor="assignProvider">Assign Provider</Label>
            <Select
              value={assignedProvider}
              onValueChange={(e) => setAssignedProvider(e)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                {providersData?.data?.map((provider: Provider) => (
                  <SelectItem key={provider?.id} value={provider?.id}>
                    {provider?.first_name} {provider?.last_name} -{' '}
                    {provider?.role_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button type="submit">Assign Provider</Button>
          </div>
        </form>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Appointment Details</TabsTrigger>
          <TabsTrigger value="patient">Patient Information</TabsTrigger>
          <TabsTrigger value="vitals">Vitals & Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
                    {new Date(
                      appointment?.schedule.appointment_date
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time:</span>
                  <span>{appointment?.schedule.appointment_time}</span>
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
                    {appointment?.reason}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Provider Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Provider:</span>
                  <span>{provider?.first_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Role:</span>
                  <span className="lowercase">{provider?.role_title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phone:</span>
                  <span>{provider?.phone}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm font-medium">Clinical Notes:</span>

                  {appointment?.soap_note ? (
                    <div className="text-sm text-muted-foreground space-y-2">
                      {typeof appointment.soap_note === 'string' ? (
                        <p>{appointment.soap_note}</p>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <strong>Subjective:</strong> {appointment.soap_note.subjective || 'N/A'}
                          </div>
                          <div>
                            <strong>Objective:</strong> {appointment.soap_note.objective || 'N/A'}
                          </div>
                          <div>
                            <strong>Assessment:</strong> {appointment.soap_note.assessment || 'N/A'}
                          </div>
                          <div>
                            <strong>Plan:</strong> {appointment.soap_note.plan || 'N/A'}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No clinical notes available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
                  {appointment?.vitals?.created_at
                    ? `Recorded at ${new Date(
                        appointment.vitals.created_at
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
                    setAppointmentStatus={setStatus}
                    showAsDialog={true}
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      {!user?.id ? "Please log in to record vitals" : "Loading appointment data..."}
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
                    vitals={appointment?.vitals || {}}
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
                      <Button 
                        onClick={handleViewSoapNotes}
                        className="flex-1"
                      >
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
