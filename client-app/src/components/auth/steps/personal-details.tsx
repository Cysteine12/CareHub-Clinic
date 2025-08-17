import { useFormContext } from 'react-hook-form'

import { type FormData } from '../../../lib/schema'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select'
import API from '../../../lib/api'

interface PersonalDetailsStepProps {
  onNext: () => void
  onPrev: () => void
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

type InsuranceProvider = {
  id: string
  name: string
  description: string
  created_at: Date
  updated_at: Date
}

export type Gender = 'MALE' | 'FEMALE' | 'NULL'

const GENDER_OPTIONS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'NULL' },
]

const PersonalDetailsStep = ({ onNext, onPrev }: PersonalDetailsStepProps) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormData>()
  const [insuranceProviders, setInsuranceProviders] = useState<
    InsuranceProvider[]
  >([])
  const [loading, setLoading] = useState(false)
  const insuranceValue = watch('insurance_provider_id')
  const bloodGroupValue = watch('blood_group') || ''
  const gender = watch('gender')

  const personalFields = [
    ['First Name', 'first_name', 'text', 'e.g. John'],
    ['Last Name', 'last_name', 'text', 'e.g. Doe'],
    ['Address', 'address', 'text', 'e.g. 123 Main St, Springfield'],
    ['Email', 'email', 'email', 'e.g. johndoe@gmail.com'],
    ['Phone', 'phone', 'text', '0903-322-827'],
    ['Date of Birth', 'date_of_birth', 'date'],
    ['Allergies', 'allergies', 'text', 'e.g. Peanuts, Penicillin'],
  ]

  const additionalFields = [
    ['Occupation', 'occupation', 'e.g. Software Engineer'],
    ['Emergency Contact Name', 'emergency_contact_name', 'e.g. Jane Doe'],
    [
      'Emergency Contact Phone',
      'emergency_contact_phone',
      'e.g. 0803-456-7890',
    ],
    [
      'Insurance Coverage',
      'insurance_coverage',
      'e.g. Basic Health Package or N/A',
    ],
  ]

  useEffect(() => {
    const fetchInsuranceProvider = async () => {
      setLoading(true)
      try {
        const { data } = await API.get(`/api/insurance-providers`)

        if (!data?.success) {
          toast.error('Error fetching providers')
        } else {
          setInsuranceProviders(data.data)
        }
      } catch (err) {
        console.error('Fetch failed:', err)
        toast.error('Failed to fetch insurance providers.')
      } finally {
        setLoading(false)
      }
    }

    fetchInsuranceProvider()
  }, [])

  return (
    <div className="text-black">
      <div className="mb-8 ">
        <h2 className="font-semibold tracking-tight text-xl">
          Personal Information
        </h2>
        <p className="text-xs text-muted-foreground">Tell us about yourself</p>
      </div>

      <div className="md:grid lg:grid-cols-2 gap-4">
        {personalFields.map(
          ([label, name, type = 'text', placeholder, width = 'col-span-2']) => (
            <div
              key={name}
              className={`space-y-2 ${
                (name as keyof FormData) === 'address' && width
              }`}
            >
              <Label className="font-semibold">{label}</Label>
              <Input
                type={type}
                {...register(name as keyof FormData)}
                className={`${
                  errors[name as keyof FormData] && 'border-red-500'
                } bg-background/20`}
                placeholder={placeholder}
              />
              {errors[name as keyof FormData] && (
                <p className="text-red-500 text-sm">
                  {errors[name as keyof FormData]?.message}
                </p>
              )}
            </div>
          )
        )}

        <div className="space-y-2">
          <Label className="font-semibold">Gender</Label>
          <Select
            value={gender}
            onValueChange={(val) =>
              setValue('gender', val as 'MALE' | 'FEMALE' | 'NULL')
            }
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-red-500 text-sm">{errors.gender.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">Blood Group</Label>
          <Select
            value={bloodGroupValue}
            onValueChange={(val) => setValue('blood_group', val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Blood Group" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.blood_group && (
            <p className="text-red-500 text-sm">{'Blood Group is required'}</p>
          )}
        </div>

        <div className="mb-2 col-span-2">
          <h2 className="font-semibold tracking-tight text-lg">
            Contact Information
          </h2>
        </div>

        {additionalFields.map(([label, name, placeholder]) => (
          <div key={name} className="space-y-2">
            <Label className="font-semibold">{label}</Label>
            <Input
              {...register(name as keyof FormData)}
              className={`${
                errors[name as keyof FormData] && 'border-red-500'
              } bg-background/20`}
              placeholder={placeholder}
            />
            {errors[name as keyof FormData] && (
              <p className="text-red-500 text-sm">
                {errors[name as keyof FormData]?.message}
              </p>
            )}
          </div>
        ))}

        <div className="space-y-2">
          <Label className="font-semibold">Insurance Provider</Label>

          {loading ? (
            <div className="w-full">
              <div className="h-10 rounded bg-zinc-700 animate-pulse" />
            </div>
          ) : (
            <Select
              value={insuranceValue}
              onValueChange={(val) => setValue('insurance_provider_id', val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Insurance Provider" />
              </SelectTrigger>
              <SelectContent>
                {insuranceProviders.map((insurance: InsuranceProvider) => (
                  <SelectItem key={insurance.id} value={insurance.id}>
                    {insurance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.insurance_provider_id && (
            <p className="text-red-500 text-sm">
              {errors.insurance_provider_id.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between md:gap-8 my-6">
        <Button
          type="button"
          onClick={onPrev}
          className="bg-gray-600 font-semibold md:w-1/2"
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="bg-[#6A5CA3] hover:bg-[#6A5CA3]/30 font-semibold z-20 md:w-1/2"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default PersonalDetailsStep
