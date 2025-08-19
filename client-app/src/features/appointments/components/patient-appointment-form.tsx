import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AppointmentPurpose,
  appointmentSchema,
  timeSlots,
  type AppointmentFormData,
} from '../../../lib/schema'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { toast } from 'sonner'
import { Input } from '../../../components/ui/input'
import { Calendar } from '../../../components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '../../../lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover'
import { useState } from 'react'
import API from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { CalendarIcon, Loader2 } from 'lucide-react'

type PatientAppointmentFormProps = {
  onCompleteSubmit: () => void
}

const PatientAppointmentForm = ({
  onCompleteSubmit,
}: PatientAppointmentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      schedule: {
        date: '',
        time: '',
      },
      purposes: undefined as keyof typeof AppointmentPurpose | undefined,
      other_purpose: '',
    },
  })

  const onSubmit = async (data: AppointmentFormData) => {
    console.log('iran')
    setIsSubmitting(true)
    const endpoint = `/api/patient/appointments`
    const payload = { ...data, purposes: [watch('purposes')] }

    try {
      const { data } = await API.post(endpoint, payload)

      if (!data?.success) {
        toast.error(data?.message || 'Failed to create appointment')
        return
      }

      toast.success(data?.message)
      setTimeout(() => {
        onCompleteSubmit()
      }, 1000)
    } catch (error) {
      console.error('See error:', error)
      const message =
        error instanceof Error
          ? error.message
          : 'Invalid email or password. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={() => handleSubmit(onSubmit)}
      className="p-6 rounded-xl space-y-4 text-sm sm:text-base"
    >
      <h2 className="text-start font-semibold text-lg mb-8">New Appointment</h2>

      {/* Date */}
      <div className="">
        <Label className="mb-1 block">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              className={cn(
                'w-full rounded-md border border-muted bg-transparent p-2 text-left text-sm hover:bg-transparent text-white',
                !watch('schedule.date') && 'text-muted-foreground'
              )}
            >
              {watch('schedule.date') ? (
                format(new Date(watch('schedule.date')), 'PPP')
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
                watch('schedule.date')
                  ? new Date(watch('schedule.date'))
                  : undefined
              }
              onSelect={(date) =>
                date &&
                setValue('schedule.date', date.toISOString(), {
                  shouldValidate: true,
                })
              }
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>

        {errors.schedule?.date && (
          <p className="text-red-500 text-xs">
            {errors.schedule?.date.message}
          </p>
        )}
      </div>

      {/* Time */}
      <div>
        <Label className="block mb-1 ">Time</Label>
        <Select
          onValueChange={(value) => setValue('schedule.time', value)}
          defaultValue={watch('schedule.time')}
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
        {errors.schedule?.time && (
          <p className="text-red-500 text-xs">
            {errors.schedule?.time.message}
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
          <p className="text-red-500 text-xs">{'Please select a purpose'}</p>
        )}
        <div className="mt-4">
          <Label htmlFor="other_purpose" className="block mb-1">
            Description{' '}
            {watch('purposes') === 'OTHERS' ? '(Required)' : '(Optional)'}
          </Label>
          <Input
            id="other_purpose"
            {...register('other_purpose', {
              required: watch('purposes') === 'OTHERS',
            })}
            placeholder="Specify other purpose"
          />
          {errors.other_purpose && (
            <p className="text-red-600 text-sm mt-1">This field is required</p>
          )}
        </div>
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
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </form>
  )
}
export default PatientAppointmentForm
