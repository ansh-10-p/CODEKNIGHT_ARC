import { NextResponse } from "next/server";

interface Event {
  _id: string;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  contactEmail?: string;
  contactPhone?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  fee: number;
  status: string;
  imageUrl?: string;
  tags: string[];
  requirements: string[];
  isPublic: boolean;
  createdAt: string;
  bookingStats?: {
    totalBookings: number;
    paidBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    pendingRevenue: number;
  };
}

let events: Event[] = [
  {
    _id: "evt1",
    title: "Campus Tech Expo",
    description:
      "A showcase of student projects, startups, and campus innovation.",
    eventType: "exhibition",
    startDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    startTime: "10:00",
    endTime: "18:00",
    venue: "Main Auditorium",
    organizer: "Student Council",
    contactEmail: "tech.expo@campus.edu",
    contactPhone: "9876543210",
    maxParticipants: 250,
    registrationDeadline: new Date(Date.now() + 1 * 86400000).toISOString(),
    fee: 0,
    status: "active",
    imageUrl: "/images/events/tech-expo.jpg",
    tags: ["technology", "innovation"],
    requirements: ["Bring student ID", "Register in advance"],
    isPublic: true,
    createdAt: new Date().toISOString(),
    bookingStats: {
      totalBookings: 245,
      paidBookings: 15,
      pendingBookings: 20,
      totalRevenue: 1200,
      pendingRevenue: 450,
    },
  },
  {
    _id: "evt2",
    title: "Entrepreneurship Bootcamp",
    description:
      "A weekend workshop series for aspiring student entrepreneurs.",
    eventType: "workshop",
    startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 9 * 86400000).toISOString(),
    startTime: "09:00",
    endTime: "17:00",
    venue: "Innovation Lab",
    organizer: "Placement Cell",
    contactEmail: "bootcamp@campus.edu",
    contactPhone: "9123456780",
    maxParticipants: 100,
    registrationDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    fee: 500,
    status: "active",
    imageUrl: "/images/events/bootcamp.jpg",
    tags: ["entrepreneurship", "startup"],
    requirements: ["Laptop", "Motivation"],
    isPublic: false,
    createdAt: new Date().toISOString(),
    bookingStats: {
      totalBookings: 75,
      paidBookings: 60,
      pendingBookings: 15,
      totalRevenue: 30000,
      pendingRevenue: 7500,
    },
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const includeStats = searchParams.get("includeStats") === "true";
  const responseData = { events: events.map((event) => ({ ...event })) };
  if (!includeStats) {
    responseData.events = events.map(({ bookingStats, ...rest }) => rest);
  }
  return NextResponse.json(responseData);
}

export async function POST(req: Request) {
  const payload = await req.json();
  const newEvent: Event = {
    _id: `evt${Date.now()}`,
    title: payload.title || "New Event",
    description: payload.description || "",
    eventType: payload.eventType || "general",
    startDate: payload.startDate || new Date().toISOString(),
    endDate: payload.endDate || new Date().toISOString(),
    startTime: payload.startTime || "09:00",
    endTime: payload.endTime || "17:00",
    venue: payload.venue || "TBD",
    organizer: payload.organizer || "Admin",
    contactEmail: payload.contactEmail || "admin@campus.edu",
    contactPhone: payload.contactPhone || "",
    maxParticipants: payload.maxParticipants || 0,
    registrationDeadline:
      payload.registrationDeadline || new Date().toISOString(),
    fee: payload.fee || 0,
    status: payload.status || "draft",
    imageUrl: payload.imageUrl || "",
    tags: payload.tags || [],
    requirements: payload.requirements || [],
    isPublic: payload.isPublic ?? true,
    createdAt: new Date().toISOString(),
    bookingStats: {
      totalBookings: 0,
      paidBookings: 0,
      pendingBookings: 0,
      totalRevenue: 0,
      pendingRevenue: 0,
    },
  };
  events.push(newEvent);
  return NextResponse.json({ event: newEvent });
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const payload = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Event id is required" },
      { status: 400 },
    );
  }

  const index = events.findIndex((event) => event._id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  events[index] = { ...events[index], ...payload };
  return NextResponse.json({ event: events[index] });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Event id is required" },
      { status: 400 },
    );
  }

  events = events.filter((event) => event._id !== id);
  return NextResponse.json({ success: true });
}
