import { useEffect, useState } from 'react'
import type { IPagination, Patient } from '../types'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePatients, useSearchPatientsByName } from '../hook'
import { useDebounce } from '../../../hooks/useDebounce'
import { Skeleton } from '../../../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Button } from '../../../components/ui/button'
import { Calendar, Edit, Eye, Mail, Phone } from 'lucide-react'
import { Avatar, AvatarFallback } from '../../../components/ui/avatar'
import { differenceInYears } from 'date-fns'
import type { InsuranceProvider } from '../../insuranceProviders/types'
import type { Appointment } from '../../../lib/type'
import { formatDate } from '../../../lib/utils'

interface Props {
  searchValue: string
  pagination: Required<IPagination>
  setPagination: (pagination: Required<IPagination>) => void
}

const PatientsList = ({ searchValue, pagination, setPagination }: Props) => {
  const [patients, setPatients] = useState<
    | (Patient & {
        insurance_provider: InsuranceProvider
        lastVisit: Appointment
        nextAppointment: Appointment
      })[]
    | null
  >(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: patientsData, isLoading } = usePatients(pagination)
  const { mutate: searchPatientsByName, data: patientsSearchData } =
    useSearchPatientsByName()

  useEffect(() => {
    if (patientsData) {
      setPatients(patientsData?.data)
      setPagination({ ...pagination, total: patientsData?.total })
    }
  }, [patientsData])
  useEffect(() => {
    if (patientsSearchData) setPatients(patientsSearchData?.data)
  }, [patientsSearchData])

  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1
    setPagination({ ...pagination, page })
  }, [searchParams.get('page')])

  useDebounce(
    () => {
      if (searchValue || patientsData) {
        const query = { page: 1, limit: pagination.limit }
        searchPatientsByName({ name: searchValue, query })
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
            <TableHead>Contact</TableHead>
            <TableHead>Insurance</TableHead>
            <TableHead>Last Visit</TableHead>
            <TableHead>Next Appointment</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? [...Array(20)].map((_i, index) => (
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
                  <TableCell>
                    <Skeleton className="h-3 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : patients?.map((patient) => (
                <TableRow key={patient?.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {patient?.first_name?.slice(0, 1)}
                          {patient?.last_name?.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {patient?.first_name} {patient?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {differenceInYears(
                            new Date(),
                            patient?.date_of_birth
                          )}
                          y •{' '}
                          <span className="capitalize">{patient?.gender}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {patient?.phone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1 h-3 w-3" />
                        {patient?.email?.toLowerCase()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {patient?.insurance_provider?.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient?.lastVisit ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(patient?.lastVisit?.schedule?.date)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        None
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient?.nextAppointment ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(patient?.nextAppointment?.schedule?.date)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        None scheduled
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/provider/patients/${patient?.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/provider/patients/${patient?.id}/edit`)
                        }
                      >
                        <Edit className="h-4 w-4" />
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
export default PatientsList
