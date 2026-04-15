import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StockItemModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST - Restock an item
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const requiredFields = ['id', 'quantity'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const quantity = parseFloat(body.quantity);
    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Restock quantity must be greater than 0" },
        { status: 400 }
      );
    }

    const stockItem = await StockItemModel.findById(body.id);
    if (!stockItem) {
      return NextResponse.json(
        { error: "Stock item not found" },
        { status: 404 }
      );
    }

    // Update stock and restock date
    const updateData: any = {
      currentStock: stockItem.currentStock + quantity,
      lastRestocked: new Date(),
    };

    // Update other fields if provided
    if (body.costPerUnit !== undefined) updateData.costPerUnit = parseFloat(body.costPerUnit);
    if (body.supplier !== undefined) updateData.supplier = body.supplier;
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
    if (body.batchNumber !== undefined) updateData.batchNumber = body.batchNumber;

    // Check if new stock exceeds maximum
    if (updateData.currentStock > stockItem.maximumStock) {
      return NextResponse.json(
        { 
          error: `Restocking ${quantity} ${stockItem.unit} would exceed maximum stock limit of ${stockItem.maximumStock} ${stockItem.unit}`,
          maxAllowed: stockItem.maximumStock - stockItem.currentStock
        },
        { status: 400 }
      );
    }

    const updatedItem = await StockItemModel.findByIdAndUpdate(
      body.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ 
      data: updatedItem,
      message: `Successfully restocked ${quantity} ${stockItem.unit} of ${stockItem.name}`,
      status: "success" 
    });
  } catch (e: any) {
    console.error("Error restocking item:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}