"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Bell, Zap, Bookmark, Eye, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Announcement {
  _id: string
  title: string
  description: string
  content: string
  postedBy: "admin" | "teacher"
  postedByName: string
  category: "academic" | "events" | "maintenance" | "urgent" | "general"
  priority: "low" | "normal" | "high" | "urgent"
  attachments: Array<{ fileName: string; fileUrl: string }>
  expiryDate: string
  isActive: boolean
  viewCount: number
  createdAt: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      let url = "/api/student/announcements?limit=50"
      if (categoryFilter !== "all") url += `&category=${categoryFilter}`
      if (priorityFilter !== "all") url += `&priority=${priorityFilter}`
      
      const res = await fetch(url)
      const data = await res.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [categoryFilter, priorityFilter])

  const categoryConfig: Record<string, { icon: any; color: string; label: string }> = {
    academic: { icon: Bell, color: "text-blue-400", label: "Academic" },
    events: { icon: Zap, color: "text-purple-400", label: "Events" },
    maintenance: { icon: Bell, color: "text-yellow-400", label: "Maintenance" },
    urgent: { icon: Zap, color: "text-red-400", label: "Urgent" },
    general: { icon: Bell, color: "text-green-400", label: "General" },
  }

  const priorityConfig: Record<string, { bg: string; label: string }> = {
    low: { bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Low" },
    normal: { bg: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Normal" },
    high: { bg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "High" },
    urgent: { bg: "bg-red-500/10 text-red-400 border-red-500/20", label: "Urgent" },
  }

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/student/dashboard" className="text-zinc-400 hover:text-white">←</Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Announcements</h1>
                <p className="text-zinc-500 text-sm mt-0.5">Important updates and notifications</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Category:</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="academic">Academic</option>
                    <option value="events">Events</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="urgent">Urgent</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Priority:</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Announcements List */}
          {loading ? (
            <p className="text-zinc-400">Loading...</p>
          ) : announcements.length === 0 ? (
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-8">
                <p className="text-zinc-400 text-center">No announcements found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => {
                const catConfig = categoryConfig[announcement.category] || categoryConfig.general
                const CatIcon = catConfig.icon
                const priConfig = priorityConfig[announcement.priority] || priorityConfig.normal

                return (
                  <Card
                    key={announcement._id}
                    className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                    onClick={() => setSelectedAnnouncement(announcement)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-lg ${catConfig.color} bg-opacity-10 flex-shrink-0`}>
                          <CatIcon className={`h-6 w-6 ${catConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-white font-semibold text-lg truncate">{announcement.title}</h3>
                              <p className="text-zinc-400 text-sm truncate">{announcement.description}</p>
                            </div>
                            <Badge className={priConfig.bg}>{priConfig.label}</Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-zinc-500 mt-3">
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                              {announcement.postedByName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(announcement.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {announcement.viewCount} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      {selectedAnnouncement && (
        <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedAnnouncement.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-white">
              <div className="flex gap-2">
                <Badge className={priorityConfig[selectedAnnouncement.priority].bg}>
                  {priorityConfig[selectedAnnouncement.priority].label}
                </Badge>
                <Badge className="bg-zinc-700/50 text-zinc-300">
                  {categoryConfig[selectedAnnouncement.category]?.label || selectedAnnouncement.category}
                </Badge>
              </div>

              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <p className="text-sm text-zinc-400 mb-2">Posted by: <span className="text-white font-semibold">{selectedAnnouncement.postedByName}</span></p>
                <p className="text-sm text-zinc-400">Date: {new Date(selectedAnnouncement.createdAt).toLocaleString()}</p>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>

              {selectedAnnouncement.attachments.length > 0 && (
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Attachments:</p>
                  <div className="space-y-2">
                    {selectedAnnouncement.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.fileUrl}
                        className="block text-[#e78a53] hover:underline text-sm"
                      >
                        📎 {att.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnnouncement.expiryDate && (
                <p className="text-xs text-zinc-500">
                  Expires: {new Date(selectedAnnouncement.expiryDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
