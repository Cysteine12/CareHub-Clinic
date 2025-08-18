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
  ResetPasswordSchema,
} from '../auth.validation.js'
import { TokenType } from '@prisma/client'
import providerService from '../../provider/provider.service.js'
import { UserType } from '../../../types/index.js'

const login = catchAsync(async (req, res) => {
  let newProvider: LoginSchema = req.body

  const provider = await providerService.findProvider({
    email: newProvider.email,
  })
  if (!provider) throw new ValidationError('Invalid credentials')

  const isMatch = await bcrypt.compare(newProvider.password, provider.password)
  if (!isMatch) throw new ValidationError('Invalid credentials')

  delete (provider as any).password

  req.session.user = {
    id: provider.id,
    type: UserType.PROVIDER,
    roleTitle: provider.role_title,
  }

  res.status(200).json({
    success: true,
    data: provider,
    message: 'Login successful',
  })
})

const profile = catchAsync(async (req, res) => {
  const providerId = req.user?.id

  const provider = await providerService.findProvider({ id: providerId })
  if (!provider) throw new NotFoundError('User not found')

  delete (provider as any).password

  res.status(200).json({
    success: true,
    data: provider,
  })
})

const forgotPassword = catchAsync(async (req, res) => {
  const { email }: ForgotPasswordSchema = req.body

  const provider = providerService.findProvider({ email })
  if (!provider) throw new NotFoundError('User not found')

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

  const updatedProvider = await providerService.updateProvider(
    { email },
    { password: newPassword }
  )
  if (!updatedProvider) throw new NotFoundError('User not found')

  await emailService.sendPasswordChangedMail(
    updatedProvider.email,
    updatedProvider.first_name
  )

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  })
})

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword }: ChangePasswordSchema = req.body
  const { id } = req.user!

  let provider = await providerService.findProvider({ id })
  if (!provider) throw new NotFoundError('User not found')

  const isMatch = await bcrypt.compare(currentPassword, provider.password)
  if (!isMatch) throw new ValidationError('Incorrect password')

  provider.password = await bcrypt.hash(newPassword, 10)

  await providerService.updateProvider({ id }, provider)

  await emailService.sendPasswordChangedMail(
    provider.email,
    provider.first_name
  )

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
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
  login,
  profile,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
}
