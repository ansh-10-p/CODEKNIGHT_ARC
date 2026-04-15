import { NextResponse } from "next/server"

// Mock student fees data
const mockStudentFees = [
  {
    _id: "fees1",
    studentId: "student1",
    semester: 6,
    academicYear: "2025-26",
    totalFees: 150000,
    paidAmount: 150000,
    dueAmount: 0,
    paymentStatus: "paid",
    dueDateLimit: new Date("2025-12-31"),
    paymentRecords: [
      {
        amount: 70000,
        paymentDate: new Date("2025-01-15"),
        paymentMethod: "online",
        transactionId: "TXN20250115001",
        reference: "Semester 6 Fees",
      },
      {
        amount: 80000,
        paymentDate: new Date("2025-02-01"),
        paymentMethod: "online",
        transactionId: "TXN20250201001",
        reference: "Semester 6 Fees",
      },
    ],
  },
  {
    _id: "fees2",
    studentId: "student1",
    semester: 7,
    academicYear: "2025-26",
    totalFees: 150000,
    paidAmount: 100000,
    dueAmount: 50000,
    paymentStatus: "partial",
    dueDateLimit: new Date("2025-07-31"),
    paymentRecords: [
      {
        amount: 100000,
        paymentDate: new Date("2025-06-10"),
        paymentMethod: "online",
        transactionId: "TXN20250610001",
        reference: "Semester 7 Fees",
      },
    ],
  },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get("studentId") || "student1"

  try {
    const fees = mockStudentFees.filter((f) => f.studentId === studentId)
    return NextResponse.json({ fees, total: fees.length })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { feesId, amount, paymentMethod, transactionId } = await req.json()
    
    // Mock payment processing
    const fees = mockStudentFees.find((f) => f._id === feesId)
    if (!fees) {
      return NextResponse.json({ error: "Fees record not found" }, { status: 404 })
    }

    fees.paymentRecords.push({
      amount,
      paymentDate: new Date(),
      paymentMethod,
      transactionId,
      reference: `Payment for Sem ${fees.semester}`,
    })
    fees.paidAmount += amount
    fees.dueAmount -= amount
    fees.paymentStatus = fees.dueAmount === 0 ? "paid" : "partial"

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      fees,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
