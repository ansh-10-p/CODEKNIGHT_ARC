import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { InternshipModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch all internships
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const locationType = searchParams.get('locationType');
    const experienceLevel = searchParams.get('experienceLevel');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (locationType) query.locationType = locationType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const internships = await InternshipModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InternshipModel.countDocuments(query);

    return NextResponse.json({
      internships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching internships:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch internships" },
      { status: 500 }
    );
  }
}

// POST - Create new internship
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const internshipData = await request.json();

    const {
      title,
      company,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      locationType,
      duration,
      stipend,
      applicationDeadline,
      startDate,
      endDate,
      contactEmail,
      contactPhone,
      companyWebsite,
      applicationUrl,
      status,
      category,
      experienceLevel,
      isRemote
    } = internshipData;

    // Validation
    if (!title || !company || !description || !location || !locationType || !duration || !applicationDeadline || !contactEmail) {
      return NextResponse.json(
        { error: "Required fields: title, company, description, location, locationType, duration, applicationDeadline, contactEmail" },
        { status: 400 }
      );
    }

    const newInternship = await InternshipModel.create({
      title,
      company,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      skills: skills || [],
      location,
      locationType,
      duration,
      stipend: stipend || '',
      applicationDeadline: new Date(applicationDeadline),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      contactEmail,
      contactPhone: contactPhone || '',
      companyWebsite: companyWebsite || '',
      applicationUrl: applicationUrl || '',
      status: status || 'active',
      category: category || null,
      experienceLevel: experienceLevel || 'fresher',
      isRemote: isRemote || false,
      applicationCount: 0
    });

    return NextResponse.json({
      message: "Internship created successfully",
      internship: newInternship
    });
  } catch (error: any) {
    console.error("Error creating internship:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create internship" },
      { status: 500 }
    );
  }
}

// PUT - Update internship
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get('id');
    
    if (!internshipId) {
      return NextResponse.json(
        { error: "Internship ID is required" },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Convert date strings to Date objects if they exist
    if (updateData.applicationDeadline) updateData.applicationDeadline = new Date(updateData.applicationDeadline);
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const updatedInternship = await InternshipModel.findByIdAndUpdate(
      internshipId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedInternship) {
      return NextResponse.json(
        { error: "Internship not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Internship updated successfully",
      internship: updatedInternship
    });
  } catch (error: any) {
    console.error("Error updating internship:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update internship" },
      { status: 500 }
    );
  }
}

// DELETE - Delete internship
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get('id');
    
    if (!internshipId) {
      return NextResponse.json(
        { error: "Internship ID is required" },
        { status: 400 }
      );
    }

    const deletedInternship = await InternshipModel.findByIdAndDelete(internshipId);

    if (!deletedInternship) {
      return NextResponse.json(
        { error: "Internship not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Internship deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting internship:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete internship" },
      { status: 500 }
    );
  }
}
