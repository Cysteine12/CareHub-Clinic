import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fullSchema, type FormData } from '../../../lib/schema'
import AuthLayout from '../../../layout/AuthLayout'
import ProgressIndicator from '../progress-indicator'
import WelcomeStep from './welcome-step'
import PersonalDetailsStep from './personal-details'
import PasswordStep from './password-step'
import RegistrationCompleteStep from './registration-complete'
import API from '../../../lib/api'
import { toast } from 'sonner'

const getProgressPercentage = (step: number) => {
  switch (step) {
    case 2:
      return 33
    case 3:
      return 66
    case 4:
      return 100
    default:
      return 0
  }
}

interface SignUpFormProps {
  onSignupComplete?: (data: FormData) => void
}

const SignUpForm = ({ onSignupComplete }: SignUpFormProps) => {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onTouched',
  })

  const { handleSubmit, trigger } = methods

  const nextStep = async () => {
    let valid = true

    if (step === 2) {
      valid = await trigger([
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'occupation',
        'emergency_contact_name',
        'emergency_contact_phone',
        'blood_group',
        'allergies',
        'insurance_coverage',
        'insurance_provider_id',
      ])
    } else if (step === 3) {
      valid = await trigger(['password', 'confirmPassword'])
    }

    if (valid) setStep((prev) => prev + 1)
  }

  const prevStep = () => setStep((prev) => prev - 1)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      // Destructure and exclude confirmPassword
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _, ...payload } = data

      // Format date_of_birth to ISO string
      payload.date_of_birth = new Date(payload.date_of_birth).toISOString()

      const allergiesNormalizedPayload = {
        ...payload,
        allergies: Array.isArray(payload.allergies)
          ? payload.allergies
          : [payload.allergies],
      }

      console.log('Submitting registration data:', payload)

      const { data: resData } = await API.post(
        `/api/auth/patient/register`,
        allergiesNormalizedPayload
      )

      if (!resData?.success) {
        toast.error(`Registration failed: ${resData?.message}`)
        return
      }

      // Notify parent
      onSignupComplete?.(data)
      setStep(4)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during signup.'
      console.error('Signup error:', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="text-white space-y-6 z-20"
        >
          {/* Progress Indicator */}
          {step !== 1 && (
            <ProgressIndicator
              step={step}
              progressPercentage={getProgressPercentage(step)}
            />
          )}

          {/* Step Components */}
          {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}

          {step === 2 && (
            <PersonalDetailsStep onNext={nextStep} onPrev={prevStep} />
          )}

          {step === 3 && (
            <PasswordStep
              onNext={nextStep}
              onPrev={prevStep}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 4 && <RegistrationCompleteStep />}
        </form>
      </FormProvider>
    </AuthLayout>
  )
}

export default SignUpForm
