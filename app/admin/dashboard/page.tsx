"use client"

import React, { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  BookOpen, 
  Briefcase, 
  Car,
  Users, 
  TrendingUp, 
  Plus,
  BarChart3,
  Loader2,
  Shield
} from "lucide-react"
import { redirectIfNotAuthenticatedAdmin, getCurrentAdminInfo } from '@/lib/auth-middleware'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)
  const [stats, setStats] = useState({
    events: 0,
    resources: 0,
    internships: 0,
    parkingRequests: 0,
    totalEntities: 0
  })
  const router = useRouter()

  useEffect(() => {
    if (!redirectIfNotAuthenticatedAdmin()) {
      return
    }
    
    const adminInfo = getCurrentAdminInfo()
    if (!adminInfo) {
      window.location.href = '/admin/login'
      return
    }
    
    setCurrentAdmin(adminInfo)
    loadStats()
    setIsPageLoading(false)
  }, [])

  const loadStats = async () => {
    // In a real app, you would fetch actual statistics from APIs
    // For now, we'll use placeholder data
    setStats({
      events: 12,
      resources: 25,
      internships: 8,
      parkingRequests: 14,
      totalEntities: 59
    })
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#e78a53] mx-auto mb-4" />
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-white">Authentication required</p>
          <p className="text-zinc-400 mt-2">Please log in as admin</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Add a new event to the system',
      icon: Calendar,
      action: () => router.push('/admin/events'),
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    },
    {
      title: 'Add Resource',
      description: 'Upload a new resource',
      icon: BookOpen,
      action: () => router.push('/admin/resources'),
      color: 'bg-green-500/10 border-green-500/30 text-green-400'
    },
    {
      title: 'Post Internship',
      description: 'Create internship opportunity',
      icon: Briefcase,
      action: () => router.push('/admin/internships'),
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
    },
    {
      title: 'Manage Parking',
      description: 'Approve and allocate parking slots',
      icon: Car,
      action: () => router.push('/admin/parking'),
      color: 'bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]'
    }
  ]

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-zinc-400 mt-2">Manage events, resources, and internships</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]">
                  <Shield className="h-4 w-4 mr-1" />
                  {currentAdmin?.username || 'Admin'}
                </Badge>
                <Badge className="bg-blue-500/10 border-blue-500/30 text-blue-400">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {stats.totalEntities} Total Items
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.events}</p>
                    <p className="text-zinc-400 text-sm">Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.resources}</p>
                    <p className="text-zinc-400 text-sm">Resources</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Briefcase className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.internships}</p>
                    <p className="text-zinc-400 text-sm">Internships</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalEntities}</p>
                    <p className="text-zinc-400 text-sm">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Car className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.parkingRequests}</p>
                    <p className="text-zinc-400 text-sm">Parking Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Card key={index} className={`${action.color} border cursor-pointer hover:bg-opacity-20 transition-colors`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className="h-6 w-6" />
                          <h3 className="font-semibold">{action.title}</h3>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">{action.description}</p>
                        <Button 
                          onClick={action.action}
                          size="sm" 
                          className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90"
                        >
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
                  <div className="p-2 bg-blue-500/10 rounded">
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Event system initialized</p>
                    <p className="text-zinc-400 text-sm">Ready to create and manage events</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
                  <div className="p-2 bg-green-500/10 rounded">
                    <BookOpen className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Resource management ready</p>
                    <p className="text-zinc-400 text-sm">Upload and organize resources</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
                  <div className="p-2 bg-purple-500/10 rounded">
                    <Briefcase className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Internship portal active</p>
                    <p className="text-zinc-400 text-sm">Post and manage internship opportunities</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
