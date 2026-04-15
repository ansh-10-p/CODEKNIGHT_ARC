import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AttendanceModel, StudentModel, SectionModel, TimetableModel } from "@/lib/models";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch attendance records
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const date = searchParams.get('date');
    const className = searchParams.get('className');
    const studentId = searchParams.get('studentId');

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    let query: any = { teacherId: new mongoose.Types.ObjectId(teacherId) };

    if (date) query.date = date;
    if (className) query.className = className;
    if (studentId) query.studentId = new mongoose.Types.ObjectId(studentId);

    const attendanceRecords = await AttendanceModel.find(query)
      .populate('studentId', 'firstName lastName rollNumber studentId section')
      .sort({ date: -1, className: 1 });

    return NextResponse.json({ attendance: attendanceRecords });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST - Mark attendance for multiple students
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { teacherId, date, className, subjectName, attendanceData, timeSlot } = await request.json();

    if (!teacherId || !date || !className || !subjectName || !attendanceData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Process each student's attendance
    for (const record of attendanceData) {
      try {
        const { studentId, status, remarks } = record;
        
        // Upsert attendance record
        const attendanceRecord = await AttendanceModel.findOneAndUpdate(
          {
            teacherId: new mongoose.Types.ObjectId(teacherId),
            studentId: new mongoose.Types.ObjectId(studentId),
            className,
            subjectName,
            date
          },
          {
            status,
            timeSlot: timeSlot || undefined,
            remarks: remarks || undefined,
            updatedAt: new Date()
          },
          {
            upsert: true,
            new: true,
            runValidators: true
          }
        );

        results.push(attendanceRecord);
      } catch (recordError: any) {
        errors.push({
          studentId: record.studentId,
          error: recordError.message
        });
      }
    }

    return NextResponse.json({
      message: `Attendance saved for ${results.length} students`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save attendance" },
      { status: 500 }
    );
  }
}

// PUT - Update specific attendance record
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { recordId, status, remarks } = await request.json();

    if (!recordId || !status) {
      return NextResponse.json(
        { error: "Record ID and status are required" },
        { status: 400 }
      );
    }

    const updatedRecord = await AttendanceModel.findByIdAndUpdate(
      recordId,
      {
        status,
        remarks: remarks || undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'firstName lastName rollNumber studentId section');

    if (!updatedRecord) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Attendance updated successfully",
      record: updatedRecord
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update attendance" },
      { status: 500 }
    );
  }
}

// DELETE - Delete attendance record
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('recordId');

    if (!recordId) {
      return NextResponse.json(
        { error: "Record ID is required" },
        { status: 400 }
      );
    }

    const deletedRecord = await AttendanceModel.findByIdAndDelete(recordId);

    if (!deletedRecord) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Attendance record deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete attendance record" },
      { status: 500 }
    );
  }
}
