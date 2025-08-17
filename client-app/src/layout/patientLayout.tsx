import { useState, useEffect } from 'react'
import { Mode } from '../components/ui/mode'

import { Link } from 'react-router-dom'
import { PatientSidebar } from '../components/patient-sidebar'

import { SidebarTrigger } from '../components/ui/sidebar'
import { Button } from '../components/ui/button'
import { LogOut } from 'lucide-react'
import { usePatientProfile } from '../hooks/fetch-patient'

interface PageLayoutProps {
  children: React.ReactNode
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const { loading, user, logOut, error } = usePatientProfile()

  useEffect(() => {
    // If user is loaded and has a role_title, they are a provider, not a patient
    // So they should be redirected/logged out from patient pages
    if (!loading && user) {
      if (user.role_title) {
        console.log('Provider detected on patient page, logging out:', user.role_title)
        logOut()
      }
    }
  }, [user, loading, logOut])

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Show loading state while user is being fetched
  if (loading) {
    return (
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-2xl">⚠️</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  // Don't render anything if no user (will be redirected by the hook)
  if (!user) {
    return null
  }

  return (
    <div className="bg-background text-foreground min-h-screen overflow-y-auto ">
      <header className="w-full border-b bg-background/95 border-muted-foreground/20 fixed backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between h-20 px-4 sm:px-8 md:px-16 lg:px-24 items-center max-w-7xl mx-auto">
          <Link to={'/dashboard'}>
            <h2 className="text-2xl font-semibold">
              C<span className="text-pink-400">H</span>C
            </h2>
          </Link>

          <div className="flex gap-4 items-center">
            <Mode theme={theme} toggleTheme={toggleTheme} />

            <div className="h-12 w-12 dark:bg-black flex items-center justify-center rounded-full font-semibold border border-muted">
              {user?.image_url ? (
                <img
                  src={user.image_url}
                  alt=""
                  className="rounded-full object-contain"
                />
              ) : (
                <>
                  {user?.first_name.charAt(0)}
                  {user?.last_name.charAt(0)}
                </>
              )}
            </div>
            <Button size={'sm'} variant={'destructive'} onClick={logOut}>
              <LogOut />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <PatientSidebar>
        <main className="min-h-screen mt-24 2xl:mt-36 container px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
          <SidebarTrigger className="md:hidden" />
          {children}
        </main>
      </PatientSidebar>
    </div>
  )
}
