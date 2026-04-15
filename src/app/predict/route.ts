import { NextResponse } from "next/server";

const DEFAULT_PREDICTOR_BASE_URLS = [
  process.env.PERFORMANCE_PREDICTOR_API_URL,
  "http://127.0.0.1:5001",
  "http://127.0.0.1:5002",
].filter(Boolean) as string[];

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    let response;
    let lastError: any = null;

    for (const baseUrl of DEFAULT_PREDICTOR_BASE_URLS) {
      const predictorUrl = `${baseUrl.replace(/\/$/, "")}/predict`;
      try {
        response = await fetch(predictorUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
        if (response.ok) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!response) {
      throw lastError || new Error("No prediction service available.");
    }

    const data = await response
      .json()
      .catch(() => ({ error: "Invalid response from predictor service." }));

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error || "Failed to get prediction from backend service.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to prediction service." },
      { status: 502 },
    );
  }
}
