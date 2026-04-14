import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ResourceModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch all resources
export async function GET(request: Request) {
  console.log('GET /api/admin/resources called');
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased limit for admin

    // Build query
    let query: any = {};
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    console.log('Executing query:', JSON.stringify(query));
    const resources = await ResourceModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    console.log('Found resources:', resources.length);

    const total = await ResourceModel.countDocuments(query);
    console.log('Total resources:', total);

    const response = {
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
    console.log('Sending response with', resources.length, 'resources');
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching resources:", error);
    console.error("Error stack:", error.stack);
    
    // Check if it's a database connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseError') {
      return NextResponse.json(
        { error: "Database connection failed: " + error.message },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch resources",
        errorType: error.name || 'Unknown',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Create new resource
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const resourceData = await request.json();

    // Basic validation
    if (!resourceData.name || !resourceData.description || !resourceData.category || !resourceData.location) {
      return NextResponse.json(
        { error: "Required fields: name, description, category, location" },
        { status: 400 }
      );
    }

    // Category-specific validation
    if (resourceData.category === 'book' && !resourceData.author) {
      return NextResponse.json(
        { error: "Author is required for books" },
        { status: 400 }
      );
    }

    if (resourceData.category === 'book' && !resourceData.totalCopies) {
      return NextResponse.json(
        { error: "Total copies is required for books" },
        { status: 400 }
      );
    }

    if (resourceData.category === 'facility' && !resourceData.capacity) {
      return NextResponse.json(
        { error: "Capacity is required for facilities" },
        { status: 400 }
      );
    }

    // Prepare the resource data
    const newResourceData = {
      name: resourceData.name,
      description: resourceData.description,
      category: resourceData.category,
      location: resourceData.location,
      condition: resourceData.condition || 'good',
      isAvailable: resourceData.isAvailable !== undefined ? resourceData.isAvailable : true,
      status: resourceData.status || 'active',
      requiresApproval: resourceData.requiresApproval || false,
      maxBorrowDuration: resourceData.maxBorrowDuration || null,
      tags: resourceData.tags || [],
      image: resourceData.image || null,
      totalBorrows: 0,
      currentBorrower: null,
      dueDate: null
    };

    // Add category-specific fields
    if (resourceData.category === 'book') {
      Object.assign(newResourceData, {
        isbn: resourceData.isbn || '',
        author: resourceData.author,
        publisher: resourceData.publisher || '',
        edition: resourceData.edition || '',
        totalCopies: resourceData.totalCopies,
        availableCopies: resourceData.totalCopies // Initially all copies are available
      });
    }

    if (resourceData.category === 'equipment') {
      Object.assign(newResourceData, {
        serialNumber: resourceData.serialNumber || '',
        model: resourceData.model || '',
        brand: resourceData.brand || '',
        specifications: resourceData.specifications || ''
      });
    }

    if (resourceData.category === 'facility') {
      Object.assign(newResourceData, {
        capacity: resourceData.capacity,
        amenities: resourceData.amenities || [],
        operatingHours: resourceData.operatingHours || { start: '09:00', end: '17:00' }
      });
    }

    const newResource = await ResourceModel.create(newResourceData);

    return NextResponse.json({
      message: "Resource created successfully",
      resource: newResource
    });
  } catch (error: any) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create resource" },
      { status: 500 }
    );
  }
}

// PUT - Update resource
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('id');
    
    if (!resourceId) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    const updatedResource = await ResourceModel.findByIdAndUpdate(
      resourceId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Resource updated successfully",
      resource: updatedResource
    });
  } catch (error: any) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update resource" },
      { status: 500 }
    );
  }
}

// DELETE - Delete resource
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('id');
    
    if (!resourceId) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 }
      );
    }

    const deletedResource = await ResourceModel.findByIdAndDelete(resourceId);

    if (!deletedResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Resource deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resource" },
      { status: 500 }
    );
  }
}
