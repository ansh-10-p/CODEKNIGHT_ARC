import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StudentModel, TimetableModel } from "@/lib/models";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch students based on teacher's classes
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const className = searchParams.get('className');
    const searchName = searchParams.get('search');

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    let query: any = {};

    if (className) {
      // If specific class is requested, find students in that class
      query.section = className;
    } else {
      // Find all classes this teacher teaches
      const teacherClasses = await TimetableModel.find({
        teacherId: new mongoose.Types.ObjectId(teacherId)
      }).distinct('className');

      if (teacherClasses.length === 0) {
        return NextResponse.json({ students: [] });
      }

      // Find students in any of these classes
      query.section = { $in: teacherClasses };
    }

    // Add search functionality
    if (searchName) {
      query.$or = [
        { firstName: { $regex: searchName, $options: 'i' } },
        { lastName: { $regex: searchName, $options: 'i' } },
        { rollNumber: { $regex: searchName, $options: 'i' } },
        { studentId: { $regex: searchName, $options: 'i' } }
      ];
    }

    const students = await StudentModel.find(query)
      .select('firstName lastName email rollNumber studentId section course branch year semester')
      .sort({ section: 1, rollNumber: 1 });

    // Group students by class for better organization
    const groupedStudents = students.reduce((acc, student) => {
      const className = student.section;
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push({
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        studentId: student.studentId,
        section: student.section,
        email: student.email,
        course: student.course,
        branch: student.branch,
        year: student.year,
        semester: student.semester
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      students: className ? students : groupedStudents,
      totalCount: students.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}
