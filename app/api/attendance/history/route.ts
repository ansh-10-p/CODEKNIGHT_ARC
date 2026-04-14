import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AttendanceModel, StudentModel } from "@/lib/models";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch attendance history with analytics
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const className = searchParams.get('className');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const subjectName = searchParams.get('subjectName');

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    let query: any = { teacherId: new mongoose.Types.ObjectId(teacherId) };

    if (studentId) query.studentId = new mongoose.Types.ObjectId(studentId);
    if (className) query.className = className;
    if (subjectName) query.subjectName = subjectName;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // Fetch attendance records with student details
    const attendanceRecords = await AttendanceModel.find(query)
      .populate('studentId', 'firstName lastName rollNumber studentId section')
      .sort({ date: -1, className: 1, 'studentId.rollNumber': 1 });

    // If specific student requested, return detailed history
    if (studentId) {
      const totalClasses = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
      const absentCount = attendanceRecords.filter(record => record.status === 'absent').length;
      const lateCount = attendanceRecords.filter(record => record.status === 'late').length;
      
      const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

      return NextResponse.json({
        studentHistory: {
          student: attendanceRecords[0]?.studentId || null,
          totalClasses,
          presentCount,
          absentCount,
          lateCount,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100,
          records: attendanceRecords
        }
      });
    }

    // Group by student for class overview
    const studentStats = attendanceRecords.reduce((acc, record) => {
      const studentKey = record.studentId._id.toString();
      
      if (!acc[studentKey]) {
        acc[studentKey] = {
          student: record.studentId,
          totalClasses: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          records: []
        };
      }

      acc[studentKey].totalClasses++;
      acc[studentKey].records.push(record);
      
      if (record.status === 'present') acc[studentKey].presentCount++;
      else if (record.status === 'absent') acc[studentKey].absentCount++;
      else if (record.status === 'late') acc[studentKey].lateCount++;

      return acc;
    }, {} as Record<string, any>);

    // Calculate attendance percentages
    const studentsWithStats = Object.values(studentStats).map((stat: any) => ({
      ...stat,
      attendancePercentage: stat.totalClasses > 0 
        ? Math.round(((stat.presentCount + stat.lateCount) / stat.totalClasses) * 100 * 100) / 100
        : 0
    })).sort((a: any, b: any) => b.attendancePercentage - a.attendancePercentage);

    // Overall class statistics
    const totalRecords = attendanceRecords.length;
    const overallPresent = attendanceRecords.filter(r => r.status === 'present').length;
    const overallAbsent = attendanceRecords.filter(r => r.status === 'absent').length;
    const overallLate = attendanceRecords.filter(r => r.status === 'late').length;
    
    const classStats = {
      totalRecords,
      overallPresent,
      overallAbsent,
      overallLate,
      averageAttendance: totalRecords > 0 
        ? Math.round(((overallPresent + overallLate) / totalRecords) * 100 * 100) / 100
        : 0
    };

    // Date-wise attendance summary
    const dateWiseSummary = attendanceRecords.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = {
          date: record.date,
          totalStudents: 0,
          present: 0,
          absent: 0,
          late: 0,
          className: record.className,
          subjectName: record.subjectName
        };
      }

      acc[record.date].totalStudents++;
      acc[record.date][record.status]++;

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      classOverview: {
        students: studentsWithStats,
        classStats,
        dateWiseSummary: Object.values(dateWiseSummary).sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        totalRecords: attendanceRecords.length
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch attendance history" },
      { status: 500 }
    );
  }
}
