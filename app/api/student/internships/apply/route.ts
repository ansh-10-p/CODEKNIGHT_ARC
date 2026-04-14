import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { InternshipModel, InternshipApplicationModel, StudentModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST - Submit internship application with resume
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const formData = await request.formData();
    
    // Extract form fields
    const internshipId = formData.get('internshipId') as string;
    const studentId = formData.get('studentId') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const resumeFile = formData.get('resume') as File;
    
    if (!internshipId || !studentId || !resumeFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resumeFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOC/DOCX files are allowed." },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (resumeFile.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }
    
    // Validate studentId is a valid ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: "Invalid student ID. Please login as a student to apply for internships." },
        { status: 400 }
      );
    }
    
    // Get student details
    const student = await StudentModel.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { error: "Student account not found. Please login as a student to apply for internships." },
        { status: 404 }
      );
    }
    
    // Get internship details
    const internship = await InternshipModel.findById(internshipId);
    if (!internship) {
      return NextResponse.json(
        { error: "Internship not found" },
        { status: 404 }
      );
    }
    
    // Check if internship is active
    if (internship.status !== 'active') {
      return NextResponse.json(
        { error: "This internship is not accepting applications" },
        { status: 400 }
      );
    }
    
    // Check if deadline has passed
    if (new Date(internship.applicationDeadline) < new Date()) {
      return NextResponse.json(
        { error: "Application deadline has passed" },
        { status: 400 }
      );
    }
    
    // Check if student has already applied
    const existingApplication = await InternshipApplicationModel.findOne({
      internshipId,
      studentId
    });
    
    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this internship" },
        { status: 400 }
      );
    }
    
    // Convert file to base64
    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Resume = buffer.toString('base64');
    
    // Determine file type extension
    let fileType = 'pdf';
    if (resumeFile.type === 'application/msword') {
      fileType = 'doc';
    } else if (resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      fileType = 'docx';
    }
    
    // Create student class string
    const studentClass = `${student.year} ${student.branch} - Section ${student.section}`;
    
    // Create application
    const application = new InternshipApplicationModel({
      internshipId,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      studentPhone: student.phone,
      studentClass,
      studentRollNumber: student.rollNumber,
      resumeFileName: resumeFile.name,
      resumeFilePath: `data:${resumeFile.type};base64,${base64Resume}`,
      resumeFileType: fileType,
      coverLetter: coverLetter || '',
      applicationStatus: 'pending',
      appliedAt: new Date()
    });
    
    await application.save();
    
    // Update internship application count
    await InternshipModel.findByIdAndUpdate(
      internshipId,
      { $inc: { applicationCount: 1 } }
    );
    
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: application._id
    });
    
  } catch (error: any) {
    console.error("Error submitting internship application:", error);
    
    // Handle duplicate application error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already applied for this internship" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}

// GET - Fetch student's applications
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const internshipId = searchParams.get('internshipId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }
    
    // Validate studentId is a valid ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      // Return empty applications for non-student users
      return NextResponse.json({
        applications: [],
        total: 0,
        message: "No applications found for this user"
      });
    }
    
    // If checking for a specific internship
    if (internshipId) {
      const application = await InternshipApplicationModel.findOne({
        studentId,
        internshipId
      }).populate('internshipId');
      
      return NextResponse.json({
        hasApplied: !!application,
        application
      });
    }
    
    // Get all applications for the student
    const applications = await InternshipApplicationModel.find({
      studentId
    })
    .populate('internshipId')
    .sort({ appliedAt: -1 });
    
    return NextResponse.json({
      applications,
      total: applications.length
    });
    
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
