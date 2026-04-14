import { NextResponse } from "next/server"

const DEFAULT_PREDICTOR_BASE_URL = "http://127.0.0.1:5001"

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    const predictorBaseUrl = process.env.PERFORMANCE_PREDICTOR_API_URL || DEFAULT_PREDICTOR_BASE_URL
    const predictorUrl = `${predictorBaseUrl.replace(/\/$/, "")}/predict`

    const response = await fetch(predictorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const data = await response.json().catch(() => ({ error: "Invalid response from predictor service." }))

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to get prediction from backend service." },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Unable to connect to prediction service." }, { status: 502 })
  }
}
