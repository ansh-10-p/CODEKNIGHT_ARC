"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import {
  Bell,
  ChevronRight,
  Clock,
  User,
  Trophy,
  Lightbulb,
  Music,
  Palette,
  Code,
  Heart,
  Star,
  Eye,
  CalendarDays,
  Building,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  GraduationCap,
  Gamepad2,
  BookOpen,
  Megaphone
} from "lucide-react"
import { useEffect, useState } from "react"
import { EventBookingDialog } from "@/components/event-booking-dialog"

interface Event {
  _id: string
  title: string
  description: string
  eventType: 'academic' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'other'
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
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  imageUrl?: string
  tags: string[]
  requirements: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)

  useEffect(() => {
    fetchEvents()
    
    // Set up real-time polling to fetch new data every 30 seconds
    const interval = setInterval(() => {
      fetchEvents()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const demoEvents: Event[] = [
    { _id: "demo-e1", title: "Annual Tech Fest 2026", description: "Annual technology festival with coding competitions, hackathons and project exhibitions.", eventType: "academic", startDate: "2026-04-20", endDate: "2026-04-22", startTime: "09:00", endTime: "18:00", venue: "Main Auditorium", organizer: "CS Department", contactEmail: "techfest@campus.edu", maxParticipants: 500, registrationDeadline: "2026-04-18", fee: 0, status: "published", imageUrl: "", tags: ["coding", "hackathon", "tech"], requirements: [], isPublic: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: "demo-e2", title: "Cultural Night — Rang De", description: "A colourful evening of dance, music and drama performances by students.", eventType: "cultural", startDate: "2026-04-25", endDate: "2026-04-25", startTime: "18:00", endTime: "22:00", venue: "Open Air Theatre", organizer: "Student Council", contactEmail: "council@campus.edu", maxParticipants: 800, registrationDeadline: "2026-04-23", fee: 50, status: "published", imageUrl: "", tags: ["dance", "music", "cultural"], requirements: [], isPublic: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: "demo-e3", title: "AI/ML Workshop", description: "Hands-on workshop covering machine learning fundamentals, neural networks, and real-world deployment.", eventType: "workshop", startDate: "2026-05-03", endDate: "2026-05-04", startTime: "10:00", endTime: "17:00", venue: "Lab 301", organizer: "Prof. Priya Verma", contactEmail: "priya.verma@campus.edu", maxParticipants: 60, registrationDeadline: "2026-05-01", fee: 100, status: "published", imageUrl: "", tags: ["AI", "ML", "workshop"], requirements: ["Laptop"], isPublic: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: "demo-e4", title: "Inter-College Cricket Tournament", description: "Two-day cricket tournament with 8 college teams competing for the campus trophy.", eventType: "sports", startDate: "2026-05-10", endDate: "2026-05-11", startTime: "08:00", endTime: "18:00", venue: "Sports Ground", organizer: "Sports Department", contactEmail: "sports@campus.edu", maxParticipants: 200, registrationDeadline: "2026-05-07", fee: 200, status: "published", imageUrl: "", tags: ["cricket", "sports", "tournament"], requirements: [], isPublic: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: "demo-e5", title: "Guest Lecture: Industry 4.0", description: "A leading industry expert discusses the future of smart manufacturing, IoT and automation.", eventType: "seminar", startDate: "2026-04-30", endDate: "2026-04-30", startTime: "11:00", endTime: "13:00", venue: "Seminar Hall A", organizer: "Placement Cell", contactEmail: "placement@campus.edu", maxParticipants: 150, registrationDeadline: "2026-04-29", fee: 0, status: "published", imageUrl: "", tags: ["industry", "IoT", "career"], requirements: [], isPublic: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: "demo-e6", title: "Photography Contest", description: "Capture campus life in a frame. Submit your best shots across 4 themes.", eventType: "cultural", startDate: "2026-05-07", endDate: "2026-05-07", startTime: "08:00", endTime: "20:00", venue: "Online + Campus", organizer: "Photography Club", contactEmail: "photoclub@campus.edu", maxParticipants: 100, registrationDeadline: "2026-05-05", fee: 0, status: "published", imageUrl: "", tags: ["photography", "contest"], requirements: ["Camera/Smartphone"], isPublic: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/events?limit=50')
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json()
      setEvents(data.events?.length ? data.events : demoEvents)
      setLastUpdated(new Date())
    } catch (error) {
      setEvents(demoEvents)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (eventType: string) => {
    const colors = {
      academic: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      cultural: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      workshop: "bg-green-500/10 text-green-400 border-green-500/20",
      sports: "bg-red-500/10 text-red-400 border-red-500/20",
      seminar: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      other: "bg-pink-500/10 text-pink-400 border-pink-500/20"
    }
    return colors[eventType as keyof typeof colors] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  }

  const getCategoryIcon = (eventType: string) => {
    const icons = {
      academic: <GraduationCap className="h-5 w-5" />,
      cultural: <Music className="h-5 w-5" />,
      workshop: <Lightbulb className="h-5 w-5" />,
      sports: <Trophy className="h-5 w-5" />,
      seminar: <Megaphone className="h-5 w-5" />,
      other: <BookOpen className="h-5 w-5" />
    }
    return icons[eventType as keyof typeof icons] || <BookOpen className="h-5 w-5" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleEventRegistration = (event: Event) => {
    setSelectedEvent(event)
    setShowBookingDialog(true)
  }

  const handleBookingSuccess = (booking: any) => {
    console.log('Booking successful:', booking)
    // Refresh events to update any counts or availability
    fetchEvents()
  }

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Campus Events</h1>
                <p className="text-zinc-400">Discover and join exciting events happening on campus</p>
                {lastUpdated && (
                  <p className="text-zinc-500 text-xs mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchEvents} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white" disabled={loading}>
                  <Clock className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Events Content */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{events.length}</p>
                    <p className="text-zinc-400 text-sm">Upcoming Events</p>
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
                    <p className="text-2xl font-bold text-white">1.2K</p>
                    <p className="text-zinc-400 text-sm">Total Participants</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Building className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">8</p>
                    <p className="text-zinc-400 text-sm">Event Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e78a53] mx-auto"></div>
              <p className="text-zinc-400 mt-4">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchEvents} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                Try Again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No events available at the moment</p>
              <p className="text-zinc-500 text-sm mt-2">Check back later for upcoming events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event._id} className="bg-zinc-900/50 border-zinc-800 hover:border-[#e78a53]/50 transition-colors group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#e78a53]/10 rounded-lg group-hover:bg-[#e78a53]/20 transition-colors">
                          {getCategoryIcon(event.eventType)}
                        </div>
                        <Badge className={`${getCategoryColor(event.eventType)} border`}>
                          {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white text-lg leading-tight">{event.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Calendar className="h-4 w-4 text-[#e78a53]" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Clock className="h-4 w-4 text-[#e78a53]" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <MapPin className="h-4 w-4 text-[#e78a53]" />
                        <span>{event.venue}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <User className="h-4 w-4 text-[#e78a53]" />
                        <span>{event.organizer}</span>
                      </div>
                    </div>

                    {event.maxParticipants && (
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-zinc-400" />
                          <span className="text-zinc-400 text-sm">
                            Max participants: {event.maxParticipants}
                          </span>
                        </div>
                      </div>
                    )}

                    {event.fee > 0 && (
                      <div className="flex items-center gap-2 text-[#e78a53] text-sm font-semibold">
                        <span>₹{event.fee}</span>
                      </div>
                    )}

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-zinc-800/50 text-zinc-400 text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {event.tags.length > 3 && (
                          <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-400 text-xs">
                            +{event.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button 
                      className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                      onClick={() => handleEventRegistration(event)}
                    >
                      {event.fee > 0 ? 'Register & Pay' : 'Register Now'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:border-[#e78a53]/50">
              Load More Events
            </Button>
          </div>
        </div>
      </main>
      
      {/* Event Booking Dialog */}
      <EventBookingDialog
        isOpen={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        event={selectedEvent}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  )
}
