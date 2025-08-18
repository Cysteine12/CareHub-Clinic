import express from 'express'
import vitalController from './vital.controller.js'
import { authenticate, authorize } from '../../middlewares/auth.js'
import vitalValidation from './vital.validation.js'
import validate from '../../middlewares/validate.js'
import { UserType } from '../../types/index.js'
import { ProviderRoleTitle } from '@prisma/client'

const router = express.Router()

router.get(
  '/appointment/:id',
  authenticate(UserType.PROVIDER),
  vitalController.getVitalByAppointment
)

router.get(
  '/:id',
  authenticate(UserType.PROVIDER),
  authorize([
    ProviderRoleTitle.ADMIN,
    ProviderRoleTitle.RECEPTIONIST,
    ProviderRoleTitle.NURSE,
  ]),
  vitalController.getVital
)

router.post(
  '/',
  authenticate(UserType.PROVIDER),
  validate(vitalValidation.recordVitalSchema),
  vitalController.recordVital
)

export default router
