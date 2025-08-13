import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Smartphone,
  Home,
  Settings,
  Bell,
  CreditCard,
  CalendarDays,
  User2,
  ReceiptText,
  FileArchive,
  Activity,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth-store' // adjust path as needed
import { cn } from '../lib/utils'

type MenuItem = {
  title: string
  url: string
  icon: React.ElementType
}

const patientMenuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Appointments', url: '/appointments', icon: CalendarDays },
  { title: 'Profile', url: '/profile', icon: User2 },
  { title: 'Billings', url: '/billings', icon: ReceiptText },
  { title: 'Records', url: '/files', icon: FileArchive },
]

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const userType = user?.role_title
  const pathname = window.location.href
  const active = (url: string) => pathname.includes(url)

  const basePath = userType ? '/provider' : ''

  const providerMenuItems: MenuItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Patient Intake', url: '/intake', icon: FileText },
    { title: 'Appointments', url: '/appointments', icon: Calendar },
    { title: 'Patients', url: '/patients', icon: Users },
    {
      title: 'Provider Dashboard',
      url: '/providers-dashboard',
      icon: BarChart3,
    },
    { title: 'Vitals & SOAP', url: '/vitals', icon: Activity },
    { title: 'Mobile Outreach', url: '/outreach', icon: Smartphone },
    { title: 'Insurance Check', url: '/insurance', icon: CreditCard },
    { title: 'Reminders', url: '/reminders', icon: Bell },
  ]

  const fullAccessRoles = ['ADMIN', 'RECEPTIONIST']
  const limitedAccessRoles = [
    'LAB TECHNICIAN',
    'PHARMACIST',
    'NURSE',
    'GYNEACOLOGIST',
    'PAEDIATRICIAN',
  ]

  let menuItems

  if (fullAccessRoles.includes(user?.role_title || '')) {
    menuItems = providerMenuItems
  } else if (limitedAccessRoles.includes(user?.role_title || '')) {
    menuItems = providerMenuItems.filter((item) =>
      [
        'Dashboard',
        'Appointments',
        'Insurance Check',
        'Vitals & SOAP',
      ].includes(item.title)
    )
  } else {
    menuItems = patientMenuItems
  }

  return (
    <Sidebar className="bg-blue-950 border-muted">
      <SidebarHeader>
        <div className="px-2 py-4">
          <h2 className="text-lg font-semibold">Community Health Clinic</h2>
          <p className="text-sm text-muted-foreground">
            {userType ? 'Provider Portal' : 'Patient Portal'}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      active(item.url) && 'bg-blue-800 text-white '
                    )}
                  >
                    <Link to={`${basePath}${item.url}`}>
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to={`${basePath}/settings`}>
                <Settings className="mr-2 h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
