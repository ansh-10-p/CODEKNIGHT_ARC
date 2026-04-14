import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StudentModel } from "@/lib/models";
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
      "studentId",
      "course",
      "branch",
      "year",
      "semester",
      "rollNumber",
      "section",
      "emergencyContactName",
      "emergencyContactPhone",
      "emergencyContactRelation",
      "parentGuardianName",
      "parentGuardianPhone",
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

    const existing = await StudentModel.findOne({ email: body.email });
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

    const student = await StudentModel.create(body);
    return NextResponse.json({ id: student._id }, { status: 201 });
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
