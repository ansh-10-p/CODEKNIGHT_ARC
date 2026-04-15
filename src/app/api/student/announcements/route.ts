import { NextResponse } from "next/server"

// Mock announcements data
const mockAnnouncements = [
  {
    _id: "anc1",
    title: "Mid-Semester Examination Schedule Released",
    description: "Mid-semester examination schedule for Semester 6 has been released",
    content: "The mid-semester examination for all Semester 6 students will be held from March 10-20, 2025. Please check your hall tickets on the student portal. Timings and venues will be displayed along with your hall ticket.",
    postedBy: "admin",
    postedByName: "Academic Administration",
    category: "academic",
    targetAudience: "all-students",
    priority: "high",
    attachments: [],
    expiryDate: new Date("2025-03-20"),
    isActive: true,
    viewCount: 245,
    createdAt: new Date("2025-02-20"),
  },
  {
    _id: "anc2",
    title: "Campus Maintenance - Water Supply Interruption",
    description: "Scheduled water supply maintenance on March 5, 2025",
    content: "Campus water supply will be interrupted on March 5, 2025 from 6 AM to 2 PM for scheduled maintenance. Kindly make necessary arrangements. Drinking water will be available at designated points.",
    postedBy: "admin",
    postedByName: "Facilities Management",
    category: "maintenance",
    targetAudience: "all",
    priority: "normal",
    attachments: [],
    expiryDate: new Date("2025-03-06"),
    isActive: true,
    viewCount: 189,
    createdAt: new Date("2025-03-01"),
  },
  {
    _id: "anc3",
    title: "Registration Open for Summer Internship",
    description: "Summer internship registration now open for students",
    content: "Dear Students, Registration for Summer 2025 internship program is now open. Companies like Google, Microsoft, TCS, Infosys and others are participating. Interested candidates should register within 2 weeks on the internship portal.",
    postedBy: "admin",
    postedByName: "Placement Cell",
    category: "events",
    targetAudience: "all-students",
    priority: "high",
    attachments: [
      { fileName: "Internship_Companies_2025.pdf", fileUrl: "/files/internships.pdf", uploadDate: new Date("2025-02-25") },
    ],
    expiryDate: new Date("2025-03-15"),
    isActive: true,
    viewCount: 512,
    createdAt: new Date("2025-02-25"),
  },
  {
    _id: "anc4",
    title: "Data Structures Lab Assignment Due",
    description: "Lab assignment for Data Structures practical session due",
    content: "Dear Students, The hands-on lab assignment on advanced data structures (AVL Trees, Heaps, Hashing) is due by March 8, 2025. Please submit your code on the course portal along with a detailed explanation of your implementation.",
    postedBy: "teacher",
    postedByName: "Dr. Priya Mehta",
    category: "academic",
    targetAudience: "all-students",
    priority: "normal",
    attachments: [],
    expiryDate: new Date("2025-03-08"),
    isActive: true,
    viewCount: 156,
    createdAt: new Date("2025-02-28"),
  },
  {
    _id: "anc5",
    title: "Campus Wi-Fi Network Upgrade",
    description: "Wi-Fi network upgrade - temporary service interruption",
    content: "URGENT: Campus Wi-Fi network will be temporarily unavailable on March 3-4, 2025 for equipment upgrade. This will improve network speed and coverage. We apologize for any inconvenience.",
    postedBy: "admin",
    postedByName: "IT Department",
    category: "urgent",
    targetAudience: "all",
    priority: "urgent",
    attachments: [],
    expiryDate: new Date("2025-03-05"),
    isActive: true,
    viewCount: 418,
    createdAt: new Date("2025-03-01"),
  },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const priority = searchParams.get("priority")
  const limit = parseInt(searchParams.get("limit") || "10")

  try {
    let announcements = mockAnnouncements.filter((a) => a.isActive)

    if (category) {
      announcements = announcements.filter((a) => a.category === category)
    }
    if (priority) {
      announcements = announcements.filter((a) => a.priority === priority)
    }

    // Sort by creation date (newest first)
    announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      announcements: announcements.slice(0, limit),
      total: announcements.length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}
