import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/order-models";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST - Verify Razorpay payment
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
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
      // Mark payment as failed
      order.paymentStatus = 'failed';
      order.addStatusHistory('cancelled', 'Payment verification failed');
      await order.save();

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Payment is valid, update order
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.addStatusHistory('confirmed', 'Payment verified and order confirmed');
    
    await order.save();
    
    return NextResponse.json({ 
      data: order,
      message: "Payment verified successfully",
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error verifying payment:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}