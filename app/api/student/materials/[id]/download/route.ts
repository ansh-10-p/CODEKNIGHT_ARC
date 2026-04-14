import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MaterialModel, ClassroomEnrollmentModel } from "@/lib/models";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const materialId = params.id;

    if (!studentId || !materialId) {
      return NextResponse.json(
        { error: "Student ID and Material ID are required" },
        { status: 400 }
      );
    }

    // Find the material
    const material = await MaterialModel.findOne({
      _id: materialId,
      isActive: true,
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Verify student is enrolled in the classroom
    const enrollment = await ClassroomEnrollmentModel.findOne({
      studentId,
      classroomId: material.classroomId,
      status: "active",
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not enrolled in this classroom" },
        { status: 403 }
      );
    }

    // Increment download count
    await MaterialModel.findByIdAndUpdate(materialId, {
      $inc: { downloadCount: 1 },
    });

    // Convert base64 to buffer
    const buffer = Buffer.from(material.fileData, "base64");

    // Set appropriate headers
    const headers = new Headers();
    headers.set("Content-Type", material.mimeType);
    headers.set("Content-Length", buffer.length.toString());
    headers.set(
      "Content-Disposition",
      `attachment; filename="${material.fileName}"`
    );

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error downloading material:", error);
    return NextResponse.json(
      { error: "Failed to download material" },
      { status: 500 }
    );
  }
}
