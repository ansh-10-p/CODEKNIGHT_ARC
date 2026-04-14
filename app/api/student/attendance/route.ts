import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AttendanceModel, ClassroomEnrollmentModel } from "@/lib/models";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classroomId = searchParams.get("classroomId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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
        attendanceRecords: [],
        enrollments,
        message: "Select a classroom to view attendance",
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

    // Build query for attendance records
    let query: any = {
      studentId,
      className: enrollment.classroomId.title,
    };

    // Only add teacherId if it exists (to avoid undefined in query)
    if (enrollment.classroomId.teacherId) {
      query.teacherId = enrollment.classroomId.teacherId;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }
    // If no dates provided, show all attendance records

    // Debug: Log the query and parameters
    console.log("=== STUDENT ATTENDANCE DEBUG ===");
    console.log("Query parameters:", {
      studentId,
      classroomId,
      startDate,
      endDate,
    });
    console.log("Enrollment found:", !!enrollment);
    if (enrollment) {
      console.log("Enrollment details:", {
        classroomId: enrollment.classroomId._id,
        classroomTitle: enrollment.classroomId.title,
        teacherId: enrollment.classroomId.teacherId,
        teacherName: enrollment.classroomId.teacherName,
        rawClassroom: enrollment.classroomId,
      });
    }
    console.log("Final query:", query);

    // Check if there are ANY attendance records in the database
    const totalAttendanceRecords = await AttendanceModel.countDocuments();
    console.log(
      "Total attendance records in database:",
      totalAttendanceRecords
    );

    // Check records for this specific student
    const studentRecords = await AttendanceModel.countDocuments({ studentId });
    console.log("Total records for this student:", studentRecords);

    // Show a sample of what attendance records actually look like
    const sampleStudentRecords = await AttendanceModel.find({
      studentId,
    }).limit(2);
    console.log(
      "Sample student records structure:",
      sampleStudentRecords.map((r) => ({
        _id: r._id,
        studentId: r.studentId,
        teacherId: r.teacherId,
        className: r.className,
        subjectName: r.subjectName,
        date: r.date,
        status: r.status,
      }))
    );

    // Get attendance records
    const attendanceRecords = await AttendanceModel.find(query).sort({
      date: -1,
      createdAt: -1,
    });

    console.log("Attendance records found:", attendanceRecords.length);
    console.log(
      "Sample records:",
      attendanceRecords.slice(0, 3).map((r) => ({
        date: r.date,
        status: r.status,
        subjectName: r.subjectName,
        studentId: r.studentId,
      }))
    );
    console.log("=== END ATTENDANCE DEBUG ===");

    // Calculate attendance statistics
    const totalClasses = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (record) => record.status === "present"
    ).length;
    const lateCount = attendanceRecords.filter(
      (record) => record.status === "late"
    ).length;
    const absentCount = attendanceRecords.filter(
      (record) => record.status === "absent"
    ).length;
    const attendancePercentage =
      totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    return NextResponse.json({
      success: true,
      attendanceRecords,
      enrollments,
      statistics: {
        totalClasses,
        presentCount,
        lateCount,
        absentCount,
        attendancePercentage,
      },
      classroom: enrollment.classroomId,
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}
