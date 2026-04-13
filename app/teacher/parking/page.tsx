"use client"

import { useState } from "react"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Car, Bell, ShieldCheck, Clock } from "lucide-react"
import { printParkingTicket } from "@/lib/parking-ticket"

export default function TeacherParkingPage() {
  const [request, setRequest] = useState({
    vehicleType: "4-wheeler",
    vehicleNumber: "BR01CD5678",
    preferredZone: "Faculty Parking",
    preferredTime: "08:30 AM",
    preferredTimeSlot: "08:30 AM - 05:30 PM",
  })

  const teacherSlots = [
    { id: "PK-TC-201", slot: "F-08", zone: "Faculty Parking", timeSlot: "08:30 AM - 05:30 PM", status: "approved", from: "Apr 2026", to: "Sep 2026" },
    { id: "PK-TC-202", slot: "F-03", zone: "Faculty Parking", timeSlot: "10:00 AM - 06:00 PM", status: "pending", from: "Oct 2026", to: "Mar 2027" },
  ]

  return (
    <div className="min-h-screen bg-black flex">
      <TeacherSidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Teacher Parking</h1>
              <p className="text-zinc-400 mt-2">Allocate and manage your faculty parking slots</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-zinc-400" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#e78a53]" />
                  Parking Allocation Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300">Vehicle Type</Label>
                    <Input value={request.vehicleType} onChange={(e) => setRequest({ ...request, vehicleType: e.target.value })} className="mt-1 bg-zinc-800/50 border-zinc-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Vehicle Number</Label>
                    <Input value={request.vehicleNumber} onChange={(e) => setRequest({ ...request, vehicleNumber: e.target.value })} className="mt-1 bg-zinc-800/50 border-zinc-700 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300">Preferred Zone</Label>
                    <Input value={request.preferredZone} onChange={(e) => setRequest({ ...request, preferredZone: e.target.value })} className="mt-1 bg-zinc-800/50 border-zinc-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Preferred Entry Time</Label>
                    <Input value={request.preferredTime} onChange={(e) => setRequest({ ...request, preferredTime: e.target.value })} className="mt-1 bg-zinc-800/50 border-zinc-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Preferred Time Slot</Label>
                    <Input value={request.preferredTimeSlot} onChange={(e) => setRequest({ ...request, preferredTimeSlot: e.target.value })} className="mt-1 bg-zinc-800/50 border-zinc-700 text-white" />
                  </div>
                </div>
                <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90">Request Allocation</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">My Parking Slots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teacherSlots.map((slot) => (
                <div key={slot.id} className="p-3 bg-zinc-800/40 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium">{slot.slot}</p>
                    <Badge className={slot.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"}>
                      {slot.status}
                    </Badge>
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">{slot.zone}</p>
                  <p className="text-zinc-500 text-xs flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {slot.timeSlot} | {slot.from} - {slot.to}
                  </p>
                  {slot.status === "approved" && (
                    <Button
                      size="sm"
                      className="mt-3 bg-[#e78a53] hover:bg-[#e78a53]/90"
                      onClick={() =>
                        printParkingTicket({
                          ticketId: slot.id,
                          userType: "teacher",
                          holderName: "Priya Verma",
                          vehicleNumber: request.vehicleNumber,
                          vehicleType: request.vehicleType,
                          zone: slot.zone,
                          slot: slot.slot,
                          timeSlot: slot.timeSlot,
                          validFrom: slot.from,
                          validTill: slot.to,
                        })
                      }
                    >
                      Download Ticket PDF
                    </Button>
                  )}
                </div>
              ))}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400 mt-0.5" />
                <p className="text-xs text-blue-300">All allocations are approved by admin and auto-expire after validity period.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
