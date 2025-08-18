import bcrypt from 'bcryptjs'
import catchAsync from '../../../utils/catchAsync.js'
import authService from '../auth.service.js'
import emailService from '../../../services/email.service.js'
import { generateOTP } from '../auth.util.js'
import {
  NotFoundError,
  ValidationError,
} from '../../../middlewares/errorHandler.js'
import type {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  PatientRegisterSchema,
  PatientUpdateProfileSchema,
  RequestOTPSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from '../auth.validation.js'
import { TokenType } from '@prisma/client'
import patientService from '../../patient/patient.service.js'
import { UserType } from '../../../types/index.js'
import awsS3 from '../../../config/aws-s3.js'

const register = catchAsync(async (req, res) => {
  let newPatient: PatientRegisterSchema = req.body

  const patient = await patientService.findPatient({ email: newPatient.email })
  if (patient) throw new ValidationError('This email already exists')

  newPatient.password = await bcrypt.hash(newPatient.password, 10)

  const savedPatient = await patientService.createPatient(newPatient)

  const { otp, expires_at } = generateOTP()

  await authService.updateOrCreateToken(
    { email: savedPatient.email },
    {
      otp,
      expires_at,
      email: savedPatient.email,
      type: TokenType.VERIFY_EMAIL,
    }
  )
  await emailService.sendEmailVerificationRequestMail(savedPatient, otp)

  res.status(201).json({
    success: true,
    message: 'Please check your email to verify your account.',
  })
})

const login = catchAsync(async (req, res) => {
  let newPatient: LoginSchema = req.body

  const patient = await patientService.findPatient({ email: newPatient.email })
  if (!patient) throw new ValidationError('Invalid credentials')

  const isMatch = await bcrypt.compare(newPatient.password, patient.password)
  if (!isMatch) throw new ValidationError('Invalid credentials')

  if (!patient.is_verified) {
    const { otp, expires_at } = generateOTP()

    await authService.updateOrCreateToken(
      { email: patient.email },
      {
        otp,
        expires_at,
        email: patient.email,
        type: TokenType.VERIFY_EMAIL,
      }
    )
    await emailService.sendEmailVerificationRequestMail(patient, otp)

    throw new ValidationError('verify-email')
  }

  if (patient.image_url) {
    patient.image_url = await awsS3.getPresignedDownloadUrl(patient.image_url)
  }
  delete (patient as any).password

  req.session.user = {
    id: patient.id,
    type: UserType.PATIENT,
  }

  res.status(200).json({
    success: true,
    data: patient,
    message: 'Login successful',
  })
})

const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp }: VerifyEmailSchema = req.body

  const patient = await patientService.findPatient({ email })
  if (!patient) throw new NotFoundError('User not found')

  const token = await authService.findToken({
    email,
    otp,
    type: TokenType.VERIFY_EMAIL,
  })
  if (!token) {
    throw new ValidationError('Invalid OTP')
  }

  if (token.expires_at < new Date()) {
    // expired – now generate a new one
    const { otp, expires_at } = generateOTP()

    await authService.updateOrCreateToken(
      { email: patient.email },
      {
        otp,
        expires_at,
        email: patient.email,
        type: TokenType.VERIFY_EMAIL,
      }
    )
    await emailService.sendEmailVerificationRequestMail(patient, otp)

    throw new ValidationError('OTP expired. A new one has been sent.')
  }
  await authService.deleteToken({ id: token.id })

  const updatedPatient = await patientService.updatePatient(
    { email },
    { is_verified: true }
  )
  if (!updatedPatient) throw new NotFoundError('Patient not found')

  await emailService.sendWelcomeMail(
    updatedPatient.email,
    updatedPatient.first_name
  )

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  })
})

const requestOTP = catchAsync(async (req, res) => {
  const { email }: RequestOTPSchema = req.body

  const patient = patientService.findPatient({ email })
  if (!patient) throw new NotFoundError('User not found')

  const { otp, expires_at } = generateOTP()

  await authService.updateOrCreateToken(
    { email },
    { otp, email, expires_at, type: TokenType.VERIFY_EMAIL }
  )

  await emailService.sendEmailVerificationRequestMail({ email }, otp)

  res.status(201).json({
    success: true,
    message: 'Kindly check your email to proceed.',
  })
})

const forgotPassword = catchAsync(async (req, res) => {
  const { email }: ForgotPasswordSchema = req.body

  const patient = patientService.findPatient({ email })
  if (!patient) throw new NotFoundError('User not found')

  const { otp, expires_at } = generateOTP()

  await authService.updateOrCreateToken(
    { email },
    { otp, email, expires_at, type: TokenType.CHANGE_PASSWORD }
  )

  await emailService.sendForgotPasswordMail(email, otp)

  res.status(200).json({
    success: true,
    message: 'OTP has been sent to your email',
  })
})

const resetPassword = catchAsync(async (req, res) => {
  const { email, password, otp }: ResetPasswordSchema = req.body

  const token = await authService.findToken({
    email,
    otp,
    type: TokenType.CHANGE_PASSWORD,
  })
  if (!token || token.expires_at < new Date()) {
    throw new ValidationError('Invalid or expired token. Try again')
  }

  await authService.deleteToken({ id: token.id })

  const newPassword = await bcrypt.hash(password, 10)

  const updatedPatient = await patientService.updatePatient(
    { email },
    { password: newPassword }
  )
  if (!updatedPatient) throw new NotFoundError('User not found')

  await emailService.sendPasswordChangedMail(
    updatedPatient.email,
    updatedPatient.first_name
  )

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  })
})

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword }: ChangePasswordSchema = req.body
  const { id } = req.user!

  let patient = await patientService.findPatient({ id })
  if (!patient) throw new NotFoundError('User not found')

  const isMatch = await bcrypt.compare(currentPassword, patient.password)
  if (!isMatch) throw new ValidationError('Incorrect password')

  patient.password = await bcrypt.hash(newPassword, 10)

  await patientService.updatePatient({ id }, patient)

  await emailService.sendPasswordChangedMail(patient.email, patient.first_name)

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  })
})

const getProfile = catchAsync(async (req, res) => {
  const patientId = req.user?.id

  const patient = await patientService.findPatient({ id: patientId })
  if (!patient) throw new NotFoundError('User not found')

  if (patient.image_url) {
    patient.image_url = await awsS3.getPresignedDownloadUrl(patient.image_url)
  }
  delete (patient as any).password

  res.status(200).json({
    success: true,
    data: patient,
  })
})

const updateProfile = catchAsync(async (req, res) => {
  const patientId = req.user?.id
  const newPatient: PatientUpdateProfileSchema = req.body

  const currentPatient = await patientService.findPatient({ id: patientId })
  if (!currentPatient) throw new NotFoundError('User not found')

  const updatedPatient = await patientService.updatePatient(
    { id: patientId },
    newPatient
  )
  if (!updatedPatient) throw new NotFoundError('User not found')

  if (newPatient.image_url && currentPatient.image_url) {
    await awsS3.deleteObject(currentPatient.image_url)
  }

  if (updatedPatient.image_url) {
    updatedPatient.image_url = await awsS3.getPresignedDownloadUrl(
      updatedPatient.image_url
    )
  }
  delete (updatedPatient as any).password

  res.status(200).json({
    success: true,
    data: updatedPatient,
    message: 'Profile updated successfully',
  })
})

const generateUploadUrl = catchAsync(async (req, res) => {
  const { fileType, fileName } = req.query as any
  const key = `profile-images/${Date.now()}-${fileName}`

  const signedUrl = await awsS3.getPresignedUploadUrl({ fileType, key })

  res.status(200).json({
    success: true,
    data: { signedUrl, key },
  })
})

const logout = catchAsync((req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err)
    res.clearCookie('connect.sid')

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  })
})

export default {
  register,
  login,
  verifyEmail,
  requestOTP,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  generateUploadUrl,
  logout,
}
