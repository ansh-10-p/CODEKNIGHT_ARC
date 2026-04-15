import { NextResponse } from "next/server";

const PREDICTOR_API_URL = process.env.PERFORMANCE_PREDICTOR_API_URL?.trim();

if (!PREDICTOR_API_URL) {
  throw new Error(
    "PERFORMANCE_PREDICTOR_API_URL is required. Add it to .env.local or .env and restart the server.",
  );
}

const getNormalizedPredictorUrl = (url: string) =>
  url.replace(/^https?:\/\/localhost(?=:|\/|$)/i, (match) =>
    match.replace(/localhost/i, "127.0.0.1"),
  );

const normalizedPredictorUrl = getNormalizedPredictorUrl(
  PREDICTOR_API_URL,
).replace(/\/$/, "");

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const fetchPredictor = async (url: string, options: RequestInit) => {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      lastError = new Error(`Predictor service returned ${response.status}`);
      if (attempt < MAX_RETRIES) {
        console.warn(
          `Predictor request failed on attempt ${attempt}. Retrying after ${RETRY_DELAY_MS}ms...`,
        );
        await delay(RETRY_DELAY_MS);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        console.warn(`Predictor request failed on attempt ${attempt}:`, error);
        await delay(RETRY_DELAY_MS);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const predictorUrl = `${normalizedPredictorUrl}/predict`;

    const response = await fetchPredictor(predictorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

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
  } catch (error) {
    console.error("Prediction service error:", error);
    return NextResponse.json(
      { error: "Unable to connect to prediction service." },
      { status: 502 },
    );
  }
}
