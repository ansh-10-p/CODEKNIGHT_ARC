import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import {
  ClassroomModel,
  ClassroomEnrollmentModel,
  StudentModel,
} from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { inviteCode, studentId } = body;

    if (!inviteCode || !studentId) {
      return NextResponse.json(
        { error: "Invite code and student ID are required" },
        { status: 400 }
      );
    }

    const student = await StudentModel.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const classroom = await ClassroomModel.findOne({
      inviteCode: inviteCode.toUpperCase(),
      status: "active",
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Invalid classroom code or classroom not found" },
        { status: 404 }
      );
    }

    const existingEnrollment = await ClassroomEnrollmentModel.findOne({
      classroomId: classroom._id,
      studentId,
      status: "active",
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "You are already enrolled in this classroom" },
        { status: 400 }
      );
    }

    if (classroom.studentsCount >= classroom.maxStudents) {
      return NextResponse.json({ error: "Classroom is full" }, { status: 400 });
    }

    const enrollment = new ClassroomEnrollmentModel({
      classroomId: classroom._id,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      studentRollNumber: student.rollNumber,
      enrolledAt: new Date(),
      status: "active",
      enrolledBy: "student",
    });

    await enrollment.save();

    await ClassroomModel.findByIdAndUpdate(classroom._id, {
      $inc: { studentsCount: 1 },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined classroom",
      classroom: {
        _id: classroom._id,
        title: classroom.title,
        subject: classroom.subject,
        teacherName: classroom.teacherName,
      },
    });
  } catch (error) {
    console.error("Error joining classroom:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You are already enrolled in this classroom" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to join classroom" },
      { status: 500 }
    );
  }
}
