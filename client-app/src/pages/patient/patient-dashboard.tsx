import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  Heart,
  MessageSquare,
  Pill,
  Plus,
  Thermometer,
} from 'lucide-react'
import { useCheckPatientProfile } from '../../hooks/fetch-patient'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import GoogleModal from '../../components/auth/google-modal'
import API from '../../lib/api'
import { useEffect, useState } from 'react'
import {
  formatPurposeText,
  formatTimeToAmPm,
  type Appointment,
  type SoapNote,
  type Vitals,
} from '../../lib/type'
import { formatDate } from '../../lib/utils'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '../../components/ui/skeleton'

const medications = [
  {
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    prescriber: 'Dr. Smith',
    refillsLeft: 3,
    nextRefill: '2024-02-15',
  },
  {
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    prescriber: 'Dr. Johnson',
    refillsLeft: 1,
    nextRefill: '2024-01-30',
  },
]
function PatientDashboard() {
  const navigate = useNavigate()
  const { user, loading: userLoading, error: userError } = useCheckPatientProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<{
    nextAppointment: Appointment
    lastVitals: Vitals
    lastSoapNote: SoapNote
    upcomingAppointments: Appointment[]
  } | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching patient dashboard stats...')
      const { data } = await API.get('/api/user/dashboard')
      console.log('Dashboard stats response:', data)
      setStats(data.data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch stats after user is loaded
    if (user && !userLoading) {
      fetchStats()
    }
  }, [user, userLoading])

  // Show loading state while user profile is being fetched
  if (userLoading) {
    return (
      <div className="px-4 mb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if there's an authentication error
  if (userError) {
    return (
      <div className="px-4 mb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-muted-foreground mb-4">{userError}</p>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Redirect if no user data (authentication failed)
  if (!userLoading && !user) {
    return (
      <div className="px-4 mb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please sign in to continue</p>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <GoogleModal />
      <div className="px-4 mb-12">
        <Card className="p-4 w-full mb-8 bg-background">
          <div className="flex justify-between items-center">
            <div className="space-y-2 flex items-center flex-row w-fit gap-2">
              <div className="h-12 w-12 dark:bg-black flex items-center justify-center rounded-full font-semibold border border-muted">
                {user?.image_url ? (
                  <img
                    src={user.image_url}
                    alt="Profile Image"
                    className="rounded-full object-cover"
                  />
                ) : (
                  <>
                    {user?.first_name.charAt(0)}
                    {user?.last_name.charAt(0)}
                  </>
                )}
              </div>
              <h1 className="text-sm font-semibold">
                Welcome back, {user?.first_name || 'Jane Doe'}{' '}
              </h1>
            </div>

            <div className="flex flex-col gap-1 font-semibold text-center text-xs">
              <h3>Clinic Open Hours:</h3>
              <p>Mon - Sat | 7:00am - 12:00am</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="dark:bg-[#bcc0f0]/20 dark:text-background/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Appointment
              </CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton>
                  <div className="p-6 w-2" />
                </Skeleton>
              ) : stats?.nextAppointment ? (
                <>
                  <div className="text-2xl font-bold">
                    {formatDate(
                      `${stats?.nextAppointment.schedule.appointment_date.substring(
                        0,
                        10
                      )}T${
                        stats?.nextAppointment?.schedule?.appointment_time
                      }:00.000Z`
                    )}
                  </div>
                  <p className="text-xs">
                    {formatTimeToAmPm(
                      stats?.nextAppointment?.schedule?.appointment_time
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">N/A</div>
                  <p className="text-xs">No record yet</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="dark:bg-[#bcc0f0]/20 dark:text-background/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton>
                    <div className="p-6 w-2" />
                  </Skeleton>
                ) : stats?.lastVitals?.temperature != null ? (
                  `${stats.lastVitals.temperature}°C`
                ) : (
                  'N/A'
                )}
              </div>
              <p className="text-xs">
                Last reading:{' '}
                {stats?.lastVitals?.created_at
                  ? formatDate(new Date(stats.lastVitals.created_at).toISOString())
                  : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-[#bcc0f0]/20 dark:text-background/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Blood Pressure
              </CardTitle>
              <Heart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton>
                    <div className="p-6 w-2" />
                  </Skeleton>
                ) : (
                  stats?.lastVitals?.blood_pressure || 'N/A'
                )}
              </div>
              <p className="text-xs">
                Last reading:{' '}
                {stats?.lastVitals?.created_at
                  ? formatDate(new Date(stats.lastVitals.created_at).toISOString())
                  : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-[#bcc0f0]/20 dark:text-background/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
              <Activity className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton>
                    <div className="p-6 w-2" />
                  </Skeleton>
                ) : (
                  stats?.lastVitals?.heart_rate || 'N/A'
                )}
              </div>
              <p className="text-xs">bpm</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled visits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.upcomingAppointments?.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border border-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">
                        {formatDate(appointment?.schedule?.appointment_date)} at{' '}
                        {formatTimeToAmPm(
                          appointment?.schedule?.appointment_time
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPurposeText(appointment?.purposes)}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      appointment.status === 'SUBMITTED'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))}
              <Button
                onClick={() => navigate('/appointments')}
                className="w-full bg-transparent"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest healthcare interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-muted-foreground">
                    Lab results available
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Complete Blood Count - Normal
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-muted-foreground">
                    Medication refill due
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Metformin - Due Jan 30
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium text-muted-foreground">
                    Message from Dr. Smith
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Follow-up on recent visit
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center my-8">
          <h2 className="text-2xl font-bold">Medications</h2>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Request Refill
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Medications</CardTitle>
            <CardDescription>Your active prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-muted rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Pill className="h-6 w-6 text-blue-500" />
                    <div>
                      <div className="font-medium">{medication.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {medication.dosage} - {medication.frequency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Prescribed by {medication.prescriber}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {medication.refillsLeft} refills left
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Next refill: {medication.nextRefill}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                    >
                      Request Refill
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* <section className="w-full bg-[#bcc0f0] py-6 px-8 space-y-8 text-background rounded-xl">
        <h2 className="flex justify-center gap-2 text-lg font-semibold">
          <Stethoscope />
          Recent Vitals
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:gap-8 place-items-center">
          <p className="flex gap-4 text-sm sm:text-base">
            <Activity />
            BP: 108/97
          </p>
          <p className="flex gap-4 text-sm sm:text-base">
            <HeartPulse fill="#E7E090" />
            Heart Rate: 80 BPM
          </p>
          <p className="flex gap-4 text-sm sm:text-base">
            <Dumbbell />
            Weight: 90kg
          </p>
          <p className="flex gap-4 text-sm sm:text-base">
            <ThermometerSun /> Temperature: 90 °F
          </p>
        </div>
      </section>
      <section className="w-full mt-16 space-y-16">
        <div className="w-full sm:max-w-lg rounded-2xl mx-auto bg-[#bcc0f0] py-12 flex items-center flex-col gap-6 text-background">
          <p className="flex gap-3">
            <Pill fill="#d05f5f" className="text-background" /> Active Meds
          </p>

          <p className="text-sm">Acetaminophen * 200mg * Twice daily</p>
        </div>

        <div className="flex justify-between gap-8 text-background text-xs font-medium">
          <div className="p-12 bg-[#bcc0f0] text-center ">
            <h4 className="flex gap-2 mb-2">
              <File size={16} /> Active Care
            </h4>
            <>Diet Plan</>
          </div>
          <div className="p-12 bg-[#bcc0f0] text-center ">
            <h4 className="flex gap-2 mb-2">
              <File size={16} className="text-" /> Active Care
            </h4>
            <>Treatment Plan</>
          </div>
        </div>
      </section> */}
      </div>
    </>
  )
}

export default PatientDashboard
