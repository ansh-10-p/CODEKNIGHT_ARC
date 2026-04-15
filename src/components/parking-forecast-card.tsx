"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Car, Clock, RefreshCw } from "lucide-react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIMES = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const statusColor: Record<string,string> = { available:"text-green-400", busy:"text-yellow-400", full:"text-red-400" };

export function ParkingForecastCard() {
  const now = new Date();
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const [day, setDay] = useState(dayNames[now.getDay()]);
  const [time, setTime] = useState(`${String(now.getHours()).padStart(2,"0")}:00`);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/parking", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({day,time}) });
      setData(await res.json());
    } finally { setLoading(false); }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2"><Car className="h-4 w-4 text-[#e78a53]" />AI Parking Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-sm w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={check} disabled={loading} size="sm" className="bg-[#e78a53] hover:bg-[#d4784a] shrink-0">
            {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
          </Button>
        </div>
        {data && (
          <>
            <div className="flex gap-1 flex-wrap">
              {data.zones?.map((z:any) => (
                <div key={z.zone} className="flex-1 min-w-[60px] bg-zinc-800 rounded p-2 text-center">
                  <p className="text-zinc-400 text-[10px]">Zone {z.zone}</p>
                  <p className={`font-bold text-sm ${statusColor[z.status]}`}>{z.occupancy}%</p>
                  <Badge variant="outline" className={`text-[9px] ${statusColor[z.status]} border-current`}>{z.status}</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 bg-zinc-800/60 rounded p-2">
              {data.isPeakHour && <span className="text-yellow-400 font-medium">Peak Hour — </span>}
              {data.recommendation}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
