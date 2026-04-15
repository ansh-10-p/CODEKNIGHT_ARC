import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const skipPaths = ["/api/health", "/health"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (!path.startsWith("/api") && path !== "/predict") {
    return NextResponse.next();
  }

  if (skipPaths.includes(path)) {
    return NextResponse.next();
  }

  try {
    const healthUrl = new URL("/api/health", request.url);
    const res = await fetch(healthUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (res.ok) {
      return NextResponse.next();
    }

    const payload = await res
      .text()
      .catch(() => "Dependency health check failed.");
    return new NextResponse(
      JSON.stringify({
        error: "Dependencies are not ready.",
        details: payload,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("❌ API middleware dependency check failed:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Dependencies are not ready.",
        details: String(error),
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const config = {
  matcher: ["/api/:path*", "/predict"],
};
