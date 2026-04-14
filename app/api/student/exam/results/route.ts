import { NextResponse } from "next/server"

// Mock exam results data
const mockExamResults = [
  {
    _id: "result1",
    studentId: "student1",
    courseCode: "CS-301",
    courseName: "Data Structures and Algorithms",
    semester: 6,
    examType: "end-term",
    totalMarks: 100,
    marksObtained: 95,
    grade: "A",
    gpa: 4.0,
    resultDate: new Date("2025-04-30"),
    status: "pass",
    remarks: "Excellent performance",
    publishedAt: new Date("2025-04-30"),
  },
  {
    _id: "result2",
    studentId: "student1",
    courseCode: "CS-303",
    courseName: "Database Management Systems",
    semester: 6,
    examType: "end-term",
    totalMarks: 100,
    marksObtained: 92,
    grade: "A",
    gpa: 4.0,
    resultDate: new Date("2025-04-30"),
    status: "pass",
    remarks: "Very good",
    publishedAt: new Date("2025-04-30"),
  },
  {
    _id: "result3",
    studentId: "student1",
    courseCode: "CS-302",
    courseName: "Operating Systems",
    semester: 6,
    examType: "mid-term",
    totalMarks: 50,
    marksObtained: 44,
    grade: "A-",
    gpa: 3.7,
    resultDate: new Date("2025-03-15"),
    status: "pass",
    remarks: "Good",
    publishedAt: new Date("2025-03-15"),
  },
  {
    _id: "result4",
    studentId: "student1",
    courseCode: "CS-306",
    courseName: "Software Engineering",
    semester: 6,
    examType: "continuous",
    totalMarks: 50,
    marksObtained: 42,
    grade: "B+",
    gpa: 3.3,
    resultDate: new Date("2025-04-15"),
    status: "pass",
    remarks: "Satisfactory",
    publishedAt: new Date("2025-04-15"),
  },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get("studentId") || "student1"
  const semester = searchParams.get("semester")

  try {
    let results = mockExamResults.filter((r) => r.studentId === studentId)
    if (semester) {
      results = results.filter((r) => r.semester === parseInt(semester))
    }
    return NextResponse.json({ results, total: results.length })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam results" }, { status: 500 })
  }
}
