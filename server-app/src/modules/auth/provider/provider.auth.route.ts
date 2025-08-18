import express from 'express'
import validate from '../../../middlewares/validate.js'
import providerAuthController from './provider.auth.controller.js'
import authValidation from '../auth.validation.js'
import { authenticate } from '../../../middlewares/auth.js'
import { UserType } from '../../../types/index.js'

const router = express.Router()

router.post(
  '/login',
  validate(authValidation.loginSchema),
  providerAuthController.login
)

router.post(
  '/forgot-password',
  validate(authValidation.forgotPasswordSchema),
  providerAuthController.forgotPassword
)

router.post(
  '/reset-password',
  validate(authValidation.resetPasswordSchema),
  providerAuthController.resetPassword
)

router.post(
  '/change-password',
  authenticate(UserType.PROVIDER),
  validate(authValidation.changePasswordSchema),
  providerAuthController.changePassword
)

router.get(
  '/profile',
  authenticate(UserType.PROVIDER),
  providerAuthController.profile
)

router.post('/logout', providerAuthController.logout)

export default router
