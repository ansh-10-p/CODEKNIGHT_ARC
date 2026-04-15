import { NextResponse } from "next/server";

interface CallRequestBody {
  phoneNumber?: string;
  assistantId?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CallRequestBody;
    const phoneNumber = body.phoneNumber?.trim();
    const assistantId = body.assistantId?.trim();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Missing phoneNumber in request body." },
        { status: 400 },
      );
    }

    // TODO: Replace this placeholder with a real telephony integration.
    const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log("Call API received request:", {
      phoneNumber,
      assistantId,
      callId,
    });

    return NextResponse.json({
      id: callId,
      phoneNumber,
      assistantId: assistantId || null,
      status: "initiated",
    });
  } catch (error) {
    console.error("Failed to process /api/call request:", error);
    return NextResponse.json(
      { error: "Unable to initiate call. Please try again." },
      { status: 500 },
    );
  }
}
