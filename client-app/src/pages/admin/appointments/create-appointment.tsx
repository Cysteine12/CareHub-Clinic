import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../../lib/api'
import { toast } from 'sonner'
import AppointmentForm from '../../../features/appointments/components/appointment-form'
import { usePatient } from '../../../features/patients/hook'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { ArrowLeft } from 'lucide-react'

const CreateAppointment = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: patientData, isLoading } = usePatient(id)

  const [formData, setFormData] = useState({
    patient_id: '',
    date: '',
    time: '',
    purposes: '',
    other_purpose: '',
    has_insurance: false,
  })

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      patient_id: id,
      schedule: {
        date: new Date(formData.date).toISOString(),
        time: formData.time,
        change_count: 0,
      },
      purposes:
        typeof formData.purposes === 'string'
          ? [formData.purposes]
          : formData.purposes,
      other_purpose: formData.other_purpose,
      has_insurance: formData.has_insurance,
    }

    const { data } = await API.post('/api/provider/appointments', payload)
    if (!data?.success) return toast.error(data.message)

    toast.success(data.message)

    navigate(`/provider/appointments/${data.data.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading patient details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-y-2">
          <Button variant="ghost" size="default" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            Book New Appointment
          </h2>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold tracking-tight">
              Create Schedule
            </h2>
          </CardHeader>
          <CardContent>
            <AppointmentForm
              patient={patientData?.data}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleScheduleAppointment}
              isLoading={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default CreateAppointment
