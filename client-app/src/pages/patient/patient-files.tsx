import {
  Activity,
  Download,
  Eye,
  FileText,
  Heart,
  TrendingUp,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { useEffect, useState } from 'react'
import API from '../../lib/api'
import type { Vital } from '../../features/vitals/types'
import type { SoapNote } from '../../features/soapNotes/types'

const labResults = [
  {
    test: 'Complete Blood Count',
    date: '2024-01-10',
    status: 'Normal',
    provider: 'Dr. Smith',
  },
  {
    test: 'Lipid Panel',
    date: '2024-01-10',
    status: 'Elevated',
    provider: 'Dr. Smith',
  },
  {
    test: 'HbA1c',
    date: '2023-12-15',
    status: 'Normal',
    provider: 'Dr. Johnson',
  },
]
const PatientFiles = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<{
    lastVitals: Vital
    lastSoapNote: SoapNote
  } | null>(null)

  const recentVisits = [
    {
      id: 1,
      date: '2024-01-10',
      provider: 'Dr. Smith',
      type: 'Consultation',
      diagnosis: 'Hypertension monitoring',
      status: 'completed',
    },
    {
      id: 2,
      date: '2023-12-15',
      provider: 'Dr. Wilson',
      type: 'Lab Results Review',
      diagnosis: 'Normal blood work',
      status: 'completed',
    },
  ]

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const { data } = await API.get('/api/user/dashboard')
      setStats(data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formattedDate = stats?.lastVitals?.created_at
    ? new Date(stats.lastVitals.created_at).toISOString().split('T')[0]
    : 'Unknown'

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Medical Records</h2>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download All Records
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vital Signs</CardTitle>
            <CardDescription>Latest measurements</CardDescription>
          </CardHeader>
          {stats?.lastVitals && (
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg border-muted">
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">Blood Pressure</div>
                    <div className="text-sm text-muted-foreground">
                      {formattedDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {stats?.lastVitals.blood_pressure}
                  </div>
                  <div className="text-sm text-muted-foreground">mmHg</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border border-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Heart Rate</div>
                    <div className="text-sm text-muted-foreground">
                      {formattedDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {stats?.lastVitals.heart_rate}
                  </div>
                  <div className="text-sm text-muted-foreground">bpm</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border border-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Weight</div>
                    <div className="text-sm text-muted-foreground">
                      {formattedDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{stats?.lastVitals.weight}</div>
                  <div className="text-sm text-muted-foreground">kg</div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
            <CardDescription>Visit summaries and diagnoses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="p-3 border border-muted rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{visit.type}</div>
                  <Badge variant="secondary">{visit.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {visit.date} with {visit.provider}
                </div>
                <div className="text-sm">{visit.diagnosis}</div>
                <Button variant="link" className="p-0 h-auto mt-2">
                  <Eye className="h-4 w-4 mr-1" />
                  View Full Record
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center space-y-10 mt-4">
        <h2 className="text-2xl font-bold mb-8">Lab Results</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Lab Results</CardTitle>
          <CardDescription>Your latest test results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {labResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg border-muted"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-green-500" />
                  <div>
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.date} - Ordered by {result.provider}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={
                      result.status === 'Normal' ? 'default' : 'destructive'
                    }
                  >
                    {result.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
export default PatientFiles
