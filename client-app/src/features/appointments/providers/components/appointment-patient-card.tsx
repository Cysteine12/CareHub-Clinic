import { Mail, MapPin, Phone, User } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card'
import type { Patient } from '../../../patients/types'
import { Badge } from '../../../../components/ui/badge'

const AppointmentPatientCard = ({
  patient,
}: {
  patient: Patient | undefined
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Full Name:</span>
              <span>
                {patient?.first_name} {patient?.last_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Date of Birth:</span>
              <span>
                {patient?.date_of_birth &&
                  new Date(patient?.date_of_birth).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Phone:</span>
              <span className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {patient?.phone}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {patient?.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Address:</span>
              <p className="text-sm text-muted-foreground flex ">
                <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                {patient?.address}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between space-y-2">
              <span className="text-sm font-medium">Insurance:</span>
              <span>{patient?.insurance_coverage}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Emergency Contact:</span>
              <p className="text-sm text-muted-foreground">
                {patient?.emergency_contact_name}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Gender:</span>
              <p className="text-sm text-muted-foreground">{patient?.gender}</p>
            </div>
            <div className="flex justify-between items-center space-y-2">
              <span className="text-sm font-medium">Blood Group:</span>
              <p className="text-sm text-muted-foreground">
                {patient?.blood_group}
              </p>
            </div>
            <div className="flex justify-between items-center space-y-2">
              <span className="text-sm font-medium">Allergies:</span>
              <p className="text-sm text-muted-foreground">
                {patient?.allergies.map((allergy) => (
                  <Badge variant={'destructive'} className="ml-1">
                    {allergy}
                  </Badge>
                ))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export default AppointmentPatientCard
