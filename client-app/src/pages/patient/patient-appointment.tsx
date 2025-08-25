import { Search, ArrowLeft, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert } from '../../components/ui/alert'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PatientAppointmentForm from '../../features/appointments/components/patient-appointment-form'
import { useAppointments } from '../../features/appointments/patients/hook'
import { PatientAppointmentList } from '../../features/appointments/components/patient-appointment-list'

export default function PatientAppointments() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [pagination, setPagination] = useState({
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    total: 0,
  })
  const { data: appointmentsData, isLoading } = useAppointments(pagination)

  useEffect(() => {
    if (searchParams.get('tab')) {
      setTab(searchParams.get('tab') || 'all')
    }
  }, [])

  useEffect(() => {
    if (appointmentsData) {
      setPagination({ ...pagination, total: appointmentsData?.total })
    }
  }, [appointmentsData?.total])

  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1
    setPagination((prevPagination) => ({ ...prevPagination, page }))
  }, [searchParams.get('page')])

  const AppointmentListSkeleton = () => (
    <div className="grid gap-6">
      {[1, 2].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-muted rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className=""
        >
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>

        <Search className="w-6 h-6" />
      </div>

      <TabsList className="mb-4 border-background">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="form" className="ml-auto">
          Schedule Appointment
        </TabsTrigger>
      </TabsList>

      {/* Tab content below */}
      <TabsContent value="all">
        {isLoading ? (
          <AppointmentListSkeleton />
        ) : (
          <PatientAppointmentList
            appointments={appointmentsData?.data}
            pagination={pagination}
          />
        )}
      </TabsContent>

      <TabsContent value="form">
        <Card className="max-w-4xl mx-auto">
          <PatientAppointmentForm onCompleteSubmit={() => setTab('all')} />
        </Card>
        <Alert
          variant="destructive"
          className="text-sm text-yellow-800 bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded-md flex gap-2 items-center max-w-lg w-full mx-auto mt-8"
        >
          <AlertCircle className="size-4" />
          <p>
            Appointments are subject to review by a healthcare administrator.
            You will be notified once it is confirmed.
          </p>
        </Alert>
      </TabsContent>
    </Tabs>
  )
}
