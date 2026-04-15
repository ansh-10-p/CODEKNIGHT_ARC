"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, User, RefreshCw } from "lucide-react";

interface Student { studentId: string; name: string; attendancePct: number; gradePct: number; riskScore: number; riskLevel: "critical" | "moderate" | "low"; flags: string[]; }
interface RiskData { totalStudents: number; critical: number; moderate: number; safe: number; summary: string; students: Student[]; }

const levelColor: Record<string,string> = { critical: "bg-red-500/10 border-red-500/40 text-red-400", moderate: "bg-yellow-500/10 border-yellow-500/40 text-yellow-400", low: "bg-green-500/10 border-green-500/40 text-green-400" };

export function RiskScorePanel({ students }: { students: any[] }) {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!students?.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/risk-score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ students }) });
      setData(await res.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  if (!students?.length) return null;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#e78a53]" />AI Risk Score</CardTitle>
        <Button variant="ghost" size="icon" onClick={load} disabled={loading} className="h-8 w-8"><RefreshCw className={`h-3 w-3 text-zinc-400 ${loading ? "animate-spin" : ""}`} /></Button>
      </CardHeader>
      <CardContent>
        {data ? (
          <>
            <div className="flex gap-3 mb-4">
              {[{label:"Critical",count:data.critical,color:"text-red-400"},{label:"Moderate",count:data.moderate,color:"text-yellow-400"},{label:"Safe",count:data.safe,color:"text-green-400"}].map((s) => (
                <div key={s.label} className="flex-1 text-center"><p className={`text-xl font-bold ${s.color}`}>{s.count}</p><p className="text-[11px] text-zinc-500">{s.label}</p></div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mb-3">{data.summary}</p>
            <div className="space-y-2">
              {data.students.filter((s) => s.riskLevel !== "low").slice(0,5).map((s) => (
                <div key={s.studentId} className={`rounded-lg border p-2 ${levelColor[s.riskLevel]}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><User className="h-3 w-3" /><span className="text-sm font-medium">{s.name}</span></div>
                    <Badge variant="outline" className="text-[10px]">{s.riskLevel} · {s.riskScore}</Badge>
                  </div>
                  {s.flags.length>0 && <p className="text-[11px] mt-1 opacity-80">{s.flags[0]}</p>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-zinc-500 text-sm">{loading ? "Calculating risk scores…" : "No data"}</div>
        )}
      </CardContent>
    </Card>
  );
}
