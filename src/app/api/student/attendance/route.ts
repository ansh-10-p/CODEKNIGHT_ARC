import { NextResponse } from "next/server";

interface Classroom {
  _id: string;
  title: string;
  subject: string;
  teacherName: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: "present" | "absent" | "late";
  subjectName: string;
  timeSlot?: string;
  remarks?: string;
  createdAt: string;
  classroomId: string;
}

interface Enrollment {
  _id: string;
  classroomId: string;
  classroom: Classroom;
}

const mockEnrollments: Enrollment[] = [
  {
    _id: "e1",
    classroomId: "mc1",
    classroom: {
      _id: "mc1",
      title: "Data Structures & Algorithms",
      subject: "Computer Science",
      teacherName: "Prof. Priya Verma",
    },
  },
  {
    _id: "e2",
    classroomId: "mc2",
    classroom: {
      _id: "mc2",
      title: "Database Management Systems",
      subject: "Computer Science",
      teacherName: "Prof. Rakesh Sharma",
    },
  },
  {
    _id: "e3",
    classroomId: "mc3",
    classroom: {
      _id: "mc3",
      title: "Operating Systems",
      subject: "Computer Science",
      teacherName: "Dr. Anita Desai",
    },
  },
];

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    _id: "a1",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "present",
    subjectName: "Data Structures & Algorithms",
    timeSlot: "09:00–10:30",
    remarks: "",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    classroomId: "mc1",
  },
  {
    _id: "a2",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: "present",
    subjectName: "Database Management Systems",
    timeSlot: "10:00–11:30",
    remarks: "",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    classroomId: "mc2",
  },
  {
    _id: "a3",
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    status: "late",
    subjectName: "Data Structures & Algorithms",
    timeSlot: "09:00–10:30",
    remarks: "Bus delay",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    classroomId: "mc1",
  },
  {
    _id: "a4",
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    status: "present",
    subjectName: "Data Structures & Algorithms",
    timeSlot: "09:00–10:30",
    remarks: "",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    classroomId: "mc1",
  },
  {
    _id: "a5",
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    status: "absent",
    subjectName: "Database Management Systems",
    timeSlot: "10:00–11:30",
    remarks: "Sick",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    classroomId: "mc2",
  },
];

const mockStatistics = {
  totalClasses: 5,
  presentCount: 3,
  lateCount: 1,
  absentCount: 1,
  attendancePercentage: 80,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const classroomId = searchParams.get("classroomId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!studentId) {
    return NextResponse.json(
      { error: "studentId is required" },
      { status: 400 },
    );
  }

  let attendanceRecords = [...mockAttendanceRecords];
  if (classroomId) {
    attendanceRecords = attendanceRecords.filter(
      (record) => record.classroomId === classroomId,
    );
  }

  if (startDate) {
    const minDate = new Date(startDate);
    attendanceRecords = attendanceRecords.filter(
      (record) => new Date(record.date) >= minDate,
    );
  }
  if (endDate) {
    const maxDate = new Date(endDate);
    attendanceRecords = attendanceRecords.filter(
      (record) => new Date(record.date) <= maxDate,
    );
  }

  const classroom = classroomId
    ? (mockEnrollments.find(
        (enrollment) => enrollment.classroomId === classroomId,
      )?.classroom ?? null)
    : null;

  return NextResponse.json({
    attendanceRecords,
    enrollments: mockEnrollments,
    statistics: mockStatistics,
    classroom,
  });
}
