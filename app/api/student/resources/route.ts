import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ResourceModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch active resources for students
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query - show all resources from database
    let query: any = {};
    
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const resources = await ResourceModel.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    const total = await ResourceModel.countDocuments(query);

    // Calculate statistics
    const totalActive = await ResourceModel.countDocuments({});
    const totalAvailable = await ResourceModel.countDocuments({ isAvailable: true });
    const totalBorrowed = await ResourceModel.countDocuments({ currentBorrower: { $ne: null } });

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalActive,
        totalAvailable,
        totalBorrowed
      }
    });
  } catch (error: any) {
    console.error("Error fetching student resources:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
