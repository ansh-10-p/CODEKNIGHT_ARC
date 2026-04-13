"use client"

import React, { useState, useEffect } from "react"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  UserCheck, 
  UtensilsCrossed,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  AlertCircle,
  Bell,
  ShoppingBag,
  CalendarDays,
  IndianRupee,
  CheckCircle,
  Building,
  MapPin,
  ChevronRight,
  Loader2
  ,Car
} from "lucide-react"
import { UserMenu } from "@/components/user-menu"

// Interfaces
interface Classroom {
  _id: string
  classroomId: string
  title: string
  subject: string
  studentsCount: number
  maxStudents: number
  status: string
  schedule: any[]
}

interface TodayClass {
  classroomId: string
  subject: string
  time: string
  room: string
  students: number
}

interface FoodOrder {
  _id: string
  orderId: string
  canteenName: string
  totalAmount: number
  paymentStatus: string
  status: string
  createdAt: string
  items: any[]
}

interface AttendanceStats {
  totalClasses: number
  classesToday: number
  studentsPresent: number
  attendanceRate: number
}

export default function TeacherDashboardPage() {
    const demoClassrooms: Classroom[] = [
        {
            _id: "demo-class-1",
            classroomId: "CS301",
            title: "Data Structures - Sec A",
            subject: "Data Structures",
            studentsCount: 48,
            maxStudents: 60,
            status: "active",
            schedule: []
        },
        {
            _id: "demo-class-2",
            classroomId: "CS305",
            title: "DBMS - Sec B",
            subject: "Database Systems",
            studentsCount: 42,
            maxStudents: 60,
            status: "active",
            schedule: []
        }
    ]
    const demoFoodOrders: FoodOrder[] = [
        {
            _id: "demo-food-1",
            orderId: "ORD-T1001",
            canteenName: "Campus Cafe",
            totalAmount: 155,
            paymentStatus: "paid",
            status: "completed",
            createdAt: "2026-04-06T12:00:00.000Z",
            items: [{ name: "Veg Meal" }]
        },
        {
            _id: "demo-food-2",
            orderId: "ORD-T1002",
            canteenName: "Main Canteen",
            totalAmount: 90,
            paymentStatus: "paid",
            status: "preparing",
            createdAt: "2026-04-06T13:00:00.000Z",
            items: [{ name: "Sandwich" }, { name: "Tea" }]
        }
    ]
    const demoTodayClasses: TodayClass[] = [
        { classroomId: "CS301", subject: "Data Structures", time: "9:00 AM", room: "Room 301", students: 48 },
        { classroomId: "CS305", subject: "Database Systems", time: "11:00 AM", room: "Room 205", students: 42 },
    ]
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [todayClasses, setTodayClasses] = useState<TodayClass[]>([])
    const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([])
    const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
        totalClasses: 5,
        classesToday: 2,
        studentsPresent: 84,
        attendanceRate: 93
    })
    const displayClassrooms = classrooms.length ? classrooms : demoClassrooms
    const displayFoodOrders = foodOrders.length ? foodOrders : demoFoodOrders
    const displayTodayClasses = todayClasses.length ? todayClasses : demoTodayClasses

    useEffect(() => {
        // Load current user
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
            fetchFoodOrders()
            fetchAttendanceStats()
            fetchTodaySchedule()
        }
    }, [currentUser])

    const fetchClassrooms = async () => {
        try {
            const response = await fetch(`/api/classrooms?teacherId=${currentUser._id || currentUser.id}`)
            if (response.ok) {
                const data = await response.json()
                setClassrooms(data.classrooms || [])
            }
        } catch (error) {
            console.error('Error fetching classrooms:', error)
        }
    }

    const fetchFoodOrders = async () => {
        try {
            const response = await fetch(`/api/orders/user?userId=${currentUser._id || currentUser.id}&userType=teacher&limit=5`)
            if (response.ok) {
                const data = await response.json()
                setFoodOrders(data.data || [])
            }
        } catch (error) {
            console.error('Error fetching food orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAttendanceStats = async () => {
        try {
            // For now, use mock data - replace with actual API call when available
            setAttendanceStats({
                totalClasses: classrooms.length,
                classesToday: 3,
                studentsPresent: 85,
                attendanceRate: 92
            })
        } catch (error) {
            console.error('Error fetching attendance stats:', error)
        }
    }

    const fetchTodaySchedule = async () => {
        try {
            // Mock data for today's classes - replace with actual API call
            const mockTodayClasses = [
                { classroomId: 'CS101', subject: 'Data Structures', time: '9:00 AM', room: 'Room 301', students: 45 },
                { classroomId: 'CS102', subject: 'Algorithms', time: '11:00 AM', room: 'Lab 2', students: 40 },
                { classroomId: 'CS103', subject: 'Database Systems', time: '2:00 PM', room: 'Room 205', students: 38 }
            ]
            setTodayClasses(mockTodayClasses)
        } catch (error) {
            console.error('Error fetching today schedule:', error)
        }
    }

    const getTotalStudents = () => {
        return displayClassrooms.reduce((sum, classroom) => sum + classroom.studentsCount, 0)
    }

    const getActiveClassrooms = () => {
        return displayClassrooms.filter(c => c.status === 'active').length
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-black flex">
            <TeacherSidebar />
            <main className="flex-1 overflow-auto">
                <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
                    <div className="px-8 py-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
                            <p className="text-zinc-400 mt-2">Welcome back, {currentUser?.firstName || 'Teacher'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <Bell className="h-5 w-5 text-zinc-400" />
                            </Button>
                            <UserMenu />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg">
                                        <BookOpen className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {loading ? '--' : getActiveClassrooms()}
                                        </p>
                                        <p className="text-zinc-400 text-sm">Active Classes</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 rounded-lg">
                                        <Users className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {loading ? '--' : getTotalStudents()}
                                        </p>
                                        <p className="text-zinc-400 text-sm">Total Students</p>
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
                                        <p className="text-2xl font-bold text-white">
                                            {loading ? '--' : `${attendanceStats.attendanceRate}%`}
                                        </p>
                                        <p className="text-zinc-400 text-sm">Attendance Rate</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 rounded-lg">
                                        <CalendarDays className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {loading ? '--' : displayTodayClasses.length}
                                        </p>
                                        <p className="text-zinc-400 text-sm">Classes Today</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Today's Schedule */}
                        <div className="lg:col-span-2">
                            <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
                                <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                                            <Car className="h-6 w-6 text-[#e78a53]" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">Parking Allocation</h3>
                                            <p className="text-zinc-400 text-sm">Request or review your teacher parking slot.</p>
                                        </div>
                                    </div>
                                    <Link href="/teacher/parking">
                                        <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90">Go to Parking</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-[#e78a53]" />
                                        Today's Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-[#e78a53] mx-auto" />
                                        </div>
                                    ) : displayTodayClasses.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                            <p className="text-zinc-400">No classes scheduled for today</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {displayTodayClasses.map((cls, index) => (
                                                <div key={index} className="p-4 bg-zinc-800/30 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h4 className="text-white font-semibold">{cls.subject}</h4>
                                                            <p className="text-zinc-400 text-sm">{cls.classroomId}</p>
                                                        </div>
                                                        <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30">
                                                            {cls.time}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {cls.room}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {cls.students} students
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* My Classrooms */}
                            <Card className="bg-zinc-900/50 border-zinc-800 mt-8">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-[#e78a53]" />
                                            My Classrooms
                                        </CardTitle>
                                        <Link href="/teacher/classroom">
                                            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white">
                                                View All
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-[#e78a53] mx-auto" />
                                        </div>
                                    ) : displayClassrooms.length === 0 ? (
                                        <div className="text-center py-8">
                                            <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                            <p className="text-zinc-400">No classrooms created yet</p>
                                            <Link href="/teacher/classroom">
                                                <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-400 hover:text-white">
                                                    Create Classroom
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {displayClassrooms.slice(0, 4).map((classroom) => (
                                                <div key={classroom._id} className="p-4 bg-zinc-800/30 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-white font-semibold text-sm">{classroom.title}</h4>
                                                        <Badge className={`text-xs ${
                                                            classroom.status === 'active' 
                                                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                                                        }`}>
                                                            {classroom.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-zinc-400 text-xs mb-2">{classroom.subject}</p>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-zinc-500">ID: {classroom.classroomId}</span>
                                                        <span className="text-[#e78a53]">
                                                            {classroom.studentsCount}/{classroom.maxStudents} students
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* Quick Actions */}
                            <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href="/teacher/classroom/attendance" className="block">
                                        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white justify-start">
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Take Attendance
                                        </Button>
                                    </Link>
                                    <Link href="/teacher/timetable" className="block">
                                        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white justify-start">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            View Timetable
                                        </Button>
                                    </Link>
                                    <Link href="/teacher/classroom" className="block">
                                        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white justify-start">
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            Manage Classes
                                        </Button>
                                    </Link>
                                    <Link href="/teacher/food" className="block">
                                        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white justify-start">
                                            <UtensilsCrossed className="h-4 w-4 mr-2" />
                                            Order Food
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Recent Food Orders */}
                            <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                                        <ShoppingBag className="h-5 w-5 text-[#e78a53]" />
                                        Recent Orders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-[#e78a53] mx-auto" />
                                        </div>
                                    ) : displayFoodOrders.length === 0 ? (
                                        <div className="text-center py-4">
                                            <ShoppingBag className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                                            <p className="text-zinc-400 text-sm">No recent orders</p>
                                            <Link href="/teacher/food">
                                                <Button variant="outline" size="sm" className="mt-3 border-zinc-700 text-zinc-400 hover:text-white">
                                                    Order Now
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {displayFoodOrders.slice(0, 3).map((order) => (
                                                <div key={order._id} className="p-3 bg-zinc-800/30 rounded-lg">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-white text-sm font-medium">{order.canteenName}</p>
                                                        <Badge className={`text-xs ${
                                                            order.status === 'completed' 
                                                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                                                : order.status === 'preparing'
                                                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                                                        }`}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-zinc-500 text-xs">{order.items.length} items</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[#e78a53] text-sm font-semibold">₹{order.totalAmount}</span>
                                                        <span className="text-zinc-500 text-xs">
                                                            {formatDate(order.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {displayFoodOrders.length > 3 && (
                                                <Link href="/teacher/food">
                                                    <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-400 hover:text-white">
                                                        View All Orders
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Upcoming Deadlines */}
                            <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                                        Upcoming Tasks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                            <p className="text-yellow-400 text-sm font-medium">Submit attendance report</p>
                                            <p className="text-zinc-400 text-xs mt-1">Due tomorrow</p>
                                        </div>
                                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                            <p className="text-blue-400 text-sm font-medium">Parent-teacher meeting</p>
                                            <p className="text-zinc-400 text-xs mt-1">Friday, 3:00 PM</p>
                                        </div>
                                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                            <p className="text-green-400 text-sm font-medium">Grade assignments</p>
                                            <p className="text-zinc-400 text-xs mt-1">3 days remaining</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}


