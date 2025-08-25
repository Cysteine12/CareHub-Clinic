import { User, Watch } from 'lucide-react'
import type { Provider } from '../../providers/types'
import type { SoapNote } from '../types'
import { Badge } from '../../../components/ui/badge'
import { formatDate } from '../../../lib/utils'
import { formatTimeToAmPm } from '../../../lib/type'
import SoapNoteCard from './soap-note-card'
import type { AppointmentProvider } from '../../appointments/types'

type SoapNoteListProps = {
  soapNotes: SoapNote[]
  appointmentProviders: (AppointmentProvider & { provider: Provider })[]
}

const SoapNoteList = ({
  soapNotes,
  appointmentProviders,
}: SoapNoteListProps) => {
  return soapNotes.map((soapNote) => (
    <SoapNoteItem
      key={soapNote.id}
      soapNote={soapNote}
      provider={
        appointmentProviders.find(
          (appointmentProvider) =>
            soapNote.created_by_id === appointmentProvider.id
        )?.provider
      }
    />
  ))
}

type SoapNoteItemProps = {
  soapNote: SoapNote
  provider: Provider | undefined
}

const SoapNoteItem = ({ soapNote, provider }: SoapNoteItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 border border-muted rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {provider?.first_name || 'Admin'}{' '}
              {provider?.last_name || ' / Receptionist'}
            </span>
            <Badge variant={'default'}>{provider?.role_title}</Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <span className="flex items-center">
              <Watch className="h-4 w-4 mr-1" />
              Recorded on {formatDate(soapNote.created_at)} at{' '}
              {formatTimeToAmPm(soapNote.created_at)}
            </span>
            <span className="flex items-center">
              <Watch className="h-4 w-4 mr-1" />
              Last Updated: {formatDate(soapNote.updated_at)} at{' '}
              {formatTimeToAmPm(soapNote.updated_at)}
            </span>
            <div className="text-xs italic">
              {soapNote.plan?.has_referral && 'Recommended a refferal'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <SoapNoteCard soapNote={soapNote} />
    </div>
  )
}

export default SoapNoteList
