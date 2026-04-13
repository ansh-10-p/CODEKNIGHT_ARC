/**
 * ARC AI Service
 * Provider chain: OpenRouter → offline fallback
 */

const OPENROUTER_BASE = process.env.OPENROUTER_API_BASE || "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fallbackResponse(type: string, data: any): any {
  if (type === "conflict") {
    const classes = Array.isArray(data) ? data : [];
    const conflicts: any[] = [];
    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        const a = classes[i], b = classes[j];
        if (a.day === b.day && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end)) {
          conflicts.push({ conflict: true, subjects: [a.subject || a.name, b.subject || b.name], day: a.day, overlap: `${a.start}–${b.end}`, message: `"${a.subject||a.name}" and "${b.subject||b.name}" overlap on ${a.day}.` });
        }
      }
    }
    return conflicts.length ? { hasConflicts: true, conflicts } : { hasConflicts: false, message: "No schedule conflicts detected." };
  }
  if (type === "anomaly") {
    const records = Array.isArray(data) ? data : [];
    const anomalies = records.map((r: any) => { const attended = r.attendance.filter(Boolean).length; const pct = Math.round((attended / r.attendance.length) * 100); return { studentId: r.studentId, name: r.name, attendancePct: pct }; }).filter((r: any) => r.attendancePct < 75).map((r: any) => ({ ...r, alert: true, message: `${r.name} has only ${r.attendancePct}% attendance — below the 75% threshold.` }));
    return { anomaliesFound: anomalies.length > 0, anomalies, summary: `${anomalies.length} student(s) flagged for low attendance.` };
  }
  if (type === "canteen") {
    const orders = Array.isArray(data) ? data : [];
    const demand: Record<string, number> = {};
    for (const o of orders) demand[o.item] = (demand[o.item] || 0) + o.quantity;
    const topItems = Object.entries(demand).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([item]) => item);
    return { topItems, peakTime: "12:00–13:00", recommendation: `Stock up on ${topItems[0] || "popular items"} before lunch rush.` };
  }
  if (type === "chat") {
    const q = (data?.query || "").toLowerCase();
    if (q.includes("timetable") || q.includes("schedule") || q.includes("class"))
      return { reply: "Your timetable shows your scheduled classes for the week. Head to the Timetable section in your dashboard to view your full schedule and room details.", source: "timetable" };
    if (q.includes("attendance") || q.includes("absent") || q.includes("present"))
      return { reply: "You can check your attendance percentage in the Attendance section. Make sure to maintain at least 75% attendance to avoid being detained.", source: "attendance" };
    if (q.includes("canteen") || q.includes("food") || q.includes("menu") || q.includes("lunch") || q.includes("eat"))
      return { reply: "The campus canteen is open from 8 AM to 8 PM. You can browse the menu and place orders from the Canteen section in your dashboard.", source: "canteen" };
    if (q.includes("event") || q.includes("workshop") || q.includes("fest") || q.includes("seminar"))
      return { reply: "Check the Events section to see upcoming campus events, workshops, and fests. You can register directly from the platform.", source: "general" };
    if (q.includes("parking") || q.includes("park") || q.includes("vehicle"))
      return { reply: "Campus parking availability can be checked in the Parking section. Book a slot in advance to ensure a spot.", source: "general" };
    if (q.includes("internship") || q.includes("placement") || q.includes("job"))
      return { reply: "Visit the Internships section for the latest placement drives, internship listings, and application deadlines.", source: "general" };
    return { reply: "I'm A.R.C AI, your campus assistant! I can help you with your timetable, attendance, canteen orders, events, parking, and more. What would you like to know?", source: "general" };
  }
  return { reply: "I'm here to help! Ask me about your timetable, attendance, canteen, or events.", source: "general" };
}

export async function generateAIResponse(prompt: string, fallbackType: string, fallbackData: any): Promise<any> {
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: OPENROUTER_MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 512 }) });
      if (res.ok) { const json = await res.json(); return json.choices[0].message.content; }
    } catch { /* fall through */ }
  }
  return fallbackResponse(fallbackType, fallbackData);
}
