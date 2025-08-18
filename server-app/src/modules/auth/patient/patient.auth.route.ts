import express from 'express'
import validate from '../../../middlewares/validate.js'
import patientAuthController from './patient.auth.controller.js'
import authValidation from '../auth.validation.js'
import {
  authenticate,
  authenticateMultipleUser,
} from '../../../middlewares/auth.js'
import { UserType } from '../../../types/index.js'

const router = express.Router()

router.post(
  '/register',
  validate(authValidation.patientRegisterSchema),
  patientAuthController.register
)

router.post(
  '/login',
  validate(authValidation.loginSchema),
  patientAuthController.login
)

router.post(
  '/verify-email',
  validate(authValidation.verifyEmailSchema),
  patientAuthController.verifyEmail
)

router.post(
  '/request-otp',
  validate(authValidation.requestOTPSchema),
  patientAuthController.requestOTP
)

router.post(
  '/forgot-password',
  validate(authValidation.forgotPasswordSchema),
  patientAuthController.forgotPassword
)

router.post(
  '/reset-password',
  validate(authValidation.resetPasswordSchema),
  patientAuthController.resetPassword
)

router.post(
  '/change-password',
  authenticate(UserType.PATIENT),
  validate(authValidation.changePasswordSchema),
  patientAuthController.changePassword
)

router.get(
  '/profile',
  authenticate(UserType.PATIENT),
  patientAuthController.getProfile
)

router.put(
  '/profile',
  authenticate(UserType.PATIENT),
  validate(authValidation.patientUpdateProfileSchema),
  patientAuthController.updateProfile
)

router.get(
  '/generate-url',
  authenticateMultipleUser([UserType.PATIENT, UserType.PROVIDER]),
  patientAuthController.generateUploadUrl
)

router.post('/logout', patientAuthController.logout)

export default router
