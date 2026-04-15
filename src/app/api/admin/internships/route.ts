import { NextResponse } from "next/server";

interface Internship {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  location: string;
  locationType: string;
  duration: string;
  stipend?: string;
  applicationDeadline: string;
  startDate?: string;
  endDate?: string;
  contactEmail: string;
  contactPhone?: string;
  companyWebsite?: string;
  applicationUrl?: string;
  status: string;
  category?: string;
  experienceLevel: string;
  isRemote: boolean;
  applicationCount: number;
  createdAt: string;
}

let internships: Internship[] = [
  {
    _id: "int1",
    title: "Frontend Development Intern",
    company: "TechLabs",
    description: "Hands-on experience building React and Next.js applications.",
    requirements: ["React", "JavaScript", "Problem solving"],
    responsibilities: [
      "Develop UI components",
      "Collaborate with designers",
      "Write tests",
    ],
    skills: ["React", "TypeScript", "CSS"],
    location: "Campus Innovation Hub",
    locationType: "onsite",
    duration: "3 months",
    stipend: "20,000 INR",
    applicationDeadline: new Date(Date.now() + 15 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 110 * 86400000).toISOString(),
    contactEmail: "internships@campus.edu",
    contactPhone: "9012345678",
    companyWebsite: "https://techlabs.example.com",
    applicationUrl: "https://campus.example.com/apply",
    status: "active",
    category: "engineering",
    experienceLevel: "fresher",
    isRemote: false,
    applicationCount: 42,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: Request) {
  return NextResponse.json({ internships });
}

export async function POST(req: Request) {
  const payload = await req.json();
  const newInternship: Internship = {
    _id: `int${Date.now()}`,
    title: payload.title || "New Internship",
    company: payload.company || "Company",
    description: payload.description || "",
    requirements: payload.requirements || [],
    responsibilities: payload.responsibilities || [],
    skills: payload.skills || [],
    location: payload.location || "",
    locationType: payload.locationType || "onsite",
    duration: payload.duration || "",
    stipend: payload.stipend || "",
    applicationDeadline:
      payload.applicationDeadline || new Date().toISOString(),
    startDate: payload.startDate || undefined,
    endDate: payload.endDate || undefined,
    contactEmail: payload.contactEmail || "",
    contactPhone: payload.contactPhone || "",
    companyWebsite: payload.companyWebsite || "",
    applicationUrl: payload.applicationUrl || "",
    status: payload.status || "active",
    category: payload.category || "other",
    experienceLevel: payload.experienceLevel || "fresher",
    isRemote: payload.isRemote ?? false,
    applicationCount: 0,
    createdAt: new Date().toISOString(),
  };
  internships.push(newInternship);
  return NextResponse.json({ internship: newInternship });
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const payload = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Internship id is required" },
      { status: 400 },
    );
  }

  const index = internships.findIndex((item) => item._id === id);
  if (index === -1) {
    return NextResponse.json(
      { error: "Internship not found" },
      { status: 404 },
    );
  }

  internships[index] = { ...internships[index], ...payload };
  return NextResponse.json({ internship: internships[index] });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Internship id is required" },
      { status: 400 },
    );
  }

  internships = internships.filter((item) => item._id !== id);
  return NextResponse.json({ success: true });
}
