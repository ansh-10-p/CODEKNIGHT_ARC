"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, RefreshCw, Utensils } from "lucide-react";

interface CanteenInsight { topItems: string[]; peakTime: string; recommendation: string; }

export function CanteenDemandCard({ orders }: { orders: Array<{item:string;quantity:number;time?:string}> }) {
  const [data, setData] = useState<CanteenInsight | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!orders?.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/canteen", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ orders }) });
      setData(await res.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#e78a53]" />AI Demand Forecast</CardTitle>
        <Button variant="ghost" size="icon" onClick={load} disabled={loading} className="h-8 w-8"><RefreshCw className={`h-3 w-3 text-zinc-400 ${loading?"animate-spin":""}`} /></Button>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-zinc-300"><Clock className="h-4 w-4 text-[#e78a53]" /><span>Peak: <strong className="text-white">{data.peakTime}</strong></span></div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Top Items Today</p>
              <div className="flex flex-wrap gap-1">{data.topItems.map((item) => <Badge key={item} variant="outline" className="border-[#e78a53]/40 text-[#e78a53] text-[11px]"><Utensils className="h-2.5 w-2.5 mr-1" />{item}</Badge>)}</div>
            </div>
            <p className="text-xs text-zinc-400 bg-zinc-800/60 rounded p-2">{data.recommendation}</p>
          </div>
        ) : (
          <div className="text-center py-4 text-zinc-500 text-sm">{loading?"Analysing demand…":"No order data"}</div>
        )}
      </CardContent>
    </Card>
  );
}
