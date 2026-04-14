import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TeacherModel } from "@/lib/models";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "phone",
      "gender",
      "dateOfBirth",
      "address",
      "employeeId",
      "department",
      "designation",
      "qualification",
      "experience",
      "subjects",
      "joiningDate",
      "emergencyContactName",
      "emergencyContactPhone",
      "emergencyContactRelation",
    ];

    for (const field of requiredFields) {
      if (
        !body[field] ||
        (Array.isArray(body[field]) && body[field].length === 0)
      ) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const existing = await TeacherModel.findOne({ email: body.email });
    if (existing)
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );

    const hashed = await bcrypt.hash(body.password, 10);
    body.password = hashed;
    body.avatarInitials = `${body.firstName?.[0] || ""}${
      body.lastName?.[0] || ""
    }`.toUpperCase();

    const teacher = await TeacherModel.create(body);
    return NextResponse.json({ id: teacher._id }, { status: 201 });
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
