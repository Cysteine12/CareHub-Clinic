import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Phone,
  MapPin,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  formatPurposeText,
  formatTimeToAmPm,
  type Appointment,
} from '../../lib/type'
import API from '../../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    todayAppointments: Appointment[]
    totalActivePatientsInLastMonth: number
  } | null>(null)
  const [waitTime, setWaitTime] = useState<number | null>(null)
  const [noShowRate, setNoShowRate] = useState<number | null>(null)

  const fetchStats = async () => {
    const { data } = await API.get('/api/user/dashboard')
    setStats(data.data)
  }
  const fetchWaitTime = async () => {
    const { data } = await API.get('/api/provider/appointment/waittime')
    setWaitTime(data.data)
  }
  const fetchNoShowRate = async () => {
    const { data } = await API.get('/api/provider/appointment/no-show-rates')
    setNoShowRate(data.data)
  }

  const todayAppointments = stats?.todayAppointments?.slice(0, 4)

  useEffect(() => {
    fetchStats()
    fetchWaitTime()
    fetchNoShowRate()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link to="/provider/patient-intake">New Patient</Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.todayAppointments?.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Patients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalActivePatientsInLastMonth}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Wait Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waitTime || '--'} min</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                No-Show Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{noShowRate || '--'}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Today's Schedule */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                Upcoming appointments and patient visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments?.map((appointment) => (
                <div
                  key={appointment?.id}
                  className="flex items-center justify-between p-3 border border-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">
                      {formatTimeToAmPm(appointment?.schedule?.time)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {appointment?.patient?.first_name}{' '}
                        {appointment?.patient?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPurposeText(appointment?.purposes)}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      appointment?.status === 'SCHEDULED'
                        ? 'default'
                        : appointment?.status === 'SUBMITTED'
                        ? 'secondary'
                        : appointment?.status === 'CANCELLED'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {appointment?.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link to="/provider/patient-intake">
                  <Users className="mr-2 h-4 w-4" />
                  New Patient Intake
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link to="/provider/appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link to="/provider/insurance-check">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check Insurance
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link to="/reminders">
                  <Phone className="mr-2 h-4 w-4" />
                  Send Reminders
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link to="/outreach">
                  <MapPin className="mr-2 h-4 w-4" />
                  Mobile Outreach
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <div className="font-medium text-muted-foreground">
                    Flu vaccine inventory low
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Only 15 doses remaining
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Reorder
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <div className="font-medium text-muted-foreground">
                    Mobile outreach event tomorrow
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Community Center - 9:00 AM
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
