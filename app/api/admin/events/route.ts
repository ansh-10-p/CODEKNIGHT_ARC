import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { EventModel } from "@/lib/models";
import { EventBookingModel } from "@/lib/event-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch all events
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const eventType = searchParams.get('eventType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeStats = searchParams.get('includeStats') === 'true';

    // Build query
    let query: any = {};
    if (status) query.status = status;
    if (eventType) query.eventType = eventType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const events = await EventModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EventModel.countDocuments(query);

    // Add booking statistics if requested
    let eventsWithStats = events;
    if (includeStats) {
      eventsWithStats = await Promise.all(
        events.map(async (event) => {
          const eventObj = event.toObject();
          
          // Get booking statistics for this event
          const bookingStats = await EventBookingModel.aggregate([
            { $match: { eventId: event._id } },
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                paidBookings: {
                  $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
                },
                pendingBookings: {
                  $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
                },
                totalRevenue: {
                  $sum: {
                    $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0]
                  }
                },
                pendingRevenue: {
                  $sum: {
                    $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalAmount', 0]
                  }
                }
              }
            }
          ]);

          const stats = bookingStats[0] || {
            totalBookings: 0,
            paidBookings: 0,
            pendingBookings: 0,
            totalRevenue: 0,
            pendingRevenue: 0
          };

          return {
            ...eventObj,
            bookingStats: {
              totalBookings: stats.totalBookings,
              paidBookings: stats.paidBookings,
              pendingBookings: stats.pendingBookings,
              totalRevenue: stats.totalRevenue,
              pendingRevenue: stats.pendingRevenue
            }
          };
        })
      );
    }

    return NextResponse.json({
      events: eventsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST - Create new event
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const eventData = await request.json();

    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      venue,
      organizer,
      contactEmail,
      contactPhone,
      maxParticipants,
      registrationDeadline,
      fee,
      status,
      imageUrl,
      tags,
      requirements,
      isPublic
    } = eventData;

    // Validation
    if (!title || !description || !eventType || !startDate || !endDate || !startTime || !endTime || !venue || !organizer) {
      return NextResponse.json(
        { error: "Required fields: title, description, eventType, startDate, endDate, startTime, endTime, venue, organizer" },
        { status: 400 }
      );
    }

    const newEvent = await EventModel.create({
      title,
      description,
      eventType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      venue,
      organizer,
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      maxParticipants: maxParticipants || null,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      fee: fee || 0,
      status: status || 'draft',
      imageUrl: imageUrl || '',
      tags: tags || [],
      requirements: requirements || [],
      isPublic: isPublic !== undefined ? isPublic : true
    });

    return NextResponse.json({
      message: "Event created successfully",
      event: newEvent
    });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

// PUT - Update event
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');
    
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Convert date strings to Date objects if they exist
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.registrationDeadline) updateData.registrationDeadline = new Date(updateData.registrationDeadline);

    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Event updated successfully",
      event: updatedEvent
    });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');
    
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const deletedEvent = await EventModel.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Event deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
