import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ClassroomModel, ClassroomEnrollmentModel } from "@/lib/models";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const classroomId = params.id;

    const classroom = await ClassroomModel.findById(classroomId);
    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    const enrollments = await ClassroomEnrollmentModel.find({
      classroomId,
      status: "active",
    }).sort({ enrolledAt: 1 });

    return NextResponse.json({
      success: true,
      students: enrollments,
    });
  } catch (error) {
    console.error("Error fetching classroom students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const classroomId = params.id;
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const classroom = await ClassroomModel.findById(classroomId);
    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    const enrollment = await ClassroomEnrollmentModel.findOne({
      classroomId,
      studentId,
      status: "active",
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not found in this classroom" },
        { status: 404 }
      );
    }

    await ClassroomEnrollmentModel.findByIdAndUpdate(enrollment._id, {
      status: "removed",
    });

    await ClassroomModel.findByIdAndUpdate(classroomId, {
      $inc: { studentsCount: -1 },
    });

    return NextResponse.json({
      success: true,
      message: "Student removed from classroom successfully",
    });
  } catch (error) {
    console.error("Error removing student from classroom:", error);
    return NextResponse.json(
      { error: "Failed to remove student" },
      { status: 500 }
    );
  }
}
