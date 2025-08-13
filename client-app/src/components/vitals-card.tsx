import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export type VitalsCardProps = {
  blood_pressure?: string | undefined
  heart_rate?: string | undefined
  temperature?: string | undefined
  height?: string | undefined
  weight?: string | undefined
  respiratory_rate?: string | undefined
  oxygen_saturation?: string | undefined
  others?: string | undefined
  created_at?: string | undefined
  created_by_id?: string
  created_by?: {
    id: string
    first_name: string
    last_name: string
    role_title: string
  }
}

export const VitalsCard = ({
  blood_pressure,
  heart_rate,
  temperature,
  height,
  weight,
  others,
  created_at,
  created_by,
}: VitalsCardProps) => {
  return (
    <Card className="my-4 w-full flex-1">
      <CardHeader>
        <CardTitle>Vitals Summary</CardTitle>
        <div className="text-xs text-gray-400 mt-2">
          Recorded at:{' '}
          {created_at ? new Date(created_at).toLocaleString() : 'N/A'}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Recorded by:{' '}
          {created_by
            ? `${created_by.first_name} ${created_by.last_name}`
            : 'N/A'}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 w-full text-sm">
        <div className="flex  items-center gap-2">
          <span className="font-medium">Blood Pressure</span>{' '}
          <Badge variant="secondary">{blood_pressure || 'N/A'}</Badge>
        </div>
        <div className="flex  items-center gap-4">
          <span className="font-medium">Heart Rate</span>{' '}
          <Badge variant="secondary">
            {heart_rate ? `${heart_rate} bpm` : 'N/A'}
          </Badge>
        </div>
        <div className="flex  items-center gap-4">
          <span className="font-medium">Temperature:</span>{' '}
          <Badge variant="secondary">
            {temperature ? `${temperature} °F` : 'N/A'}
          </Badge>
        </div>
        <div className="flex  items-center gap-4">
          <span className="font-medium">Height</span>{' '}
          <Badge variant="secondary">
            {height ? `${height} inches` : 'N/A'}
          </Badge>
        </div>
        <div className="flex  items-center gap-4">
          <span className="font-medium">Weight</span>{' '}
          <Badge variant="secondary">{weight ? `${weight} kg` : 'N/A'}</Badge>
        </div>
        {/* <div className="flex  items-center gap-4">
          <span className="font-medium line-clamp-1">Respiratory Rate</span>{' '}
          <Badge variant="secondary">
            {respiratory_rate ? `${respiratory_rate}` : 'N/A'}
          </Badge>
        </div> */}
        {/* <div className="flex  items-center gap-4">
          <span className="font-medium">O2 Saturation</span>{' '}
          <Badge variant="secondary">
            {oxygen_saturation ? `${oxygen_saturation}%` : 'N/A'}
          </Badge>
        </div> */}
        <div className="flex  items-center gap-4">
          <span className="font-medium">Notes</span>{' '}
          <Badge variant="secondary">{others ? `${others}%` : 'N/A'}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
