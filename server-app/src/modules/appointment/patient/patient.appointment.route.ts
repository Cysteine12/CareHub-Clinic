import express from 'express'
import validate from '../../../middlewares/validate.js'
import appointmentValidation from '../appointment.validation.js'
import patientAppointmentController from './patient.appointment.controller.js'
import { authenticate } from '../../../middlewares/auth.js'
import { UserType } from '../../../types/index.js'

const router = express.Router()

router.get(
  '/',
  authenticate(UserType.PATIENT),
  patientAppointmentController.getAppointments
)

router.get(
  '/:id',
  authenticate(UserType.PATIENT),
  patientAppointmentController.getAppointment
)

router.post(
  '/',
  authenticate(UserType.PATIENT),
  validate(appointmentValidation.createPatientAppointmentSchema),
  patientAppointmentController.createAppointment
)

router.patch(
  '/:id',
  authenticate(UserType.PATIENT),
  validate(appointmentValidation.updatePatientAppointmentSchema),
  patientAppointmentController.updateAppointment
)

router.patch(
  '/:id/reschedule',
  authenticate(UserType.PATIENT),
  validate(appointmentValidation.updatePatientAppointmentSchema),
  patientAppointmentController.rescheduleAppointment
)

router.patch(
  '/:id/cancel',
  authenticate(UserType.PATIENT),
  patientAppointmentController.cancelAppointment
)

export default router
