import { useEffect, useState } from 'react'
import type { IPagination, Appointment } from '../../types'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDebounce } from '../../../../hooks/useDebounce'
import { Skeleton } from '../../../../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table'
import { Button } from '../../../../components/ui/button'
import { Calendar, Clock, Eye } from 'lucide-react'
import { Avatar, AvatarFallback } from '../../../../components/ui/avatar'
import { formatDate, formatTextWithSize } from '../../../../lib/utils'
import { useAppointments, useSearchAppointmentsByPatientName } from '../hook'
import type { Patient } from '../../../patients/types'
import { Badge } from '../../../../components/ui/badge'
import { formatPurposeText, formatTimeToAmPm } from '../../../../lib/type'
import { getBadgeVariant } from '../../util'

interface Props {
  searchValue: string
  pagination: Required<IPagination>
  setPagination: (pagination: Required<IPagination>) => void
}

const ProviderAppointmentList = ({
  searchValue,
  pagination,
  setPagination,
}: Props) => {
  const [appointments, setAppointments] = useState<
    (Appointment & { patient: Patient })[]
  >([])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: appointmentsData, isLoading } = useAppointments(pagination)
  const { mutate: searchProvidersByName, data: appointmentsSearchData } =
    useSearchAppointmentsByPatientName()

  useEffect(() => {
    if (appointmentsData) {
      setAppointments(appointmentsData?.data)
      setPagination({ ...pagination, total: appointmentsData?.total })
    }
  }, [appointmentsData])
  useEffect(() => {
    if (appointmentsSearchData) setAppointments(appointmentsSearchData?.data)
  }, [appointmentsSearchData])

  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1
    // @ts-expect-error: use mid-state var
    setPagination((prevPagination) => ({ ...prevPagination, page }))
  }, [searchParams.get('page')])

  useDebounce(
    () => {
      if (searchValue || appointmentsData) {
        const query = { page: 1, limit: pagination.limit }
        searchProvidersByName({ name: searchValue, query })
      }
    },
    1000,
    [searchValue]
  )

  return (
    <div className="my-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? // @ts-expect-error: no-unused-vars
              [...Array(20)].map((i, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-3 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : appointments?.map((appointment) => (
                <TableRow key={appointment?.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {appointment?.patient?.first_name?.slice(0, 1)}
                          {appointment?.patient?.last_name?.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {appointment?.patient?.first_name}{' '}
                          {appointment?.patient?.last_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-nowrap">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(appointment?.schedule?.date)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTimeToAmPm(appointment?.schedule?.time)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        {formatTextWithSize(
                          formatPurposeText(appointment?.purposes),
                          25
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Badge variant={getBadgeVariant(appointment?.status)}>
                        {appointment?.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/provider/appointments/${appointment?.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default ProviderAppointmentList
