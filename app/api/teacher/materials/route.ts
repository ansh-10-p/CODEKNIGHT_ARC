import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MaterialModel, ClassroomModel } from "@/lib/models";

// Helper function to determine file type from mime type
function getFileType(mimeType: string): "pdf" | "image" | null {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  return null;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const classroomId = searchParams.get("classroomId");
    const fileType = searchParams.get("fileType");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Get teacher's classrooms for dropdown
    const classrooms = await ClassroomModel.find({
      teacherId,
      status: "active",
    }).select("_id title subject inviteCode studentsCount");

    if (!classroomId) {
      return NextResponse.json({
        success: true,
        materials: [],
        classrooms,
        message: "Select a classroom to view materials"
      });
    }

    // Build query
    let query: any = {
      teacherId,
      classroomId,
      isActive: true
    };

    if (fileType && (fileType === "pdf" || fileType === "image")) {
      query.fileType = fileType;
    }

    // Get materials without the actual file data for listing
    const materials = await MaterialModel.find(query)
      .select("-fileData") // Exclude large base64 data from listing
      .populate("classroomId", "title subject")
      .sort({ createdAt: -1 });

    // Add formatted file sizes
    const materialsWithFormattedSize = materials.map(material => ({
      ...material.toObject(),
      formattedFileSize: formatFileSize(material.fileSize)
    }));

    return NextResponse.json({
      success: true,
      materials: materialsWithFormattedSize,
      classrooms,
      totalCount: materials.length
    });

  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      teacherId,
      classroomId,
      title,
      description,
      fileName,
      mimeType,
      fileData,
      tags
    } = body;

    if (!teacherId || !classroomId || !title || !description || !fileName || !mimeType || !fileData) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify classroom ownership
    const classroom = await ClassroomModel.findOne({
      _id: classroomId,
      teacherId,
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found or unauthorized" },
        { status: 404 }
      );
    }

    // Determine file type
    const fileType = getFileType(mimeType);
    if (!fileType) {
      return NextResponse.json(
        { error: "Unsupported file type. Only PDFs and images are allowed." },
        { status: 400 }
      );
    }

    // Validate base64 data and calculate file size
    const base64Data = fileData.split(',')[1] || fileData; // Remove data URL prefix if present
    const fileSize = Math.round((base64Data.length * 3) / 4); // Approximate size from base64

    // File size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Create new material
    const material = new MaterialModel({
      teacherId,
      classroomId,
      title,
      description,
      fileName,
      fileType,
      mimeType,
      fileSize,
      fileData: base64Data,
      tags: tags || [],
    });

    await material.save();
    await material.populate("classroomId", "title subject");

    // Return material without file data
    const { fileData: _, ...materialWithoutData } = material.toObject();

    return NextResponse.json({
      success: true,
      message: "Material uploaded successfully",
      material: {
        ...materialWithoutData,
        formattedFileSize: formatFileSize(fileSize)
      }
    });

  } catch (error) {
    console.error("Error uploading material:", error);
    return NextResponse.json(
      { error: "Failed to upload material" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      materialId,
      teacherId,
      title,
      description,
      tags
    } = body;

    if (!materialId || !teacherId || !title || !description) {
      return NextResponse.json(
        { error: "Material ID, Teacher ID, title, and description are required" },
        { status: 400 }
      );
    }

    // Update material
    const updatedMaterial = await MaterialModel.findOneAndUpdate(
      { _id: materialId, teacherId },
      {
        title,
        description,
        tags: tags || []
      },
      { new: true }
    )
      .select("-fileData")
      .populate("classroomId", "title subject");

    if (!updatedMaterial) {
      return NextResponse.json(
        { error: "Material not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Material updated successfully",
      material: {
        ...updatedMaterial.toObject(),
        formattedFileSize: formatFileSize(updatedMaterial.fileSize)
      }
    });

  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get("materialId");
    const teacherId = searchParams.get("teacherId");

    if (!materialId || !teacherId) {
      return NextResponse.json(
        { error: "Material ID and Teacher ID are required" },
        { status: 400 }
      );
    }

    // Soft delete the material
    const deletedMaterial = await MaterialModel.findOneAndUpdate(
      { _id: materialId, teacherId },
      { isActive: false },
      { new: true }
    );

    if (!deletedMaterial) {
      return NextResponse.json(
        { error: "Material not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Material deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
