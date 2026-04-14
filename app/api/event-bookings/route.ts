import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { EventBookingModel } from "@/lib/event-models";
import { EventModel } from "@/lib/models";
import { createRazorpayOrder } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch bookings (for admin or student)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const eventId = searchParams.get('eventId');
    const bookingStatus = searchParams.get('bookingStatus');
    const paymentStatus = searchParams.get('paymentStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query: any = {};
    if (studentId) query.studentId = studentId;
    if (eventId) query.eventId = eventId;
    if (bookingStatus) query.bookingStatus = bookingStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const bookings = await EventBookingModel.find(query)
      .populate('eventId', 'title startDate venue eventType organizer')
      .populate('studentId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EventBookingModel.countDocuments(query);

    // Calculate statistics
    const totalBookings = await EventBookingModel.countDocuments({});
    const totalRevenue = await EventBookingModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalBookings,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
      }
    });
  } catch (error: any) {
    console.error("Error fetching event bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create new event booking
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const bookingData = await request.json();

    const {
      studentId,
      studentName,
      studentEmail,
      studentPhone,
      eventId,
      attendeeCount = 1,
      paymentMethod,
      specialRequirements,
      totalAmount
    } = bookingData;

    // Validation
    if (!studentId || !studentName || !studentEmail || !eventId || !paymentMethod || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if student already registered for this event
    const existingBooking = await EventBookingModel.findOne({
      studentId,
      eventId,
      bookingStatus: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 }
      );
    }

    // Generate booking ID
    const bookingId = await EventBookingModel.generateBookingId();

    // Create booking
    const newBooking = new EventBookingModel({
      bookingId,
      studentId,
      studentName,
      studentEmail,
      studentPhone: studentPhone || '',
      eventId,
      eventTitle: event.title,
      eventDate: event.startDate,
      eventVenue: event.venue,
      attendeeCount,
      totalAmount,
      paymentMethod,
      specialRequirements: specialRequirements || '',
      statusHistory: [{
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Booking created'
      }]
    });

    let razorpayOrder = null;
    
    if (paymentMethod === 'online') {
      // Create Razorpay order
      razorpayOrder = await createRazorpayOrder(totalAmount, bookingId, studentEmail);
      newBooking.razorpayOrderId = razorpayOrder.id;
    } else {
      // For offline payment, mark as paid immediately
      newBooking.paymentStatus = 'paid';
    }

    await newBooking.save();

    return NextResponse.json({
      message: "Booking created successfully",
      booking: newBooking,
      razorpayOrder: razorpayOrder
    });

  } catch (error: any) {
    console.error("Error creating event booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

// PUT - Update booking (for admin or payment updates)
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    const updatedBooking = await EventBookingModel.findOneAndUpdate(
      { bookingId },
      updateData,
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Booking updated successfully",
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const reason = searchParams.get('reason') || 'Cancelled by user';
    
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await EventBookingModel.findOne({ bookingId });
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledBy = 'student';
    booking.cancelledAt = new Date();
    booking.addStatusHistory('cancelled', reason);

    await booking.save();

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
