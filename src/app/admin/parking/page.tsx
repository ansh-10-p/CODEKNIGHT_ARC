"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Car, CheckCircle, Clock, Search, Shield } from "lucide-react"

export default function AdminParkingPage() {
  const requests = [
    { id: "REQ-901", user: "Rahul Sharma", role: "student", vehicle: "BR01AB1234", zone: "Student Block A", requestedSlot: "Near Gate", timeSlot: "09:00 AM - 06:00 PM", status: "pending" },
    { id: "REQ-902", user: "Priya Verma", role: "teacher", vehicle: "BR01CD5678", zone: "Faculty Parking", requestedSlot: "Covered Bay", timeSlot: "08:30 AM - 05:30 PM", status: "pending" },
    { id: "REQ-903", user: "Amit Kumar", role: "student", vehicle: "BR01XY7788", zone: "Student Block B", requestedSlot: "B-10", timeSlot: "10:00 AM - 05:00 PM", status: "approved" },
  ]

  const slots = [
    { zone: "Student Block A", total: 120, occupied: 89 },
    { zone: "Student Block B", total: 100, occupied: 64 },
    { zone: "Faculty Parking", total: 60, occupied: 43 },
  ]

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Parking Management</h1>
              <p className="text-zinc-400 mt-2">Approve requests and monitor parking capacity</p>
            </div>
            <Badge className="bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]">
              <Shield className="h-4 w-4 mr-1" />
              Admin Control
            </Badge>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <Card key={slot.zone} className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{slot.zone}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{slot.occupied}/{slot.total}</p>
                  <p className="text-zinc-400 text-sm">Occupied Slots</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#e78a53]" />
                  Parking Requests
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search by user/vehicle..." className="w-64 bg-zinc-800/50 border-zinc-700 text-white" />
                  <Button variant="outline" className="border-zinc-700 text-zinc-300">
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="p-4 bg-zinc-800/40 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{request.user} <span className="text-zinc-500 text-sm">({request.role})</span></p>
                    <p className="text-zinc-400 text-sm">{request.vehicle} - {request.zone}</p>
                    <p className="text-zinc-500 text-xs">Slot: {request.requestedSlot} | Time: {request.timeSlot}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={request.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"}>
                      {request.status}
                    </Badge>
                    <Button size="sm" className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300">
                      <Clock className="h-4 w-4 mr-1" />
                      Hold
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
