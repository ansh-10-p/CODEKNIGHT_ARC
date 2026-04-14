import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WeeklyScheduleModel, ClassroomEnrollmentModel } from "@/lib/models";

// Helper function to get Monday of a given date
function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classroomId = searchParams.get("classroomId");
    const weekStartDate = searchParams.get("weekStartDate");

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
      .populate(
        "classroomId",
        "title subject teacherName teacherId teacherEmail"
      )
      .sort({ enrolledAt: -1 });

    if (!classroomId) {
      return NextResponse.json({
        success: true,
        schedule: null,
        enrollments,
        message: "Select a classroom to view schedule",
      });
    }

    // Verify student is enrolled in the classroom
    const enrollment = enrollments.find(
      (e) => e.classroomId._id.toString() === classroomId
    );

    console.log("=== ENROLLMENT DEBUG ===");
    console.log(
      "All enrollments:",
      enrollments.map((e) => ({
        classroomId: e.classroomId._id,
        teacherId: e.classroomId.teacherId,
        title: e.classroomId.title,
      }))
    );
    console.log("Looking for classroomId:", classroomId);
    console.log("Found enrollment:", !!enrollment);
    if (enrollment) {
      console.log("Enrollment classroom data:", {
        _id: enrollment.classroomId._id,
        teacherId: enrollment.classroomId.teacherId,
        title: enrollment.classroomId.title,
      });
    }
    console.log("=== END ENROLLMENT DEBUG ===");

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not enrolled in this classroom" },
        { status: 403 }
      );
    }

    // Get the week start date
    const currentWeekStart = weekStartDate || getMondayOfWeek(new Date());

    // Find the schedule for this classroom and week
    const schedule = await WeeklyScheduleModel.findOne({
      teacherId: enrollment.classroomId.teacherId,
      classroomId,
      weekStartDate: currentWeekStart,
      isActive: true,
    }).populate("classroomId", "title subject teacherName");

    // Debug logging
    console.log("=== STUDENT SCHEDULE DEBUG ===");
    console.log("Query parameters:", {
      teacherId: enrollment.classroomId.teacherId,
      classroomId,
      weekStartDate: currentWeekStart,
    });
    console.log("Schedule found:", !!schedule);
    console.log(
      "Schedule data:",
      schedule
        ? {
            _id: schedule._id,
            weeklyDataExists: !!schedule.weeklyData,
            weeklyDataType: typeof schedule.weeklyData,
            weeklyDataKeys: schedule.weeklyData
              ? Object.keys(schedule.weeklyData)
              : "none",
            weeklyData: schedule.weeklyData,
          }
        : "null"
    );
    console.log("=== END DEBUG ===");

    return NextResponse.json({
      success: true,
      schedule,
      enrollments,
      weekStartDate: currentWeekStart,
      classroom: enrollment.classroomId,
    });
  } catch (error) {
    console.error("Error fetching student schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
