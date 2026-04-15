"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
    Calendar,
    Clock,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Coffee,
    MapPin
} from "lucide-react"

interface ScheduleEntry {
    timeSlot: string
    type: 'class' | 'break' | 'lunch'
    subject: string
    room: string
    notes: string
}

interface ScheduleData {
    Monday: ScheduleEntry[]
    Tuesday: ScheduleEntry[]
    Wednesday: ScheduleEntry[]
    Thursday: ScheduleEntry[]
    Friday: ScheduleEntry[]
    Saturday: ScheduleEntry[]
    Sunday: ScheduleEntry[]
}

interface Schedule {
    _id: string
    weekStartDate: string
    weeklyData: ScheduleData
    classroomId: {
        _id: string
        title: string
        subject: string
        teacherName: string
    }
}

interface Classroom {
    _id: string
    title: string
    subject: string
    teacherName: string
}

const mockScheduleData: ScheduleData = {
    Monday: [
        { timeSlot: "09:00-10:00", type: "class", subject: "Data Structures", room: "Room 301", notes: "Prof. Priya Verma" },
        { timeSlot: "10:00-11:00", type: "class", subject: "Data Structures", room: "Room 301", notes: "Prof. Priya Verma (contd.)" },
        { timeSlot: "11:00-12:00", type: "class", subject: "Mathematics", room: "Room 202", notes: "Prof. Amit Sharma" },
        { timeSlot: "12:00-13:00", type: "lunch", subject: "Lunch Break", room: "", notes: "" },
    ],
    Tuesday: [
        { timeSlot: "09:00-10:00", type: "class", subject: "Data Structures", room: "Room 301", notes: "Prof. Priya Verma" },
        { timeSlot: "10:00-11:00", type: "class", subject: "Data Structures", room: "Room 301", notes: "Prof. Priya Verma (contd.)" },
        { timeSlot: "12:00-13:00", type: "lunch", subject: "Lunch Break", room: "", notes: "" },
        { timeSlot: "14:00-15:00", type: "class", subject: "DBMS", room: "Room 305", notes: "Prof. Rakesh Sharma" },
        { timeSlot: "15:00-16:00", type: "class", subject: "DBMS", room: "Room 305", notes: "Prof. Rakesh Sharma (contd.)" },
    ],
    Wednesday: [
        { timeSlot: "09:00-10:00", type: "class", subject: "Operating Systems", room: "Room 401", notes: "Dr. Anita Desai" },
        { timeSlot: "10:00-11:00", type: "class", subject: "Operating Systems", room: "Room 401", notes: "Dr. Anita Desai (contd.)" },
        { timeSlot: "11:00-12:00", type: "class", subject: "Data Structures Lab", room: "Lab 3", notes: "Prof. Priya Verma" },
        { timeSlot: "12:00-13:00", type: "class", subject: "Data Structures Lab", room: "Lab 3", notes: "Prof. Priya Verma (contd.)" },
    ],
    Thursday: [
        { timeSlot: "09:00-10:00", type: "class", subject: "DBMS", room: "Room 305", notes: "Prof. Rakesh Sharma" },
        { timeSlot: "10:00-11:00", type: "class", subject: "DBMS", room: "Room 305", notes: "Prof. Rakesh Sharma (contd.)" },
        { timeSlot: "12:00-13:00", type: "lunch", subject: "Lunch Break", room: "", notes: "" },
        { timeSlot: "14:00-15:00", type: "class", subject: "Computer Networks", room: "Room 302", notes: "Prof. Srinivas Rao" },
        { timeSlot: "15:00-16:00", type: "class", subject: "Computer Networks", room: "Room 302", notes: "Prof. Srinivas Rao (contd.)" },
    ],
    Friday: [
        { timeSlot: "09:00-10:00", type: "class", subject: "Data Structures", room: "Room 301", notes: "Prof. Priya Verma" },
        { timeSlot: "10:00-11:00", type: "class", subject: "Data Structures", room: "Room 301", notes: "Prof. Priya Verma (contd.)" },
        { timeSlot: "11:00-12:00", type: "class", subject: "Operating Systems Lab", room: "Lab 2", notes: "Dr. Anita Desai" },
        { timeSlot: "12:00-13:00", type: "class", subject: "Operating Systems Lab", room: "Lab 2", notes: "Dr. Anita Desai (contd.)" },
    ],
    Saturday: [],
    Sunday: [],
}

const mockSchedule: Schedule = {
    _id: "mock-schedule",
    weekStartDate: new Date().toISOString().split('T')[0],
    weeklyData: mockScheduleData,
    classroomId: {
        _id: "mock-classroom",
        title: "CS-301 (Rohit Sharma)",
        subject: "Computer Science",
        teacherName: "Prof. Priya Verma",
    },
}

const mockEnrollments = [
    {
        classroomId: {
            _id: "mock-classroom",
            title: "CS-301 (Rohit Sharma)",
            subject: "Computer Science",
            teacherName: "Prof. Priya Verma",
        },
    },
]

export default function StudentSchedulePage() {
    const searchParams = useSearchParams()
    const classroomParam = searchParams.get('classroom')

    const [schedule, setSchedule] = useState<Schedule | null>(null)
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [selectedClassroom, setSelectedClassroom] = useState<string>(classroomParam || "")
    const [classroom, setClassroom] = useState<Classroom | null>(null)
    const [currentWeekStart, setCurrentWeekStart] = useState("")
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const timeSlots = [
        "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
        "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00",
        "16:00-17:00", "17:00-18:00"
    ]

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
            const today = new Date()
            const weekStart = getMondayOfWeek(today)
            setCurrentWeekStart(weekStart)
            fetchScheduleData(weekStart, selectedClassroom)
        }
    }, [currentUser])

    const getMondayOfWeek = (date: Date): string => {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        d.setDate(diff)
        return d.toISOString().split('T')[0]
    }

    const formatWeekRange = (weekStart: string): string => {
        const start = new Date(weekStart)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)

        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }

    const fetchScheduleData = async (weekStartDate: string, classroomId?: string) => {
        if (!currentUser) return

        setLoading(true)
        try {
            const params = new URLSearchParams({
                studentId: currentUser._id || currentUser.id,
                weekStartDate
            })

            if (classroomId) params.append('classroomId', classroomId)

            const response = await fetch(`/api/student/schedule?${params}`)

            if (response.ok) {
                const data = await response.json()
                const hasSchedule = data.schedule?.weeklyData && Object.keys(data.schedule.weeklyData).length > 0
                setSchedule(hasSchedule ? data.schedule : mockSchedule)
                setEnrollments(data.enrollments?.length ? data.enrollments : mockEnrollments)
                setClassroom(data.classroom || mockSchedule.classroomId)
            } else {
                console.warn('Schedule API returned error, using mock data')
                setSchedule(mockSchedule)
                setEnrollments(mockEnrollments)
                setClassroom(mockSchedule.classroomId)
            }
        } catch (error) {
            console.error('Error fetching schedule:', error)
            setSchedule(mockSchedule)
            setEnrollments(mockEnrollments)
            setClassroom(mockSchedule.classroomId)
        } finally {
            setLoading(false)
            setInitialLoading(false)
        }
    }

    const navigateWeek = (direction: 'prev' | 'next') => {
        const currentDate = new Date(currentWeekStart)
        currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
        const newWeekStart = getMondayOfWeek(currentDate)
        setCurrentWeekStart(newWeekStart)
        fetchScheduleData(newWeekStart, selectedClassroom)
    }

    const handleClassroomChange = (classroomId: string) => {
        setSelectedClassroom(classroomId)
        fetchScheduleData(currentWeekStart, classroomId)
    }

    const getEntryColor = (type: string) => {
        switch (type) {
            case 'class':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            case 'break':
                return 'bg-green-500/10 text-green-400 border-green-500/30'
            case 'lunch':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
            default:
                return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
        }
    }

    const getEntryIcon = (type: string) => {
        switch (type) {
            case 'class':
                return <BookOpen className="h-3 w-3" />
            case 'break':
            case 'lunch':
                return <Coffee className="h-3 w-3" />
            default:
                return <Clock className="h-3 w-3" />
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
                                    <h1 className="text-3xl font-bold text-white mb-2">Class Schedule</h1>
                                    <p className="text-zinc-400">View your weekly class schedule</p>
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                                        <CardTitle className="text-white text-sm">Week Navigation</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigateWeek('prev')}
                                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>

                                            <div className="text-center">
                                                <p className="text-white font-medium">{formatWeekRange(currentWeekStart)}</p>
                                                <p className="text-zinc-400 text-xs">Week of {currentWeekStart}</p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigateWeek('next')}
                                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Schedule Table */}
                            {!selectedClassroom ? (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-12">
                                        <div className="text-center">
                                            <Calendar className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Select a Classroom</h3>
                                            <p className="text-zinc-400">
                                                Choose a classroom from the dropdown above to view its schedule.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : !schedule?.weeklyData || Object.keys(schedule.weeklyData).length === 0 ? (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-12">
                                        <div className="text-center">
                                            <Clock className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">No Schedule Available</h3>
                                            <p className="text-zinc-400">
                                                No schedule has been created for this classroom and week yet.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader>
                                        <CardTitle className="text-white">
                                            Weekly Schedule - {classroom?.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="border-b border-zinc-700">
                                                        <th className="text-left text-white p-3 font-medium">Time</th>
                                                        {daysOfWeek.map(day => (
                                                            <th key={day} className="text-center text-white p-3 font-medium min-w-[120px]">
                                                                {day}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {timeSlots.map(timeSlot => (
                                                        <tr key={timeSlot} className="border-b border-zinc-800/50">
                                                            <td className="text-zinc-300 p-3 font-mono text-sm">{timeSlot}</td>
                                                            {daysOfWeek.map(day => {
                                                                const dayEntries = schedule?.weeklyData?.[day as keyof ScheduleData] || []
                                                                const entry = Array.isArray(dayEntries) ? dayEntries.find(e => e.timeSlot === timeSlot) : null

                                                                return (
                                                                    <td key={`${day}-${timeSlot}`} className="p-2">
                                                                        {entry ? (
                                                                            <div className={`p-2 rounded border text-xs ${getEntryColor(entry.type)}`}>
                                                                                <div className="flex items-center gap-1 mb-1">
                                                                                    {getEntryIcon(entry.type)}
                                                                                    <span className="font-medium">
                                                                                        {entry.type === 'class' ? entry.subject : entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                                                                                    </span>
                                                                                </div>
                                                                                {entry.room && (
                                                                                    <div className="flex items-center gap-1 text-xs opacity-75">
                                                                                        <MapPin className="h-2 w-2" />
                                                                                        {entry.room}
                                                                                    </div>
                                                                                )}
                                                                                {entry.notes && (
                                                                                    <div className="text-xs opacity-75 italic mt-1">{entry.notes}</div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="h-12 border border-dashed border-zinc-700/50 rounded flex items-center justify-center">
                                                                                <span className="text-zinc-600 text-xs">Free</span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                )
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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
