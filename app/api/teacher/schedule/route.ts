import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WeeklyScheduleModel, ClassroomModel } from "@/lib/models";

// Helper function to get Monday of a given date
function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

// Initialize empty schedule data
function getEmptyScheduleData() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const scheduleData: any = {};

  days.forEach((day) => {
    scheduleData[day] = [];
  });

  return scheduleData;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const classroomId = searchParams.get("classroomId");
    const weekStartDate = searchParams.get("weekStartDate");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Get teacher's classrooms for dropdown
    const classrooms = await ClassroomModel.find({
      teacherId,
      status: "active",
    }).select("_id title subject inviteCode studentsCount");

    if (!classroomId) {
      return NextResponse.json({
        success: true,
        schedule: null,
        classrooms,
        message: "Select a classroom to view schedule",
      });
    }

    // Get the week start date
    const currentWeekStart = weekStartDate || getMondayOfWeek(new Date());

    // Find existing schedule
    let schedule = await WeeklyScheduleModel.findOne({
      teacherId,
      classroomId,
      weekStartDate: currentWeekStart,
      isActive: true,
    }).populate("classroomId", "title subject inviteCode");

    // If no schedule exists, create an empty one
    if (!schedule) {
      schedule = {
        teacherId,
        classroomId,
        weekStartDate: currentWeekStart,
        weeklyData: getEmptyScheduleData(),
        isActive: true,
      };
    }

    return NextResponse.json({
      success: true,
      schedule,
      classrooms,
      weekStartDate: currentWeekStart,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { teacherId, classroomId, weekStartDate, scheduleData } = body;

    if (!teacherId || !classroomId || !weekStartDate) {
      return NextResponse.json(
        { error: "Teacher ID, Classroom ID, and Week Start Date are required" },
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

    // Validate and clean scheduleData
    let cleanScheduleData;
    if (!scheduleData || typeof scheduleData !== "object") {
      cleanScheduleData = getEmptyScheduleData();
    } else if (typeof scheduleData === "string") {
      cleanScheduleData = JSON.parse(scheduleData);
    } else {
      cleanScheduleData = scheduleData;
    }

    // Upsert the schedule (update if exists, create if not)
    const schedule = await WeeklyScheduleModel.findOneAndUpdate(
      { teacherId, classroomId, weekStartDate },
      {
        teacherId,
        classroomId,
        weekStartDate,
        weeklyData: cleanScheduleData,
        isActive: true,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).populate("classroomId", "title subject inviteCode");

    // Mark the weeklyData field as modified for Object type
    if (schedule && !schedule.isNew) {
      schedule.markModified("weeklyData");
      await schedule.save();
    }

    return NextResponse.json({
      success: true,
      message: "Schedule saved successfully",
      schedule,
    });
  } catch (error) {
    console.error("Error saving schedule:", error);
    return NextResponse.json(
      { error: "Failed to save schedule" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { scheduleId, teacherId, scheduleData } = body;

    if (!scheduleId || !teacherId || !scheduleData) {
      return NextResponse.json(
        { error: "Schedule ID, Teacher ID, and schedule data are required" },
        { status: 400 }
      );
    }

    // Update the schedule
    const updatedSchedule = await WeeklyScheduleModel.findOneAndUpdate(
      { _id: scheduleId, teacherId },
      { weeklyData: scheduleData },
      { new: true }
    ).populate("classroomId", "title subject inviteCode");

    if (!updatedSchedule) {
      return NextResponse.json(
        { error: "Schedule not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");
    const teacherId = searchParams.get("teacherId");

    if (!scheduleId || !teacherId) {
      return NextResponse.json(
        { error: "Schedule ID and Teacher ID are required" },
        { status: 400 }
      );
    }

    // Soft delete the schedule
    const deletedSchedule = await WeeklyScheduleModel.findOneAndUpdate(
      { _id: scheduleId, teacherId },
      { isActive: false },
      { new: true }
    );

    if (!deletedSchedule) {
      return NextResponse.json(
        { error: "Schedule not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}

// Bulk operations
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      action,
      teacherId,
      classroomId,
      sourceWeekStartDate,
      targetWeekStartDate,
    } = body;

    if (!action || !teacherId) {
      return NextResponse.json(
        { error: "Action and Teacher ID are required" },
        { status: 400 }
      );
    }

    if (action === "copy_week") {
      if (!sourceWeekStartDate || !targetWeekStartDate || !classroomId) {
        return NextResponse.json(
          {
            error:
              "Source week, target week, and classroom ID are required for copying",
          },
          { status: 400 }
        );
      }

      // Get source schedule
      const sourceSchedule = await WeeklyScheduleModel.findOne({
        teacherId,
        classroomId,
        weekStartDate: sourceWeekStartDate,
        isActive: true,
      });

      if (!sourceSchedule) {
        return NextResponse.json(
          { error: "Source schedule not found" },
          { status: 404 }
        );
      }

      // Create/update target schedule
      const targetSchedule = await WeeklyScheduleModel.findOneAndUpdate(
        { teacherId, classroomId, weekStartDate: targetWeekStartDate },
        {
          teacherId,
          classroomId,
          weekStartDate: targetWeekStartDate,
          weeklyData: sourceSchedule.weeklyData,
          isActive: true,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      return NextResponse.json({
        success: true,
        message: "Schedule copied successfully",
        schedule: targetSchedule,
      });
    }

    if (action === "clear_week") {
      if (!classroomId || !targetWeekStartDate) {
        return NextResponse.json(
          {
            error: "Classroom ID and week start date are required for clearing",
          },
          { status: 400 }
        );
      }

      // Clear the schedule by setting empty schedule data
      const clearedSchedule = await WeeklyScheduleModel.findOneAndUpdate(
        { teacherId, classroomId, weekStartDate: targetWeekStartDate },
        {
          weeklyData: getEmptyScheduleData(),
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: "Schedule cleared successfully",
        schedule: clearedSchedule,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in bulk schedule operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
