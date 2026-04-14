import { NextResponse } from "next/server";
import { getRazorpayPayment } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await getRazorpayPayment(paymentId);
    
    if (!paymentDetails) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Format the response
    const formattedDetails = {
      paymentId: paymentDetails.id,
      orderId: paymentDetails.order_id,
      amount: paymentDetails.amount / 100, // Convert from paise to rupees
      status: paymentDetails.status,
      method: paymentDetails.method,
      paidAt: new Date(paymentDetails.created_at * 1000),
      currency: paymentDetails.currency,
      description: paymentDetails.description,
      fee: paymentDetails.fee ? paymentDetails.fee / 100 : 0,
      tax: paymentDetails.tax ? paymentDetails.tax / 100 : 0,
      refundStatus: paymentDetails.refund_status,
      captured: paymentDetails.captured,
      bank: paymentDetails.bank,
      wallet: paymentDetails.wallet,
      vpa: paymentDetails.vpa,
      email: paymentDetails.email,
      contact: paymentDetails.contact,
      notes: paymentDetails.notes
    };

    return NextResponse.json(formattedDetails);

  } catch (error: any) {
    console.error("Error fetching payment details:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch payment details",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
