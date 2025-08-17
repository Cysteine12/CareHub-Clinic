import { useEffect } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Activity,
  Loader2,
  Save,
  Thermometer,
  Heart,
  Ruler,
  Scale,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { type Vitals } from '../lib/schema'
import { VitalsCard } from './vitals-card'
import type { Dispatch, SetStateAction } from 'react'
import type { AppointmentStatus } from '../lib/type'
import API from '../lib/api'

export default function VitalsFormDialog({
  appointmentId,
  setAppointmentId,
  userId,
  setHasVitals,
  setAppointmentStatus,
  showAsDialog = true,
}: {
  appointmentId: string
  setAppointmentId: React.Dispatch<React.SetStateAction<string | null>>
  userId?: string
  setHasVitals: (value: boolean) => void
  setAppointmentStatus: Dispatch<SetStateAction<AppointmentStatus>>
  showAsDialog?: boolean
}) {
  const [localHasVitals, setLocalHasVitals] = useState(false)
  if (!userId) {
    throw new Error('userId is required')
  }
  const [vitals, setVitals] = useState<Vitals & { appointment_id?: string }>({
    temperature: '',
    blood_pressure: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
    height: '',
    others: '',
    created_by_id: userId,
    appointment_id: appointmentId,
    created_by: undefined,
    created_at: undefined,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const checkVitals = async (id: string) => {
    try {
      const vitalsUrl = `${
        import.meta.env.VITE_SERVER_URL
      }/api/provider/vitals/${id}`
      const { data } = await API.get(vitalsUrl)

      const exists = data.success && data.data && data.data.length > 0
      setHasVitals(exists)
      setLocalHasVitals(exists)
      if (exists && data.data.length > 0) {
        const vitalsData = data.data[0]

        if (vitalsData.created_by_id && !vitalsData.created_by) {
          try {
            const providerUrl = `${
              import.meta.env.VITE_SERVER_URL
            }/api/provider/${vitalsData.created_by_id}`
            const { data } = await API.get(providerUrl)

            if (data.success && data.data) {
              vitalsData.created_by = {
                id: data.data.id,
                first_name: data.data.first_name,
                last_name: data.data.last_name,
                role_title: data.data.role_title,
              }
            }
          } catch (error) {
            console.error('Failed to fetch provider details:', error)
          }
        }

        setVitals(vitalsData)
      }
      return exists
    } catch (err) {
      console.error('Failed to check vitals:', err)
      setHasVitals(false)
      setLocalHasVitals(false)
      return false
    }
  }

  useEffect(() => {
    const updateVitals = async () => {
      if (appointmentId) {
        setVitals((prev) => ({
          ...prev,
          appointment_id: appointmentId,
        }))
        await checkVitals(appointmentId)
      }
    }
    updateVitals()
  }, [appointmentId])

  useEffect(() => {
    setVitals((prev) => ({ ...prev, created_by_id: userId }))
  }, [userId])

  const calculateBMI = (weight: string, height: string) => {
    const weightNum = Number.parseFloat(weight)
    const heightNum = Number.parseFloat(height)
    if (weightNum && heightNum) {
      const heightInMeters = heightNum * 0.0254
      const bmi = weightNum / (heightInMeters * heightInMeters)
      return bmi.toFixed(1)
    }
    return ''
  }

  const handleVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted')
    setIsSubmitting(true)

    try {
      const vitalsExist = await checkVitals(appointmentId)
      if (vitalsExist) {
        toast.error(
          'Vitals already exist for this appointment. Please update them instead of creating new ones.'
        )
        return
      }

      const calculatedBMI = calculateBMI(
        vitals.weight ?? '',
        vitals.height ?? ''
      )
      const vitalsPayload = {
        ...vitals,
        bmi: calculatedBMI || undefined,
      }

      console.log(
        'Sending vitals payload:',
        JSON.stringify(vitalsPayload, null, 2)
      )

      const { data } = await API.post(
        `/api/provider/vitals/record`,
        vitalsPayload
      )

      if (!data || !data.success) {
        toast.error(data?.message || 'Failed to update vitals')
        console.error('Server error:', data?.error)
        return
      }

      const { data: resData } = await API.patch(
        `/api/appointment/${appointmentId}`,
        { status: 'ATTENDING' }
      )

      if (!resData || !resData.success) {
        toast.error('Vitals saved, but failed to update appointment status.')
        return
      }

      if (setAppointmentStatus) {
        setAppointmentStatus('ATTENDING')
      }

      toast.success('Patient vitals updated, status set to ATTENDING')
      setHasVitals(true)
      setLocalHasVitals(true)
    } catch (error) {
      console.error('Error updating patient appointment:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const vitalsContent = (
    <>
      {localHasVitals ? (
        <VitalsCard {...vitals} />
      ) : (
        <form onSubmit={(e) => handleVitalsSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature" className="flex items-center">
                <Thermometer className="mr-1 h-4 w-4" />
                Temperature (°C)
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="98.6"
                value={vitals.temperature}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    temperature: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodPressure" className="flex items-center">
                <Heart className="mr-1 h-4 w-4" />
                Blood Pressure
              </Label>
              <Input
                id="blood Pressure"
                placeholder="120/80"
                value={vitals.blood_pressure}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    blood_pressure: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
              <Input
                id="heartRate"
                type="number"
                placeholder="72"
                value={vitals.heart_rate}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    heart_rate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
              <Input
                id="respiratoryRate"
                type="number"
                placeholder="16"
                value={vitals.respiratory_rate}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    respiratory_rate: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation">O2 Saturation (%)</Label>
              <Input
                id="oxygenSaturation"
                type="number"
                placeholder="98"
                value={vitals.oxygen_saturation}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    oxygen_saturation: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center">
                <Scale className="mr-1 h-4 w-4" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="150"
                value={vitals.weight}
                onChange={(e) =>
                  setVitals({
                    ...vitals,
                    weight: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="flex items-center">
              <Ruler className="mr-1 h-4 w-4" />
              Height (inches)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="66"
              value={vitals.height}
              onChange={(e) =>
                setVitals({
                  ...vitals,
                  height: e.target.value,
                })
              }
            />
          </div>

          {vitals.weight && vitals.height && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Calculated BMI:</Label>
              <div className="text-lg font-bold">
                {calculateBMI(vitals.weight ?? '', vitals.height ?? '')}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="vitals-notes">Notes</Label>
            <Textarea
              id="vitals-notes"
              placeholder="Additional observations or notes..."
              value={vitals.others}
              onChange={(e) =>
                setVitals({
                  ...vitals,
                  others: e.target.value,
                })
              }
            />
          </div>

          <Button type="submit" className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin size-6" />
                Submitting...
              </>
            ) : (
              <>
                {' '}
                <Save className="mr-2 h-4 w-4" />
                Save Vitals
              </>
            )}
          </Button>
        </form>
      )}
    </>
  )

  if (!showAsDialog) {
    return vitalsContent
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={() => setAppointmentId(appointmentId)}>
          {localHasVitals ? 'View Vitals' : 'Take Vitals'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-12" />
            Record Vital Signs
          </DialogTitle>
          <DialogDescription>
            {localHasVitals
              ? 'Here are the recorded vital signs.'
              : 'Enter patient vital signs and measurements'}
          </DialogDescription>
        </DialogHeader>
        {vitalsContent}
      </DialogContent>
    </Dialog>
  )
}
