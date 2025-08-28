import type { RecordSoapNoteSchema } from './soapNote.validation.js'
import soapNoteService from './soapNote.service.js'
import catchAsync from '../../utils/catchAsync.js'

const getSoapNotesByAppointment = catchAsync(async (req, res) => {
  const { id } = req.params

  const soapNotes = await soapNoteService.findSoapNotes({
    appointment_id: id,
  })

  res.status(200).json({
    success: true,
    data: soapNotes,
  })
})

const getProviderSoapNote = catchAsync(async (req, res) => {
  const { id } = req.params
  const user = req.user!

  const soapNotes = await soapNoteService.findSoapNote({
    id,
    created_by_id: user.id,
  })

  res.status(200).json({
    success: true,
    data: soapNotes,
  })
})

const recordSoapNote = catchAsync(async (req, res) => {
  const newSoapNote: RecordSoapNoteSchema = req.body
  const provider_id = req.user!.id

  const savedSoapNote = await soapNoteService.updateOrCreateSoapNote(
    {
      appointment_id_created_by_id: {
        appointment_id: newSoapNote.appointment_id,
        created_by_id: provider_id,
      },
    },
    { created_by_id: provider_id, ...newSoapNote }
  )

  res.status(201).json({
    success: true,
    message: 'Note recorded successfully',
    data: savedSoapNote,
  })
})

export default {
  getSoapNotesByAppointment,
  getProviderSoapNote,
  recordSoapNote,
}
