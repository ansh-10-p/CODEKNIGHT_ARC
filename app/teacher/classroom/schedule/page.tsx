"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
    Calendar,
    Clock,
    Plus,
    Edit,
    Trash2,
    Copy,
    RefreshCw,
    Coffee,
    BookOpen,
    Save,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Sparkles
} from "lucide-react"
import { AIScheduleChat } from "@/components/ai-schedule-chat"

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
    _id?: string
    teacherId: string
    classroomId: any
    weekStartDate: string
    weeklyData: ScheduleData
    isActive: boolean
}

interface Classroom {
    _id: string
    title: string
    subject: string
    inviteCode: string
    studentsCount: number
}

export default function TeacherSchedulePage() {
    const [schedule, setSchedule] = useState<Schedule | null>(null)
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [selectedClassroom, setSelectedClassroom] = useState<string>("")
    const [currentWeekStart, setCurrentWeekStart] = useState("")
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Dialog states
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingDay, setEditingDay] = useState<string>("")
    const [editingIndex, setEditingIndex] = useState<number>(-1)
    const [editingEntry, setEditingEntry] = useState<ScheduleEntry>({
        timeSlot: "",
        type: "class",
        subject: "",
        room: "",
        notes: ""
    })
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
    const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleData | null>(null)

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
                teacherId: currentUser._id || currentUser.id,
                weekStartDate
            })

            if (classroomId) {
                params.append('classroomId', classroomId)
            }

            const response = await fetch(`/api/teacher/schedule?${params}`)

            if (response.ok) {
                const data = await response.json()
                setSchedule(data.schedule)
                setClassrooms(data.classrooms || [])
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch schedule data",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error fetching schedule:', error)
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
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

    const saveSchedule = async () => {
        if (!selectedClassroom) {
            toast({
                title: "Error",
                description: "Please select a classroom first",
                variant: "destructive"
            })
            return
        }

        // Ensure we have a valid schedule structure
        const scheduleToSave = schedule?.weeklyData || {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        }

        setLoading(true)
        try {
            const response = await fetch('/api/teacher/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teacherId: currentUser._id || currentUser.id,
                    classroomId: selectedClassroom,
                    weekStartDate: currentWeekStart,
                    scheduleData: scheduleToSave
                })
            })

            if (response.ok) {
                const data = await response.json()
                setSchedule(data.schedule)
                toast({
                    title: "Success",
                    description: "Schedule saved successfully"
                })
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to save schedule",
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

    const addEntry = (day: string) => {
        if (!schedule) return

        const newEntry: ScheduleEntry = {
            timeSlot: "",
            type: "class",
            subject: "",
            room: "",
            notes: ""
        }

        const updatedSchedule = { ...schedule }
        updatedSchedule.weeklyData[day as keyof ScheduleData].push(newEntry)
        setSchedule(updatedSchedule)
    }

    const editEntry = (day: string, index: number) => {
        if (!schedule) return

        const entry = schedule.weeklyData[day as keyof ScheduleData][index]
        setEditingDay(day)
        setEditingIndex(index)
        setEditingEntry({ ...entry })
        setIsEditDialogOpen(true)
    }

    const saveEditedEntry = () => {
        if (!schedule) return

        const updatedSchedule = { ...schedule }
        updatedSchedule.weeklyData[editingDay as keyof ScheduleData][editingIndex] = { ...editingEntry }
        setSchedule(updatedSchedule)
        setIsEditDialogOpen(false)
        resetEditForm()
    }

    const deleteEntry = (day: string, index: number) => {
        if (!schedule) return

        const updatedSchedule = { ...schedule }
        updatedSchedule.weeklyData[day as keyof ScheduleData].splice(index, 1)
        setSchedule(updatedSchedule)
    }

    const resetEditForm = () => {
        setEditingDay("")
        setEditingIndex(-1)
        setEditingEntry({
            timeSlot: "",
            type: "class",
            subject: "",
            room: "",
            notes: ""
        })
    }

    const copyWeek = async () => {
        // Implementation for copying week functionality
        toast({
            title: "Info",
            description: "Copy week feature coming soon",
        })
    }

    const clearWeek = async () => {
        if (!schedule || !selectedClassroom) return

        setLoading(true)
        try {
            const response = await fetch('/api/teacher/schedule', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'clear_week',
                    teacherId: currentUser._id || currentUser.id,
                    classroomId: selectedClassroom,
                    targetWeekStartDate: currentWeekStart
                })
            })

            if (response.ok) {
                fetchScheduleData(currentWeekStart, selectedClassroom)
                toast({
                    title: "Success",
                    description: "Schedule cleared successfully"
                })
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to clear schedule",
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

    const handleAIScheduleGenerated = (aiSchedule: ScheduleData) => {
        setGeneratedSchedule(aiSchedule)

        toast({
            title: "Schedule generated!",
            description: "Review and apply the AI-generated schedule to your timetable."
        })
    }

    const applyGeneratedSchedule = async () => {
        if (!generatedSchedule || !selectedClassroom) return

        setLoading(true)
        try {
            const response = await fetch('/api/teacher/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teacherId: currentUser._id || currentUser.id,
                    classroomId: selectedClassroom,
                    weekStartDate: currentWeekStart,
                    scheduleData: generatedSchedule
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setSchedule(data.schedule)
                setGeneratedSchedule(null)
                setIsAIDialogOpen(false)

                toast({
                    title: "Schedule applied!",
                    description: "AI-generated schedule has been saved successfully."
                })
            } else {
                throw new Error('Failed to save AI-generated schedule')
            }
        } catch (error) {
            console.error('Error applying AI schedule:', error)
            toast({
                title: "Error",
                description: "Failed to apply AI-generated schedule. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const getSelectedClassroomInfo = () => {
        const classroom = classrooms.find(c => c._id === selectedClassroom)
        return classroom ? {
            title: classroom.title,
            subject: classroom.subject
        } : undefined
    }

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
                                    <h1 className="text-3xl font-bold text-white mb-2">Schedule Management</h1>
                                    <p className="text-zinc-400">Create and manage your classroom schedules in tabular format</p>
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
                                                <SelectValue placeholder="Select a classroom to manage schedule" />
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

                            {/* Action Buttons */}
                            {selectedClassroom && (
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <Button
                                        onClick={saveSchedule}
                                        disabled={loading}
                                        className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {loading ? 'Saving...' : 'Save Schedule'}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                        onClick={copyWeek}
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Week
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                        onClick={clearWeek}
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear Week
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                        onClick={() => setIsAIDialogOpen(true)}
                                        disabled={loading || !selectedClassroom}
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        AI Generate
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                        onClick={() => fetchScheduleData(currentWeekStart, selectedClassroom)}
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            )}

                            {/* Schedule Table */}
                            {!selectedClassroom ? (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-12">
                                        <div className="text-center">
                                            <Calendar className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Select a Classroom</h3>
                                            <p className="text-zinc-400">
                                                Please select a classroom from the dropdown above to view and manage its schedule.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : schedule ? (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardHeader>
                                        <CardTitle className="text-white">
                                            Weekly Schedule - {classrooms.find(c => c._id === selectedClassroom)?.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="border-b border-zinc-700">
                                                        <th className="text-left text-white p-3 font-medium">Time</th>
                                                        {daysOfWeek.map(day => (
                                                            <th key={day} className="text-center text-white p-3 font-medium min-w-[150px]">
                                                                <div className="flex items-center justify-between">
                                                                    <span>{day}</span>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => addEntry(day)}
                                                                        className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {timeSlots.map(timeSlot => (
                                                        <tr key={timeSlot} className="border-b border-zinc-800/50">
                                                            <td className="text-zinc-300 p-3 font-mono text-sm">{timeSlot}</td>
                                                            {daysOfWeek.map(day => {
                                                                const dayEntries = schedule.weeklyData[day as keyof ScheduleData] || []
                                                                const entry = dayEntries.find(e => e.timeSlot === timeSlot)

                                                                return (
                                                                    <td key={`${day}-${timeSlot}`} className="p-2">
                                                                        {entry ? (
                                                                            <div className="group relative">
                                                                                <div className={`p-2 rounded border text-xs ${getEntryColor(entry.type)}`}>
                                                                                    <div className="flex items-center gap-1 mb-1">
                                                                                        {getEntryIcon(entry.type)}
                                                                                        <span className="font-medium">
                                                                                            {entry.type === 'class' ? entry.subject : entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                                                                                        </span>
                                                                                    </div>
                                                                                    {entry.room && (
                                                                                        <div className="text-xs opacity-75">Room: {entry.room}</div>
                                                                                    )}
                                                                                    {entry.notes && (
                                                                                        <div className="text-xs opacity-75 italic mt-1">{entry.notes}</div>
                                                                                    )}
                                                                                </div>

                                                                                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="h-5 w-5 p-0 bg-zinc-800 text-zinc-300 hover:text-white"
                                                                                        onClick={() => editEntry(day, dayEntries.indexOf(entry))}
                                                                                    >
                                                                                        <Edit className="h-2 w-2" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="h-5 w-5 p-0 bg-zinc-800 text-red-400 hover:text-red-300"
                                                                                        onClick={() => deleteEntry(day, dayEntries.indexOf(entry))}
                                                                                    >
                                                                                        <Trash2 className="h-2 w-2" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div
                                                                                className="h-16 border border-dashed border-zinc-700 rounded flex items-center justify-center cursor-pointer hover:border-zinc-600 transition-colors"
                                                                                onClick={() => {
                                                                                    const newEntry: ScheduleEntry = {
                                                                                        timeSlot,
                                                                                        type: "class",
                                                                                        subject: "",
                                                                                        room: "",
                                                                                        notes: ""
                                                                                    }
                                                                                    const updatedSchedule = { ...schedule }
                                                                                    updatedSchedule.weeklyData[day as keyof ScheduleData].push(newEntry)
                                                                                    setSchedule(updatedSchedule)
                                                                                    editEntry(day, updatedSchedule.weeklyData[day as keyof ScheduleData].length - 1)
                                                                                }}
                                                                            >
                                                                                <Plus className="h-4 w-4 text-zinc-600" />
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
                            ) : (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                                    <p className="text-zinc-400 mt-2">Loading schedule...</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Edit Entry Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Edit Entry - {editingDay} {editingEntry.timeSlot}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white">Time Slot</Label>
                                    <Select
                                        value={editingEntry.timeSlot}
                                        onValueChange={(value) => setEditingEntry({ ...editingEntry, timeSlot: value })}
                                    >
                                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                            <SelectValue placeholder="Select time" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                            {timeSlots.map((slot) => (
                                                <SelectItem key={slot} value={slot} className="text-white hover:bg-zinc-700">
                                                    {slot}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-white">Type</Label>
                                    <Select
                                        value={editingEntry.type}
                                        onValueChange={(value: 'class' | 'break' | 'lunch') => setEditingEntry({ ...editingEntry, type: value })}
                                    >
                                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                            <SelectItem value="class" className="text-white hover:bg-zinc-700">Class</SelectItem>
                                            <SelectItem value="break" className="text-white hover:bg-zinc-700">Break</SelectItem>
                                            <SelectItem value="lunch" className="text-white hover:bg-zinc-700">Lunch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {editingEntry.type === 'class' && (
                                <div>
                                    <Label className="text-white">Subject *</Label>
                                    <Input
                                        value={editingEntry.subject}
                                        onChange={(e) => setEditingEntry({ ...editingEntry, subject: e.target.value })}
                                        className="bg-zinc-800/50 border-zinc-700 text-white"
                                        placeholder="Enter subject name"
                                    />
                                </div>
                            )}

                            <div>
                                <Label className="text-white">Room/Location</Label>
                                <Input
                                    value={editingEntry.room}
                                    onChange={(e) => setEditingEntry({ ...editingEntry, room: e.target.value })}
                                    className="bg-zinc-800/50 border-zinc-700 text-white"
                                    placeholder="Room number or location"
                                />
                            </div>

                            <div>
                                <Label className="text-white">Notes</Label>
                                <Input
                                    value={editingEntry.notes}
                                    onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                                    className="bg-zinc-800/50 border-zinc-700 text-white"
                                    placeholder="Additional notes"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={saveEditedEntry}
                                className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                                disabled={editingEntry.type === 'class' && !editingEntry.subject}
                            >
                                Save Entry
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <AIScheduleChat
                    isOpen={isAIDialogOpen}
                    onClose={() => {
                        setIsAIDialogOpen(false)
                        setGeneratedSchedule(null)
                    }}
                    onScheduleGenerated={handleAIScheduleGenerated}
                    classroomInfo={getSelectedClassroomInfo()}
                    currentSchedule={schedule?.weeklyData}
                />

                {generatedSchedule && (
                    <Dialog open={true} onOpenChange={() => setGeneratedSchedule(null)}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto bg-zinc-900 border-zinc-700">
                            <DialogHeader>
                                <DialogTitle className="text-white flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    Review AI Generated Schedule
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <p className="text-zinc-300">
                                    Preview the AI-generated schedule below. Click "Apply Schedule" to use it.
                                </p>

                                <div className="grid grid-cols-7 gap-2">
                                    {daysOfWeek.map(day => (
                                        <div key={day} className="space-y-2">
                                            <h3 className="font-semibold text-white text-center">{day}</h3>
                                            <div className="space-y-1">
                                                {generatedSchedule[day as keyof ScheduleData]?.map((entry, index) => (
                                                    <div
                                                        key={index}
                                                        className={`p-2 rounded text-xs ${entry.type === 'class'
                                                            ? 'bg-blue-500/20 border border-blue-500/30'
                                                            : entry.type === 'break'
                                                                ? 'bg-green-500/20 border border-green-500/30'
                                                                : 'bg-orange-500/20 border border-orange-500/30'
                                                            }`}
                                                    >
                                                        <div className="font-medium text-white">{entry.timeSlot}</div>
                                                        <div className="text-zinc-300">
                                                            {entry.type === 'class' ? entry.subject : entry.type}
                                                        </div>
                                                        {entry.room && (
                                                            <div className="text-zinc-400">{entry.room}</div>
                                                        )}
                                                    </div>
                                                )) || []}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setGeneratedSchedule(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={applyGeneratedSchedule}
                                        disabled={loading}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {loading ? "Applying..." : "Apply Schedule"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </main>
        </div>
    )
}
