import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StudentModel, TeacherModel, CanteenModel } from "@/lib/models";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    let Model;
    if (role === "student") {
      Model = StudentModel;
    } else if (role === "teacher") {
      Model = TeacherModel;
    } else if (role === "canteen") {
      Model = CanteenModel;
    } else {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const user = await Model.findOne({ email });
    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    // Handle different name formats for different user types
    let userName = "";
    if (role === "canteen") {
      userName = user.ownerName || "";
    } else {
      userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }

    return NextResponse.json({
      id: String(user._id),
      name: userName,
      email: user.email,
      role,
      avatarInitials: user.avatarInitials || "",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
