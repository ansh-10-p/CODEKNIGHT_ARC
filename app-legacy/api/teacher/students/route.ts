import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StudentModel, TimetableModel } from "@/lib/models";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch students in teacher's classes
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const className = searchParams.get('className');

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Find all classes this teacher teaches
    const teacherClasses = await TimetableModel.find({
      teacherId: new mongoose.Types.ObjectId(teacherId)
    }).distinct('className');

    if (teacherClasses.length === 0) {
      return NextResponse.json({ students: [], totalCount: 0 });
    }

    // Build query
    let query: any = { section: { $in: teacherClasses } };
    if (className) {
      query.section = className;
    }

    const students = await StudentModel.find(query)
      .select('firstName lastName email rollNumber studentId section course branch year semester phone')
      .sort({ section: 1, rollNumber: 1 });

    // Group students by class
    const studentsByClass = students.reduce((acc, student) => {
      const className = student.section;
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push({
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        rollNumber: student.rollNumber,
        studentId: student.studentId,
        section: student.section,
        course: student.course,
        branch: student.branch,
        year: student.year,
        semester: student.semester,
        phone: student.phone
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      students: className ? studentsByClass[className] || [] : studentsByClass,
      totalCount: students.length,
      teacherClasses
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST - Add new student to class
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const {
      teacherId,
      name,
      firstName,
      lastName,
      email,
      password,
      rollNumber,
      studentId,
      section,
      course,
      branch,
      year,
      semester,
      phone,
      gender,
      dateOfBirth,
      address
    } = await request.json();

    // Use name field if provided, otherwise combine firstName/lastName, or use firstName as name
    const studentName = name || `${firstName || ''} ${lastName || ''}`.trim() || firstName
    const [firstNamePart, ...lastNameParts] = studentName ? studentName.split(' ') : ['', '']
    const finalFirstName = firstName || firstNamePart || ''
    const finalLastName = lastName || lastNameParts.join(' ') || ''

    if (!teacherId || !studentName || !rollNumber || !studentId || !section || !course || !branch) {
      return NextResponse.json(
        { error: "Required fields: teacherId, name, rollNumber, studentId, section, course, branch" },
        { status: 400 }
      );
    }

    // Verify that the teacher teaches this class
    const teacherClassExists = await TimetableModel.findOne({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      className: section
    });

    if (!teacherClassExists) {
      return NextResponse.json(
        { error: "You can only add students to classes you teach" },
        { status: 403 }
      );
    }

    // Check if student already exists (skip email check if no email provided)
    const existingQuery = [{ rollNumber }, { studentId }]
    if (email && email.trim()) {
      existingQuery.push({ email })
    }
    
    const existingStudent = await StudentModel.findOne({
      $or: existingQuery
    });

    if (existingStudent) {
      // Check if the existing student is in a different class than what the teacher teaches
      const teacherClassExists = await TimetableModel.findOne({
        teacherId: new mongoose.Types.ObjectId(teacherId),
        className: existingStudent.section
      });
      
      // If teacher doesn't teach the existing student's current class, allow adding to new class
      if (!teacherClassExists) {
        // Update the existing student's section to the teacher's class
        const updatedStudent = await StudentModel.findByIdAndUpdate(
          existingStudent._id,
          { section },
          { new: true }
        );
        
        return NextResponse.json({
          message: "Student moved to your class successfully",
          student: {
            _id: updatedStudent._id,
            name: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
            firstName: updatedStudent.firstName,
            lastName: updatedStudent.lastName,
            email: updatedStudent.email,
            rollNumber: updatedStudent.rollNumber,
            studentId: updatedStudent.studentId,
            section: updatedStudent.section,
            course: updatedStudent.course,
            branch: updatedStudent.branch,
            year: updatedStudent.year,
            semester: updatedStudent.semester
          }
        });
      } else {
        return NextResponse.json(
          { error: "Student already exists in your class with this email, roll number, or student ID" },
          { status: 409 }
        );
      }
    }

    // Hash password if provided, otherwise use default
    const defaultPassword = `${rollNumber}@${section}`.toLowerCase()
    const hashedPassword = await bcrypt.hash(password || defaultPassword, 12);

    // Create student
    const newStudent = await StudentModel.create({
      firstName: finalFirstName,
      lastName: finalLastName,
      email: email || `${rollNumber}@student.local`,
      password: hashedPassword,
      rollNumber,
      studentId,
      section,
      course: course || "",
      branch: branch || "",
      year: year || "",
      semester: semester || "",
      phone: phone || "",
      gender: gender || "",
      dateOfBirth: dateOfBirth || "",
      address: address || "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      parentGuardianName: "",
      parentGuardianPhone: "",
      avatarInitials: `${finalFirstName.charAt(0) || 'S'}${finalLastName.charAt(0) || 'T'}`.toUpperCase()
    });

    return NextResponse.json({
      message: "Student added successfully",
      student: {
        _id: newStudent._id,
        name: `${finalFirstName} ${finalLastName}`.trim() || finalFirstName,
        firstName: finalFirstName,
        lastName: finalLastName,
        email: newStudent.email,
        rollNumber,
        studentId,
        section,
        course,
        branch,
        year,
        semester
      }
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Student already exists with this email, roll number, or student ID" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to add student" },
      { status: 500 }
    );
  }
}

// PUT - Update student information
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const {
      teacherId,
      studentId,
      name,
      firstName,
      lastName,
      email,
      rollNumber,
      section,
      course,
      branch,
      year,
      semester,
      phone
    } = await request.json();

    // Use name field if provided, otherwise combine firstName/lastName, or use firstName as name
    const studentName = name || `${firstName || ''} ${lastName || ''}`.trim() || firstName
    const [firstNamePart, ...lastNameParts] = studentName ? studentName.split(' ') : ['', '']
    const finalFirstName = firstName || firstNamePart || ''
    const finalLastName = lastName || lastNameParts.join(' ') || ''

    if (!teacherId || !studentId || !studentName || !rollNumber || !section) {
      return NextResponse.json(
        { error: "Required fields: teacherId, studentId, name, rollNumber, section" },
        { status: 400 }
      );
    }

    // Verify that the teacher teaches this class
    const teacherClassExists = await TimetableModel.findOne({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      className: section
    });

    if (!teacherClassExists) {
      return NextResponse.json(
        { error: "You can only update students in classes you teach" },
        { status: 403 }
      );
    }

    // Update student
    const updatedStudent = await StudentModel.findByIdAndUpdate(
      studentId,
      {
        firstName: finalFirstName,
        lastName: finalLastName,
        email: email || `${rollNumber}@student.local`,
        rollNumber,
        section,
        course: course || "",
        branch: branch || "",
        year: year || "",
        semester: semester || "",
        phone: phone || "",
        avatarInitials: `${finalFirstName.charAt(0) || 'S'}${finalLastName.charAt(0) || 'T'}`.toUpperCase()
      },
      { new: true, runValidators: true }
    ).select('firstName lastName email rollNumber studentId section course branch year semester phone');

    if (!updatedStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Student updated successfully",
      student: {
        _id: updatedStudent._id,
        name: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        email: updatedStudent.email,
        rollNumber: updatedStudent.rollNumber,
        studentId: updatedStudent.studentId,
        section: updatedStudent.section,
        course: updatedStudent.course,
        branch: updatedStudent.branch,
        year: updatedStudent.year,
        semester: updatedStudent.semester,
        phone: updatedStudent.phone
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 500 }
    );
  }
}

// DELETE - Remove student from class
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');

    if (!teacherId || !studentId) {
      return NextResponse.json(
        { error: "Teacher ID and Student ID are required" },
        { status: 400 }
      );
    }

    // Get student info first to verify teacher can delete them
    const student = await StudentModel.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Verify that the teacher teaches this student's class
    const teacherClassExists = await TimetableModel.findOne({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      className: student.section
    });

    if (!teacherClassExists) {
      return NextResponse.json(
        { error: "You can only delete students from classes you teach" },
        { status: 403 }
      );
    }

    // Delete student
    await StudentModel.findByIdAndDelete(studentId);

    return NextResponse.json({
      message: "Student deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete student" },
      { status: 500 }
    );
  }
}
