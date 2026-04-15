import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/arc-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = body.role || "student";
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const timetable = body.timetable ?? null;
    const studentId = body.studentId ?? null;
    const userName = body.userName ? String(body.userName).trim() : "";

    if (!query) {
      return NextResponse.json(
        { error: "Query text is required." },
        { status: 400 },
      );
    }

    const contextParts = [
      `Role: ${role}`,
      userName ? `User: ${userName}` : null,
      studentId ? `Student ID: ${studentId}` : null,
    ].filter(Boolean);

    const timetablePrompt = timetable
      ? `Here is the user's timetable data:
${JSON.stringify(timetable, null, 2)}`
      : "";
    const prompt = `You are ARC AI, the campus assistant for a ${role}. ${contextParts.join(" | ")} ${timetablePrompt}

Answer the following student campus question clearly and politely:

${query}`;

    const aiResult = await generateAIResponse(prompt, "chat", { query });

    if (typeof aiResult === "string") {
      return NextResponse.json({ reply: aiResult, source: "openrouter" });
    }

    return NextResponse.json(aiResult);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to process the chatbot request. Please try again later.",
      },
      { status: 500 },
    );
  }
}
