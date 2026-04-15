import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import {
  ClassroomModel,
  ClassroomEnrollmentModel,
  TeacherModel,
} from "@/lib/models";

function generateInviteCode(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateClassroomId(subject: string): string {
  const prefix = subject
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 3);
  const number = Math.floor(Math.random() * 900) + 100;
  return `${prefix}${number}`;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const studentId = searchParams.get("studentId");

    if (teacherId) {
      const classrooms = await ClassroomModel.find({ teacherId }).sort({
        createdAt: -1,
      });

      return NextResponse.json({
        success: true,
        classrooms,
      });
    }

    if (studentId) {
      const enrollments = await ClassroomEnrollmentModel.find({
        studentId,
        status: "active",
      }).populate("classroomId");

      const enrolledClassrooms = enrollments.map(
        (enrollment) => enrollment.classroomId
      );

      const availableClassrooms = await ClassroomModel.find({
        status: "active",
        isPublic: true,
        _id: { $nin: enrolledClassrooms.map((c) => c._id) },
      }).limit(20);

      return NextResponse.json({
        success: true,
        enrolledClassrooms,
        availableClassrooms,
      });
    }

    const classrooms = await ClassroomModel.find({ status: "active" })
      .populate("teacherId", "firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      classrooms,
    });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { title, subject, description, maxStudents, schedule, teacherId } =
      body;

    if (
      !title ||
      !subject ||
      !description ||
      !maxStudents ||
      !schedule ||
      !teacherId
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(schedule) || schedule.length === 0) {
      return NextResponse.json(
        { error: "At least one schedule item is required" },
        { status: 400 }
      );
    }

    const teacher = await TeacherModel.findById(teacherId);
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    let classroomId = generateClassroomId(subject);
    let inviteCode = generateInviteCode();

    while (await ClassroomModel.findOne({ classroomId })) {
      classroomId = generateClassroomId(subject);
    }

    while (await ClassroomModel.findOne({ inviteCode })) {
      inviteCode = generateInviteCode();
    }

    const classroom = new ClassroomModel({
      classroomId,
      inviteCode,
      title,
      subject,
      description,
      teacherId,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      maxStudents,
      schedule,
      status: "active",
      studentsCount: 0,
    });

    await classroom.save();

    return NextResponse.json({
      success: true,
      message: "Classroom created successfully",
      classroom,
    });
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json(
      { error: "Failed to create classroom" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      classroomId,
      title,
      subject,
      description,
      maxStudents,
      schedule,
      teacherId,
    } = body;

    if (!classroomId || !teacherId) {
      return NextResponse.json(
        { error: "Classroom ID and Teacher ID are required" },
        { status: 400 }
      );
    }

    const classroom = await ClassroomModel.findOne({
      _id: classroomId,
      teacherId,
    });
    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found or unauthorized" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (subject) updateData.subject = subject;
    if (description) updateData.description = description;
    if (maxStudents) updateData.maxStudents = maxStudents;
    if (schedule) updateData.schedule = schedule;

    const updatedClassroom = await ClassroomModel.findByIdAndUpdate(
      classroomId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Classroom updated successfully",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error updating classroom:", error);
    return NextResponse.json(
      { error: "Failed to update classroom" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const teacherId = searchParams.get("teacherId");

    if (!classroomId || !teacherId) {
      return NextResponse.json(
        { error: "Classroom ID and Teacher ID are required" },
        { status: 400 }
      );
    }

    const classroom = await ClassroomModel.findOne({
      _id: classroomId,
      teacherId,
    });
    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found or unauthorized" },
        { status: 404 }
      );
    }

    await ClassroomEnrollmentModel.deleteMany({ classroomId });
    await ClassroomModel.findByIdAndDelete(classroomId);

    return NextResponse.json({
      success: true,
      message: "Classroom deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return NextResponse.json(
      { error: "Failed to delete classroom" },
      { status: 500 }
    );
  }
}
