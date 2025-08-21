import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import API from '../../lib/api'
import type { Appointment } from '../../lib/type'
import type { AppointmentSchedule } from './types'
import { useNavigate } from 'react-router-dom'

type PaginationType = {
  page: number
  limit: number
}

const useAppointmentsByPatient = (
  patientId: string | undefined,
  query?: PaginationType
) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<
    (Appointment & { schedule: AppointmentSchedule })[]
  >([])

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)

      if (!patientId) return navigate('/not-found')
      const { data } = await API.get(
        `/api/provider/appointments/patient/${patientId}?page=${query?.page}&limit=${query?.limit}`
      )

      if (!data?.success) {
        toast.error(data?.message || 'Failed to fetch appointments')
      }
      setAppointments(data?.data ?? [])
      setLoading(false)
    }
    fetchAppointments()
  }, [patientId])

  return { loading, appointments }
}

export { useAppointmentsByPatient }
