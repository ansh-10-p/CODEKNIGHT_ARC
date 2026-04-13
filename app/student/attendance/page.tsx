"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
  UserCheck,
  Calendar,
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react"

interface AttendanceRecord {
  _id: string
  date: string
  status: 'present' | 'absent' | 'late'
  subjectName: string
  timeSlot?: string
  remarks?: string
  createdAt: string
}

interface Classroom {
  _id: string
  title: string
  subject: string
  teacherName: string
}

interface Statistics {
  totalClasses: number
  presentCount: number
  lateCount: number
  absentCount: number
  attendancePercentage: number
}

// ── Mock data fallback ──────────────────────────────────────────────────────
const mockEnrollments = [
  { _id:"e1", classroomId:"mc1", classroom:{ _id:"mc1", title:"Data Structures & Algorithms", subject:"Computer Science", teacherName:"Prof. Priya Verma" } },
  { _id:"e2", classroomId:"mc2", classroom:{ _id:"mc2", title:"Database Management Systems", subject:"Computer Science", teacherName:"Prof. Rakesh Sharma" } },
  { _id:"e3", classroomId:"mc3", classroom:{ _id:"mc3", title:"Operating Systems", subject:"Computer Science", teacherName:"Dr. Anita Desai" } },
]

const mkDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString()

const mockAttendance: AttendanceRecord[] = [
  { _id:"a1",  date:mkDate(1),  status:"present", subjectName:"Data Structures & Algorithms", timeSlot:"09:00–10:30", remarks:"",          createdAt:mkDate(1)  },
  { _id:"a2",  date:mkDate(3),  status:"present", subjectName:"Database Management Systems",  timeSlot:"10:00–11:30", remarks:"",          createdAt:mkDate(3)  },
  { _id:"a3",  date:mkDate(4),  status:"late",    subjectName:"Data Structures & Algorithms", timeSlot:"09:00–10:30", remarks:"Bus delay", createdAt:mkDate(4)  },
  { _id:"a4",  date:mkDate(6),  status:"present", subjectName:"Data Structures & Algorithms", timeSlot:"09:00–10:30", remarks:"",          createdAt:mkDate(6)  },
  { _id:"a5",  date:mkDate(8),  status:"absent",  subjectName:"Database Management Systems",  timeSlot:"10:00–11:30", remarks:"Sick",      createdAt:mkDate(8)  },
  { _id:"a6",  date:mkDate(10), status:"present", subjectName:"Data Structures & Algorithms", timeSlot:"09:00–10:30", remarks:"",          createdAt:mkDate(10) },
  { _id:"a7",  date:mkDate(11), status:"present", subjectName:"Operating Systems",            timeSlot:"11:00–12:30", remarks:"",          createdAt:mkDate(11) },
  { _id:"a8",  date:mkDate(13), status:"present", subjectName:"Data Structures & Algorithms", timeSlot:"09:00–10:30", remarks:"",          createdAt:mkDate(13) },
  { _id:"a9",  date:mkDate(15), status:"absent",  subjectName:"Data Structures & Algorithms", timeSlot:"09:00–10:30", remarks:"",          createdAt:mkDate(15) },
  { _id:"a10", date:mkDate(17), status:"present", subjectName:"Operating Systems",            timeSlot:"11:00–12:30", remarks:"",          createdAt:mkDate(17) },
  { _id:"a11", date:mkDate(18), status:"present", subjectName:"Database Management Systems",  timeSlot:"10:00–11:30", remarks:"",          createdAt:mkDate(18) },
  { _id:"a12", date:mkDate(20), status:"late",    subjectName:"Data Structures & Algorithms", timeSlot:"09:00–10:30", remarks:"Traffic",   createdAt:mkDate(20) },
]

const mockStats: Statistics = {
  totalClasses: 12,
  presentCount: 8,
  lateCount: 2,
  absentCount: 2,
  attendancePercentage: 83,
}

export default function StudentAttendancePage() {
  const searchParams = useSearchParams()
  const classroomParam = searchParams.get('classroom')

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<string>(classroomParam || "")
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser')
      if (user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchAttendanceData(selectedClassroom)
    }
  }, [currentUser])

  const fetchAttendanceData = async (classroomId?: string) => {
    if (!currentUser) return

    setLoading(true)

    console.log("=== FRONTEND ATTENDANCE DEBUG ===");
    console.log("Current user:", currentUser._id || currentUser.id);
    console.log("Selected classroom:", classroomId);
    console.log("Start date:", startDate);
    console.log("End date:", endDate);
    console.log("Date filters applied:", !!(startDate || endDate));

    try {
      const params = new URLSearchParams({
        studentId: currentUser._id || currentUser.id,
      })

      if (classroomId) params.append('classroomId', classroomId)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      console.log("API URL:", `/api/student/attendance?${params}`);
      const response = await fetch(`/api/student/attendance?${params}`)

      if (response.ok) {
        const data = await response.json()
        console.log("API Response data:", data);
        console.log("Attendance records received:", data.attendanceRecords?.length || 0);
        console.log("Statistics:", data.statistics);
        console.log("=== END FRONTEND DEBUG ===");

        setAttendanceRecords(data.attendanceRecords?.length ? data.attendanceRecords : mockAttendance)
        setEnrollments(data.enrollments?.length ? data.enrollments : mockEnrollments)
        setStatistics(data.statistics || mockStats)
        setClassroom(data.classroom || null)
      } else {
        setAttendanceRecords(mockAttendance)
        setEnrollments(mockEnrollments)
        setStatistics(mockStats)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      setAttendanceRecords(mockAttendance)
      setEnrollments(mockEnrollments)
      setStatistics(mockStats)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  const handleClassroomChange = (classroomId: string) => {
    setSelectedClassroom(classroomId)
    fetchAttendanceData(classroomId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      case 'absent':
      default:
        return <XCircle className="h-4 w-4 text-red-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'late':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'absent':
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />

      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link href="/student/classroom">
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">My Attendance</h1>
                  <p className="text-zinc-400">View all your attendance records and statistics. Use date filters for specific periods.</p>
                </div>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-8">
          {initialLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
              <p className="text-zinc-400 mt-2">Loading...</p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm">Select Classroom</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedClassroom} onValueChange={handleClassroomChange}>
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                        <SelectValue placeholder="Choose a classroom" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {enrollments.map((enrollment) => (
                          <SelectItem key={enrollment.classroomId._id} value={enrollment.classroomId._id} className="text-white hover:bg-zinc-700">
                            {enrollment.classroomId.title} ({enrollment.classroomId.subject})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm">Start Date (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Filter from date"
                      className="bg-zinc-800/50 border-zinc-700 text-white"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Leave empty to show all records</p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm">End Date (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="Filter to date"
                      className="bg-zinc-800/50 border-zinc-700 text-white"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Leave empty to show all records</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filter Controls */}
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={() => fetchAttendanceData(selectedClassroom)}
                  disabled={loading}
                  className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {(startDate || endDate) ? 'Apply Filter' : 'Refresh'}
                </Button>
                {(startDate || endDate) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                      fetchAttendanceData(selectedClassroom)
                    }}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Clear Filter (Show All)
                  </Button>
                )}
              </div>

              {/* Statistics */}
              {statistics && selectedClassroom && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <Clock className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{statistics.totalClasses}</p>
                          <p className="text-zinc-400 text-sm">Total Classes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{statistics.presentCount}</p>
                          <p className="text-zinc-400 text-sm">Present</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                          <XCircle className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{statistics.absentCount}</p>
                          <p className="text-zinc-400 text-sm">Absent</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-[#e78a53]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{statistics.attendancePercentage}%</p>
                          <p className="text-zinc-400 text-sm">Attendance</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Attendance Records */}
              {!selectedClassroom ? (
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-12">
                    <div className="text-center">
                      <UserCheck className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Select a Classroom</h3>
                      <p className="text-zinc-400">
                        Choose a classroom from the dropdown above to view your attendance records.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : attendanceRecords.length === 0 ? (
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-12">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Attendance Records</h3>
                      <p className="text-zinc-400">
                        No attendance has been taken for this classroom yet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-[#e78a53]" />
                        Attendance Records - {classroom?.title}
                      </div>
                      <span className="text-sm font-normal text-zinc-400">
                        {(startDate || endDate) ?
                          `Filtered${startDate ? ` from ${startDate}` : ''}${endDate ? ` to ${endDate}` : ''}` :
                          'All Time'
                        }
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {attendanceRecords.map((record) => (
                        <div key={record._id} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-zinc-800/50 rounded-lg">
                              {getStatusIcon(record.status)}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{record.subjectName}</h4>
                              <p className="text-zinc-400 text-sm">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              {record.timeSlot && (
                                <p className="text-zinc-500 text-xs">Time: {record.timeSlot}</p>
                              )}
                              {record.remarks && (
                                <p className="text-zinc-500 text-xs italic mt-1">Note: {record.remarks}</p>
                              )}
                            </div>
                          </div>

                          <Badge className={getStatusColor(record.status)}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}