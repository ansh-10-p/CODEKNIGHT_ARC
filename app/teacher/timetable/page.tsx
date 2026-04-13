"use client"

import React, { useState, useEffect } from "react"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users, 
  Clock,
  Save,
  X,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  getCurrentTeacherId, 
  getCurrentTeacherInfo, 
  redirectIfNotAuthenticated 
} from "@/lib/auth-middleware"

interface Lecture {
  _id: string
  day: string
  timeSlot: string
  subjectName: string
  className: string
  teacherId: string
}

const slots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 01:00",
    "01:00 - 02:00",
    "02:00 - 03:00",
    "03:00 - 04:00",
]
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const breakSlots = ["12:00 - 01:00"]

// Common subjects and classes for dropdowns
const subjects = [
  "Algorithm and Analysis (AOA)",
  "Microprocessor (MP)",
  "Mathematics",
  "Data Structures",
  "Computer Networks",
  "Database Management",
  "Software Engineering",
  "Operating Systems",
  "Web Development",
  "Machine Learning"
]

const classes = [
  "SE-A", "SE-B", "TE-A", "TE-B", "BE-A", "BE-B",
  "FE-A", "FE-B", "SY-A", "SY-B"
]

export default function TeacherTimetablePage() {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [formData, setFormData] = useState({
    subjectName: "",
    className: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTeacher, setCurrentTeacher] = useState<any>(null)

  // Check authentication and load teacher data
  useEffect(() => {
    if (!redirectIfNotAuthenticated()) {
      return
    }
    
    const teacherInfo = getCurrentTeacherInfo()
    if (!teacherInfo) {
      window.location.href = '/login'
      return
    }
    
    setCurrentTeacher(teacherInfo)
    loadTimetable()
  }, [])

  // Load timetable data from MongoDB
  const loadTimetable = async () => {
    try {
      setIsPageLoading(true)
      const teacherId = getCurrentTeacherId()
      if (!teacherId) throw new Error('No teacher ID found')
      
      const response = await fetch(`/api/timetable?teacherId=${teacherId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load timetable')
      }
      
      setLectures(data.lectures || [])
      setError(null)
    } catch (err: any) {
      console.error('Error loading timetable:', err)
      setError(err.message || 'Failed to load timetable')
    } finally {
      setIsPageLoading(false)
    }
  }

  // Get lecture for a specific day and time slot
  const getLecture = (day: string, timeSlot: string): Lecture | null => {
    return lectures.find(lecture => 
      lecture.day === day && 
      lecture.timeSlot === timeSlot
    ) || null
  }

  // Open modal for adding new lecture
  const openAddLectureModal = (day: string, timeSlot: string) => {
    if (breakSlots.includes(timeSlot)) return
    
    setEditingLecture(null)
    setSelectedDay(day)
    setSelectedSlot(timeSlot)
    setFormData({ subjectName: "", className: "" })
    setIsModalOpen(true)
    setError(null)
  }

  // Open modal for editing existing lecture
  const openEditLectureModal = (lecture: Lecture) => {
    setEditingLecture(lecture)
    setSelectedDay(lecture.day)
    setSelectedSlot(lecture.timeSlot)
    setFormData({ 
      subjectName: lecture.subjectName, 
      className: lecture.className 
    })
    setIsModalOpen(true)
    setError(null)
  }

  // Add new lecture to MongoDB
  const addLecture = async () => {
    if (!formData.subjectName || !formData.className) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const teacherId = getCurrentTeacherId()
      if (!teacherId) throw new Error('No teacher ID found')
      
      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          day: selectedDay,
          timeSlot: selectedSlot,
          subjectName: formData.subjectName,
          className: formData.className
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add lecture')
      }
      
      // Reload the timetable to show the new lecture
      await loadTimetable()
      closeModal()
    } catch (err: any) {
      console.error('Error adding lecture:', err)
      setError(err.message || 'Failed to add lecture')
    } finally {
      setIsLoading(false)
    }
  }

  // Update existing lecture in MongoDB
  const updateLecture = async () => {
    if (!editingLecture || !formData.subjectName || !formData.className) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/timetable', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: editingLecture._id,
          subjectName: formData.subjectName,
          className: formData.className
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lecture')
      }
      
      // Reload the timetable to show the updated lecture
      await loadTimetable()
      closeModal()
    } catch (err: any) {
      console.error('Error updating lecture:', err)
      setError(err.message || 'Failed to update lecture')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete lecture from MongoDB
  const deleteLecture = async (lectureId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/timetable?lectureId=${lectureId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete lecture')
      }
      
      // Reload the timetable to remove the deleted lecture
      await loadTimetable()
    } catch (err: any) {
      console.error('Error deleting lecture:', err)
      setError(err.message || 'Failed to delete lecture')
    }
  }

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLecture(null)
    setSelectedDay("")
    setSelectedSlot("")
    setFormData({ subjectName: "", className: "" })
    setError(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingLecture) {
      await updateLecture()
    } else {
      await addLecture()
    }
  }

  // Show loading screen while page is loading
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#e78a53] mx-auto mb-4" />
          <p className="text-white">Loading your timetable...</p>
        </div>
      </div>
    )
  }

  // Show error if teacher not found
  if (!currentTeacher) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-white">Authentication required</p>
          <p className="text-zinc-400 mt-2">Please log in as a teacher</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <TeacherSidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Timetable Management</h1>
                <p className="text-zinc-400 mt-2">Manage your lectures and class schedules</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]">
                  <Users className="h-4 w-4 mr-1" />
                  {currentTeacher?.name || 'Teacher'}
                </Badge>
                <Badge className="bg-blue-500/10 border-blue-500/30 text-blue-400">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {lectures.length} Lectures
                </Badge>
              </div>
            </div>
            
            {error && (
              <Alert className="mt-4 border-red-500/30 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </header>

        <div className="p-8">
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid" style={{ gridTemplateColumns: `180px repeat(${slots.length}, minmax(160px, 1fr))` }}>
                  <div className="sticky left-0 z-10 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-300">
                    Day / Time
                  </div>
                  {slots.map((s) => (
                    <div key={s} className={`border-b border-l border-zinc-800 px-4 py-3 text-sm font-semibold ${
                      breakSlots.includes(s) ? 'text-[#e78a53]' : 'text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {s}
                        {breakSlots.includes(s) }
                      </div>
                    </div>
                  ))}

                  {days.map((d) => (
                    <React.Fragment key={d}>
                      <div className="sticky left-0 z-10 bg-zinc-900/80 backdrop-blur-sm border-t border-b border-zinc-800 px-4 py-3 text-zinc-200 font-medium">
                        {d}
                      </div>
                      {slots.map((s) => {
                        const lecture = getLecture(d, s)
                        const isBreakSlot = breakSlots.includes(s)
                        
                        return (
                          <div 
                            key={`${d}|${s}`} 
                            className={`border-t border-l border-zinc-800 px-2 py-3 min-h-[80px] ${
                              isBreakSlot 
                                ? 'bg-zinc-800/40' 
                                : lecture 
                                  ? 'bg-[#e78a53]/5 border-[#e78a53]/20 hover:bg-[#e78a53]/10' 
                                  : 'hover:bg-zinc-800/50 cursor-pointer'
                            } transition-colors`}
                            onClick={() => !isBreakSlot && !lecture && openAddLectureModal(d, s)}
                          >
                            {isBreakSlot ? (
                              <div className="flex items-center justify-center h-full">
                                <Badge className="bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Break
                                </Badge>
                              </div>
                            ) : lecture ? (
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 mb-1">
                                      <BookOpen className="h-3 w-3 text-[#e78a53]" />
                                      <p className="text-xs font-semibold text-[#e78a53] truncate">
                                        {lecture.subjectName}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3 text-zinc-400" />
                                      <p className="text-xs text-zinc-300">
                                        {lecture.className}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 ml-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openEditLectureModal(lecture)
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteLecture(lecture._id)
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-zinc-500 hover:text-zinc-400 transition-colors">
                                <div className="text-center">
                                  <Plus className="h-4 w-4 mx-auto mb-1" />
                                  <p className="text-xs">Add Lecture</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Lecture Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingLecture ? (
                  <>
                    <Edit className="h-5 w-5 text-blue-400" />
                    Edit Lecture
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-[#e78a53]" />
                    Add New Lecture
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Day</Label>
                  <Input 
                    value={selectedDay} 
                    disabled 
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-400"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Time Slot</Label>
                  <Input 
                    value={selectedSlot} 
                    disabled 
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-400"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject" className="text-zinc-300">Subject Name</Label>
                <Select 
                  value={formData.subjectName} 
                  onValueChange={(value) => setFormData({...formData, subjectName: value})}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Select a subject" />
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
              
              <div>
                <Label htmlFor="class" className="text-zinc-300">Class Name</Label>
                <Select 
                  value={formData.className} 
                  onValueChange={(value) => setFormData({...formData, className: value})}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {classes.map((className) => (
                      <SelectItem key={className} value={className} className="text-white hover:bg-zinc-700">
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeModal}
                  disabled={isLoading}
                  className="border-zinc-700 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                  disabled={!formData.subjectName || !formData.className || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isLoading 
                    ? (editingLecture ? 'Updating...' : 'Adding...')
                    : (editingLecture ? 'Update' : 'Add') + ' Lecture'
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}


