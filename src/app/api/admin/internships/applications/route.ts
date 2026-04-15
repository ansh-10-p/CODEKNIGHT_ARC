import { NextResponse } from "next/server";

interface Application {
  _id: string;
  internshipId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentClass: string;
  studentRollNumber: string;
  resumeFileName: string;
  resumeFilePath: string;
  resumeFileType: string;
  coverLetter?: string;
  applicationStatus: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

let applications: Application[] = [
  {
    _id: "app1",
    internshipId: "int1",
    studentId: "student1",
    studentName: "Aarav Singh",
    studentEmail: "aarav.singh@example.com",
    studentPhone: "9876501234",
    studentClass: "B.Tech CSE",
    studentRollNumber: "CSE2024001",
    resumeFileName: "Aarav_Singh_Resume.pdf",
    resumeFilePath: "/files/resumes/aarav_singh_resume.pdf",
    resumeFileType: "application/pdf",
    coverLetter: "Excited to intern with your organization.",
    applicationStatus: "pending",
    appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const internshipId = searchParams.get("internshipId");

  const filtered = internshipId
    ? applications.filter(
        (application) => application.internshipId === internshipId,
      )
    : applications;

  return NextResponse.json({ applications: filtered });
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const payload = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Application id is required" },
      { status: 400 },
    );
  }

  const index = applications.findIndex((app) => app._id === id);
  if (index === -1) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }

  applications[index] = {
    ...applications[index],
    ...payload,
    reviewedAt: payload.reviewedBy
      ? new Date().toISOString()
      : applications[index].reviewedAt,
  };

  return NextResponse.json({ application: applications[index] });
}
