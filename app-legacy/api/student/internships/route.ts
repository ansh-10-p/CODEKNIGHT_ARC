import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { InternshipModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch active internships for students
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const locationType = searchParams.get('locationType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query - show only active internships
    let query: any = { status: 'active' };
    
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }
    
    if (locationType && locationType !== 'all') {
      query.locationType = locationType.toLowerCase();
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { requirements: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const internships = await InternshipModel.find(query)
      .sort({ applicationDeadline: 1 }) // Sort by deadline ascending (closing soon first)
      .skip(skip)
      .limit(limit);

    const total = await InternshipModel.countDocuments(query);

    // Calculate statistics
    const totalActive = await InternshipModel.countDocuments({ status: 'active' });
    const totalRemote = await InternshipModel.countDocuments({ status: 'active', locationType: 'remote' });
    const totalApplications = await InternshipModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$applicationCount' } } }
    ]);
    
    // Count internships closing within 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const today = new Date();
    const closingSoon = await InternshipModel.countDocuments({
      status: 'active',
      applicationDeadline: { $gte: today, $lte: threeDaysFromNow }
    });

    return NextResponse.json({
      internships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalActive,
        totalRemote,
        totalApplications: totalApplications.length > 0 ? totalApplications[0].total : 0,
        closingSoon
      }
    });
  } catch (error: any) {
    console.error("Error fetching student internships:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch internships" },
      { status: 500 }
    );
  }
}
