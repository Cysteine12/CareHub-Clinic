import {
  Activity,
  Droplet,
  Heart,
  LineChart,
  Ruler,
  Scale,
  Thermometer,
  Wind,
  FileText,
} from 'lucide-react'
import type { Vital } from '../types'

const VitalCard = ({ vital }: { vital: Vital }) => {
  const vitals = [
    {
      icon: <Thermometer className="size-12" />,
      key: 'Temperature',
      data: vital.temperature,
      unit: '°C',
    },
    {
      icon: <Heart className="size-12" />,
      key: 'Blood Pressure',
      data: vital.blood_pressure,
      unit: 'mmHg',
    },
    {
      icon: <Activity className="size-12" />,
      key: 'Heart Rate',
      data: vital.heart_rate,
      unit: 'bpm',
    },
    {
      icon: <Wind className="size-12" />,
      key: 'Respiratory Rate',
      data: vital.respiratory_rate,
      unit: '',
    },
    {
      icon: <Droplet className="size-12" />,
      key: 'Oxygen Saturation',
      data: vital.oxygen_saturation,
      unit: '%',
    },
    {
      icon: <Scale className="size-12" />,
      key: 'Weight',
      data: vital.weight,
      unit: 'kg',
    },
    {
      icon: <Ruler className="size-12" />,
      key: 'Height',
      data: vital.height,
      unit: 'ft',
    },
    {
      icon: <LineChart className="size-12" />,
      key: 'BMI',
      data: vital.bmi,
      unit: '',
    },
  ]

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {vitals.map((vital) => (
          <div
            key={vital.key}
            className="bg-muted rounded-lg p-4 hover:bg-muted-foreground cursor-pointer"
          >
            <div className="flex justify-between">
              <div>
                <div className="text-nowrap">{vital.key}</div>
                <div className="">
                  <span className="text-2xl font-bold">
                    {vital.data || 'N/A'}
                  </span>
                  <span className="text-sm">{vital.data && vital.unit}</span>
                </div>
              </div>
              <div className="">{vital.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted rounded-lg p-4 hover:bg-muted-foreground cursor-pointer">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Note
        </div>
        <div>{vital.others ? vital.others : 'None provided'}</div>
      </div>
    </>
  )
}
export default VitalCard
