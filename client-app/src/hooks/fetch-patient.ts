import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../store/auth-store'
import API from '../lib/api'

export const useCheckPatientProfile = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const firstLoad = useRef(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(false) // already has user
        return
      }

      try {
        console.log('Fetching patient profile...')
        const { data, status } = await API.get('/api/auth/patient/profile')

        if (!data?.success) {
          const errorMsg = 'Failed to load profile. Please sign in.'
          setError(errorMsg)
          
          if (status === 401) {
            console.log('Authentication failed, redirecting to login')
            toast.error('Session expired. Please sign in.')
            navigate('/login')
          } else {
            console.log('Profile fetch failed:', data)
            if (!firstLoad.current) {
              toast.error(errorMsg)
              navigate('/login')
            }
          }
          return
        }

        console.log('Patient profile loaded:', data.data)
        setUser(data.data)
        setError(null)
      } catch (error) {
        console.error('Error fetching patient profile:', error)
        const message = error instanceof Error ? error.message : 'Session expired. Please sign in.'
        setError(message)
        
        if (!firstLoad.current) {
          toast.error(message)
          navigate('/login')
        } else {
          // Even on first load, navigate if it's clearly an auth error
          toast.error('Please sign in to continue')
          navigate('/login')
        }
      } finally {
        setLoading(false)
        firstLoad.current = false // mark first attempt as done
      }
    }

    fetchProfile()
  }, [user, setUser, navigate])

  return { user, loading, error }
}

export const usePatientProfile = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching patient profile with usePatientProfile...')
        const { data } = await API.get('/api/auth/patient/profile')

        if (!data || !data.success) {
          const errorMsg = 'Session expired. Please sign in.'
          setError(errorMsg)
          toast.error(errorMsg)
          navigate('/login')
          return
        }

        console.log('Patient profile loaded successfully:', data.data)
        setUser(data.data)
        setError(null)
      } catch (error) {
        console.error('Error in usePatientProfile:', error)
        const message = error instanceof Error ? error.message : 'Session expired. Please sign in.'
        setError(message)
        toast.error(message)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate, setUser])

  const logOut = async () => {
    try {
      const { data } = await API.post('/api/auth/logout')

      if (!data?.success) throw new Error('Logout failed')

      logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  return { user, loading, logOut, error }
}
