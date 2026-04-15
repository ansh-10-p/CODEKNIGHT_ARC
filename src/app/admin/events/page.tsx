"use client"

import React, { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Loader2,
  AlertCircle,
  Eye,
  Clock,
  MapPin,
  Users,
  X,
  IndianRupee,
  UserCheck,
  TrendingUp,
  Receipt,
  Download,
  CreditCard
} from "lucide-react"
import { redirectIfNotAuthenticatedAdmin } from '@/lib/auth-middleware'

interface Event {
  _id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  venue: string
  organizer: string
  contactEmail?: string
  contactPhone?: string
  maxParticipants?: number
  registrationDeadline?: string
  fee: number
  status: string
  imageUrl?: string
  tags: string[]
  requirements: string[]
  isPublic: boolean
  createdAt: string
  // Booking statistics
  bookingStats?: {
    totalBookings: number
    paidBookings: number
    pendingBookings: number
    totalRevenue: number
    pendingRevenue: number
  }
  participants?: EventParticipant[]
}

interface EventParticipant {
  _id: string
  bookingId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  paymentStatus: string
  bookingStatus: string
  totalAmount: number
  paymentMethod: string
  razorpayPaymentId?: string
  registrationDate: string
  specialRequirements?: string
}

export default function AdminEventsPage() {
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    organizer: '',
    contactEmail: '',
    contactPhone: '',
    maxParticipants: '',
    registrationDeadline: '',
    fee: '0',
    status: 'draft',
    tags: '',
    requirements: '',
    isPublic: true
  })

  useEffect(() => {
    if (!redirectIfNotAuthenticatedAdmin()) {
      return
    }
    
    loadEvents()
    setIsPageLoading(false)
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, statusFilter, eventTypeFilter])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/events?includeStats=true')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load events')
      }

      setEvents(data.events || [])
    } catch (error: any) {
      setError(error.message || 'Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter)
    }

    if (eventTypeFilter && eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter)
    }

    setFilteredEvents(filtered)
  }

  const loadEventParticipants = async (eventId: string) => {
    try {
      setLoadingParticipants(true)
      const response = await fetch(`/api/event-bookings?eventId=${eventId}&limit=1000`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load participants')
      }

      // Update the selected event with participants data
      if (selectedEvent && selectedEvent._id === eventId) {
        const participants = data.bookings.map((booking: any) => ({
          _id: booking._id,
          bookingId: booking.bookingId,
          studentName: booking.studentName,
          studentEmail: booking.studentEmail,
          studentPhone: booking.studentPhone,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,
          totalAmount: booking.totalAmount,
          paymentMethod: booking.paymentMethod,
          razorpayPaymentId: booking.razorpayPaymentId,
          registrationDate: booking.createdAt,
          specialRequirements: booking.specialRequirements
        }))
        
        setSelectedEvent({
          ...selectedEvent,
          participants
        })
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load participants')
    } finally {
      setLoadingParticipants(false)
    }
  }

  const viewEventParticipants = async (event: Event) => {
    setSelectedEvent(event)
    setParticipantsModalOpen(true)
    await loadEventParticipants(event._id)
  }

  const generateEventReport = (event: Event) => {
    if (!event.participants || event.participants.length === 0) {
      alert('No participants data available for this event.')
      return
    }

    const reportWindow = window.open('', '_blank')
    if (!reportWindow) return
    
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event Report - ${event.title}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
          .participants-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .participants-table th, .participants-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .participants-table th { background-color: #f5f5f5; }
          .status-paid { color: green; font-weight: bold; }
          .status-pending { color: orange; font-weight: bold; }
          .status-failed { color: red; font-weight: bold; }
          .print-btn { margin: 20px 0; padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Event Report</h1>
          <h2>${event.title}</h2>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Registrations</h3>
            <p style="font-size: 24px; font-weight: bold;">${event.bookingStats?.totalBookings || 0}</p>
          </div>
          <div class="summary-card">
            <h3>Paid Bookings</h3>
            <p style="font-size: 24px; font-weight: bold; color: green;">${event.bookingStats?.paidBookings || 0}</p>
          </div>
          <div class="summary-card">
            <h3>Total Revenue</h3>
            <p style="font-size: 24px; font-weight: bold; color: #e78a53;">₹${event.bookingStats?.totalRevenue || 0}</p>
          </div>
          <div class="summary-card">
            <h3>Pending Revenue</h3>
            <p style="font-size: 24px; font-weight: bold; color: orange;">₹${event.bookingStats?.pendingRevenue || 0}</p>
          </div>
        </div>
        
        <h3>Participants List</h3>
        <table class="participants-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th>Payment Method</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            ${event.participants.map(participant => `
              <tr>
                <td>${participant.bookingId}</td>
                <td>${participant.studentName}</td>
                <td>${participant.studentEmail}</td>
                <td>${participant.studentPhone}</td>
                <td>₹${participant.totalAmount}</td>
                <td class="status-${participant.paymentStatus}">${participant.paymentStatus.toUpperCase()}</td>
                <td>${participant.paymentMethod}</td>
                <td>${new Date(participant.registrationDate).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <button class="print-btn" onclick="window.print()">Print Report</button>
      </body>
      </html>
    `
    
    reportWindow.document.write(reportHtml)
    reportWindow.document.close()
    reportWindow.focus()
  }

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0],
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        organizer: event.organizer,
        contactEmail: event.contactEmail || '',
        contactPhone: event.contactPhone || '',
        maxParticipants: event.maxParticipants?.toString() || '',
        registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
        fee: event.fee.toString(),
        status: event.status,
        tags: event.tags.join(', '),
        requirements: event.requirements.join(', '),
        isPublic: event.isPublic
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        description: '',
        eventType: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        venue: '',
        organizer: '',
        contactEmail: '',
        contactPhone: '',
        maxParticipants: '',
        registrationDeadline: '',
        fee: '0',
        status: 'draft',
        tags: '',
        requirements: '',
        isPublic: true
      })
    }
    setModalOpen(true)
    setError(null)
  }

  const saveEvent = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const eventData = {
        ...formData,
        fee: parseInt(formData.fee) || 0,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        requirements: formData.requirements ? formData.requirements.split(',').map(req => req.trim()).filter(req => req) : []
      }

      const url = editingEvent ? `/api/admin/events?id=${editingEvent._id}` : '/api/admin/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save event')
      }

      await loadEvents()
      setModalOpen(false)
      alert(editingEvent ? 'Event updated successfully' : 'Event created successfully')
    } catch (error: any) {
      setError(error.message || 'Failed to save event')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete event')
      }

      await loadEvents()
      alert('Event deleted successfully')
    } catch (error: any) {
      setError(error.message || 'Failed to delete event')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      published: 'bg-green-500/20 border-green-500/30 text-green-400',
      ongoing: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      completed: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cancelled: 'bg-red-500/20 border-red-500/30 text-red-400'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const getEventTypeBadge = (eventType: string) => {
    const colors = {
      academic: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      cultural: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      sports: 'bg-green-500/20 border-green-500/30 text-green-400',
      workshop: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      seminar: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      other: 'bg-gray-500/20 border-gray-500/30 text-gray-400'
    }
    return colors[eventType as keyof typeof colors] || colors.other
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#e78a53] mx-auto mb-4" />
          <p className="text-white">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Events Management</h1>
                <p className="text-zinc-400 mt-2">Create and manage campus events</p>
              </div>
              <Button onClick={() => openModal()} className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
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
          {/* Filters */}
          <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setEventTypeFilter('all')
                  }}
                  className="border-zinc-700 text-zinc-400"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#e78a53]" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
                  <p className="text-zinc-400">No events found</p>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((event) => (
                <Card key={event._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                          <Badge className={getStatusBadge(event.status)}>
                            {event.status}
                          </Badge>
                          <Badge className={getEventTypeBadge(event.eventType)}>
                            {event.eventType}
                          </Badge>
                        </div>
                        
                        <p className="text-zinc-400 mb-4 line-clamp-2">{event.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Clock className="h-4 w-4" />
                            {event.startTime} - {event.endTime}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <MapPin className="h-4 w-4" />
                            {event.venue}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Users className="h-4 w-4" />
                            {event.organizer}
                          </div>
                        </div>
                        
                        {/* Booking Statistics */}
                        {event.bookingStats && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm p-3 bg-zinc-800/30 rounded-lg">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <UserCheck className="h-4 w-4 text-blue-400" />
                                <span className="text-zinc-400">Registrations</span>
                              </div>
                              <p className="text-white font-semibold">{event.bookingStats.totalBookings}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <CreditCard className="h-4 w-4 text-green-400" />
                                <span className="text-zinc-400">Paid</span>
                              </div>
                              <p className="text-green-400 font-semibold">{event.bookingStats.paidBookings}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <IndianRupee className="h-4 w-4 text-[#e78a53]" />
                                <span className="text-zinc-400">Revenue</span>
                              </div>
                              <p className="text-[#e78a53] font-semibold">₹{event.bookingStats.totalRevenue}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <TrendingUp className="h-4 w-4 text-yellow-400" />
                                <span className="text-zinc-400">Pending</span>
                              </div>
                              <p className="text-yellow-400 font-semibold">₹{event.bookingStats.pendingRevenue}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEvent(event)
                              setDetailModalOpen(true)
                            }}
                            className="border-zinc-700 text-zinc-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModal(event)}
                            className="border-zinc-700 text-zinc-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEvent(event._id)}
                            className="border-red-600 text-red-400 hover:bg-red-600/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {event.bookingStats && event.bookingStats.totalBookings > 0 && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewEventParticipants(event)}
                              className="border-blue-600 text-blue-400 hover:bg-blue-600/20 text-xs"
                            >
                              <Users className="h-3 w-3 mr-1" />
                              Participants
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateEventReport(event)}
                              className="border-green-600 text-green-400 hover:bg-green-600/20 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Report
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingEvent ? (
                  <>
                    <Edit className="h-5 w-5 text-blue-400" />
                    Edit Event
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-[#e78a53]" />
                    Add Event
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {error && (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Event Type *</Label>
                  <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value})}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-zinc-300">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  placeholder="Event description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Start Time *</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">End Time *</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Venue *</Label>
                  <Input
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="Event venue"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Organizer *</Label>
                  <Input
                    value={formData.organizer}
                    onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="Event organizer"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Contact Phone</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-zinc-300">Max Participants</Label>
                  <Input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="Leave empty for no limit"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Registration Deadline</Label>
                  <Input
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Fee (₹)</Label>
                  <Input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({...formData, fee: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Visibility</Label>
                  <Select value={formData.isPublic ? 'public' : 'private'} onValueChange={(value) => setFormData({...formData, isPublic: value === 'public'})}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Tags (comma separated)</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="workshop, ai, technology"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Requirements (comma separated)</Label>
                  <Input
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="laptop, notebook, pen"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setModalOpen(false)}
                  disabled={isLoading}
                  className="border-zinc-700 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={saveEvent}
                  className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                  disabled={isLoading || !formData.title || !formData.description || !formData.eventType || !formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime || !formData.venue || !formData.organizer}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  {isLoading 
                    ? (editingEvent ? 'Updating...' : 'Creating...')
                    : (editingEvent ? 'Update' : 'Create') + ' Event'
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#e78a53]" />
                Event Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{selectedEvent.title}</h3>
                  <div className="flex gap-2 mb-4">
                    <Badge className={getStatusBadge(selectedEvent.status)}>
                      {selectedEvent.status}
                    </Badge>
                    <Badge className={getEventTypeBadge(selectedEvent.eventType)}>
                      {selectedEvent.eventType}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-400">Start Date</p>
                    <p className="text-white">{new Date(selectedEvent.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">End Date</p>
                    <p className="text-white">{new Date(selectedEvent.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Time</p>
                    <p className="text-white">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Venue</p>
                    <p className="text-white">{selectedEvent.venue}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Organizer</p>
                    <p className="text-white">{selectedEvent.organizer}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Fee</p>
                    <p className="text-white">₹{selectedEvent.fee}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-zinc-400 mb-2">Description</p>
                  <p className="text-white">{selectedEvent.description}</p>
                </div>
                
                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                  <div>
                    <p className="text-zinc-400 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.tags.map((tag, index) => (
                        <Badge key={index} className="bg-zinc-700 text-zinc-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
                  <div>
                    <p className="text-zinc-400 mb-2">Requirements</p>
                    <ul className="list-disc list-inside text-white space-y-1">
                      {selectedEvent.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedEvent.contactEmail && (
                  <div>
                    <p className="text-zinc-400">Contact Email</p>
                    <p className="text-white">{selectedEvent.contactEmail}</p>
                  </div>
                )}
                
                {selectedEvent.contactPhone && (
                  <div>
                    <p className="text-zinc-400">Contact Phone</p>
                    <p className="text-white">{selectedEvent.contactPhone}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Participants Modal */}
        <Dialog open={participantsModalOpen} onOpenChange={setParticipantsModalOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#e78a53]" />
                Event Participants - {selectedEvent?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="space-y-6">
                {/* Summary Stats */}
                {selectedEvent.bookingStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4 text-center">
                        <UserCheck className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{selectedEvent.bookingStats.totalBookings}</p>
                        <p className="text-zinc-400 text-sm">Total Registrations</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4 text-center">
                        <CreditCard className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-400">{selectedEvent.bookingStats.paidBookings}</p>
                        <p className="text-zinc-400 text-sm">Paid Bookings</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4 text-center">
                        <IndianRupee className="h-8 w-8 text-[#e78a53] mx-auto mb-2" />
                        <p className="text-2xl font-bold text-[#e78a53]">₹{selectedEvent.bookingStats.totalRevenue}</p>
                        <p className="text-zinc-400 text-sm">Total Revenue</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-yellow-400">₹{selectedEvent.bookingStats.pendingRevenue}</p>
                        <p className="text-zinc-400 text-sm">Pending Revenue</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Participants List */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Participants List</h3>
                    <Button
                      onClick={() => generateEventReport(selectedEvent)}
                      className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                      disabled={!selectedEvent.participants || selectedEvent.participants.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                  
                  {loadingParticipants ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[#e78a53] mx-auto mb-4" />
                      <p className="text-zinc-400">Loading participants...</p>
                    </div>
                  ) : selectedEvent.participants && selectedEvent.participants.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEvent.participants.map((participant) => (
                        <Card key={participant._id} className="bg-zinc-800/30 border-zinc-700">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-semibold text-white mb-2">{participant.studentName}</h4>
                                <div className="space-y-1 text-sm">
                                  <p className="text-zinc-400">
                                    <span className="text-zinc-500">Email:</span> {participant.studentEmail}
                                  </p>
                                  <p className="text-zinc-400">
                                    <span className="text-zinc-500">Phone:</span> {participant.studentPhone}
                                  </p>
                                  <p className="text-zinc-400">
                                    <span className="text-zinc-500">Booking ID:</span> {participant.bookingId}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${
                                      participant.paymentStatus === 'paid' 
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                        : participant.paymentStatus === 'pending'
                                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                                    }`}>
                                      {participant.paymentStatus.toUpperCase()}
                                    </Badge>
                                    <span className="text-[#e78a53] font-semibold">₹{participant.totalAmount}</span>
                                  </div>
                                  <p className="text-sm text-zinc-400">
                                    <span className="text-zinc-500">Method:</span> {participant.paymentMethod}
                                  </p>
                                  {participant.razorpayPaymentId && (
                                    <p className="text-xs text-zinc-500 font-mono">
                                      Payment ID: {participant.razorpayPaymentId}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <div className="space-y-1 text-sm">
                                  <p className="text-zinc-400">
                                    <span className="text-zinc-500">Registered:</span> {new Date(participant.registrationDate).toLocaleDateString()}
                                  </p>
                                  <Badge className={`${
                                    participant.bookingStatus === 'confirmed'
                                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                      : participant.bookingStatus === 'attended'
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                      : participant.bookingStatus === 'cancelled'
                                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                      : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                  }`}>
                                    {participant.bookingStatus.toUpperCase()}
                                  </Badge>
                                  {participant.specialRequirements && (
                                    <div className="mt-2 p-2 bg-zinc-900/50 rounded text-xs">
                                      <span className="text-zinc-500">Special Requirements:</span>
                                      <p className="text-zinc-300 mt-1">{participant.specialRequirements}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-400 text-lg">No participants yet</p>
                      <p className="text-zinc-500 text-sm">Participants will appear here once students register for this event.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
