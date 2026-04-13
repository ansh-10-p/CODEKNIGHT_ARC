"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
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
    MapPin,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Settings
} from "lucide-react"

interface TimetableEntry {
    _id: string
    teacherId: string
    classroomId: {
        _id: string
        title: string
        subject: string
        inviteCode: string
    }
    weekStartDate: string
    day: string
    timeSlot: string
    type: 'class' | 'break' | 'lunch'
    subjectName?: string
    className: string
    room?: string
    notes?: string
    isActive: boolean
}

interface Classroom {
    _id: string
    title: string
    subject: string
    inviteCode: string
    studentsCount: number
}

interface NewEntryForm {
    classroomId: string
    day: string
    timeSlot: string
    type: 'class' | 'break' | 'lunch'
    subjectName: string
    room: string
    notes: string
}

export default function TeacherTimetablePage() {
    const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>({})
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [selectedClassroom, setSelectedClassroom] = useState<string>("")
    const [currentWeekStart, setCurrentWeekStart] = useState("")
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)

    // Form states
    const [newEntry, setNewEntry] = useState<NewEntryForm>({
        classroomId: "",
        day: "Monday",
        timeSlot: "",
        type: "class",
        subjectName: "",
        room: "",
        notes: ""
    })
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null)
    const [deletingEntry, setDeletingEntry] = useState<TimetableEntry | null>(null)
    const [copyWeekData, setCopyWeekData] = useState({
        sourceWeek: "",
        targetWeek: ""
    })

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
            // Set current week start date
            const today = new Date()
            const weekStart = getMondayOfWeek(today)
            setCurrentWeekStart(weekStart)
            fetchTimetableData(weekStart, selectedClassroom)
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

    const fetchTimetableData = async (weekStartDate: string, classroomId?: string) => {
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

            const response = await fetch(`/api/teacher/timetable?${params}`)

            if (response.ok) {
                const data = await response.json()
                setTimetable(data.timetable || {})
                setClassrooms(data.classrooms || [])
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch timetable data",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error fetching timetable:', error)
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
        fetchTimetableData(newWeekStart, selectedClassroom)
    }

    const handleClassroomChange = (classroomId: string) => {
        setSelectedClassroom(classroomId)
        fetchTimetableData(currentWeekStart, classroomId)
    }

    const resetForm = () => {
        setNewEntry({
            classroomId: selectedClassroom,
            day: "Monday",
            timeSlot: "",
            type: "class",
            subjectName: "",
            room: "",
            notes: ""
        })
    }

    const handleCreateEntry = async () => {
        if (!newEntry.classroomId || !newEntry.timeSlot || (newEntry.type === 'class' && !newEntry.subjectName)) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const selectedClassroomData = classrooms.find(c => c._id === newEntry.classroomId)

            const response = await fetch('/api/teacher/timetable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teacherId: currentUser._id || currentUser.id,
                    classroomId: newEntry.classroomId,
                    weekStartDate: currentWeekStart,
                    day: newEntry.day,
                    timeSlot: newEntry.timeSlot,
                    type: newEntry.type,
                    subjectName: newEntry.subjectName,
                    className: selectedClassroomData?.title || "",
                    room: newEntry.room,
                    notes: newEntry.notes
                })
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Timetable entry created successfully"
                })
                setIsCreateDialogOpen(false)
                resetForm()
                fetchTimetableData(currentWeekStart, selectedClassroom)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to create timetable entry",
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

    const handleEditEntry = async () => {
        if (!editingEntry) return

        setLoading(true)
        try {
            const response = await fetch('/api/teacher/timetable', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    entryId: editingEntry._id,
                    teacherId: currentUser._id || currentUser.id,
                    type: editingEntry.type,
                    subjectName: editingEntry.subjectName,
                    room: editingEntry.room,
                    notes: editingEntry.notes
                })
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Timetable entry updated successfully"
                })
                setIsEditDialogOpen(false)
                setEditingEntry(null)
                fetchTimetableData(currentWeekStart, selectedClassroom)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to update timetable entry",
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

    const handleDeleteEntry = async () => {
        if (!deletingEntry) return

        setLoading(true)
        try {
            const response = await fetch(`/api/teacher/timetable?entryId=${deletingEntry._id}&teacherId=${currentUser._id || currentUser.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Timetable entry deleted successfully"
                })
                setIsDeleteDialogOpen(false)
                setDeletingEntry(null)
                fetchTimetableData(currentWeekStart, selectedClassroom)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to delete timetable entry",
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

    const handleCopyWeek = async () => {
        if (!copyWeekData.sourceWeek || !copyWeekData.targetWeek || !selectedClassroom) {
            toast({
                title: "Error",
                description: "Please select source week, target week, and classroom",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/teacher/timetable', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'copy_week',
                    teacherId: currentUser._id || currentUser.id,
                    classroomId: selectedClassroom,
                    sourceWeekStartDate: copyWeekData.sourceWeek,
                    targetWeekStartDate: copyWeekData.targetWeek
                })
            })

            if (response.ok) {
                const data = await response.json()
                toast({
                    title: "Success",
                    description: data.message
                })
                setIsCopyDialogOpen(false)
                setCopyWeekData({ sourceWeek: "", targetWeek: "" })

                // If target week is current week, refresh data
                if (copyWeekData.targetWeek === currentWeekStart) {
                    fetchTimetableData(currentWeekStart, selectedClassroom)
                }
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to copy week",
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

    const clearCurrentWeek = async () => {
        if (!selectedClassroom) {
            toast({
                title: "Error",
                description: "Please select a classroom first",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/teacher/timetable', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'clear_week',
                    teacherId: currentUser._id || currentUser.id,
                    classroomId: selectedClassroom,
                    weekStartDate: currentWeekStart
                })
            })

            if (response.ok) {
                const data = await response.json()
                toast({
                    title: "Success",
                    description: data.message
                })
                fetchTimetableData(currentWeekStart, selectedClassroom)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to clear week",
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

    const getEntryIcon = (type: string) => {
        switch (type) {
            case 'class':
                return <BookOpen className="h-4 w-4" />
            case 'break':
                return <Coffee className="h-4 w-4" />
            case 'lunch':
                return <Coffee className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
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
                                    <h1 className="text-3xl font-bold text-white mb-2">Timetable Management</h1>
                                    <p className="text-zinc-400">Create and manage your classroom schedules</p>
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
                                                <SelectValue placeholder="Select a classroom to manage timetable" />
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
                            <div className="flex flex-wrap gap-4 mb-6">
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                            onClick={() => {
                                                resetForm()
                                                setIsCreateDialogOpen(true)
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Entry
                                        </Button>
                                    </DialogTrigger>
                                </Dialog>

                                <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Week
                                        </Button>
                                    </DialogTrigger>
                                </Dialog>

                                <Button
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    onClick={clearCurrentWeek}
                                    disabled={!selectedClassroom || loading}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear Week
                                </Button>

                                <Button
                                    variant="outline"
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                    onClick={() => fetchTimetableData(currentWeekStart, selectedClassroom)}
                                    disabled={loading}
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>

                            {/* Timetable Grid */}
                            {!selectedClassroom ? (
                                <Card className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-12">
                                        <div className="text-center">
                                            <Calendar className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Select a Classroom</h3>
                                            <p className="text-zinc-400">
                                                Please select a classroom from the dropdown above to view and manage its timetable.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                                    {daysOfWeek.map((day) => (
                                        <Card key={day} className="bg-zinc-900/50 border-zinc-800">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-white text-lg text-center">{day}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                {timetable[day]?.length > 0 ? (
                                                    timetable[day]
                                                        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                                                        .map((entry) => (
                                                            <div
                                                                key={entry._id}
                                                                className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors group"
                                                            >
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-start gap-2">
                                                                        <div className="mt-1">
                                                                            {getEntryIcon(entry.type)}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-white text-sm font-medium truncate">
                                                                                {entry.type === 'class' ? entry.subjectName : entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                                                                            </p>
                                                                            <p className="text-zinc-400 text-xs">{entry.timeSlot}</p>
                                                                            {entry.room && (
                                                                                <p className="text-zinc-500 text-xs flex items-center gap-1 mt-1">
                                                                                    <MapPin className="h-3 w-3" />
                                                                                    {entry.room}
                                                                                </p>
                                                                            )}
                                                                            <Badge className={`${getEntryColor(entry.type)} text-xs mt-1`}>
                                                                                {entry.classroomId.title}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                                                                            onClick={() => {
                                                                                setEditingEntry(entry)
                                                                                setIsEditDialogOpen(true)
                                                                            }}
                                                                        >
                                                                            <Edit className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                                                            onClick={() => {
                                                                                setDeletingEntry(entry)
                                                                                setIsDeleteDialogOpen(true)
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {entry.notes && (
                                                                    <p className="text-zinc-500 text-xs mt-2 italic">{entry.notes}</p>
                                                                )}
                                                            </div>
                                                        ))
                                                ) : (
                                                    <div className="text-center py-8 text-zinc-500">
                                                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No entries</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Create Entry Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">Add Timetable Entry</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white">Classroom</Label>
                                    <Select value={newEntry.classroomId} onValueChange={(value) => setNewEntry({ ...newEntry, classroomId: value })}>
                                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                            <SelectValue placeholder="Select classroom" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                            {classrooms.map((classroom) => (
                                                <SelectItem key={classroom._id} value={classroom._id} className="text-white hover:bg-zinc-700">
                                                    {classroom.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-white">Day</Label>
                                    <Select value={newEntry.day} onValueChange={(value) => setNewEntry({ ...newEntry, day: value })}>
                                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                            {daysOfWeek.map((day) => (
                                                <SelectItem key={day} value={day} className="text-white hover:bg-zinc-700">
                                                    {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white">Time Slot</Label>
                                    <Select value={newEntry.timeSlot} onValueChange={(value) => setNewEntry({ ...newEntry, timeSlot: value })}>
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
                                    <Select value={newEntry.type} onValueChange={(value: 'class' | 'break' | 'lunch') => setNewEntry({ ...newEntry, type: value })}>
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

                            {newEntry.type === 'class' && (
                                <div>
                                    <Label className="text-white">Subject Name *</Label>
                                    <Input
                                        value={newEntry.subjectName}
                                        onChange={(e) => setNewEntry({ ...newEntry, subjectName: e.target.value })}
                                        className="bg-zinc-800/50 border-zinc-700 text-white"
                                        placeholder="Enter subject name"
                                    />
                                </div>
                            )}

                            <div>
                                <Label className="text-white">Room/Location</Label>
                                <Input
                                    value={newEntry.room}
                                    onChange={(e) => setNewEntry({ ...newEntry, room: e.target.value })}
                                    className="bg-zinc-800/50 border-zinc-700 text-white"
                                    placeholder="Room number or location"
                                />
                            </div>

                            <div>
                                <Label className="text-white">Notes</Label>
                                <Textarea
                                    value={newEntry.notes}
                                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                                    className="bg-zinc-800/50 border-zinc-700 text-white resize-none"
                                    placeholder="Additional notes"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateEntry} disabled={loading} className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                                {loading ? 'Creating...' : 'Create Entry'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Entry Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">Edit Timetable Entry</DialogTitle>
                        </DialogHeader>
                        {editingEntry && (
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-white">Day</Label>
                                        <Input value={editingEntry.day} disabled className="bg-zinc-800/30 border-zinc-700 text-zinc-400" />
                                    </div>
                                    <div>
                                        <Label className="text-white">Time Slot</Label>
                                        <Input value={editingEntry.timeSlot} disabled className="bg-zinc-800/30 border-zinc-700 text-zinc-400" />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-white">Type</Label>
                                    <Select value={editingEntry.type} onValueChange={(value: 'class' | 'break' | 'lunch') => setEditingEntry({ ...editingEntry, type: value })}>
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

                                {editingEntry.type === 'class' && (
                                    <div>
                                        <Label className="text-white">Subject Name *</Label>
                                        <Input
                                            value={editingEntry.subjectName || ''}
                                            onChange={(e) => setEditingEntry({ ...editingEntry, subjectName: e.target.value })}
                                            className="bg-zinc-800/50 border-zinc-700 text-white"
                                            placeholder="Enter subject name"
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label className="text-white">Room/Location</Label>
                                    <Input
                                        value={editingEntry.room || ''}
                                        onChange={(e) => setEditingEntry({ ...editingEntry, room: e.target.value })}
                                        className="bg-zinc-800/50 border-zinc-700 text-white"
                                        placeholder="Room number or location"
                                    />
                                </div>

                                <div>
                                    <Label className="text-white">Notes</Label>
                                    <Textarea
                                        value={editingEntry.notes || ''}
                                        onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                                        className="bg-zinc-800/50 border-zinc-700 text-white resize-none"
                                        placeholder="Additional notes"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditEntry} disabled={loading} className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                                {loading ? 'Updating...' : 'Update Entry'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Copy Week Dialog */}
                <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">Copy Week Schedule</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label className="text-white">Source Week (Copy From)</Label>
                                <Input
                                    type="date"
                                    value={copyWeekData.sourceWeek}
                                    onChange={(e) => setCopyWeekData({ ...copyWeekData, sourceWeek: e.target.value })}
                                    className="bg-zinc-800/50 border-zinc-700 text-white"
                                />
                            </div>

                            <div>
                                <Label className="text-white">Target Week (Copy To)</Label>
                                <Input
                                    type="date"
                                    value={copyWeekData.targetWeek}
                                    onChange={(e) => setCopyWeekData({ ...copyWeekData, targetWeek: e.target.value })}
                                    className="bg-zinc-800/50 border-zinc-700 text-white"
                                />
                            </div>

                            <p className="text-zinc-400 text-sm">
                                This will copy all timetable entries from the source week to the target week for the selected classroom.
                                Existing entries in the target week will be replaced.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsCopyDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCopyWeek} disabled={loading} className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                                {loading ? 'Copying...' : 'Copy Week'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Timetable Entry</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-400">
                                Are you sure you want to delete this timetable entry? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteEntry}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    )
}
