import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  FileText,
  Stethoscope,
  TestTube,
  Heart,
  Pill,
  UserCheck,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  MessageSquare,
  Phone,
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store";

// Mock data for different staff roles
// const staffRoles = {
//   doctor: {
//     name: "Dr. Sarah Johnson",
//     role: "Primary Care Physician",
//     avatar: "/placeholder.svg?height=40&width=40",
//     department: "Internal Medicine",
//     license: "MD-12345",
//   },
//   nurse: {
//     name: "Jennifer Martinez",
//     role: "Registered Nurse",
//     avatar: "/placeholder.svg?height=40&width=40",
//     department: "Emergency Department",
//     license: "RN-67890",
//   },
//   labtech: {
//     name: "Michael Chen",
//     role: "Lab Technician",
//     avatar: "/placeholder.svg?height=40&width=40",
//     department: "Laboratory Services",
//     license: "MLT-54321",
//   },
// };

const providerRoleData = {
  ADMIN: {
    role_title: "ADMIN",
    department: "Administration",
    license: "ADM-00000",
  },
  GENERAL_PRACTIONER: {
    role_title: "GENERAL_PRACTIONER",
    department: "Primary Care",
    license: "GP-12345",
  },
  NURSE: {
    role_title: "NURSE",
    department: "Nursing",
    license: "RN-67890",
  },
  PHARMACIST: {
    role_title: "PHARMACIST",
    department: "Pharmacy",
    license: "PH-11122",
  },
  LAB_TECHNICIAN: {
    role_title: "LAB_TECHNICIAN",
    department: "Laboratory Services",
    license: "LT-54321",
  },
  PAEDIATRICIAN: {
    role_title: "PAEDIATRICIAN",
    department: "Pediatrics",
    license: "PD-33333",
  },
  GYNAECOLOGIST: {
    role_title: "GYNAECOLOGIST",
    department: "Obstetrics & Gynecology",
    license: "GYN-44444",
  },
  RECEPTIONIST: {
    role_title: "RECEPTIONIST",
    department: "Front Desk",
    license: "REC-55555",
  },
} as const;

export default function ProviderDashboard() {
  const user = useAuthStore((state) => state.user);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedRole, _setSelectedRole] = useState<
    keyof typeof providerRoleData
  >((user?.role_title as keyof typeof providerRoleData) || "NURSE");
  const currentStaff = providerRoleData[selectedRole];

  // Mock data that changes based on role
  const getDashboardData = () => {
    switch (selectedRole) {
      case "GENERAL_PRACTIONER":
        return {
          todayStats: {
            patients: 12,
            appointments: 15,
            consultations: 8,
            pending: 3,
          },
          urgentTasks: [
            {
              id: 1,
              type: "Lab Review",
              patient: "John Smith",
              priority: "high",
              time: "30 min ago",
            },
            {
              id: 2,
              type: "Prescription",
              patient: "Mary Johnson",
              priority: "medium",
              time: "1 hour ago",
            },
            {
              id: 3,
              type: "Follow-up",
              patient: "Robert Davis",
              priority: "low",
              time: "2 hours ago",
            },
          ],
          upcomingAppointments: [
            {
              time: "2:00 PM",
              patient: "Alice Brown",
              type: "Check-up",
              duration: "30 min",
            },
            {
              time: "2:30 PM",
              patient: "David Wilson",
              type: "Follow-up",
              duration: "15 min",
            },
            {
              time: "3:00 PM",
              patient: "Emma Davis",
              type: "Consultation",
              duration: "45 min",
            },
          ],
        };
      case "NURSE":
        return {
          todayStats: {
            patients: 24,
            vitals: 18,
            medications: 32,
            procedures: 6,
          },
          urgentTasks: [
            {
              id: 1,
              type: "Vital Signs",
              patient: "Lisa Anderson",
              priority: "high",
              time: "15 min ago",
            },
            {
              id: 2,
              type: "Medication",
              patient: "Tom Wilson",
              priority: "high",
              time: "20 min ago",
            },
            {
              id: 3,
              type: "Wound Care",
              patient: "Sarah Miller",
              priority: "medium",
              time: "45 min ago",
            },
          ],
          upcomingAppointments: [
            {
              time: "2:00 PM",
              patient: "Patient Room 101",
              type: "Medication Admin",
              duration: "15 min",
            },
            {
              time: "2:15 PM",
              patient: "Patient Room 103",
              type: "Vital Signs",
              duration: "10 min",
            },
            {
              time: "2:30 PM",
              patient: "Patient Room 105",
              type: "Wound Care",
              duration: "20 min",
            },
          ],
        };
      case "LAB_TECHNICIAN":
        return {
          todayStats: {
            samples: 45,
            completed: 32,
            pending: 13,
            urgent: 5,
          },
          urgentTasks: [
            {
              id: 1,
              type: "Blood Work",
              patient: "STAT - Room 201",
              priority: "high",
              time: "10 min ago",
            },
            {
              id: 2,
              type: "Urine Analysis",
              patient: "Emergency Dept",
              priority: "high",
              time: "25 min ago",
            },
            {
              id: 3,
              type: "Culture",
              patient: "ICU Patient",
              priority: "medium",
              time: "1 hour ago",
            },
          ],
          upcomingAppointments: [
            {
              time: "2:00 PM",
              patient: "Batch Processing",
              type: "Chemistry Panel",
              duration: "60 min",
            },
            {
              time: "3:00 PM",
              patient: "Quality Control",
              type: "Equipment Check",
              duration: "30 min",
            },
            {
              time: "4:00 PM",
              patient: "Sample Collection",
              type: "Outpatient Draw",
              duration: "45 min",
            },
          ],
        };
      default:
        return {
          todayStats: {
            patients: 0,
            appointments: 0,
            consultations: 0,
            pending: 0,
          },
          urgentTasks: [],
          upcomingAppointments: [],
        };
    }
  };

  const dashboardData = getDashboardData();

  const getStatsCards = () => {
    switch (selectedRole) {
      case "GENERAL_PRACTIONER":
        return [
          {
            title: "Today's Patients",
            value: dashboardData.todayStats.patients,
            icon: Users,
            change: "+2 from yesterday",
          },
          {
            title: "Appointments",
            value: dashboardData.todayStats.appointments,
            icon: Calendar,
            change: "3 remaining",
          },
          {
            title: "Consultations",
            value: dashboardData.todayStats.consultations,
            icon: Stethoscope,
            change: "4 completed",
          },
          {
            title: "Pending Reviews",
            value: dashboardData.todayStats.pending,
            icon: FileText,
            change: "Lab results",
          },
        ];
      case "NURSE":
        return [
          {
            title: "Patients Assigned",
            value: dashboardData.todayStats.patients,
            icon: Users,
            change: "6 new admits",
          },
          {
            title: "Vitals Recorded",
            value: dashboardData.todayStats.vitals,
            icon: Activity,
            change: "6 pending",
          },
          {
            title: "Medications Given",
            value: dashboardData.todayStats.medications,
            icon: Pill,
            change: "8 due soon",
          },
          {
            title: "Procedures",
            value: dashboardData.todayStats.procedures,
            icon: Heart,
            change: "2 scheduled",
          },
        ];
      case "LAB_TECHNICIAN":
        return [
          {
            title: "Samples Today",
            value: dashboardData.todayStats.samples,
            icon: TestTube,
            change: "12 new",
          },
          {
            title: "Completed Tests",
            value: dashboardData.todayStats.completed,
            icon: CheckCircle,
            change: "71% complete",
          },
          {
            title: "Pending Results",
            value: dashboardData.todayStats.pending,
            icon: Clock,
            change: "5 urgent",
          },
          {
            title: "STAT Orders",
            value: dashboardData.todayStats.urgent,
            icon: AlertTriangle,
            change: "2 critical",
          },
        ];
      default:
        return [];
    }
  };

  const statsCards = getStatsCards();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header>
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4"></div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              {/* <Avatar className="h-8 w-8">
                <AvatarImage src={currentStaff.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {currentStaff.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar> */}
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user?.first_name}</div>
                <div className="text-xs text-muted-foreground">
                  {currentStaff.role_title.replace('_', ' ')}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.first_name.split(" ")[0]}
            </h2>
            <p className="text-muted-foreground">
              {currentStaff.department} • {currentStaff.license}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {selectedRole === "GENERAL_PRACTIONER"
                ? "New Patient"
                : selectedRole === "NURSE"
                ? "New Task"
                : "New Sample"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">
              {selectedRole === "GENERAL_PRACTIONER"
                ? "Patients"
                : selectedRole === "NURSE"
                ? "Assignments"
                : "Samples"}
            </TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Urgent Tasks */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                    Urgent Tasks
                  </CardTitle>
                  <CardDescription>
                    Items requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.urgentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border border-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {task.priority}
                          </Badge>
                          <div>
                            <div className="font-medium">{task.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {task.patient}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {task.time}
                          </div>
                          <Button size="sm" variant="outline">
                            {selectedRole === "GENERAL_PRACTIONER"
                              ? "Review"
                              : selectedRole === "NURSE"
                              ? "Complete"
                              : "Process"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedRole === "GENERAL_PRACTIONER" && (
                    <>
                      <Button className="w-full justify-start">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        New Consultation
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Review Lab Results
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <Pill className="mr-2 h-4 w-4" />
                        Prescribe Medication
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Patient Call
                      </Button>
                    </>
                  )}

                  {selectedRole === "NURSE" && (
                    <>
                      <Button className="w-full justify-start">
                        <Activity className="mr-2 h-4 w-4" />
                        Record Vitals
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <Pill className="mr-2 h-4 w-4" />
                        Administer Medication
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Patient Assessment
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Wound Care
                      </Button>
                    </>
                  )}

                  {selectedRole === "LAB_TECHNICIAN" && (
                    <>
                      <Button className="w-full justify-start">
                        <TestTube className="mr-2 h-4 w-4" />
                        Process Sample
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Test
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Flag Critical Result
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Quality Control
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  Upcoming appointments and tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.upcomingAppointments.map(
                    (appointment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium w-20">
                            {appointment.time}
                          </div>
                          <div>
                            <div className="font-medium">
                              {appointment.patient}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {appointment.duration}
                          </Badge>
                          <Button size="sm" variant="outline">
                            {selectedRole === "GENERAL_PRACTIONER"
                              ? "Start"
                              : selectedRole === "NURSE"
                              ? "Begin"
                              : "Process"}
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedRole === "GENERAL_PRACTIONER"
                    ? "My Patients"
                    : selectedRole === "NURSE"
                    ? "Patient Assignments"
                    : "Sample Queue"}
                </CardTitle>
                <CardDescription>
                  {selectedRole === "GENERAL_PRACTIONER"
                    ? "Patients under your care"
                    : selectedRole === "NURSE"
                    ? "Patients assigned to you today"
                    : "Samples awaiting processing"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder={`Search ${
                        selectedRole === "GENERAL_PRACTIONER"
                          ? "patients"
                          : selectedRole === "NURSE"
                          ? "assignments"
                          : "samples"
                      }...`}
                      className="pl-8 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedRole === "GENERAL_PRACTIONER" &&
                    [
                      {
                        name: "John Smith",
                        age: 45,
                        condition: "Hypertension",
                        lastVisit: "2 days ago",
                        status: "stable",
                      },
                      {
                        name: "Mary Johnson",
                        age: 32,
                        condition: "Diabetes",
                        lastVisit: "1 week ago",
                        status: "monitoring",
                      },
                      {
                        name: "Robert Davis",
                        age: 67,
                        condition: "Heart Disease",
                        lastVisit: "3 days ago",
                        status: "critical",
                      },
                    ].map((patient, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {/* <Avatar>
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar> */}
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Age {patient.age} • {patient.condition}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last visit: {patient.lastVisit}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              patient.status === "critical"
                                ? "destructive"
                                : patient.status === "monitoring"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {patient.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            View Chart
                          </Button>
                        </div>
                      </div>
                    ))}

                  {selectedRole === "NURSE" &&
                    [
                      {
                        room: "101",
                        name: "Alice Brown",
                        condition: "Post-op",
                        priority: "high",
                        tasks: 3,
                      },
                      {
                        room: "103",
                        name: "David Wilson",
                        condition: "Pneumonia",
                        priority: "medium",
                        tasks: 2,
                      },
                      {
                        room: "105",
                        name: "Emma Davis",
                        condition: "Recovery",
                        priority: "low",
                        tasks: 1,
                      },
                    ].map((assignment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-bold text-lg">Room</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {assignment.room}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{assignment.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {assignment.condition}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {assignment.tasks} pending tasks
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              assignment.priority === "high"
                                ? "destructive"
                                : assignment.priority === "medium"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {assignment.priority}
                          </Badge>
                          <Button size="sm" variant="outline">
                            View Tasks
                          </Button>
                        </div>
                      </div>
                    ))}

                  {selectedRole === "LAB_TECHNICIAN" &&
                    [
                      {
                        id: "LAB001",
                        type: "Blood Chemistry",
                        patient: "Room 201",
                        priority: "STAT",
                        received: "10 min ago",
                      },
                      {
                        id: "LAB002",
                        type: "Urinalysis",
                        patient: "Outpatient",
                        priority: "Routine",
                        received: "30 min ago",
                      },
                      {
                        id: "LAB003",
                        type: "Culture",
                        patient: "ICU",
                        priority: "Urgent",
                        received: "1 hour ago",
                      },
                    ].map((sample, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-bold text-sm">Sample</div>
                            <div className="text-lg font-bold text-green-600">
                              {sample.id}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{sample.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {sample.patient}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Received: {sample.received}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              sample.priority === "STAT"
                                ? "destructive"
                                : sample.priority === "Urgent"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {sample.priority}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Process
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Your schedule for this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4" />
                  <p>Schedule view coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  Track and manage your daily tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                  <p>Task management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>
                  Performance metrics and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>Reports section coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
