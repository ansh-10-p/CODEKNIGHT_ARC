import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TimetableModel } from "@/lib/models";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch teacher's classes and subjects
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    const timetableEntries = await TimetableModel.find({
      teacherId: new mongoose.Types.ObjectId(teacherId)
    });

    const classes = [...new Set(timetableEntries.map(entry => entry.className))];
    const subjects = [...new Set(timetableEntries.map(entry => entry.subjectName))];

    // Group subjects by class for better organization
    const classesBySubject = timetableEntries.reduce((acc, entry) => {
      if (!acc[entry.className]) {
        acc[entry.className] = new Set();
      }
      acc[entry.className].add(entry.subjectName);
      return acc;
    }, {} as Record<string, Set<string>>);

    const classSubjectMapping = Object.fromEntries(
      Object.entries(classesBySubject).map(([className, subjects]) => [
        className, 
        Array.from(subjects)
      ])
    );

    return NextResponse.json({
      classes,
      subjects,
      classSubjectMapping,
      timetableEntries: timetableEntries.map(entry => ({
        id: entry._id,
        day: entry.day,
        timeSlot: entry.timeSlot,
        className: entry.className,
        subjectName: entry.subjectName
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch classes and subjects" },
      { status: 500 }
    );
  }
}

// POST - Add new class/subject combination
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { teacherId, className, subjectName, day, timeSlot } = await request.json();

    if (!teacherId || !className || !subjectName || !day || !timeSlot) {
      return NextResponse.json(
        { error: "All fields are required: teacherId, className, subjectName, day, timeSlot" },
        { status: 400 }
      );
    }

    // Check if this slot is already occupied
    const existingEntry = await TimetableModel.findOne({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      day,
      timeSlot
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "This time slot is already occupied" },
        { status: 409 }
      );
    }

    const newEntry = await TimetableModel.create({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      className,
      subjectName,
      day,
      timeSlot
    });

    return NextResponse.json({
      message: "Class/Subject combination added successfully",
      entry: {
        id: newEntry._id,
        day: newEntry.day,
        timeSlot: newEntry.timeSlot,
        className: newEntry.className,
        subjectName: newEntry.subjectName
      }
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "This time slot is already occupied" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to add class/subject" },
      { status: 500 }
    );
  }
}

// PUT - Update class/subject combination
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { entryId, className, subjectName } = await request.json();

    if (!entryId || !className || !subjectName) {
      return NextResponse.json(
        { error: "Entry ID, class name, and subject name are required" },
        { status: 400 }
      );
    }

    const updatedEntry = await TimetableModel.findByIdAndUpdate(
      entryId,
      { className, subjectName },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Class/Subject updated successfully",
      entry: {
        id: updatedEntry._id,
        day: updatedEntry.day,
        timeSlot: updatedEntry.timeSlot,
        className: updatedEntry.className,
        subjectName: updatedEntry.subjectName
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update class/subject" },
      { status: 500 }
    );
  }
}

// DELETE - Remove class/subject combination
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const deletedEntry = await TimetableModel.findByIdAndDelete(entryId);

    if (!deletedEntry) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Class/Subject combination deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete class/subject" },
      { status: 500 }
    );
  }
}
