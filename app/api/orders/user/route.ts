import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/order-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType");

    if (!userId || !userType) {
      return NextResponse.json(
        { error: "User ID and user type are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch orders for the specific user, sorted by creation date (newest first)
    const orders = await OrderModel.find({
      customerId: userId,
      customerRole: userType,
    })
      .sort({ createdAt: -1 })
      .limit(10) // Limit to 10 most recent orders
      .lean();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
