import { NextResponse } from "next/server";

interface Resource {
  _id: string;
  name: string;
  description: string;
  category: "book" | "equipment" | "facility";
  location: string;
  isAvailable: boolean;
  condition: "excellent" | "good" | "fair" | "damaged";
  status: "active" | "maintenance" | "retired";
  tags: string[];
  image?: string;
  isbn?: string;
  author?: string;
  publisher?: string;
  edition?: string;
  totalCopies?: number;
  availableCopies?: number;
  serialNumber?: string;
  model?: string;
  brand?: string;
  specifications?: string;
  capacity?: number;
  amenities?: string[];
  operatingHours?: {
    start: string;
    end: string;
  };
  maxBorrowDuration?: number;
  requiresApproval: boolean;
  currentBorrower?: string;
  dueDate?: string;
  totalBorrows: number;
  createdAt: string;
  updatedAt?: string;
}

let resources: Resource[] = [
  {
    _id: "res1",
    name: "Advanced Data Structures Textbook",
    description:
      "Comprehensive textbook for advanced algorithms and data structures.",
    category: "book",
    location: "Library - Shelf B2",
    isAvailable: true,
    condition: "excellent",
    status: "active",
    tags: ["book", "computer science"],
    isbn: "978-0134190440",
    author: "S. Lipschutz",
    publisher: "McGraw Hill",
    edition: "3rd",
    totalCopies: 10,
    availableCopies: 7,
    maxBorrowDuration: 14,
    requiresApproval: false,
    totalBorrows: 62,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: Request) {
  return NextResponse.json({ resources });
}

export async function POST(req: Request) {
  const payload = await req.json();
  const newResource: Resource = {
    _id: `res${Date.now()}`,
    name: payload.name || "New Resource",
    description: payload.description || "",
    category: payload.category || "book",
    location: payload.location || "",
    isAvailable: payload.isAvailable ?? true,
    condition: payload.condition || "good",
    status: payload.status || "active",
    tags: payload.tags || [],
    image: payload.image || "",
    isbn: payload.isbn,
    author: payload.author,
    publisher: payload.publisher,
    edition: payload.edition,
    totalCopies: payload.totalCopies ?? 0,
    availableCopies: payload.availableCopies ?? payload.totalCopies ?? 0,
    serialNumber: payload.serialNumber,
    model: payload.model,
    brand: payload.brand,
    specifications: payload.specifications,
    capacity: payload.capacity,
    amenities: payload.amenities || [],
    operatingHours: payload.operatingHours,
    maxBorrowDuration: payload.maxBorrowDuration,
    requiresApproval: payload.requiresApproval ?? false,
    totalBorrows: payload.totalBorrows ?? 0,
    createdAt: new Date().toISOString(),
    dueDate: payload.dueDate,
    currentBorrower: payload.currentBorrower,
  };
  resources.push(newResource);
  return NextResponse.json({ resource: newResource });
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const payload = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Resource id is required" },
      { status: 400 },
    );
  }

  const index = resources.findIndex((resource) => resource._id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  resources[index] = {
    ...resources[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ resource: resources[index] });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Resource id is required" },
      { status: 400 },
    );
  }

  resources = resources.filter((resource) => resource._id !== id);
  return NextResponse.json({ success: true });
}
