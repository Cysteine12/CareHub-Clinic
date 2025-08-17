import {
  Search,
  ArrowLeft,
  CheckCircle,
  Eye,
  Loader2,
  AlertCircle,
  CalendarIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AppointmentPurpose,
  appointmentSchema,
  timeSlots,
  type AppointmentFormData,
} from '../../lib/schema'
import { useNavigate } from 'react-router-dom'
import { Label } from '../../components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
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
import { toast } from 'sonner'
import { useAuthStore } from '../../store/auth-store'
import { Input } from '../../components/ui/input'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert } from '../../components/ui/alert'
import { Calendar } from '../../components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '../../lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover'
import {
  formatDateParts,
  formatPurposeText,
  formatTimeToAmPm,
  type Appointment,
} from '../../lib/type'
import { VitalsCard, type VitalsCardProps } from '../../components/vitals-card'
import API from '../../lib/api'

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
  const [tab, setTab] = useState('all')
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>()
  const [viewVitalsAppointmentId, setViewVitalsAppointmentId] = useState<
    string | null
  >(null)
  const [patientVitals, setPatientVitals] = useState<VitalsCardProps | null>(
    null
  )
  const [, setAppointmentId] = useState<string | null>(null)
  const [vitalsLoading, setVitalsLoading] = useState<boolean>(false)

  // Handler for cancel button in vitals view
  const onCancel = () => {
    setViewVitalsAppointmentId(null)
    setPatientVitals(null)
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: {
        id: user?.id,
        insurance_provider_id: user?.insurance_provider_id,
        first_name: user?.first_name,
        last_name: user?.last_name,
      },
      schedule: {
        appointment_date: '',
        appointment_time: '',
      },
      purposes: undefined as keyof typeof AppointmentPurpose | undefined,
      has_insurance: true,
    },
  })

  const selectedPurpose = watch('purposes')
  const navigate = useNavigate()

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true)
    const endpoint = `/api/appointment/create`
    const payload = {
      ...data,
      purposes: [watch('purposes')], // <-- array, not a string
    }

    try {
      const { data } = await API.post(endpoint, payload)

      if (!data?.success) {
        toast.error(data?.message || 'Failed to create appointment')
        return
      }

      toast.success(data?.message)
      setTimeout(() => {
        location.assign('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Sign in error:', error)
      const message =
        error instanceof Error
          ? error.message
          : 'Invalid email or password. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchPatientVitals = async (appointmentId: string) => {
    try {
      setVitalsLoading(true)
      const { data } = await API.get(`/api/vitals/${appointmentId}`)

      if (!data || !data.success) {
        toast.error(data?.message || 'Failed to fetch vitals')
        return
      }

      setPatientVitals(data?.data?.[0] ?? null)
      setViewVitalsAppointmentId(appointmentId)
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setVitalsLoading(false)
    }
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      const { data } = await API.get(`/api/appointment/appointments`)

      if (!data?.success) {
        toast.error(data?.message || 'Failed to fetch appointments')
      }
      setAppointments(data?.data ?? [])
      setLoading(false)
    }
    fetchAppointments()
  }, [tab])

  const renderSkeleton = () => (
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

  const renderTable = () => (
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
                        {
                          formatDateParts(appointment.schedule.appointment_date)
                            .day
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {
                          formatDateParts(appointment.schedule.appointment_date)
                            .month
                        }
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {appointment.purposes.includes('OTHERS')
                          ? appointment.other_purpose
                          : formatPurposeText(appointment.purposes)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTimeToAmPm(
                          appointment.schedule.appointment_time
                        )}
                        {appointment.appointment_providers.length > 0 && (
                          <>
                            {' '}
                            with{' '}
                            {appointment.appointment_providers
                              .map((ap) => {
                                const p = ap.provider
                                return `${p.first_name} ${p.last_name}`
                              })
                              .join(', ')}
                          </>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Main Clinic
                      </div>
                      {vitalsLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-4 w-1/2 mt-2" />
                        </div>
                      ) : (
                        viewVitalsAppointmentId === appointment.id &&
                        !vitalsLoading &&
                        patientVitals && (
                          <div className="relative bg-background p-8 rounded-2xl border-2 border-foreground">
                            <button
                              onClick={onCancel}
                              className="absolute text-foreground top-2 right-4 border-2 border-foreground rounded-full w-8 h-8 flex items-center justify-center"
                            >
                              X
                            </button>
                            <VitalsCard {...patientVitals} />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className="uppercase"
                      variant={
                        appointment.status === 'CONFIRMED'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {appointment.status}
                    </Badge>
                    {appointment.status === 'ATTENDING' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAppointmentId(appointment.id)
                          fetchPatientVitals(appointment.id)
                        }}
                      >
                        {viewVitalsAppointmentId === appointment.id
                          ? 'View Vitals'
                          : 'Show Vitals'}
                      </Button>
                    ) : (
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
        {loading ? renderSkeleton() : renderTable()}
      </TabsContent>

      <TabsContent value="form">
        <Card className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 rounded-xl space-y-4 text-sm sm:text-base"
          >
            <h2 className="text-start font-semibold text-lg mb-8">
              New Appointment
            </h2>

            {/* Date */}
            <div className="">
              <Label className="mb-1 block">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    className={cn(
                      'w-full rounded-md border border-muted bg-transparent p-2 text-left text-sm hover:bg-transparent text-white',
                      !watch('schedule.appointment_date') &&
                        'text-muted-foreground'
                    )}
                  >
                    {watch('schedule.appointment_date') ? (
                      format(
                        new Date(watch('schedule.appointment_date')),
                        'PPP'
                      )
                    ) : (
                      <span>Select a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      watch('schedule.appointment_date')
                        ? new Date(watch('schedule.appointment_date'))
                        : undefined
                    }
                    onSelect={(date) =>
                      date &&
                      setValue(
                        'schedule.appointment_date',
                        date.toISOString(),
                        {
                          shouldValidate: true,
                        }
                      )
                    }
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              {errors.schedule?.appointment_date && (
                <p className="text-red-500 text-xs">
                  {errors.schedule?.appointment_date.message}
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <Label className="block mb-1 ">Time</Label>
              <Select
                onValueChange={(value) =>
                  setValue('schedule.appointment_time', value)
                }
                defaultValue={watch('schedule.appointment_time')}
              >
                <SelectTrigger className="w-full rounded-md p-2">
                  <SelectValue placeholder="Select Time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots().map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.schedule?.appointment_time && (
                <p className="text-red-500 text-xs">
                  {errors.schedule?.appointment_time.message}
                </p>
              )}
            </div>

            {/* Purpose */}
            <div>
              <Label className="block mb-1 ">Purpose</Label>
              <Select
                onValueChange={(value) =>
                  setValue('purposes', value as keyof typeof AppointmentPurpose)
                } // value is key
                defaultValue={watch('purposes')?.[0]}
              >
                <SelectTrigger className="w-full rounded-md p-2">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AppointmentPurpose).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.purposes && (
                <p className="text-red-500 text-xs">
                  {'Please select a purpose'}
                </p>
              )}

              {selectedPurpose === 'OTHERS' && (
                <div className="mt-4">
                  <Label htmlFor="other_purpose" className="block mb-1">
                    Please specify
                  </Label>
                  <Input
                    id="other_purpose"
                    {...register('other_purpose', { required: true })}
                    placeholder="Specify other purpose"
                  />
                  {errors.other_purpose && (
                    <p className="text-red-600 text-sm mt-1">
                      This field is required
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 justify-center">
              <Button
                type="submit"
                className="dark:bg-[#2a2348] text-white py-2 rounded-md w-1/2 disabled:bg-[#2a2348]/30"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-6 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </form>
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
