import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.json(
      { error: "paymentId is required" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    paymentId,
    status: "captured",
    amount: 5000,
    currency: "INR",
    method: "upi",
    email: "student@example.com",
    contact: "9876501234",
    createdAt: new Date().toISOString(),
  });
}
