import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import {
  AttendanceModel,
  ClassroomEnrollmentModel,
  ClassroomModel,
} from "@/lib/models";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const classroomId = searchParams.get("classroomId");
    const date = searchParams.get("date");

    if (!teacherId || !classroomId) {
      return NextResponse.json(
        { error: "Teacher ID and Classroom ID are required" },
        { status: 400 }
      );
    }

    // Get classroom details
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

    // Get all students enrolled in this classroom
    const enrollments = await ClassroomEnrollmentModel.find({
      classroomId,
      status: "active",
    }).sort({ studentName: 1 });

    if (!date) {
      // Return students without attendance data
      return NextResponse.json({
        success: true,
        classroom,
        students: enrollments,
      });
    }

    // Get existing attendance records for the date
    const attendanceRecords = await AttendanceModel.find({
      teacherId,
      className: classroom.title,
      date,
    });

    // Create attendance map for quick lookup
    const attendanceMap = new Map();
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.studentId.toString(), record);
    });

    // Combine students with their attendance status
    const studentsWithAttendance = enrollments.map((enrollment) => ({
      ...enrollment.toObject(),
      attendance: attendanceMap.get(enrollment.studentId.toString()) || null,
    }));

    return NextResponse.json({
      success: true,
      classroom,
      students: studentsWithAttendance,
      date,
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      teacherId,
      classroomId,
      subjectName,
      date,
      attendanceData,
      remarks,
    } = body;

    if (
      !teacherId ||
      !classroomId ||
      !subjectName ||
      !date ||
      !attendanceData
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify classroom ownership
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

    const attendanceRecords = [];
    const errors = [];

    // Process each attendance record
    for (const record of attendanceData) {
      const { studentId, status } = record;

      if (
        !studentId ||
        !status ||
        !["present", "absent", "late"].includes(status)
      ) {
        errors.push(`Invalid data for student ${studentId}`);
        continue;
      }

      try {
        // Use upsert to update existing record or create new one
        const attendanceRecord = await AttendanceModel.findOneAndUpdate(
          {
            teacherId,
            studentId,
            className: classroom.title,
            subjectName,
            date,
          },
          {
            teacherId,
            studentId,
            className: classroom.title,
            subjectName,
            date,
            status,
            remarks: remarks || "",
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        );

        attendanceRecords.push(attendanceRecord);
      } catch (err) {
        console.error(`Error saving attendance for student ${studentId}:`, err);
        errors.push(`Failed to save attendance for student ${studentId}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Attendance saved for ${attendanceRecords.length} students`,
      savedRecords: attendanceRecords.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { attendanceId, status, remarks } = body;

    if (
      !attendanceId ||
      !status ||
      !["present", "absent", "late"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Valid attendance ID and status are required" },
        { status: 400 }
      );
    }

    const updatedRecord = await AttendanceModel.findByIdAndUpdate(
      attendanceId,
      { status, remarks: remarks || "" },
      { new: true }
    );

    if (!updatedRecord) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
