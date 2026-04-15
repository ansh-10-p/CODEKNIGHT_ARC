import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { EventBookingModel } from "@/lib/event-models";
import { verifyRazorpaySignature, getRazorpayPayment } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = await request.json();

    // Find the booking
    const booking = await EventBookingModel.findOne({ bookingId });
    
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify the payment signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      // Update booking as payment failed
      booking.paymentStatus = 'failed';
      booking.addStatusHistory('cancelled', 'Payment failed: Invalid payment signature');
      await booking.save();
      
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    let paymentDetails;
    try {
      paymentDetails = await getRazorpayPayment(razorpay_payment_id);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return NextResponse.json(
        { error: "Failed to verify payment details" },
        { status: 400 }
      );
    }

    // Update booking with payment details
    booking.paymentStatus = 'paid';
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.receiptGenerated = true;
    booking.addStatusHistory('confirmed', `Payment of ₹${booking.totalAmount} completed successfully`);

    await booking.save();

    // Populate the booking with event and student details for response
    const populatedBooking = await EventBookingModel.findById(booking._id)
      .populate('eventId', 'title startDate venue eventType organizer')
      .populate('studentId', 'firstName lastName email phone');

    return NextResponse.json({
      message: "Payment verified successfully",
      data: {
        booking: populatedBooking,
        paymentDetails: {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          amount: paymentDetails.amount / 100, // Convert from paise to rupees
          status: paymentDetails.status,
          method: paymentDetails.method,
          paidAt: new Date(paymentDetails.created_at * 1000)
        }
      }
    });

  } catch (error: any) {
    console.error("Error verifying event booking payment:", error);
    return NextResponse.json(
      { 
        error: error.message || "Payment verification failed",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
