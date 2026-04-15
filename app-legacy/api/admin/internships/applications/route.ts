import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { InternshipApplicationModel, InternshipModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch all internship applications with filters
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get('internshipId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build query
    let query: any = {};
    
    if (internshipId) {
      query.internshipId = internshipId;
    }
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    if (status && status !== 'all') {
      query.applicationStatus = status;
    }
    
    const skip = (page - 1) * limit;
    
    // Fetch applications with populated internship details
    const applications = await InternshipApplicationModel.find(query)
      .populate('internshipId')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await InternshipApplicationModel.countDocuments(query);
    
    // Get statistics
    const stats = await InternshipApplicationModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$applicationStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusCounts = {
      pending: 0,
      under_review: 0,
      shortlisted: 0,
      rejected: 0,
      selected: 0
    };
    
    stats.forEach(stat => {
      statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
    });
    
    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statusCounts
    });
    
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// PUT - Update application status
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');
    
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const {
      applicationStatus,
      reviewNotes,
      reviewedBy,
      interviewDate,
      interviewTime,
      interviewVenue,
      selectionNotes
    } = body;
    
    const updateData: any = {
      applicationStatus,
      reviewedAt: new Date(),
      reviewedBy
    };
    
    if (reviewNotes) updateData.reviewNotes = reviewNotes;
    if (interviewDate) updateData.interviewDate = interviewDate;
    if (interviewTime) updateData.interviewTime = interviewTime;
    if (interviewVenue) updateData.interviewVenue = interviewVenue;
    if (selectionNotes) updateData.selectionNotes = selectionNotes;
    
    const application = await InternshipApplicationModel.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('internshipId');
    
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      application
    });
    
  } catch (error: any) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update application" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an application
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');
    
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }
    
    const application = await InternshipApplicationModel.findById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Decrease application count in internship
    await InternshipModel.findByIdAndUpdate(
      application.internshipId,
      { $inc: { applicationCount: -1 } }
    );
    
    await InternshipApplicationModel.findByIdAndDelete(applicationId);
    
    return NextResponse.json({
      success: true,
      message: "Application deleted successfully"
    });
    
  } catch (error: any) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete application" },
      { status: 500 }
    );
  }
}
