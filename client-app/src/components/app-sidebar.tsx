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
import { Badge } from './ui/badge'

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

  const providerMenuItems: MenuItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Patient Intake', url: '/patient-intake', icon: FileText },
    { title: 'Appointments', url: '/appointments', icon: Calendar },
    { title: 'Patients', url: '/patients', icon: Users },
    { title: 'Providers', url: '/list', icon: BarChart3 },
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
      ['Dashboard', 'Appointments', 'Insurance Check'].includes(item.title)
    )
  } else {
    menuItems = patientMenuItems
  }

  const basePath = userType ? '/provider' : ''

  return (
    <Sidebar className="bg-blue-950 border-muted">
      <SidebarHeader>
        <div className="px-2 py-4">
          <h2 className="text-lg font-semibold">CareHub Clinic</h2>
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {userType ? 'Provider Portal' : 'Patient Portal'}
            </p>
            {user?.role_title && (
              <Badge variant={'outline'}>{user?.role_title}</Badge>
            )}
          </div>
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
