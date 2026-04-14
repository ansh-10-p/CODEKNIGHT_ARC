import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TimetableModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch all available classes for student signup
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Get all unique classes from timetable entries
    const availableClasses = await TimetableModel.distinct('className');
    
    // Get class-subject mapping for better information
    const timetableEntries = await TimetableModel.find({})
      .populate('teacherId', 'firstName lastName')
      .select('className subjectName teacherId');

    // Group by class to show subjects and teachers
    const classDetails = availableClasses.map(className => {
      const classEntries = timetableEntries.filter(entry => entry.className === className);
      const subjects = [...new Set(classEntries.map(entry => entry.subjectName))];
      const teachers = [...new Set(classEntries.map(entry => 
        entry.teacherId ? `${(entry.teacherId as any).firstName} ${(entry.teacherId as any).lastName}` : 'Unknown'
      ))];

      return {
        className,
        subjects,
        teachers,
        subjectCount: subjects.length,
        teacherCount: teachers.length
      };
    }).sort((a, b) => a.className.localeCompare(b.className));

    return NextResponse.json({
      availableClasses: availableClasses.sort(),
      classDetails,
      totalClasses: availableClasses.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch available classes" },
      { status: 500 }
    );
  }
}
