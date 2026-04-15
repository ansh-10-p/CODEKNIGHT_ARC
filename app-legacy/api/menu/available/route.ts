import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MenuItemModel, CanteenModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch all available menu items from all canteens
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Fetch all available menu items with canteen information
    const menuItems = await MenuItemModel.aggregate([
      {
        $match: { isAvailable: true }
      },
      {
        $lookup: {
          from: 'canteens',
          localField: 'canteenId',
          foreignField: '_id',
          as: 'canteen'
        }
      },
      {
        $unwind: '$canteen'
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          category: 1,
          image: 1,
          isVeg: 1,
          isSpicy: 1,
          prepTime: 1,
          rating: 1,
          isAvailable: 1,
          createdAt: 1,
          updatedAt: 1,
          canteenName: '$canteen.ownerName',
          canteenId: '$canteen._id'
        }
      },
      {
        $sort: { category: 1, name: 1 }
      }
    ]);
    
    return NextResponse.json({ 
      data: menuItems,
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error fetching available menu items:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}