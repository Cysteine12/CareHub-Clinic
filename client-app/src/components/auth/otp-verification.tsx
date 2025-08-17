import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

import { Mail, RefreshCw } from 'lucide-react'
import AuthLayout from '../../layout/AuthLayout'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import API from '../../lib/api'

interface OTPVerificationProps {
  email?: string
  onVerificationSuccess?: () => void
  onResendOTP?: () => void
}

const OTPVerification = ({
  email: initialEmail,
  onVerificationSuccess,
  onResendOTP,
}: OTPVerificationProps) => {
  const [email, setEmail] = useState(initialEmail || '')
  const [hasSubmittedEmail, setHasSubmittedEmail] = useState(!!initialEmail)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useNavigate()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter a valid email')
      return
    }

    try {
      const { data } = await API.post(`/api/auth/patient/request-otp`, {
        email,
      })

      if (!data?.success) {
        return toast.error(data.message || 'Failed to send OTP')
      }

      toast.success('Verification code sent to your email')
      setHasSubmittedEmail(true)
      setTimeLeft(300)
    } catch (err) {
      toast.error('Could not send verification code')
      console.error(err)
    }
  }
  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }

    setOtp(newOtp)

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit) => digit === '')
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5
    inputRefs.current[focusIndex]?.focus()
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join('')

    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }

    setIsVerifying(true)

    try {
      const { data } = await API.post(`/api/auth/patient/verify-email`, {
        email,
        otp: otpString,
      })

      if (!data?.success) {
        toast.error(data?.message || 'OTP verification failed')
        return
      }

      toast.success('Your account has been verified')
      if (typeof onVerificationSuccess === 'function') {
        onVerificationSuccess()
      } else {
        router('/dashboard') // or wherever you want to navigate
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Invalid OTP. Please try again.'

      toast.error(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)

    try {
      const { data } = await API.post(`/api/auth/patient/request-otp`, {
        email,
      })

      if (!data?.success) {
        toast.error(data?.message || 'Failed to resend OTP')
        return
      }

      onResendOTP?.()
      setTimeLeft(300) // Reset timer (5 minutes)
      setOtp(['', '', '', '', '', '']) // Clear OTP input

      toast.info('A new verification code has been sent to your email.')
    } catch (error) {
      console.error('Resend OTP error:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to resend OTP. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <Card className="border-none bg-transparent">
          {!hasSubmittedEmail ? (
            <>
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-2xl font-bold">
                  Enter Your Email
                </CardTitle>
                <CardDescription className="text-base">
                  We'll send a 6-digit code to your email address
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Send Verification Code
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  Verify Your Email
                </CardTitle>
                <CardDescription className="text-base">
                  We've sent a 6-digit verification code to
                  <br />
                  <span className="font-semibold text-gray-900">{email}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Enter verification code
                  </Label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-12 text-center text-lg font-semibold"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={isVerifying || otp.some((digit) => digit === '')}
                  className="w-full bg-[#6A5CA3] hover:bg-[#6A5CA3]/90"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Account'}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Time remaining:{' '}
                    <span className="font-semibold">
                      {formatTime(timeLeft)}
                    </span>
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600">
                      Didn't receive the code?
                    </span>
                    <Button
                      variant="link"
                      onClick={handleResendOTP}
                      disabled={isResending || timeLeft > 0}
                      className="p-0 h-auto text-[#6A5CA3] hover:text-[#6A5CA3]/80"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        'Resend OTP'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> The verification code will expire in{' '}
                    {formatTime(timeLeft)}. If you don't receive it, check your
                    spam folder or request a new code.
                  </p>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </AuthLayout>
  )
}

export default OTPVerification
