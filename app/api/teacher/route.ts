import { NextResponse } from "next/server"
import { teacherResourcesStore } from "@/lib/teacher-resources-store"

let nextId = teacherResourcesStore.length + 1

export async function GET() {
  return NextResponse.json({ resources: teacherResourcesStore })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, subject, description, content, category, postedBy, postedByName } = body

    if (!title || !subject || !content) {
      return NextResponse.json({ error: "title, subject and content are required" }, { status: 400 })
    }

    const resource = {
      _id: `tr-${nextId++}`,
      title,
      subject,
      description: description || "",
      content,
      category: category || "notes",
      postedBy: postedBy || "teacher",
      postedByName: postedByName || "Teacher",
      fileSize: `${Math.round(content.length / 100) / 10} KB`,
      downloads: 0,
      createdAt: new Date().toISOString(),
    }

    teacherResourcesStore.push(resource)
    return NextResponse.json({ resource }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create resource"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const idx = teacherResourcesStore.findIndex(r => r._id === id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
  teacherResourcesStore.splice(idx, 1)
  return NextResponse.json({ success: true })
}