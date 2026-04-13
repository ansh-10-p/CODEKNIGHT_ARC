"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
    Users,
    Clock,
    MapPin,
    Calendar,
    Search,
    UserPlus,
    BookOpen,
    Video,
    MessageSquare,
    FileText,
    CheckCircle,
    ExternalLink,
    UserCheck
} from "lucide-react"

interface Classroom {
    _id: string
    classroomId: string
    title: string
    subject: string
    teacherName: string
    teacherEmail: string
    description: string
    schedule: {
        day: string
        startTime: string
        endTime: string
    }[]
    studentsCount: number
    maxStudents: number
    status: string
    createdAt: string
}

const mockEnrolled: Classroom[] = [
  { _id:"mc1", classroomId:"CLS-2024-001", title:"Data Structures & Algorithms", subject:"Computer Science", teacherName:"Prof. Priya Verma", teacherEmail:"priya.verma@campus.in", description:"Core CS subject covering arrays, trees, graphs, DP and sorting algorithms.", schedule:[{day:"Monday",startTime:"09:00",endTime:"10:30"},{day:"Wednesday",startTime:"09:00",endTime:"10:30"},{day:"Friday",startTime:"11:00",endTime:"12:30"}], studentsCount:38, maxStudents:45, status:"active", createdAt:new Date(Date.now()-60*86400000).toISOString() },
  { _id:"mc2", classroomId:"CLS-2024-002", title:"Database Management Systems", subject:"Computer Science", teacherName:"Prof. Rakesh Sharma", teacherEmail:"rakesh.sharma@college.edu", description:"Relational databases, SQL, normalization, transactions and NoSQL fundamentals.", schedule:[{day:"Tuesday",startTime:"10:00",endTime:"11:30"},{day:"Thursday",startTime:"10:00",endTime:"11:30"}], studentsCount:35, maxStudents:40, status:"active", createdAt:new Date(Date.now()-55*86400000).toISOString() },
  { _id:"mc3", classroomId:"CLS-2024-003", title:"Operating Systems", subject:"Computer Science", teacherName:"Dr. Anita Desai", teacherEmail:"anita.desai@college.edu", description:"Process management, memory management, file systems, CPU scheduling and deadlock.", schedule:[{day:"Monday",startTime:"11:00",endTime:"12:30"},{day:"Friday",startTime:"09:00",endTime:"10:30"}], studentsCount:29, maxStudents:42, status:"active", createdAt:new Date(Date.now()-50*86400000).toISOString() },
]

const mockAvailable: Classroom[] = [
  { _id:"mc4", classroomId:"CLS-2024-004", title:"Computer Networks", subject:"Computer Science", teacherName:"Prof. Priya Verma", teacherEmail:"priya.verma@campus.in", description:"OSI model, TCP/IP, routing, network security, wireless networks and socket programming.", schedule:[{day:"Wednesday",startTime:"14:00",endTime:"15:30"},{day:"Saturday",startTime:"10:00",endTime:"11:30"}], studentsCount:22, maxStudents:40, status:"active", createdAt:new Date(Date.now()-40*86400000).toISOString() },
  { _id:"mc5", classroomId:"CLS-2024-005", title:"Software Engineering", subject:"Computer Science", teacherName:"Dr. Nikhil Joshi", teacherEmail:"nikhil.joshi@college.edu", description:"SDLC, Agile, design patterns, UML diagrams and software testing methodologies.", schedule:[{day:"Tuesday",startTime:"14:00",endTime:"15:30"},{day:"Thursday",startTime:"14:00",endTime:"15:30"}], studentsCount:18, maxStudents:35, status:"active", createdAt:new Date(Date.now()-30*86400000).toISOString() },
]

export default function StudentClassroomPage() {
    const [joinCode, setJoinCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [enrolledClassrooms, setEnrolledClassrooms] = useState<Classroom[]>([])
    const [availableClassrooms, setAvailableClassrooms] = useState<Classroom[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [initialLoading, setInitialLoading] = useState(true)

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

    const fetchClassrooms = async () => {
        try {
            const response = await fetch(`/api/classrooms?studentId=${currentUser._id || currentUser.id}`)
            if (response.ok) {
                const data = await response.json()
                setEnrolledClassrooms(data.enrolledClassrooms?.length ? data.enrolledClassrooms : mockEnrolled)
                setAvailableClassrooms(data.availableClassrooms?.length ? data.availableClassrooms : mockAvailable)
            } else {
                setEnrolledClassrooms(mockEnrolled)
                setAvailableClassrooms(mockAvailable)
            }
        } catch (error) {
            console.error('Error fetching classrooms:', error)
            setEnrolledClassrooms(mockEnrolled)
            setAvailableClassrooms(mockAvailable)
        } finally {
            setInitialLoading(false)
        }
    }

    const handleJoinWithCode = async () => {
        if (!joinCode.trim()) {
            toast({
                title: "Error",
                description: "Please enter a classroom code",
                variant: "destructive"
            })
            return
        }

        if (!currentUser) {
            toast({
                title: "Error",
                description: "Please log in to join a classroom",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/classrooms/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inviteCode: joinCode.trim(),
                    studentId: currentUser._id || currentUser.id
                })
            })

            if (response.ok) {
                const data = await response.json()
                toast({
                    title: "Success",
                    description: "Successfully joined classroom!",
                })
                setJoinCode("")
                fetchClassrooms()
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to join classroom",
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

    const handleJoinClassroom = async (classroom: Classroom) => {
        if (!currentUser) {
            toast({
                title: "Error",
                description: "Please log in to join a classroom",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/classrooms/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inviteCode: classroom.classroomId,
                    studentId: currentUser._id || currentUser.id
                })
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Successfully joined classroom!",
                })
                fetchClassrooms()
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to join classroom",
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

    const filteredClassrooms = availableClassrooms.filter(classroom =>
        classroom.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classroom.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classroom.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    return (
        <div className="min-h-screen bg-black flex">
            <StudentSidebar />

            <main className="flex-1 overflow-auto">
                <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
                    <div className="px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Classroom</h1>
                                <p className="text-zinc-400">Join classrooms and access your learning materials</p>
                            </div>
                            <UserMenu />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2">
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-white mb-4">Available Classrooms</h2>

                                <div className="mb-6">
                                    <Label htmlFor="search" className="text-white mb-2 block">Search Classrooms</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            id="search"
                                            placeholder="Search by subject, teacher, or title..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 bg-zinc-900/50 border-zinc-700 text-white"
                                        />
                                    </div>
                                </div>

                                {initialLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                                        <p className="text-zinc-400 mt-2">Loading classrooms...</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {filteredClassrooms.map((classroom) => (
                                            <Card key={classroom._id} className="bg-zinc-900/50 border-zinc-800">
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-white mb-1">{classroom.title}</h3>
                                                            <p className="text-zinc-400 text-sm">{classroom.teacherName}</p>
                                                        </div>
                                                        <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30">
                                                            {classroom.subject}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-zinc-300 mb-4 text-sm leading-relaxed">{classroom.description}</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                                <Users className="h-4 w-4" />
                                                                <span>{classroom.studentsCount}/{classroom.maxStudents} students</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>Code: {classroom.classroomId}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                                                                <Clock className="h-4 w-4" />
                                                                <span>Schedule:</span>
                                                            </div>
                                                            {classroom.schedule.map((schedule, index) => (
                                                                <div key={index} className="text-xs text-zinc-500 ml-6">
                                                                    {schedule.day}: {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <div className="flex gap-2">
                                                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                                                {classroom.status}
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            onClick={() => handleJoinClassroom(classroom)}
                                                            disabled={loading || classroom.studentsCount >= classroom.maxStudents}
                                                            className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                                        >
                                                            <UserPlus className="h-4 w-4 mr-2" />
                                                            {classroom.studentsCount >= classroom.maxStudents ? 'Full' : 'Join'}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {filteredClassrooms.length === 0 && (
                                            <div className="text-center py-8">
                                                <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                                <p className="text-zinc-400">No classrooms found</p>
                                                <p className="text-zinc-500 text-sm mt-1">Try adjusting your search or join with a code</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-[#e78a53]" />
                                        Join with Code
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="joinCode" className="text-white mb-2 block">Classroom Code</Label>
                                        <Input
                                            id="joinCode"
                                            placeholder="Enter 6-digit code"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value)}
                                            maxLength={6}
                                            className="bg-zinc-800/50 border-zinc-700 text-white"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleJoinWithCode}
                                        disabled={loading || !joinCode.trim()}
                                        className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                    >
                                        {loading ? 'Joining...' : 'Join Classroom'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-[#e78a53]" />
                                        My Classrooms
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {enrolledClassrooms.length === 0 ? (
                                        <div className="text-center py-8">
                                            <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                            <p className="text-zinc-400 text-sm">No classrooms joined yet</p>
                                            <p className="text-zinc-500 text-xs mt-1">Join a classroom to get started</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {enrolledClassrooms.map((classroom) => (
                                                <div key={classroom._id} className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="text-white font-medium mb-1">{classroom.title}</h4>
                                                            <p className="text-zinc-400 text-sm">{classroom.subject}</p>
                                                            <p className="text-zinc-500 text-xs">Teacher: {classroom.teacherName}</p>
                                                        </div>
                                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Enrolled
                                                        </Badge>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Link href={`/student/attendance?classroom=${classroom._id}`}>
                                                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                                                <UserCheck className="h-3 w-3 mr-1" />
                                                                Attendance
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/student/schedule?classroom=${classroom._id}`}>
                                                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                Schedule
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/student/materials?classroom=${classroom._id}`}>
                                                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                Materials
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
