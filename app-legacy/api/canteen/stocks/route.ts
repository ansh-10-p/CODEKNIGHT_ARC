import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StockItemModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch all stock items for a canteen
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

    const stockItems = await StockItemModel.find({ canteenId }).sort({ createdAt: -1 });
    
    // Calculate status based on current stock vs minimum stock
    const itemsWithStatus = stockItems.map(item => {
      let status = 'good';
      if (item.currentStock === 0) {
        status = 'out_of_stock';
      } else if (item.currentStock <= item.minimumStock * 0.5) {
        status = 'critical';
      } else if (item.currentStock <= item.minimumStock) {
        status = 'low';
      }
      
      return {
        ...item.toObject(),
        status
      };
    });
    
    return NextResponse.json({ 
      data: itemsWithStatus,
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error fetching stock items:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new stock item
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const requiredFields = ['canteenId', 'name', 'category', 'currentStock', 'unit', 'minimumStock', 'maximumStock', 'costPerUnit'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate stock levels
    if (body.minimumStock > body.maximumStock) {
      return NextResponse.json(
        { error: "Minimum stock cannot be greater than maximum stock" },
        { status: 400 }
      );
    }

    if (body.currentStock < 0) {
      return NextResponse.json(
        { error: "Current stock cannot be negative" },
        { status: 400 }
      );
    }

    const stockItem = await StockItemModel.create({
      canteenId: body.canteenId,
      name: body.name,
      category: body.category,
      currentStock: parseFloat(body.currentStock),
      unit: body.unit,
      minimumStock: parseFloat(body.minimumStock),
      maximumStock: parseFloat(body.maximumStock),
      costPerUnit: parseFloat(body.costPerUnit),
      supplier: body.supplier || '',
      lastRestocked: body.lastRestocked ? new Date(body.lastRestocked) : new Date(),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      description: body.description || '',
      location: body.location || '',
      batchNumber: body.batchNumber || '',
    });
    
    return NextResponse.json({ 
      data: stockItem,
      message: "Stock item created successfully",
      status: "success" 
    }, { status: 201 });
  } catch (e: any) {
    console.error("Error creating stock item:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a stock item
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Stock item ID is required" },
        { status: 400 }
      );
    }

    // Validate stock levels if provided
    if (body.minimumStock !== undefined && body.maximumStock !== undefined && body.minimumStock > body.maximumStock) {
      return NextResponse.json(
        { error: "Minimum stock cannot be greater than maximum stock" },
        { status: 400 }
      );
    }

    if (body.currentStock !== undefined && body.currentStock < 0) {
      return NextResponse.json(
        { error: "Current stock cannot be negative" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.currentStock !== undefined) updateData.currentStock = parseFloat(body.currentStock);
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.minimumStock !== undefined) updateData.minimumStock = parseFloat(body.minimumStock);
    if (body.maximumStock !== undefined) updateData.maximumStock = parseFloat(body.maximumStock);
    if (body.costPerUnit !== undefined) updateData.costPerUnit = parseFloat(body.costPerUnit);
    if (body.supplier !== undefined) updateData.supplier = body.supplier;
    if (body.lastRestocked !== undefined) updateData.lastRestocked = new Date(body.lastRestocked);
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.batchNumber !== undefined) updateData.batchNumber = body.batchNumber;

    const stockItem = await StockItemModel.findByIdAndUpdate(
      body.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!stockItem) {
      return NextResponse.json(
        { error: "Stock item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      data: stockItem,
      message: "Stock item updated successfully",
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error updating stock item:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a stock item
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Stock item ID is required" },
        { status: 400 }
      );
    }

    const stockItem = await StockItemModel.findByIdAndDelete(id);

    if (!stockItem) {
      return NextResponse.json(
        { error: "Stock item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: "Stock item deleted successfully",
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error deleting stock item:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}