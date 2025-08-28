import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import { PageLayout } from './layout/patientLayout'
import SignUpPage from './pages/signup'
import ChangePassword from './pages/change-password'
import { useAuthStore } from './store/auth-store'
import ProviderForgotPassword from './pages/provider/forgot-password-provider'
import PatientForgotPassword from './pages/patient/forgot-password-patient'
import PatientSignIn from './pages/patient/patient-sign-in'
import ProviderSignIn from './pages/provider/provider-sign-in'
import { Toaster } from 'sonner'
import PatientAppointments from './pages/patient/appointments/all-appointments'
import PatientViewAppointment from './pages/patient/appointments/view-appointment'
import PatientEditAppointment from './pages/patient/appointments/edit-appointment'
import PatientProfile from './pages/patient/patient-profile'
import PatientFiles from './pages/patient/patient-files'
import { ProviderLayout } from './layout/providerLayout'
import { useEffect } from 'react'
import ProviderAppointments from './pages/admin/appointments/all-appointments'
import ViewAppointment from './pages/admin/appointments/view-appointment'
import CreateAppointment from './pages/admin/appointments/create-appointment'
import InsuranceCheck from './pages/admin/insurance-check'
import AllPatients from './pages/admin/patients/all-patients'
import MobileOutreach from './pages/admin/mobile-outreach'
import Reminders from './pages/admin/reminders'
import Billings from './pages/patient/billings'
import Settings from './pages/Settings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CreatePatient from './pages/admin/patients/create-patient'
import ViewPatient from './pages/admin/patients/view-patient'
import EditPatient from './pages/admin/patients/edit-patient'
import OTPVerification from './components/auth/otp-verification'
import PatientEditProfile from './pages/patient/patient-edit-profile'
import AllProviders from './pages/admin/providers/all-providers'
import CreateProvider from './pages/admin/providers/create-provider'
import EditProvider from './pages/admin/providers/edit-provider'
import About from './pages/About'
import { teamArray } from './pages/about/about-data'

const queryClient = new QueryClient()

// Protected Route Component
export const ProtectedLayout = () => {
  const user = useAuthStore((state) => state.user)
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const initializeUser = useAuthStore((state) => state.initializeUser)

  useEffect(() => {
    if (!isInitialized) {
      initializeUser()
    }
  }, [isInitialized, initializeUser])

  if (!isInitialized) {
    return <div className="p-8 text-center">Loading...</div>
  }
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }
  // Dynamically choose layout based on user role
  const Layout = user.role_title ? ProviderLayout : PageLayout
  // If user is not authenticated, redirect to /signin
  // if (!user) {
  //   return <Navigate to="/auth/patient/login" replace />;
  // }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster richColors />
        <Routes>
          {/* ✅ Public Routes */}
          <Route index path="/" element={<Home />} />
          <Route index path="/about" element={<About team={teamArray} />} />

          {/* Patient Auth */}
          <Route path="/login" element={<PatientSignIn />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<PatientForgotPassword />} />

          {/* Provider Auth */}
          <Route path="/login" element={<ProviderSignIn />} />
          <Route path="/forgot-password" element={<ProviderForgotPassword />} />

          {/* Common Public Route */}
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/verify-account" element={<OTPVerification />} />

          {/* ✅ Protected Routes - all use ProtectedRoute + PageLayout */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<PatientProfile />} />
            <Route path="/profile/edit" element={<PatientEditProfile />} />
            <Route path="/files" element={<PatientFiles />} />
            <Route path="/billings" element={<Billings />} />
            <Route path="/appointments" element={<PatientAppointments />} />
            <Route
              path="/appointments/:id"
              element={<PatientViewAppointment />}
            />
            <Route
              path="/appointments/:id/edit"
              element={<PatientEditAppointment />}
            />

            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/provider/dashboard" element={<Dashboard />} />
            <Route
              path="/provider/appointments"
              element={<ProviderAppointments />}
            />
            <Route
              path="/provider/appointments/:id"
              element={<ViewAppointment />}
            />
            <Route
              path="/provider/appointments/new/:id"
              element={<CreateAppointment />}
            />

            <Route
              path="/provider/insurance-check"
              element={<InsuranceCheck />}
            />
            <Route path="/provider/insurance" element={<InsuranceCheck />} />
            <Route
              path="/provider/patient-intake"
              element={<CreatePatient />}
            />
            <Route path="/provider/list" element={<AllProviders />} />
            <Route path="/provider/new" element={<CreateProvider />} />
            <Route path="/provider/:id/edit" element={<EditProvider />} />
            <Route path="/provider/patients" element={<AllPatients />} />
            <Route path="/provider/patients/:id" element={<ViewPatient />} />
            <Route
              path="/provider/patients/:id/edit"
              element={<EditPatient />}
            />
            <Route path="/provider/outreach" element={<MobileOutreach />} />
            <Route path="/provider/reminders" element={<Reminders />} />
          </Route>
          {/* ❌ Catch-all (404) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
