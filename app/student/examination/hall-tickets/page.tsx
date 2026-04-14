"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Printer, Download, Eye, Calendar, MapPin, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HallTicket {
  _id: string
  hallTicketNumber: string
  examCode: string
  examName: string
  examDate: string
  examTime: string
  venue: string
  seatNumber: string
  reportingTime: string
  instructions: string[]
}

export default function HallTicketsPage() {
  const [tickets, setTickets] = useState<HallTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<HallTicket | null>(null)

  useEffect(() => {
    fetchHallTickets()
  }, [])

  const fetchHallTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/student/exam/hall-tickets")
      const data = await res.json()
      setTickets(data.hallTickets || [])
    } catch (error) {
      console.error("Failed to fetch hall tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = (ticket: HallTicket) => {
    const element = document.createElement("div")
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #333;">
        <h1 style="text-align: center; margin-bottom: 5px;">EXAM HALL TICKET</h1>
        <p style="text-align: center; color: #666; margin-bottom: 20px;">Official Document</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <p><strong>Hall Ticket No:</strong> ${ticket.hallTicketNumber}</p>
            <p><strong>Exam Code:</strong> ${ticket.examCode}</p>
            <p><strong>Exam Name:</strong> ${ticket.examName}</p>
            <p><strong>Seat Number:</strong> ${ticket.seatNumber}</p>
          </div>
          <div>
            <p><strong>Exam Date:</strong> ${new Date(ticket.examDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${ticket.examTime}</p>
            <p><strong>Reporting Time:</strong> ${ticket.reportingTime}</p>
            <p><strong>Venue:</strong> ${ticket.venue}</p>
          </div>
        </div>
        
        <div style="border-top: 1px solid #999; padding-top: 10px; margin-top: 10px;">
          <strong>Important Instructions:</strong>
          <ol>
            ${ticket.instructions.map((inst) => `<li>${inst}</li>`).join("")}
          </ol>
        </div>
      </div>
    `
    const printWin = window.open("", "_blank")
    if (printWin) {
      printWin.document.write(element.innerHTML)
      printWin.document.close()
      printWin.print()
    }
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
                <h1 className="text-2xl font-bold text-white">Exam Hall Tickets</h1>
                <p className="text-zinc-500 text-sm mt-0.5">Download and view your hall tickets</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-zinc-400">Loading...</p>
          ) : tickets.length === 0 ? (
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-8">
                <p className="text-zinc-400 text-center">No hall tickets available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <Card key={ticket._id} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-white font-semibold text-lg">{ticket.examName}</p>
                        <p className="text-zinc-400 text-sm">Ticket #: {ticket.hallTicketNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPDF(ticket)}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Exam Date</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-[#e78a53]" />
                          {new Date(ticket.examDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Time</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <Clock className="h-4 w-4 text-[#e78a53]" />
                          {ticket.examTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Seat Number</p>
                        <p className="text-white font-semibold">{ticket.seatNumber}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Venue</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-[#e78a53]" />
                          {ticket.venue}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-700">
                      <p className="text-zinc-400 text-xs">Report by: {ticket.reportingTime}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Hall Ticket Preview</DialogTitle>
            </DialogHeader>
            <div className="bg-white text-black p-6 rounded-lg space-y-4">
              <div className="text-center border-b pb-3">
                <h1 className="text-xl font-bold">EXAM HALL TICKET</h1>
                <p className="text-sm text-gray-600">Official Document</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Hall Ticket Number</p>
                  <p className="font-semibold">{selectedTicket.hallTicketNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Exam Code</p>
                  <p className="font-semibold">{selectedTicket.examCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Exam Name</p>
                  <p className="font-semibold">{selectedTicket.examName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Seat Number</p>
                  <p className="font-semibold">{selectedTicket.seatNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Exam Date</p>
                  <p className="font-semibold">{new Date(selectedTicket.examDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Time</p>
                  <p className="font-semibold">{selectedTicket.examTime}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-600 mb-1">Venue</p>
                  <p className="font-semibold">{selectedTicket.venue}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-600 mb-1">Reporting Time</p>
                  <p className="font-semibold">{selectedTicket.reportingTime}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="font-semibold mb-2 text-sm">Instructions:</p>
                <ul className="text-xs space-y-1">
                  {selectedTicket.instructions.map((inst, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="font-semibold">{idx + 1}.</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => downloadPDF(selectedTicket)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print / Download as PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
