import { useEffect, useMemo, useRef } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
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
import type { Vital } from '../types'
import type { RecordVitalSchema } from '../schema'
import { useRecordVital } from '../hook'

type VitalFormDialogProps = {
  appointmentId: string
  appointmentVital: Vital | undefined
}

export default function VitalFormDialog({
  appointmentId,
  appointmentVital,
}: VitalFormDialogProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const { mutate: recordVital, isPending } = useRecordVital(appointmentId)
  const [vital, setVital] = useState<RecordVitalSchema>({
    temperature: '',
    blood_pressure: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
    height: '',
    bmi: '',
    others: '',
    appointment_id: appointmentId,
  })

  useEffect(() => {
    if (appointmentVital) setVital(appointmentVital)
  }, [appointmentVital])

  const computeBMI = useMemo(() => {
    if (!vital.weight || !vital.height) return ''
    const weight = Number.parseFloat(vital.weight)
    const height = Number.parseFloat(vital.height)

    const heightInMeters = height * 0.0254
    const bmi = weight / (heightInMeters * heightInMeters)
    setVital((prev: RecordVitalSchema) => ({ ...prev, bmi: bmi.toFixed(1) }))
    return bmi.toFixed(1)
  }, [vital.height, vital.weight])

  const handleVitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    recordVital(vital)
    buttonRef?.current?.click()
  }

  const handleInputChange = (field: string, value: string) => {
    setVital((prevVital: RecordVitalSchema) => ({
      ...prevVital,
      [field]: value,
    }))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button ref={buttonRef} onClick={() => {}}>
          {appointmentVital ? 'Update Vitals' : 'Record Vitals'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-12" />
            Record Vital Signs
          </DialogTitle>
          <DialogDescription>
            Enter patient vital signs and measurements
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => handleVitalSubmit(e)} className="space-y-4">
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
                value={vital.temperature}
                onChange={(e) =>
                  handleInputChange('temperature', e.target.value)
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
                value={vital.blood_pressure}
                onChange={(e) =>
                  handleInputChange('blood_pressure', e.target.value)
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
                value={vital.heart_rate}
                onChange={(e) =>
                  handleInputChange('heart_rate', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
              <Input
                id="respiratoryRate"
                type="number"
                placeholder="16"
                value={vital.respiratory_rate}
                onChange={(e) =>
                  handleInputChange('respiratory_rate', e.target.value)
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
                value={vital.oxygen_saturation}
                onChange={(e) =>
                  handleInputChange('oxygen_saturation', e.target.value)
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
                value={vital.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="flex items-center">
              <Ruler className="mr-1 h-4 w-4" />
              Height (ft)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="66"
              value={vital.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
            />
          </div>

          {vital.weight && vital.height && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Calculated BMI:</Label>
              <div className="text-lg font-bold">{computeBMI}</div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="vital-notes">Notes</Label>
            <Textarea
              id="vital-notes"
              placeholder="Additional observations or notes..."
              value={vital.others}
              onChange={(e) => handleInputChange('others', e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            {isPending ? (
              <>
                <Loader2 className="animate-spin size-6" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Vitals
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
