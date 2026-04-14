import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MaterialModel, ClassroomEnrollmentModel } from "@/lib/models";

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classroomId = searchParams.get("classroomId");
    const fileType = searchParams.get("fileType");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Get student's enrolled classrooms
    const enrollments = await ClassroomEnrollmentModel.find({
      studentId,
      status: "active",
    })
      .populate("classroomId", "title subject teacherName")
      .sort({ enrolledAt: -1 });

    if (!classroomId) {
      return NextResponse.json({
        success: true,
        materials: [],
        enrollments,
        message: "Select a classroom to view materials",
      });
    }

    // Verify student is enrolled in the classroom
    const enrollment = enrollments.find(
      (e) => e.classroomId._id.toString() === classroomId
    );
    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not enrolled in this classroom" },
        { status: 403 }
      );
    }

    // Build query
    let query: any = {
      classroomId,
      isActive: true,
    };

    if (fileType && (fileType === "pdf" || fileType === "image")) {
      query.fileType = fileType;
    }

    // Get materials without the actual file data for listing
    const materials = await MaterialModel.find(query)
      .select("-fileData") // Exclude large base64 data from listing
      .populate("teacherId", "name email")
      .populate("classroomId", "title subject")
      .sort({ createdAt: -1 });

    // Add formatted file sizes
    const materialsWithFormattedSize = materials.map((material) => ({
      ...material.toObject(),
      formattedFileSize: formatFileSize(material.fileSize),
    }));

    return NextResponse.json({
      success: true,
      materials: materialsWithFormattedSize,
      enrollments,
      totalCount: materials.length,
      classroom: enrollment.classroomId,
    });
  } catch (error) {
    console.error("Error fetching student materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}
