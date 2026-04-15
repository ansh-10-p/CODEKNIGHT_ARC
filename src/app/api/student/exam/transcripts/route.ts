import { NextResponse } from "next/server"

// Mock transcript data
const mockTranscripts = [
  {
    _id: "transcript1",
    studentId: "student1",
    academicYear: "2024-25",
    semester: 6,
    courses: [
      {
        courseCode: "CS-301",
        courseName: "Data Structures and Algorithms",
        credits: 4,
        grade: "A",
        gpa: 4.0,
        marks: 95,
      },
      {
        courseCode: "CS-303",
        courseName: "Database Management Systems",
        credits: 4,
        grade: "A",
        gpa: 4.0,
        marks: 92,
      },
      {
        courseCode: "CS-302",
        courseName: "Operating Systems",
        credits: 4,
        grade: "A-",
        gpa: 3.7,
        marks: 88,
      },
      {
        courseCode: "CS-304",
        courseName: "Computer Networks",
        credits: 4,
        grade: "A",
        gpa: 4.0,
        marks: 94,
      },
      {
        courseCode: "CS-306",
        courseName: "Software Engineering",
        credits: 4,
        grade: "B+",
        gpa: 3.3,
        marks: 85,
      },
    ],
    sgpa: 3.8,
    cgpa: 3.85,
    totalCreditsEarned: 20,
    status: "active",
    issuedDate: new Date("2025-03-01"),
  },
  {
    _id: "transcript2",
    studentId: "student1",
    academicYear: "2024-25",
    semester: 5,
    courses: [
      {
        courseCode: "CS-201",
        courseName: "Web Development",
        credits: 4,
        grade: "A-",
        gpa: 3.7,
        marks: 89,
      },
      {
        courseCode: "CS-203",
        courseName: "Mobile App Development",
        credits: 4,
        grade: "A",
        gpa: 4.0,
        marks: 96,
      },
      {
        courseCode: "CS-204",
        courseName: "Machine Learning",
        credits: 4,
        grade: "B+",
        gpa: 3.3,
        marks: 83,
      },
      {
        courseCode: "CS-205",
        courseName: "Cloud Computing",
        credits: 4,
        grade: "A",
        gpa: 4.0,
        marks: 91,
      },
      {
        courseCode: "CS-206",
        courseName: "Cyber Security",
        credits: 4,
        grade: "A-",
        gpa: 3.7,
        marks: 87,
      },
    ],
    sgpa: 3.74,
    cgpa: 3.80,
    totalCreditsEarned: 40,
    status: "active",
    issuedDate: new Date("2024-09-01"),
  },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get("studentId") || "student1"

  try {
    const transcripts = mockTranscripts.filter((t) => t.studentId === studentId)
    return NextResponse.json({ transcripts, total: transcripts.length })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transcripts" }, { status: 500 })
  }
}
