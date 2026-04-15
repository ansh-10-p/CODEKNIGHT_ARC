import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    availableClasses: ["CSE-A", "CSE-B", "ECE-A", "IT-A", "MECH-A", "CIVIL-A"],
    classDetails: [
      {
        className: "CSE-A",
        subjectCount: 8,
        teacherCount: 5,
        subjects: [
          "Data Structures",
          "Algorithms",
          "DBMS",
          "OS",
          "Networks",
          "AI",
          "ML",
          "Software Engineering",
        ],
      },
      {
        className: "CSE-B",
        subjectCount: 7,
        teacherCount: 4,
        subjects: [
          "Data Structures",
          "Algorithms",
          "DBMS",
          "OS",
          "Networks",
          "Computer Architecture",
          "Web Development",
        ],
      },
      {
        className: "ECE-A",
        subjectCount: 7,
        teacherCount: 5,
        subjects: [
          "Circuits",
          "Signals",
          "Electromagnetics",
          "Digital Systems",
          "Communications",
          "Microprocessors",
          "Control Systems",
        ],
      },
      {
        className: "IT-A",
        subjectCount: 8,
        teacherCount: 5,
        subjects: [
          "Programming",
          "Databases",
          "Networks",
          "Web Development",
          "AI",
          "ML",
          "Cloud Computing",
          "Cyber Security",
        ],
      },
      {
        className: "MECH-A",
        subjectCount: 6,
        teacherCount: 4,
        subjects: [
          "Thermodynamics",
          "Fluid Mechanics",
          "Mechanics",
          "Manufacturing",
          "Machine Design",
          "Dynamics",
        ],
      },
      {
        className: "CIVIL-A",
        subjectCount: 6,
        teacherCount: 4,
        subjects: [
          "Strength of Materials",
          "Geotechnical Engineering",
          "Surveying",
          "Structural Analysis",
          "Construction Management",
          "Environmental Engineering",
        ],
      },
    ],
  });
}
