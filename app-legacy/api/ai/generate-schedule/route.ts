import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { prompt, classroomInfo, currentSchedule } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const currentScheduleText = currentSchedule
      ? `\n\nCURRENT SCHEDULE:\n${JSON.stringify(currentSchedule, null, 2)}`
      : "\n\nCURRENT SCHEDULE: Empty schedule";

    const systemPrompt = `You are an AI assistant that modifies weekly class schedules based on user requests. Your job is to PRESERVE existing schedule entries and only ADD, MODIFY, or REMOVE entries as specifically requested by the user.

CLASSROOM CONTEXT:
- Subject: ${classroomInfo?.subject || "Not specified"}
- Class Title: ${classroomInfo?.title || "Not specified"}
- Available Time Slots: 08:00-09:00, 09:00-10:00, 10:00-11:00, 11:00-12:00, 12:00-13:00, 13:00-14:00, 14:00-15:00, 15:00-16:00, 16:00-17:00
- Days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday${currentScheduleText}

CRITICAL RULES:
1. PRESERVE ALL EXISTING ENTRIES unless user specifically asks to modify/remove them
2. Only make changes that the user explicitly requests
3. If user says "add", keep existing entries and add new ones
4. If user says "change" or "modify", only change the specific entries mentioned
5. If user says "remove" or "delete", only remove the specific entries mentioned
6. Avoid time conflicts on the same day
7. Use realistic room names (A101, Lab1, Library, etc.)
8. Maintain consistency with existing schedule style

REQUIRED JSON STRUCTURE:
{
  "Monday": [
    {
      "timeSlot": "09:00-10:00",
      "type": "class",
      "subject": "Mathematics", 
      "room": "A101",
      "notes": "Chapter 5 - Algebra"
    }
  ],
  "Tuesday": [],
  "Wednesday": [],
  "Thursday": [],
  "Friday": [],
  "Saturday": [],
  "Sunday": []
}

VALID TYPES: "class", "break", "lunch"

USER REQUEST: "${prompt}"

INSTRUCTIONS:
- Start with the current schedule as your base
- Only make changes that are specifically requested
- If no specific changes are mentioned, make minimal logical additions
- Return the complete modified schedule with all days included
- Preserve the exact format and structure of existing entries`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    let scheduleData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scheduleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);

      scheduleData = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };
    }

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const validTypes = ["class", "break", "lunch"];

    const cleanedSchedule: any = {};
    validDays.forEach((day) => {
      cleanedSchedule[day] = [];
      if (scheduleData[day] && Array.isArray(scheduleData[day])) {
        scheduleData[day].forEach((entry: any) => {
          if (entry.timeSlot && validTypes.includes(entry.type)) {
            cleanedSchedule[day].push({
              timeSlot: entry.timeSlot,
              type: entry.type,
              subject: entry.subject || "",
              room: entry.room || "",
              notes: entry.notes || "",
            });
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      schedule: cleanedSchedule,
      originalPrompt: prompt,
    });
  } catch (error) {
    console.error("Error generating schedule:", error);
    return NextResponse.json(
      { error: "Failed to generate schedule" },
      { status: 500 }
    );
  }
}
