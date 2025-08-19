import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../store/auth-store'
import API from '../lib/api'

export const useProviderProfile = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/api/auth/provider/profile')

        if (!data || !data.success) {
          toast.error('Session expired. Please sign in.')
          navigate('/login')
          return
        }

        setUser(data.data)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Session expired. Please sign in.'
        toast.error(message)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const logOut = async () => {
    try {
      const { data } = await API.post(
        `/api/auth/${user?.role_title ? 'provider' : 'patient'}/logout`
      )

      if (!data || !data.success) return toast.error('Logout attempt failed')

      logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  return { user, loading, logOut }
}
