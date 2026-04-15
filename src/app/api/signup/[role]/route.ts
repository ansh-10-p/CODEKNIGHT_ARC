import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StudentModel, TeacherModel, CanteenModel } from "@/lib/models";

const roleModels = {
  student: StudentModel,
  teacher: TeacherModel,
  canteen: CanteenModel,
};

const requiredFields: Record<string, string[]> = {
  student: [
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
  ],
  teacher: [
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
    "joiningDate",
    "emergencyContactName",
    "emergencyContactPhone",
    "emergencyContactRelation",
  ],
  canteen: [
    "ownerName",
    "email",
    "password",
    "phone",
    "seatingCapacity",
    "servingCapacity",
    "emergencyContactName",
    "emergencyContactPhone",
    "bankAccountNumber",
    "bankIFSC",
    "panNumber",
  ],
};

const allowedFields: Record<string, string[]> = {
  student: [
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
    "bio",
    "interests",
    "skills",
  ],
  teacher: [
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
    "bio",
    "specializations",
  ],
  canteen: [
    "ownerName",
    "email",
    "password",
    "phone",
    "alternatePhone",
    "address",
    "gstNumber",
    "cuisineTypes",
    "seatingCapacity",
    "servingCapacity",
    "emergencyContactName",
    "emergencyContactPhone",
    "bankAccountNumber",
    "bankIFSC",
    "panNumber",
    "description",
    "specialities",
  ],
};

function getAvatarInitials(firstName: string, lastName: string) {
  const firstInitial = firstName?.trim()?.charAt(0)?.toUpperCase() || "";
  const lastInitial = lastName?.trim()?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}`.trim();
}

export async function POST(
  request: Request,
  { params }: { params: { role: string } },
) {
  const role = params?.role?.toLowerCase();
  const Model = role ? roleModels[role] : undefined;

  if (!Model) {
    return NextResponse.json(
      { error: "Invalid signup role." },
      { status: 404 },
    );
  }

  await connectToDatabase();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const missingFields = requiredFields[role].filter((field) => {
    const value = body[field];
    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0)
    );
  });

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(", ")}` },
      { status: 400 },
    );
  }

  const safeData = allowedFields[role].reduce<Record<string, unknown>>(
    (acc, field) => {
      if (body[field] !== undefined) {
        acc[field] = body[field];
      }
      return acc;
    },
    {},
  );

  if (
    role === "student" &&
    typeof body.firstName === "string" &&
    typeof body.lastName === "string"
  ) {
    safeData.avatarInitials = getAvatarInitials(body.firstName, body.lastName);
  }

  if (
    role === "teacher" &&
    typeof body.firstName === "string" &&
    typeof body.lastName === "string"
  ) {
    safeData.avatarInitials = getAvatarInitials(body.firstName, body.lastName);
  }

  if (role === "canteen" && typeof body.ownerName === "string") {
    const ownerParts = body.ownerName.trim().split(" ");
    safeData.avatarInitials = getAvatarInitials(
      ownerParts[0] || "",
      ownerParts[ownerParts.length - 1] || "",
    );
  }

  try {
    const record = await Model.create(safeData);
    return NextResponse.json(
      { success: true, id: record._id },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create account.";

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      const duplicateField = Object.keys((error as any).keyValue || {}).join(
        ", ",
      );
      return NextResponse.json(
        { error: `Duplicate field detected: ${duplicateField}` },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: message || "Failed to create account." },
      { status: 500 },
    );
  }
}
