import express from 'express'
import validate from '../../../middlewares/validate.js'
import appointmentValidation from '../appointment.validation.js'
import providerAppointmentController from './provider.appointment.controller.js'
import { authenticate, authorize } from '../../../middlewares/auth.js'
import { UserType } from '../../../types/index.js'
import { ProviderRoleTitle } from '@prisma/client'

const router = express.Router()

router.get(
  '/',
  authenticate(UserType.PROVIDER),
  providerAppointmentController.getAppointments
)

router.get(
  '/schedule/:scheduleType',
  authenticate(UserType.PROVIDER),
  providerAppointmentController.getAppointmentsBySchedule
)

router.get(
  '/search',
  authenticate(UserType.PROVIDER),
  providerAppointmentController.searchAppointmentsByPatientName
)

router.get(
  '/patient/:patient_id',
  authenticate(UserType.PROVIDER),
  providerAppointmentController.getAppointmentsByPatient
)

router.get(
  '/provider/:provider_id',
  authenticate(UserType.PROVIDER),
  authorize([ProviderRoleTitle.ADMIN, ProviderRoleTitle.RECEPTIONIST]),
  providerAppointmentController.getAppointmentsByProvider
)

router.get(
  '/:id',
  authenticate(UserType.PROVIDER),
  providerAppointmentController.getAppointment
)

router.post(
  '/',
  authenticate(UserType.PROVIDER),
  authorize([ProviderRoleTitle.ADMIN, ProviderRoleTitle.RECEPTIONIST]),
  validate(appointmentValidation.createProviderAppointmentSchema),
  providerAppointmentController.createAppointment
)

router.patch(
  '/:id',
  authenticate(UserType.PROVIDER),
  authorize([ProviderRoleTitle.ADMIN, ProviderRoleTitle.RECEPTIONIST]),
  validate(appointmentValidation.updateProviderAppointmentSchema),
  providerAppointmentController.updateAppointment
)

router.patch(
  '/:id/status',
  authenticate(UserType.PROVIDER),
  validate(appointmentValidation.updateAppointmentStatusSchema),
  providerAppointmentController.updateAppointmentStatus
)

router.patch(
  '/:id/followup',
  authenticate(UserType.PROVIDER),
  authorize([ProviderRoleTitle.ADMIN, ProviderRoleTitle.RECEPTIONIST]),
  validate(appointmentValidation.followUpAppointmentSchema),
  providerAppointmentController.followUpAppointment
)

router.patch(
  '/:id/assign',
  authenticate(UserType.PROVIDER),
  authorize([ProviderRoleTitle.ADMIN, ProviderRoleTitle.RECEPTIONIST]),
  validate(appointmentValidation.assignProviderSchema),
  providerAppointmentController.assignAppointmentProvider
)

router.delete(
  '/:id',
  authenticate(UserType.PROVIDER),
  authorize([ProviderRoleTitle.ADMIN, ProviderRoleTitle.RECEPTIONIST]),
  providerAppointmentController.deleteAppointment
)

export default router
