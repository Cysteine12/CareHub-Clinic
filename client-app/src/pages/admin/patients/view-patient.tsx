import {
  Calendar,
  CheckCircle,
  ListChecks,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  User,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Skeleton } from '../../../components/ui/skeleton'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProfilePhoto from '../../../components/profile-photo'
import { usePatient } from '../../../features/patients/hook'
import type { Patient } from '../../../features/patients/types'
import { useAppointmentsByPatient } from '../../../features/appointments/hooks'
import { formatDate } from '../../../lib/utils'
import { formatPurposeText } from '../../../lib/type'
import { getBadgeVariant } from '../../../features/appointments/util'

const ViewPatient = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: patientData, isLoading } = usePatient(id)
  const { appointments } = useAppointmentsByPatient(id, { page: 1, limit: 3 })

  const patient: Patient = patientData?.data

  if (isLoading) {
    return (
      <>
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
              <div>
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-3 w-64 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const handleDelete = () => {}

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Patient Information</h2>
        <Button
          onClick={() => navigate(`/provider/patients/${patient?.id}/edit`)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Card className="my-2">
            <div className="md:grid md:grid-cols-2">
              <ProfilePhoto
                photo={patient?.image_url}
                patientId={patient?.id}
              />
              <div>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Full Name</div>
                      <div className="text-sm text-muted-foreground">
                        {patient?.first_name} {patient?.last_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">
                        {patient?.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-sm text-muted-foreground">
                        {patient?.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-sm text-muted-foreground">
                        {patient?.address}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>

          <Card className="my-2">
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium">Date of Birth</div>
                <div className="text-sm text-muted-foreground">
                  {patient?.date_of_birth
                    ? new Date(patient.date_of_birth).toLocaleDateString(
                        'en-GB',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )
                    : null}
                </div>
              </div>
              <div>
                <div className="font-medium">Blood Type</div>
                <div className="text-sm text-muted-foreground">
                  {patient?.blood_group}
                </div>
              </div>
              <div>
                <div className="font-medium">Allergies</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient?.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium">Emergency Contact</div>
                <div className="text-sm text-muted-foreground">
                  {patient?.emergency_contact_name}{' '}
                </div>
                <div className="text-sm text-muted-foreground">
                  {patient?.emergency_contact_phone}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4">
          {/* Quick Actions */}
          <Card className="my-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link to="/provider/appointments">
                  <ListChecks className="mr-2 h-4 w-4" />
                  View Appointments
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link to={`/provider/appointments/new/${patient?.id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  New Appointment
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link
                  to={`/provider/insurance-check?patient_id=${patient?.id}`}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check Insurance
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="my-2">
            <CardHeader>
              <CardTitle>Upcoming Schedules</CardTitle>
              <CardDescription>Recent appointments and visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length < 1 && (
                  <div className="text-center text-sm text-muted-foreground">
                    No records yet
                  </div>
                )}
                {appointments?.map((appointment) => (
                  <Button
                    variant={'ghost'}
                    onClick={() =>
                      navigate(`/provider/appointments/${appointment?.id}`)
                    }
                    key={appointment?.id}
                    className="w-full flex items-center justify-between border rounded-lg text-wrap h-auto"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">
                        {appointment?.schedule?.time}{' '}
                        {formatDate(appointment?.schedule?.date)}
                      </div>
                      <div>
                        {/* <div className="font-medium">{patient.first_name}</div> */}
                        <div className="text-sm text-muted-foreground">
                          {`${
                            appointment?.purposes?.includes('OTHERS')
                              ? appointment?.other_purpose
                              : formatPurposeText(appointment?.purposes)
                          }`.slice(0, 12)}
                          ..
                        </div>
                      </div>
                    </div>
                    <Badge variant={getBadgeVariant(appointment?.status)}>
                      {appointment?.status}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          className="w-fit 2xl:w-1/5"
          size={'sm'}
          variant={'destructive'}
          onClick={handleDelete}
        >
          <LogOut />
          Delete Patient
        </Button>
      </div>
    </>
  )
}
export default ViewPatient
