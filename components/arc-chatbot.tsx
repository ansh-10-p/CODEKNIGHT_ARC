"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Send, Sparkles, Loader2 } from "lucide-react";

interface Message { id: string; role: "user" | "ai"; content: string; source?: string; }
interface ArcChatbotProps { userRole?: "student" | "teacher" | "canteen" | "admin"; timetable?: any; }

export function ArcChatbot({ userRole = "student", timetable }: ArcChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.id) setUserId(u.id);
        if (u?.name) setUserName(u.name.split(" ")[0]); // first name only
      }
    } catch {}
  }, []);

  useEffect(() => {
    const roleGreetings: Record<string, string> = {
      student: "timetable, attendance, canteen, events, or anything campus-related",
      teacher: "your classrooms, student attendance, timetables, or upcoming events",
      canteen: "menu management, today's orders, stock levels, or demand forecasts",
      admin: "campus events, internships, resources, parking, or platform analytics",
    };
    const topics = roleGreetings[userRole] ?? roleGreetings.student;
    const greeting = userName
      ? `Hi ${userName}! I'm ARC AI. Ask me about ${topics}.`
      : `Hi! I'm ARC AI. Ask me about ${topics}.`;
    setMessages([{ id: "0", role: "ai", content: greeting, source: "general" }]);
  }, [userName, userRole]);

  async function send() {
    const query = input.trim();
    if (!query || loading) return;
    setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: query }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chatbot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: userRole, query, timetable, studentId: userId, userName }) });
      const data = await res.json();
      setMessages((m) => [...m, { id: (Date.now()+1).toString(), role: "ai", content: data.reply ?? data.error, source: data.source }]);
    } catch {
      setMessages((m) => [...m, { id: (Date.now()+1).toString(), role: "ai", content: "Sorry, A.R.C AI is unavailable right now." }]);
    } finally { setLoading(false); }
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 bg-[#e78a53] hover:bg-[#d4784a] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors" aria-label="Open ARC AI chat">
          <Sparkles className="h-6 w-6" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-xl overflow-hidden shadow-2xl border border-zinc-700 bg-zinc-900">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-800 border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#e78a53]" />
              <span className="text-white font-semibold text-sm">A.R.C AI</span>
              <Badge variant="outline" className="text-[10px] border-green-500 text-green-400">Online</Badge>
            </div>
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72 bg-zinc-900">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-[#e78a53] text-white" : "bg-zinc-800 text-zinc-200 border border-zinc-700"}`}>
                  {m.content}
                  {m.source && m.source !== "general" && <span className="block text-[10px] mt-1 opacity-60">via {m.source}</span>}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"><Loader2 className="h-4 w-4 animate-spin text-[#e78a53]" /></div></div>}
          </div>
          <div className="flex gap-2 p-3 bg-zinc-800 border-t border-zinc-700">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask anything..." className="bg-zinc-700 border-zinc-600 text-white text-sm placeholder:text-zinc-400" />
            <Button size="icon" onClick={send} disabled={loading} className="bg-[#e78a53] hover:bg-[#d4784a] shrink-0"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </>
  );
}
