import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { EventModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch published events for students
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query - show all events from database
    let query: any = {};
    
    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const events = await EventModel.find(query)
      .sort({ startDate: 1 }) // Sort by start date ascending (upcoming first)
      .skip(skip)
      .limit(limit);

    const total = await EventModel.countDocuments(query);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching student events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}
