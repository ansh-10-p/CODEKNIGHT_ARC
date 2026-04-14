import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TimetableModel, ClassroomModel } from "@/lib/models";

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
    const teacherId = searchParams.get("teacherId");
    const classroomId = searchParams.get("classroomId");
    const weekStartDate = searchParams.get("weekStartDate");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    let query: any = { teacherId, isActive: true };

    if (classroomId) {
      query.classroomId = classroomId;
    }

    if (weekStartDate) {
      query.weekStartDate = weekStartDate;
    } else {
      // Default to current week
      const currentWeekStart = getMondayOfWeek(new Date());
      query.weekStartDate = currentWeekStart;
    }

    // Get timetable entries
    const timetableEntries = await TimetableModel.find(query)
      .populate("classroomId", "title subject inviteCode")
      .sort({ day: 1, timeSlot: 1 });

    // Get teacher's classrooms for dropdown
    const classrooms = await ClassroomModel.find({
      teacherId,
      status: "active",
    }).select("_id title subject inviteCode studentsCount");

    // Organize timetable by day
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const organizedTimetable: any = {};

    daysOfWeek.forEach((day) => {
      organizedTimetable[day] = timetableEntries.filter(
        (entry) => entry.day === day
      );
    });

    return NextResponse.json({
      success: true,
      timetable: organizedTimetable,
      entries: timetableEntries,
      classrooms,
      weekStartDate: query.weekStartDate,
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable" },
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
      weekStartDate,
      day,
      timeSlot,
      type,
      subjectName,
      className,
      room,
      notes,
    } = body;

    if (
      !teacherId ||
      !classroomId ||
      !weekStartDate ||
      !day ||
      !timeSlot ||
      !type ||
      !className
    ) {
      return NextResponse.json(
        {
          error:
            "Required fields: teacherId, classroomId, weekStartDate, day, timeSlot, type, className",
        },
        { status: 400 }
      );
    }

    // Validate that subject is provided for class type
    if (type === "class" && !subjectName) {
      return NextResponse.json(
        { error: "Subject name is required for class entries" },
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

    // Create new timetable entry
    const timetableEntry = new TimetableModel({
      teacherId,
      classroomId,
      weekStartDate,
      day,
      timeSlot,
      type,
      subjectName: type === "class" ? subjectName : undefined,
      className,
      room,
      notes,
    });

    const savedEntry = await timetableEntry.save();

    // Populate the classroom information
    const populatedEntry = await TimetableModel.findById(
      savedEntry._id
    ).populate("classroomId", "title subject inviteCode");

    return NextResponse.json({
      success: true,
      message: "Timetable entry created successfully",
      entry: populatedEntry,
    });
  } catch (error) {
    console.error("Error creating timetable entry:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A timetable entry already exists for this time slot" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create timetable entry" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { entryId, teacherId, type, subjectName, room, notes } = body;

    if (!entryId || !teacherId) {
      return NextResponse.json(
        { error: "Entry ID and Teacher ID are required" },
        { status: 400 }
      );
    }

    // Validate that subject is provided for class type
    if (type === "class" && !subjectName) {
      return NextResponse.json(
        { error: "Subject name is required for class entries" },
        { status: 400 }
      );
    }

    // Find and update the entry
    const updatedEntry = await TimetableModel.findOneAndUpdate(
      { _id: entryId, teacherId },
      {
        type,
        subjectName: type === "class" ? subjectName : undefined,
        room,
        notes,
      },
      { new: true }
    );

    // Populate the classroom information
    const populatedEntry = await TimetableModel.findById(
      updatedEntry._id
    ).populate("classroomId", "title subject inviteCode");

    if (!updatedEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Timetable entry updated successfully",
      entry: populatedEntry,
    });
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to update timetable entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");
    const teacherId = searchParams.get("teacherId");

    if (!entryId || !teacherId) {
      return NextResponse.json(
        { error: "Entry ID and Teacher ID are required" },
        { status: 400 }
      );
    }

    // Find and delete the entry
    const deletedEntry = await TimetableModel.findOneAndDelete({
      _id: entryId,
      teacherId,
    });

    if (!deletedEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Timetable entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to delete timetable entry" },
      { status: 500 }
    );
  }
}

// Bulk operations for creating weekly schedules
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { action, teacherId, classroomId, weekStartDate, entries } = body;

    if (!action || !teacherId) {
      return NextResponse.json(
        { error: "Action and Teacher ID are required" },
        { status: 400 }
      );
    }

    if (action === "copy_week") {
      // Copy timetable from one week to another
      const { sourceWeekStartDate, targetWeekStartDate } = body;

      if (!sourceWeekStartDate || !targetWeekStartDate || !classroomId) {
        return NextResponse.json(
          {
            error:
              "Source week, target week, and classroom ID are required for copying",
          },
          { status: 400 }
        );
      }

      // Get source week entries
      const sourceEntries = await TimetableModel.find({
        teacherId,
        classroomId,
        weekStartDate: sourceWeekStartDate,
        isActive: true,
      });

      // Create new entries for target week
      const newEntries = sourceEntries.map((entry) => ({
        teacherId: entry.teacherId,
        classroomId: entry.classroomId,
        weekStartDate: targetWeekStartDate,
        day: entry.day,
        timeSlot: entry.timeSlot,
        type: entry.type,
        subjectName: entry.subjectName,
        className: entry.className,
        room: entry.room,
        notes: entry.notes,
      }));

      // Clear existing entries for target week first
      await TimetableModel.deleteMany({
        teacherId,
        classroomId,
        weekStartDate: targetWeekStartDate,
      });

      // Insert new entries
      const createdEntries = await TimetableModel.insertMany(newEntries);

      return NextResponse.json({
        success: true,
        message: `Copied ${createdEntries.length} entries to new week`,
        entriesCount: createdEntries.length,
      });
    }

    if (action === "clear_week") {
      // Clear all entries for a specific week
      if (!classroomId || !weekStartDate) {
        return NextResponse.json(
          {
            error: "Classroom ID and week start date are required for clearing",
          },
          { status: 400 }
        );
      }

      const result = await TimetableModel.deleteMany({
        teacherId,
        classroomId,
        weekStartDate,
      });

      return NextResponse.json({
        success: true,
        message: `Cleared ${result.deletedCount} entries from the week`,
        deletedCount: result.deletedCount,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in bulk timetable operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
