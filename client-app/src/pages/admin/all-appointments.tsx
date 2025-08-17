import type React from 'react'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'

import { Input } from '../../components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs'

import { toast } from 'sonner'
import { type Appointment } from '../../lib/type'
import { Skeleton } from '../../components/ui/skeleton'

import AppointmentList from '../../components/appointment-list'
import { Search } from 'lucide-react'
import { isToday } from 'date-fns'
import AppointmentForm from '../../features/appointments/components/appointment-form'
import API from '../../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Appointments() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [appointments, setAppointments] = useState<Appointment[]>()
  const [filteredAppointments, setFilteredAppointments] =
    useState<Appointment[]>()

  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_date: '',
    appointment_time: '',
    purposes: '',
    other_purpose: '',
    has_insurance: false,
  })

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(`Appointment has been scheduled successfully.`)

    const payload = {
      patient_id: {
        id: formData.patient_id.split(' - ')[1],
        first_name: formData.patient_id.split(' ')[0],
        last_name: formData.patient_id.split(' ')[1],
        insurance_provider_id: 'Leads corp',
      },
      schedule: {
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        schedule_count: 0,
      },
      purposes:
        typeof formData.purposes === 'string'
          ? [formData.purposes]
          : formData.purposes,
      other_purpose: formData.other_purpose,
      has_insurance: formData.has_insurance,
    }

    const { data } = await API.post('/api/appointment/create', payload)
    if (!data?.success) return toast.error(data.message)

    navigate(`/provider/appointments/${data.data.id}`)
  }

  const filterAppointments = (filter: string) => {
    if (filter === 'all') {
      setFilteredAppointments(appointments)
    }
    if (filter === 'today') {
      const filteredResults = appointments?.filter((appointment) =>
        isToday(appointment?.schedule?.appointment_date)
      )
      setFilteredAppointments(filteredResults)
    }
    if (filter === 'completed') {
      const filteredResults = appointments?.filter(
        (appointment) => appointment.status === 'COMPLETED'
      )
      setFilteredAppointments(filteredResults)
    }
    if (filter === 'search') {
      if (searchTerm === '') {
        setFilteredAppointments(appointments)
        return
      }
      const filteredResults = filteredAppointments?.filter((appointment) => {
        const patientName =
          `${appointment.patient.first_name} ${appointment.patient.last_name}`.toLowerCase()
        return patientName.includes(searchTerm.toLowerCase())
      })
      setFilteredAppointments(filteredResults)
    }
  }

  const fetchAppointments = async () => {
    setIsLoading(true)
    const { data } = await API.get(`/api/appointment/appointments`)

    if (!data?.success) {
      toast.error(data?.message || 'Failed to fetch appointments')
    }

    setAppointments(data?.data ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  if (isLoading) {
    return (
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
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Appointment Management
          </h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  filterAppointments('search')
                }}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger onClick={() => filterAppointments('all')} value="all">
              All Schedule
            </TabsTrigger>
            <TabsTrigger
              onClick={() => filterAppointments('today')}
              value="today"
            >
              Today's Schedule
            </TabsTrigger>
            <TabsTrigger
              onClick={() => filterAppointments('completed')}
              value="completed"
            >
              Completed Schedules
            </TabsTrigger>
            <TabsTrigger value="schedule">Add New Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <AppointmentList
              appointments={filteredAppointments || appointments}
              title={'All Appointments'}
            />
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            <AppointmentList
              appointments={filteredAppointments}
              title={"Today's Appointments"}
            />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <AppointmentList
              appointments={filteredAppointments}
              title={'Completed Appointments'}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Appointment</CardTitle>
                <CardDescription>
                  Book a new appointment for a patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleScheduleAppointment}
                  isLoading={false}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
