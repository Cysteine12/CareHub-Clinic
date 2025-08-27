import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Alert } from '../../../components/ui/alert'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useAppointment,
  useRescheduleAppointment,
  useUpdateAppointment,
} from '../../../features/appointments/patients/hook'
import type { UpdatePatientAppointmentSchema } from '../../../features/appointments/schema'
import type { AppointmentPurposes } from '../../../features/appointments/types'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { AppointmentPurpose, timeSlots } from '../../../lib/schema'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'

const PatientEditAppointment = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: appointmentData, isLoading } = useAppointment(id)
  const { mutate: rescheduleAppointment } = useRescheduleAppointment()
  const { mutate: updateAppointment } = useUpdateAppointment()
  const [formData, setFormData] = useState<UpdatePatientAppointmentSchema>({
    schedule: {
      date: '',
      time: '',
    },
    purposes: '' as unknown as AppointmentPurposes,
    other_purpose: '',
  })

  useEffect(() => {
    if (appointmentData?.data) {
      if (
        !['SUBMITTED', 'SCHEDULED', 'NO_SHOW'].includes(
          appointmentData?.data?.status
        )
      ) {
        navigate(-1)
      }

      setFormData(appointmentData?.data)
    }
  }, [appointmentData?.data])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (['SCHEDULED', 'NO_SHOW'].includes(appointmentData?.data?.status)) {
      rescheduleAppointment({
        id: appointmentData?.data?.id,
        payload: formData,
      })
    } else if (['SUBMITTED'].includes(appointmentData?.data?.status)) {
      updateAppointment({ id: appointmentData?.data?.id, payload: formData })
    } else {
      navigate(-1)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate(-1)} variant="ghost" className="">
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>
        <h4 className="text-2xl font-bold">Edit Appointment Details</h4>
        <div></div>
      </div>

      {!isLoading && (
        <div className="flex-1 space-y-4 p-4 md:p-8 lg:px-32 pt-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Edit Schedule</CardTitle>
              <CardDescription>
                Please fill out all required information for booking an
                appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purposes">Appointment Purpose *</Label>
                  <Select
                    value={formData?.purposes[0]}
                    onValueChange={(e) =>
                      setFormData({
                        ...formData,
                        purposes: [e as AppointmentPurposes[number]],
                      })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AppointmentPurpose).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.schedule.date.substring(0, 10)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: {
                            ...formData.schedule,
                            date: new Date(e.target.value).toISOString(),
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Select
                      value={formData.schedule.time}
                      onValueChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, time: e },
                        })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots().map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.other_purpose || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        other_purpose: e.target.value,
                      })
                    }
                    placeholder="Any special notes or requirements for this appointment"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="submit" disabled={isLoading}>
                    Submit Appointment
                  </Button>
                </div>
              </form>
            </CardContent>
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
        </div>
      )}
    </>
  )
}

export default PatientEditAppointment
