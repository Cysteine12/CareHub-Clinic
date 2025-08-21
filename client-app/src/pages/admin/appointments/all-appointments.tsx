import { useState } from 'react'

import { Input } from '../../../components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import { type Appointment } from '../../../lib/type'
import AppointmentList from '../../../components/appointment-list'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import ProviderAppointmentList from '../../../features/appointments/providers/components/provider-appointment-list'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import Pagination from '../../../components/ui/pagination'
import { useAppointmentsBySchedule } from '../../../features/appointments/providers/hook'

export default function Appointments() {
  const [searchValue, setSearchValue] = useState('')
  const [searchParams] = useSearchParams()
  const [pagination, setPagination] = useState({
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    total: 0,
  })
  const [filteredAppointments, setFilteredAppointments] =
    useState<Appointment[]>()
  const { data: todayAppointmentsData } = useAppointmentsBySchedule('today', {
    page: 1,
    limit: 200,
  })
  const { data: upcomingAppointmentsData } = useAppointmentsBySchedule(
    'upcoming',
    { page: 1, limit: 200 }
  )

  const filterAppointments = (filter: string) => {
    if (filter === 'today') {
      setFilteredAppointments(todayAppointmentsData.data)
    }
    if (filter === 'upcoming') {
      setFilteredAppointments(upcomingAppointmentsData.data)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Appointment Management
          </h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  filterAppointments('search')
                }}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger onClick={() => filterAppointments('all')} value="all">
              All
            </TabsTrigger>
            <TabsTrigger
              onClick={() => filterAppointments('today')}
              value="today"
            >
              Today Schedules
            </TabsTrigger>
            <TabsTrigger
              onClick={() => filterAppointments('upcoming')}
              value="upcoming"
            >
              Upcoming Schedules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Directory</CardTitle>
                <CardDescription>
                  Complete list of all appointment with their details and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderAppointmentList
                  pagination={pagination}
                  setPagination={setPagination}
                  searchValue={searchValue}
                />
              </CardContent>
            </Card>

            {pagination.total > 0 && (
              <div className="flex justify-center mx-auto">
                <Pagination
                  currentPage={pagination.page}
                  perPage={pagination.limit}
                  total={pagination.total}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            <AppointmentList
              appointments={filteredAppointments}
              title={"Today's Appointments"}
            />
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <AppointmentList
              appointments={filteredAppointments}
              title={'Upcoming Appointments'}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
