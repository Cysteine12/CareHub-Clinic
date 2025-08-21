import type { Provider } from '../../../providers/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card'
import type { AppointmentProvider } from '../../types'
import { formatDateParts } from '../../../../lib/type'
import { Clock, Mail, Phone, User } from 'lucide-react'
import { Badge } from '../../../../components/ui/badge'
import { useState, type FormEvent } from 'react'
import { useAssignAppointmentProvider } from '../hook'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select'
import { useProviders } from '../../../providers/hook'
import { Button } from '../../../../components/ui/button'
import { useAuthStore } from '../../../../store/auth-store'

type AppointmentProviderListProps = {
  appointmentId: string | undefined
  appointmentProviders:
    | (AppointmentProvider & { provider: Provider })[]
    | undefined
}

export default function AppointmentProviderList({
  appointmentId,
  appointmentProviders,
}: AppointmentProviderListProps) {
  const { user } = useAuthStore()
  const [assignedProvider, setAssignedProvider] = useState('')
  const { mutate: assignProvider } = useAssignAppointmentProvider()
  const { data: providersData } = useProviders({ page: 1, limit: 200 })

  const handleAssignProvider = (e: FormEvent) => {
    e.preventDefault()
    if (!appointmentId) return

    assignProvider({
      id: appointmentId,
      payload: { provider_id: assignedProvider },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>List of assigned providers</CardTitle>
        <CardDescription>With assignment date</CardDescription>
      </CardHeader>
      <CardContent>
        {user?.role_title &&
          ['ADMIN', 'RECEPTIONIST'].includes(user.role_title) && (
            <form
              onSubmit={handleAssignProvider}
              className="flex justify-between items-center space-y-4 py-2"
            >
              <Select
                value={assignedProvider}
                onValueChange={(e) => setAssignedProvider(e)}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  {providersData?.data?.map((provider: Provider) => (
                    <SelectItem key={provider?.id} value={provider?.id}>
                      {provider?.first_name} {provider?.last_name} -{' '}
                      {provider?.role_title?.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="flex self-center mt-[-15px]" type="submit">
                Assign Provider
              </Button>
            </form>
          )}

        <div className="space-y-4">
          {!appointmentProviders && (
            <div className="text-sm mx-auto text-center">
              No provider assigned yet
            </div>
          )}
          {appointmentProviders?.map((appointmentProvider) => (
            <AppointmentProviderCard
              key={appointmentProvider?.id}
              provider={appointmentProvider?.provider}
              assignedAt={appointmentProvider?.created_at}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

type AppointmentProviderCardProps = {
  provider: Provider | undefined
  assignedAt: string | undefined
}

const AppointmentProviderCard = ({
  provider,
  assignedAt,
}: AppointmentProviderCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border border-muted rounded-lg">
      <div className="flex items-center space-x-4">
        {/* Date and Duration */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {assignedAt && formatDateParts(assignedAt).month}
          </div>
          <div className="text-lg font-semibold">
            {assignedAt && formatDateParts(assignedAt).day}
          </div>
          <div className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 inline mr-1" />
            30 min
          </div>
        </div>

        {/* Appointment Details */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {provider?.first_name} {provider?.last_name}
            </span>
            <Badge variant={'outline'}>
              {provider?.role_title?.replace('_', ' ')}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {provider?.phone}
              </span>
              <span className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {provider?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {/* <Button
        size="sm"
        variant="default"
        onClick={() => navigate(`/provider/appointments/${provider?.id}`)}
      >
        <Eye />
        View Details
      </Button> */}
    </div>
  )
}
