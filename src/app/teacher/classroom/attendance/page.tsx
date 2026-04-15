"use client"

import { useState, useEffect } from "react"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import {
    Calendar,
    Users,
    UserCheck,
    Clock,
    Save,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"

interface Student {
    _id: string
    studentId: string
    studentName: string
    studentEmail: string
    studentRollNumber: string
    enrolledAt: string
    attendance?: {
        _id: string
        status: string
        remarks: string
    } | null
}

interface Classroom {
    _id: string
    title: string
    subject: string
    inviteCode: string
    studentsCount: number
}

interface AttendanceRecord {
    studentId: string
    status: 'present' | 'absent' | 'late'
}

export default function TeacherAttendancePage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
    const [students, setStudents] = useState<Student[]>([])
    const [attendanceData, setAttendanceData] = useState<Map<string, string>>(new Map())
    const [subjectName, setSubjectName] = useState("")
    const [date, setDate] = useState("")
    const [remarks, setRemarks] = useState("")
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
            fetchClassrooms()
        }
    }, [currentUser])

    useEffect(() => {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0]
        setDate(today)
    }, [])

    const fetchClassrooms = async () => {
        try {
            const response = await fetch(`/api/classrooms?teacherId=${currentUser._id || currentUser.id}`)
            if (response.ok) {
                const data = await response.json()
                setClassrooms(data.classrooms || [])
            }
        } catch (error) {
            console.error('Error fetching classrooms:', error)
        } finally {
            setInitialLoading(false)
        }
    }

    const fetchStudentsAndAttendance = async (classroomId: string, selectedDate?: string) => {
        if (!classroomId || !currentUser) return

        setLoading(true)
        try {
            const dateParam = selectedDate || date
            const response = await fetch(
                `/api/teacher/attendance?teacherId=${currentUser._id || currentUser.id}&classroomId=${classroomId}&date=${dateParam}`
            )

            if (response.ok) {
                const data = await response.json()
                setStudents(data.students || [])

                // Initialize attendance data with existing records
                const newAttendanceData = new Map()
                data.students.forEach((student: Student) => {
                    if (student.attendance) {
                        newAttendanceData.set(student.studentId, student.attendance.status)
                    } else {
                        newAttendanceData.set(student.studentId, 'absent') // Default to absent
                    }
                })
                setAttendanceData(newAttendanceData)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch students data",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error fetching students:', error)
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleClassroomSelect = (classroomId: string) => {
        const classroom = classrooms.find(c => c._id === classroomId)
        if (classroom) {
            setSelectedClassroom(classroom)
            setSubjectName(classroom.subject) // Auto-set subject from classroom
            fetchStudentsAndAttendance(classroomId)
        }
    }

    const handleDateChange = (newDate: string) => {
        setDate(newDate)
        if (selectedClassroom) {
            fetchStudentsAndAttendance(selectedClassroom._id, newDate)
        }
    }

    const updateAttendance = (studentId: string, status: string) => {
        const newData = new Map(attendanceData)
        newData.set(studentId, status)
        setAttendanceData(newData)
    }

    const markAllPresent = () => {
        const newData = new Map()
        students.forEach(student => {
            newData.set(student.studentId, 'present')
        })
        setAttendanceData(newData)
    }

    const markAllAbsent = () => {
        const newData = new Map()
        students.forEach(student => {
            newData.set(student.studentId, 'absent')
        })
        setAttendanceData(newData)
    }

    const saveAttendance = async () => {
        if (!selectedClassroom || !subjectName || !date || attendanceData.size === 0) {
            toast({
                title: "Error",
                description: "Please select classroom, subject, date and mark attendance",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const attendanceRecords: AttendanceRecord[] = Array.from(attendanceData.entries()).map(([studentId, status]) => ({
                studentId,
                status: status as 'present' | 'absent' | 'late'
            }))

            const response = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teacherId: currentUser._id || currentUser.id,
                    classroomId: selectedClassroom._id,
                    subjectName,
                    date,
                    attendanceData: attendanceRecords,
                    remarks
                })
            })

            if (response.ok) {
                const data = await response.json()
                toast({
                    title: "Success",
                    description: `Attendance saved for ${data.savedRecords} students`,
                })

                // Refresh the data to show saved attendance
                fetchStudentsAndAttendance(selectedClassroom._id)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to save attendance",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
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

    const presentCount = Array.from(attendanceData.values()).filter(status => status === 'present').length
    const absentCount = Array.from(attendanceData.values()).filter(status => status === 'absent').length
    const lateCount = Array.from(attendanceData.values()).filter(status => status === 'late').length

    return (
        <div className="min-h-screen bg-black flex">
            <TeacherSidebar />

            <main className="flex-1 overflow-auto">
                <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
                    <div className="px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Link href="/teacher/classroom">
                                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Take Attendance</h1>
                                    <p className="text-zinc-400">Mark student attendance for your classrooms</p>
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
                            {/* Selection Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-white text-sm">Select Classroom</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Select value={selectedClassroom?._id || ""} onValueChange={handleClassroomSelect}>
                                            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                                <SelectValue placeholder="Choose classroom" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                                {classrooms.map((classroom) => (
                                                    <SelectItem key={classroom._id} value={classroom._id} className="text-white hover:bg-zinc-700">
                                                        {classroom.title} ({classroom.subject})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-white text-sm">Subject</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            value={subjectName}
                                            onChange={(e) => setSubjectName(e.target.value)}
                                            placeholder="Enter subject name"
                                            className="bg-zinc-800/50 border-zinc-700 text-white"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-white text-sm">Date</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            className="bg-zinc-800/50 border-zinc-700 text-white"
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {selectedClassroom && (
                                <>
                                    {/* Statistics */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        <Card className="bg-zinc-900/50 border-zinc-800">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-500/10 rounded-lg">
                                                        <Users className="h-6 w-6 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-white">{students.length}</p>
                                                        <p className="text-zinc-400 text-sm">Total Students</p>
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
                                                        <p className="text-2xl font-bold text-white">{presentCount}</p>
                                                        <p className="text-zinc-400 text-sm">Present</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-zinc-900/50 border-zinc-800">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                                                        <AlertCircle className="h-6 w-6 text-yellow-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-white">{lateCount}</p>
                                                        <p className="text-zinc-400 text-sm">Late</p>
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
                                                        <p className="text-2xl font-bold text-white">{absentCount}</p>
                                                        <p className="text-zinc-400 text-sm">Absent</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-4 mb-6">
                                        <Button
                                            onClick={markAllPresent}
                                            variant="outline"
                                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                                        >
                                            Mark All Present
                                        </Button>
                                        <Button
                                            onClick={markAllAbsent}
                                            variant="outline"
                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                        >
                                            Mark All Absent
                                        </Button>
                                    </div>

                                    {/* Students List */}
                                    <Card className="bg-zinc-900/50 border-zinc-800">
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <UserCheck className="h-5 w-5 text-[#e78a53]" />
                                                Student Attendance - {selectedClassroom.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {loading ? (
                                                <div className="text-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                                                    <p className="text-zinc-400 mt-2">Loading students...</p>
                                                </div>
                                            ) : students.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                                    <p className="text-zinc-400">No students enrolled in this classroom</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {students.map((student) => (
                                                        <div key={student.studentId} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                                    {getStatusIcon(attendanceData.get(student.studentId) || 'absent')}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-medium">{student.studentName}</h4>
                                                                    <p className="text-zinc-400 text-sm">{student.studentEmail}</p>
                                                                    {student.studentRollNumber && (
                                                                        <p className="text-zinc-500 text-xs">Roll: {student.studentRollNumber}</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Badge className={getStatusColor(attendanceData.get(student.studentId) || 'absent')}>
                                                                    {attendanceData.get(student.studentId) || 'absent'}
                                                                </Badge>

                                                                <div className="flex gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant={attendanceData.get(student.studentId) === 'present' ? 'default' : 'outline'}
                                                                        className={attendanceData.get(student.studentId) === 'present'
                                                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                                                            : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}
                                                                        onClick={() => updateAttendance(student.studentId, 'present')}
                                                                    >
                                                                        P
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant={attendanceData.get(student.studentId) === 'late' ? 'default' : 'outline'}
                                                                        className={attendanceData.get(student.studentId) === 'late'
                                                                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                                            : 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'}
                                                                        onClick={() => updateAttendance(student.studentId, 'late')}
                                                                    >
                                                                        L
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant={attendanceData.get(student.studentId) === 'absent' ? 'default' : 'outline'}
                                                                        className={attendanceData.get(student.studentId) === 'absent'
                                                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                                                            : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}
                                                                        onClick={() => updateAttendance(student.studentId, 'absent')}
                                                                    >
                                                                        A
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Remarks and Save */}
                                    {students.length > 0 && (
                                        <Card className="bg-zinc-900/50 border-zinc-800 mt-6">
                                            <CardContent className="p-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-white">Remarks (Optional)</Label>
                                                        <Textarea
                                                            value={remarks}
                                                            onChange={(e) => setRemarks(e.target.value)}
                                                            placeholder="Add any notes about today's attendance..."
                                                            className="mt-1 bg-zinc-800/50 border-zinc-700 text-white resize-none"
                                                            rows={3}
                                                        />
                                                    </div>

                                                    <Button
                                                        onClick={saveAttendance}
                                                        disabled={loading || !subjectName || !date}
                                                        className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                                    >
                                                        <Save className="h-4 w-4 mr-2" />
                                                        {loading ? 'Saving...' : 'Save Attendance'}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
