import { useEffect, useState } from 'react'
import type { IPagination, Provider } from '../types'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { Calendar, Edit, Mail, Phone } from 'lucide-react'
import { Avatar, AvatarFallback } from '../../../components/ui/avatar'
import type { Appointment } from '../../../lib/type'
import { formatDate, formatTextWithSize } from '../../../lib/utils'
import { Badge } from '../../../components/ui/badge'
import { useProviders, useSearchProvidersByName } from '../hook'

interface Props {
  searchValue: string
  pagination: Required<IPagination>
  setPagination: (pagination: Required<IPagination>) => void
}

const ProvidersList = ({ searchValue, pagination, setPagination }: Props) => {
  const [providers, setProviders] = useState<
    | (Provider & {
        nextAppointment: Appointment
        lastAppointment: Appointment
      })[]
    | null
  >(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: providersData, isLoading } = useProviders(pagination)
  const { mutate: searchProvidersByName, data: providersSearchData } =
    useSearchProvidersByName()

  useEffect(() => {
    if (providersData) {
      setProviders(providersData?.data)
      setPagination({ ...pagination, total: providersData?.total })
    }
  }, [providersData])
  useEffect(() => {
    if (providersSearchData) setProviders(providersSearchData?.data)
  }, [providersSearchData])

  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1
    // @ts-expect-error: use mid-state var
    setPagination((prevPagination) => ({ ...prevPagination, page }))
  }, [searchParams.get('page')])

  useDebounce(
    () => {
      if (searchValue || providersData) {
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
            <TableHead>Provider</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Appointment</TableHead>
            <TableHead>Next Appointment</TableHead>
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
                  <TableCell>
                    <Skeleton className="h-3 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : providers?.map((provider) => (
                <TableRow key={provider?.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {provider?.first_name?.slice(0, 1)}
                          {provider?.last_name?.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {provider?.first_name} {provider?.last_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {provider?.phone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1 h-3 w-3" />
                        {formatTextWithSize(provider?.email?.toLowerCase(), 25)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Badge variant={'outline'}>
                        {provider?.role_title.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {provider?.lastAppointment ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(provider?.lastAppointment?.schedule?.date)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        None
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {provider?.nextAppointment ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(provider?.nextAppointment?.schedule?.date)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        None
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/provider/${provider?.id}/edit`)
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
export default ProvidersList
