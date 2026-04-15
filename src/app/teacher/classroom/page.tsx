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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import {
    Plus,
    Users,
    Clock,
    Calendar,
    BookOpen,
    Settings,
    Copy,
    Edit3,
    Trash2,
    Eye,
    UserCheck,
    FileText,
    Video,
    MessageSquare,
    MoreVertical
} from "lucide-react"

interface ClassroomFormData {
    title: string
    subject: string
    description: string
    maxStudents: number
    schedule: ScheduleItem[]
}

interface ScheduleItem {
    day: string
    startTime: string
    endTime: string
}

interface Classroom {
    _id: string
    classroomId: string
    inviteCode: string
    title: string
    subject: string
    description: string
    maxStudents: number
    studentsCount: number
    schedule: ScheduleItem[]
    status: string
    createdAt: string
}

const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]

const subjects = [
    "Computer Science", "Mathematics", "Physics", "Chemistry", "Biology",
    "English", "History", "Geography", "Economics", "Business Studies"
]

export default function TeacherClassroomPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isStudentManageDialogOpen, setIsStudentManageDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [initialLoading, setInitialLoading] = useState(true)
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
    const [classroomStudents, setClassroomStudents] = useState<any[]>([])
    const [studentsLoading, setStudentsLoading] = useState(false)

    const [formData, setFormData] = useState<ClassroomFormData>({
        title: "",
        subject: "",
        description: "",
        maxStudents: 30,
        schedule: []
    })

    const [newSchedule, setNewSchedule] = useState<ScheduleItem>({
        day: "",
        startTime: "",
        endTime: ""
    })

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

    const handleInputChange = (field: keyof ClassroomFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const addScheduleItem = () => {
        if (!newSchedule.day || !newSchedule.startTime || !newSchedule.endTime) {
            toast({
                title: "Error",
                description: "Please fill all schedule fields",
                variant: "destructive"
            })
            return
        }

        if (formData.schedule.some(item => item.day === newSchedule.day)) {
            toast({
                title: "Error",
                description: "Schedule for this day already exists",
                variant: "destructive"
            })
            return
        }

        setFormData(prev => ({
            ...prev,
            schedule: [...prev.schedule, newSchedule]
        }))

        setNewSchedule({ day: "", startTime: "", endTime: "" })
    }

    const removeScheduleItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            schedule: prev.schedule.filter((_, i) => i !== index)
        }))
    }

    const generateClassroomId = () => {
        const prefix = formData.subject.split(' ').map(word => word.charAt(0)).join('').toUpperCase()
        const number = Math.floor(Math.random() * 900) + 100
        return `${prefix}${number}`
    }

    const handleCreateClassroom = async () => {
        if (!formData.title || !formData.subject || !formData.description || formData.schedule.length === 0) {
            toast({
                title: "Error",
                description: "Please fill all required fields and add at least one schedule",
                variant: "destructive"
            })
            return
        }

        if (!currentUser) {
            toast({
                title: "Error",
                description: "Please log in to create a classroom",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/classrooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    teacherId: currentUser._id || currentUser.id
                })
            })

            if (response.ok) {
                const data = await response.json()
                setClassrooms(prev => [data.classroom, ...prev])

                toast({
                    title: "Success",
                    description: "Classroom created successfully!",
                })

                setFormData({
                    title: "",
                    subject: "",
                    description: "",
                    maxStudents: 30,
                    schedule: []
                })
                setIsCreateDialogOpen(false)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to create classroom",
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

    const copyClassroomCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast({
            title: "Copied",
            description: "Classroom code copied to clipboard",
        })
    }

    const handleEditClassroom = (classroom: Classroom) => {
        setSelectedClassroom(classroom)
        setFormData({
            title: classroom.title,
            subject: classroom.subject,
            description: classroom.description,
            maxStudents: classroom.maxStudents,
            schedule: classroom.schedule
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdateClassroom = async () => {
        if (!formData.title || !formData.subject || !formData.description || formData.schedule.length === 0) {
            toast({
                title: "Error",
                description: "Please fill all required fields and add at least one schedule",
                variant: "destructive"
            })
            return
        }

        if (!selectedClassroom || !currentUser) {
            toast({
                title: "Error",
                description: "Missing classroom or user information",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/classrooms', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    classroomId: selectedClassroom._id,
                    teacherId: currentUser._id || currentUser.id
                })
            })

            if (response.ok) {
                const data = await response.json()
                setClassrooms(prev => prev.map(c =>
                    c._id === selectedClassroom._id ? data.classroom : c
                ))

                toast({
                    title: "Success",
                    description: "Classroom updated successfully!",
                })

                setFormData({
                    title: "",
                    subject: "",
                    description: "",
                    maxStudents: 30,
                    schedule: []
                })
                setIsEditDialogOpen(false)
                setSelectedClassroom(null)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to update classroom",
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

    const handleDeleteClassroom = (classroom: Classroom) => {
        setSelectedClassroom(classroom)
        setIsDeleteDialogOpen(true)
    }

    const confirmDeleteClassroom = async () => {
        if (!selectedClassroom || !currentUser) {
            toast({
                title: "Error",
                description: "Missing classroom or user information",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/classrooms?classroomId=${selectedClassroom._id}&teacherId=${currentUser._id || currentUser.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setClassrooms(prev => prev.filter(c => c._id !== selectedClassroom._id))

                toast({
                    title: "Success",
                    description: "Classroom deleted successfully!",
                })

                setIsDeleteDialogOpen(false)
                setSelectedClassroom(null)
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to delete classroom",
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

    const handleManageStudents = async (classroom: Classroom) => {
        setSelectedClassroom(classroom)
        setIsStudentManageDialogOpen(true)
        setStudentsLoading(true)

        try {
            const response = await fetch(`/api/classrooms/${classroom._id}/students`)
            if (response.ok) {
                const data = await response.json()
                setClassroomStudents(data.students || [])
            }
        } catch (error) {
            console.error('Error fetching students:', error)
            toast({
                title: "Error",
                description: "Failed to load students",
                variant: "destructive"
            })
        } finally {
            setStudentsLoading(false)
        }
    }

    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedClassroom) return

        try {
            const response = await fetch(`/api/classrooms/${selectedClassroom._id}/students`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ studentId })
            })

            if (response.ok) {
                setClassroomStudents(prev => prev.filter(s => s.studentId !== studentId))
                setClassrooms(prev => prev.map(c =>
                    c._id === selectedClassroom._id
                        ? { ...c, studentsCount: c.studentsCount - 1 }
                        : c
                ))
                toast({
                    title: "Success",
                    description: "Student removed from classroom",
                })
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Failed to remove student",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive"
            })
        }
    }

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    return (
        <div className="min-h-screen bg-black flex">
            <TeacherSidebar />

            <main className="flex-1 overflow-auto">
                <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
                    <div className="px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">My Classrooms</h1>
                                <p className="text-zinc-400">Create and manage your virtual classrooms</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Classroom
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Create New Classroom</DialogTitle>
                                        </DialogHeader>

                                        <div className="space-y-6 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="title" className="text-white">Classroom Title *</Label>
                                                    <Input
                                                        id="title"
                                                        placeholder="e.g., Introduction to Computer Science"
                                                        value={formData.title}
                                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                                        className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="subject" className="text-white">Subject *</Label>
                                                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                                                        <SelectTrigger className="mt-1 bg-zinc-800/50 border-zinc-700 text-white">
                                                            <SelectValue placeholder="Select subject" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                                            {subjects.map((subject) => (
                                                                <SelectItem key={subject} value={subject} className="text-white hover:bg-zinc-700">
                                                                    {subject}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="description" className="text-white">Description *</Label>
                                                <Textarea
                                                    id="description"
                                                    placeholder="Describe what students will learn in this classroom..."
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    rows={3}
                                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white resize-none"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="maxStudents" className="text-white">Maximum Students</Label>
                                                <Input
                                                    id="maxStudents"
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={formData.maxStudents}
                                                    onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 30)}
                                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-white mb-3 block">Class Schedule *</Label>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                                    <Select value={newSchedule.day} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, day: value }))}>
                                                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                                            <SelectValue placeholder="Day" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                                            {daysOfWeek.map((day) => (
                                                                <SelectItem key={day} value={day} className="text-white hover:bg-zinc-700">
                                                                    {day}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <Input
                                                        type="time"
                                                        placeholder="Start Time"
                                                        value={newSchedule.startTime}
                                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                                                        className="bg-zinc-800/50 border-zinc-700 text-white"
                                                    />

                                                    <Input
                                                        type="time"
                                                        placeholder="End Time"
                                                        value={newSchedule.endTime}
                                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                                                        className="bg-zinc-800/50 border-zinc-700 text-white"
                                                    />

                                                    <Button
                                                        type="button"
                                                        onClick={addScheduleItem}
                                                        variant="outline"
                                                        className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>

                                                {formData.schedule.length > 0 && (
                                                    <div className="space-y-2">
                                                        {formData.schedule.map((item, index) => (
                                                            <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                                                                <span className="text-white text-sm">
                                                                    {item.day}: {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                                </span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeScheduleItem(index)}
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsCreateDialogOpen(false)}
                                                    className="border-zinc-700 text-zinc-400 hover:text-white"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleCreateClassroom}
                                                    disabled={loading}
                                                    className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                                >
                                                    {loading ? 'Creating...' : 'Create Classroom'}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Edit Classroom</DialogTitle>
                                        </DialogHeader>

                                        <div className="space-y-6 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="edit-title" className="text-white">Classroom Title *</Label>
                                                    <Input
                                                        id="edit-title"
                                                        placeholder="e.g., Introduction to Computer Science"
                                                        value={formData.title}
                                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                                        className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="edit-subject" className="text-white">Subject *</Label>
                                                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                                                        <SelectTrigger className="mt-1 bg-zinc-800/50 border-zinc-700 text-white">
                                                            <SelectValue placeholder="Select subject" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                                            {subjects.map((subject) => (
                                                                <SelectItem key={subject} value={subject} className="text-white hover:bg-zinc-700">
                                                                    {subject}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="edit-description" className="text-white">Description *</Label>
                                                <Textarea
                                                    id="edit-description"
                                                    placeholder="Describe what students will learn in this classroom..."
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    rows={3}
                                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white resize-none"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="edit-maxStudents" className="text-white">Maximum Students</Label>
                                                <Input
                                                    id="edit-maxStudents"
                                                    type="number"
                                                    min="1"
                                                    max="200"
                                                    value={formData.maxStudents}
                                                    onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 30)}
                                                    className="mt-1 bg-zinc-800/50 border-zinc-700 text-white"
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-white mb-3 block">Class Schedule *</Label>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                                    <Select value={newSchedule.day} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, day: value }))}>
                                                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                                                            <SelectValue placeholder="Day" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                                            {daysOfWeek.map((day) => (
                                                                <SelectItem key={day} value={day} className="text-white hover:bg-zinc-700">
                                                                    {day}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <Input
                                                        type="time"
                                                        placeholder="Start Time"
                                                        value={newSchedule.startTime}
                                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                                                        className="bg-zinc-800/50 border-zinc-700 text-white"
                                                    />

                                                    <Input
                                                        type="time"
                                                        placeholder="End Time"
                                                        value={newSchedule.endTime}
                                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                                                        className="bg-zinc-800/50 border-zinc-700 text-white"
                                                    />

                                                    <Button
                                                        type="button"
                                                        onClick={addScheduleItem}
                                                        variant="outline"
                                                        className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>

                                                {formData.schedule.length > 0 && (
                                                    <div className="space-y-2">
                                                        {formData.schedule.map((item, index) => (
                                                            <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                                                                <span className="text-white text-sm">
                                                                    {item.day}: {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                                </span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeScheduleItem(index)}
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsEditDialogOpen(false)
                                                        setSelectedClassroom(null)
                                                        setFormData({
                                                            title: "",
                                                            subject: "",
                                                            description: "",
                                                            maxStudents: 30,
                                                            schedule: []
                                                        })
                                                    }}
                                                    className="border-zinc-700 text-zinc-400 hover:text-white"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleUpdateClassroom}
                                                    disabled={loading}
                                                    className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                                >
                                                    {loading ? 'Updating...' : 'Update Classroom'}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={isStudentManageDialogOpen} onOpenChange={setIsStudentManageDialogOpen}>
                                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">
                                                Manage Students - {selectedClassroom?.title}
                                            </DialogTitle>
                                        </DialogHeader>

                                        <div className="py-4">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-zinc-400 text-sm">
                                                        {classroomStudents.length} of {selectedClassroom?.maxStudents} students enrolled
                                                    </p>
                                                </div>
                                                <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30">
                                                    {selectedClassroom?.inviteCode}
                                                </Badge>
                                            </div>

                                            {studentsLoading ? (
                                                <div className="text-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                                                    <p className="text-zinc-400 mt-2">Loading students...</p>
                                                </div>
                                            ) : classroomStudents.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                                    <p className="text-zinc-400">No students enrolled yet</p>
                                                    <p className="text-zinc-500 text-sm mt-1">Share the invite code for students to join</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {classroomStudents.map((student) => (
                                                        <div key={student.studentId} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                                    <Users className="h-4 w-4 text-blue-400" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-medium">{student.studentName}</h4>
                                                                    <p className="text-zinc-400 text-sm">{student.studentEmail}</p>
                                                                    {student.studentRollNumber && (
                                                                        <p className="text-zinc-500 text-xs">Roll: {student.studentRollNumber}</p>
                                                                    )}
                                                                    <p className="text-zinc-500 text-xs">
                                                                        Joined {new Date(student.enrolledAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                                                                    Active
                                                                </Badge>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveStudent(student.studentId)}
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <UserMenu />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg">
                                        <BookOpen className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{initialLoading ? '--' : classrooms.length}</p>
                                        <p className="text-zinc-400 text-sm">Total Classrooms</p>
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
                                            {initialLoading ? '--' : classrooms.reduce((sum, classroom) => sum + classroom.studentsCount, 0)}
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
                                        <Calendar className="h-6 w-6 text-[#e78a53]" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {initialLoading ? '--' : classrooms.filter(c => c.status === 'active').length}
                                        </p>
                                        <p className="text-zinc-400 text-sm">Active Classes</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {initialLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                            <p className="text-zinc-400 mt-2">Loading classrooms...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {classrooms.map((classroom) => (
                                <Card key={classroom._id} className="bg-zinc-900/50 border-zinc-800">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-white">{classroom.title}</h3>
                                                    <Badge className="bg-[#e78a53]/10 text-[#e78a53] border-[#e78a53]/30">
                                                        {classroom.subject}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-zinc-700 text-zinc-400 cursor-pointer hover:bg-zinc-800/50"
                                                        onClick={() => copyClassroomCode(classroom.inviteCode || classroom.classroomId)}
                                                    >
                                                        <Copy className="h-3 w-3 mr-1" />
                                                        {classroom.inviteCode || classroom.classroomId}
                                                    </Badge>
                                                </div>
                                                <p className="text-zinc-300 mb-4">{classroom.description}</p>
                                            </div>

                                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                    <Users className="h-4 w-4" />
                                                    <span>{classroom.studentsCount}/{classroom.maxStudents} students</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Created {new Date(classroom.createdAt).toLocaleDateString()}</span>
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

                                            <div className="flex flex-col gap-2">
                                                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-zinc-700 text-zinc-400 hover:text-white"
                                                    onClick={() => handleManageStudents(classroom)}
                                                >
                                                    <UserCheck className="h-4 w-4 mr-2" />
                                                    Manage Students
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                                            <div className="flex gap-2">
                                                <Link href="/teacher/classroom/attendance">
                                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        Attendance
                                                    </Button>
                                                </Link>
                                                <Link href="/teacher/classroom/materials">
                                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Materials
                                                    </Button>
                                                </Link>
                                                <Link href="/teacher/classroom/schedule">
                                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        Schedule
                                                    </Button>
                                                </Link>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-zinc-400 hover:text-white"
                                                    onClick={() => handleEditClassroom(classroom)}
                                                >
                                                    <Edit3 className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-zinc-400">
                                                                This will permanently delete "{classroom.title}" and remove all {classroom.studentsCount} enrolled students. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white">
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                                onClick={() => {
                                                                    setSelectedClassroom(classroom)
                                                                    confirmDeleteClassroom()
                                                                }}
                                                            >
                                                                Delete Classroom
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {classrooms.length === 0 && !initialLoading && (
                                <div className="text-center py-16">
                                    <BookOpen className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No Classrooms Yet</h3>
                                    <p className="text-zinc-400 mb-6">Create your first classroom to get started with teaching</p>
                                    <Button
                                        onClick={() => setIsCreateDialogOpen(true)}
                                        className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Classroom
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
