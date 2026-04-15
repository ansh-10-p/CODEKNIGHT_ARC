import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TimetableModel } from "@/lib/models";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch all timetable entries for a teacher
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

    const lectures = await TimetableModel.find({ 
      teacherId: new mongoose.Types.ObjectId(teacherId) 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ lectures });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}

// POST - Add new lecture to timetable
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { teacherId, day, timeSlot, subjectName, className } = await request.json();

    if (!teacherId || !day || !timeSlot || !subjectName || !className) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if slot is already occupied by this teacher
    const existingLecture = await TimetableModel.findOne({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      day,
      timeSlot
    });

    if (existingLecture) {
      return NextResponse.json(
        { error: "Time slot already occupied" },
        { status: 409 }
      );
    }

    const newLecture = await TimetableModel.create({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      day,
      timeSlot,
      subjectName,
      className
    });

    return NextResponse.json({ 
      lecture: newLecture,
      message: "Lecture added successfully" 
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Time slot already occupied" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to add lecture" },
      { status: 500 }
    );
  }
}

// PUT - Update existing lecture
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { lectureId, subjectName, className } = await request.json();

    if (!lectureId || !subjectName || !className) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const updatedLecture = await TimetableModel.findByIdAndUpdate(
      lectureId,
      { subjectName, className },
      { new: true }
    );

    if (!updatedLecture) {
      return NextResponse.json(
        { error: "Lecture not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      lecture: updatedLecture,
      message: "Lecture updated successfully" 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update lecture" },
      { status: 500 }
    );
  }
}

// DELETE - Remove lecture from timetable
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');

    if (!lectureId) {
      return NextResponse.json(
        { error: "Lecture ID is required" },
        { status: 400 }
      );
    }

    const deletedLecture = await TimetableModel.findByIdAndDelete(lectureId);

    if (!deletedLecture) {
      return NextResponse.json(
        { error: "Lecture not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Lecture deleted successfully" 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete lecture" },
      { status: 500 }
    );
  }
}
