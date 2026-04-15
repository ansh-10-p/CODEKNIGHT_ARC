import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CanteenModel } from "@/lib/models";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Debug: Log the received data
    console.log("Received canteen signup data:", JSON.stringify(body, null, 2));

    const requiredFields = [
      "ownerName",
      "email",
      "password",
      "phone",
      "cuisineTypes",
      "seatingCapacity",
      "servingCapacity",
      "emergencyContactName",
      "emergencyContactPhone",
      "bankAccountNumber",
      "bankIFSC",
      "panNumber",
    ];

    for (const field of requiredFields) {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (!body[parent] || !body[parent][child]) {
          return NextResponse.json(
            { error: `${field} is required` },
            { status: 400 }
          );
        }
      } else if (
        !body[field] ||
        (Array.isArray(body[field]) && body[field].length === 0)
      ) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const existing = await CanteenModel.findOne({ email: body.email });
    if (existing)
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );

    const hashed = await bcrypt.hash(body.password, 10);
    
    // Create clean data object with only the fields we want
    const canteenData = {
      ownerName: body.ownerName,
      email: body.email,
      password: hashed,
      phone: body.phone,
      alternatePhone: body.alternatePhone,
      gstNumber: body.gstNumber,
      cuisineTypes: body.cuisineTypes,
      seatingCapacity: body.seatingCapacity,
      servingCapacity: body.servingCapacity,
      emergencyContactName: body.emergencyContactName,
      emergencyContactPhone: body.emergencyContactPhone,
      bankAccountNumber: body.bankAccountNumber,
      bankIFSC: body.bankIFSC,
      panNumber: body.panNumber,
      description: body.description,
      specialities: body.specialities,
      avatarInitials: `${
        body.ownerName
          ?.split(" ")
          ?.map((p: string) => p[0])
          .join("")
          .slice(0, 2) || ""
      }`.toUpperCase(),
    };

    console.log("Filtered canteen data:", JSON.stringify(canteenData, null, 2));
    const canteen = await CanteenModel.create(canteenData);
    return NextResponse.json({ id: canteen._id }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
