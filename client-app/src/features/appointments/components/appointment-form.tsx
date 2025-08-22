import type { FormEvent } from 'react'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { AppointmentPurpose, timeSlots } from '../../../lib/schema'
import { Textarea } from '../../../components/ui/textarea'
import { Button } from '../../../components/ui/button'
import type { Patient } from '../../patients/types'
import { Checkbox } from '../../../components/ui/checkbox'
import type { AppointmentPurposes } from '../types'

type ProviderAppointment = {
  patient_id: string
  date: string
  time: string
  purposes: AppointmentPurposes[number]
  other_purpose: string
  has_insurance: boolean
}

interface Props {
  patient: Patient
  formData: ProviderAppointment
  setFormData: (formData: ProviderAppointment) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
}

const AppointmentForm = ({
  patient,
  formData,
  setFormData,
  onSubmit,
  isLoading,
}: Props) => {
  const handleInputChange = (
    field: keyof ProviderAppointment,
    value: string | boolean
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patient">Patient *</Label>
        <div>
          {patient.first_name} {patient.last_name}
        </div>
        <div className="text-muted-foreground lowercase">
          {patient.email} | {patient.gender}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="purposes">Appointment Purpose *</Label>
        <Select
          value={formData.purposes}
          onValueChange={(e) => handleInputChange('purposes', e)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select appointment purpose" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AppointmentPurpose).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {'date' in formData && (
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
        )}
        {'time' in formData && (
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Select
              value={formData.time}
              onValueChange={(e) => handleInputChange('time', e)}
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
        )}
      </div>
      {'other_purpose' in formData && (
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.other_purpose}
            onChange={(e) => handleInputChange('other_purpose', e.target.value)}
            placeholder="Any special notes or requirements for this appointment"
          />
        </div>
      )}
      {'has_insurance' in formData && (
        <div className="space-y-2">
          <Checkbox
            id="has_insurance"
            checked={formData.has_insurance}
            onCheckedChange={(value) =>
              handleInputChange('has_insurance', value)
            }
          />
          <Label htmlFor="has_insurance" className="mx-2">
            Select if patient has insurance
          </Label>
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          Schedule Appointment
        </Button>
      </div>
    </form>
  )
}
export default AppointmentForm
