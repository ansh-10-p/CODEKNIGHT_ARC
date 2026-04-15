import { NextResponse } from "next/server"

// Mock exam hall ticket data
const mockHallTickets = [
  {
    _id: "ticket1",
    studentId: "student1",
    hallTicketNumber: "HT-2025-0001",
    examCode: "CS-301",
    examName: "Data Structures and Algorithms",
    examDate: new Date("2025-04-20"),
    examTime: "9:00 AM - 12:00 PM",
    venue: "Examination Hall A - Building B",
    seatNumber: "A-045",
    reportingTime: "8:45 AM",
    instructions: [
      "Arrive 15 minutes before reporting time",
      "Carry valid ID card and hall ticket",
      "Only blue/black pen allowed",
      "No calculators or electronic devices allowed",
      "Rough work should be on provided sheets only",
    ],
    issuedDate: new Date("2025-04-10"),
  },
  {
    _id: "ticket2",
    studentId: "student1",
    hallTicketNumber: "HT-2025-0002",
    examCode: "CS-303",
    examName: "Database Management Systems",
    examDate: new Date("2025-04-22"),
    examTime: "2:00 PM - 5:00 PM",
    venue: "Examination Hall B - Building C",
    seatNumber: "B-052",
    reportingTime: "1:45 PM",
    instructions: [
      "Arrive 15 minutes before reporting time",
      "Carry valid ID card and hall ticket",
      "Only blue/black pen allowed",
      "No calculators or electronic devices allowed",
      "Rough work should be on provided sheets only",
    ],
    issuedDate: new Date("2025-04-10"),
  },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get("studentId") || "student1"

  try {
    const tickets = mockHallTickets.filter((t) => t.studentId === studentId)
    return NextResponse.json({ hallTickets: tickets, total: tickets.length })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hall tickets" }, { status: 500 })
  }
}
