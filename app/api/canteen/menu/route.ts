import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MenuItemModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch all menu items for a canteen
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const canteenId = searchParams.get('canteenId');
    
    if (!canteenId) {
      return NextResponse.json(
        { error: "Canteen ID is required" },
        { status: 400 }
      );
    }

    const menuItems = await MenuItemModel.find({ canteenId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      data: menuItems,
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error fetching menu items:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new menu item
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const requiredFields = ['canteenId', 'name', 'price', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const menuItem = await MenuItemModel.create({
      canteenId: body.canteenId,
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      category: body.category,
      image: body.image || null,
      isVeg: body.isVeg !== undefined ? body.isVeg : true,
      isSpicy: body.isSpicy !== undefined ? body.isSpicy : false,
      prepTime: parseInt(body.prepTime) || 15,
      rating: body.rating || 4.0,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      digitalMenuId: body.digitalMenuId || null,
    });
    
    console.log('Created menu item with digitalMenuId:', body.digitalMenuId, 'item:', menuItem.name)
    
    return NextResponse.json({ 
      data: menuItem,
      message: "Menu item created successfully",
      status: "success" 
    }, { status: 201 });
  } catch (e: any) {
    console.error("Error creating menu item:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a menu item
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    const updateData = {
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      category: body.category,
      image: body.image,
      isVeg: body.isVeg !== undefined ? body.isVeg : true,
      isSpicy: body.isSpicy !== undefined ? body.isSpicy : false,
      prepTime: parseInt(body.prepTime) || 15,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
    };

    const menuItem = await MenuItemModel.findByIdAndUpdate(
      body.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      data: menuItem,
      message: "Menu item updated successfully",
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error updating menu item:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a menu item
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    const menuItem = await MenuItemModel.findByIdAndDelete(id);

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: "Menu item deleted successfully",
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error deleting menu item:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}