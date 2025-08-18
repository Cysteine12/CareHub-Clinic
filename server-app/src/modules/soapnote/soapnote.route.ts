import express from 'express'
import soapNoteController from './soapNote.controller.js'
import { authenticate, authorize } from '../../middlewares/auth.js'
import soapNoteValidation from './soapNote.validation.js'
import validate from '../../middlewares/validate.js'
import { UserType } from '../../types/index.js'
import { ProviderRoleTitle } from '@prisma/client'

const router = express.Router()

router.get(
  '/appointment/:id',
  authenticate(UserType.PROVIDER),
  authorize([ProviderRoleTitle.ADMIN, ProviderRoleTitle.RECEPTIONIST]),
  soapNoteController.getSoapNotesByAppointment
)

router.get(
  '/:id',
  authenticate(UserType.PROVIDER),
  soapNoteController.getProviderSoapNote
)

router.post(
  '/',
  authenticate(UserType.PROVIDER),
  validate(soapNoteValidation.recordSoapNoteSchema),
  soapNoteController.recordSoapNote
)

export default router
