import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";

const ML_SERVICE_URL = process.env.PERFORMANCE_PREDICTOR_API_URL?.trim();
const HEALTH_CHECK_TIMEOUT_MS = 10000;

if (!ML_SERVICE_URL) {
  throw new Error(
    "PERFORMANCE_PREDICTOR_API_URL is required for health checks. Add it to .env.local or .env.",
  );
}

const getMlHealthUrl = () => `${ML_SERVICE_URL.replace(/\/$/, "")}/health`;

async function checkMlService() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(getMlHealthUrl(), {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }

    const body = await response.json();
    if (body.status !== "ok" || body.modelLoaded !== true) {
      throw new Error(
        `ML health check returned unexpected response: ${JSON.stringify(body)}`,
      );
    }
    return { ok: true };
  } catch (error) {
    console.error("❌ ML health check failed:", error);
    return { ok: false, error: String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkDatabase() {
  try {
    const db = await connectToDatabase();
    const ready = db.connection.readyState === 1;
    return { ok: ready, readyState: db.connection.readyState };
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return { ok: false, error: String(error) };
  }
}

export async function GET() {
  const [dbResult, mlResult] = await Promise.all([
    checkDatabase(),
    checkMlService(),
  ]);
  const allHealthy = dbResult.ok && mlResult.ok;

  return NextResponse.json(
    {
      status: allHealthy ? "ok" : "unhealthy",
      database: dbResult,
      mlService: mlResult,
    },
    { status: allHealthy ? 200 : 503 },
  );
}
