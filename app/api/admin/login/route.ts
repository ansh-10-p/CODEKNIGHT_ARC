import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check hardcoded admin credentials
    if (username === "ADMIN1" && password === "ADMIN1") {
      return NextResponse.json({
        message: "Login successful",
        admin: {
          id: "admin1",
          username: "ADMIN1",
          role: "admin"
        }
      });
    } else {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
=======
import { NextResponse } from "next/server"

const adminUsers = [
  {
    username: "ADMIN1",
    password: "Admin@123",
    id: "admin1",
    name: "Campus Admin",
    role: "admin",
  },
]

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 })
  }

  const admin = adminUsers.find(
    (user) =>
      user.username.toLowerCase() === String(username).toLowerCase() &&
      user.password === password,
  )

  if (!admin) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 })
  }

  return NextResponse.json({
    id: admin.id,
    username: admin.username,
    name: admin.name,
    role: admin.role,
  })
>>>>>>> Initial commit
}
