import React, { useState } from "react";
import { TrendingUp, Clock, DollarSign, Users } from "lucide-react";
import { HEATMAP_DATA } from "../data/mockData";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm"];

function getColor(value: number): string {
  if (value === 0) return "bg-white/4";
  if (value < 20) return "bg-emerald-900/60";
  if (value < 40) return "bg-emerald-700/80";
  if (value < 60) return "bg-emerald-500";
  if (value < 80) return "bg-emerald-400";
  return "bg-emerald-300";
}

const TOP_HOURS = [
  { day: "Saturday", hour: "12pm", revenue: 480, orders: 47 },
  { day: "Friday", hour: "7pm", revenue: 420, orders: 41 },
  { day: "Sunday", hour: "11am", revenue: 390, orders: 38 },
  { day: "Saturday", hour: "1pm", revenue: 370, orders: 36 },
];

const INSIGHTS = [
  { icon: "⚡", text: "Sat 12–1pm generates 3.2× your average hourly revenue", action: "Schedule extra staff" },
  { icon: "🌧", text: "Tue & Wed afternoons consistently underperform — consider flash deals", action: "Create promo" },
  { icon: "☕", text: "Morning peak 9–10am has low margin items — upsell opportunity", action: "Update menu" },
];

export default function Heatmap() {
  const [selectedCell, setSelectedCell] = useState<null | { day: string; hour: string; value: number }>(null);
  const [metric, setMetric] = useState<"revenue" | "orders" | "margin">("revenue");

  const grid = HEATMAP_DATA;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0D0D0D]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-bold">Income Heatmap</h2>
          <p className="text-white/40 text-xs mt-0.5">See when your business makes money — and when it doesn't</p>
        </div>
        <div className="flex items-center gap-2">
          {(["revenue", "orders", "margin"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`capitalize text-xs px-3 py-2 rounded-lg font-medium transition-all
                ${metric === m ? "bg-emerald-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Best Hour", value: "Sat 12pm", sub: "S$480 avg", icon: Clock, color: "text-emerald-400" },
          { label: "Weekly Revenue", value: "S$ 34,920", sub: "+12% vs last week", icon: DollarSign, color: "text-emerald-400" },
          { label: "Peak Day", value: "Saturday", sub: "S$6,820 avg", icon: TrendingUp, color: "text-blue-400" },
          { label: "Dead Zone", value: "Tue 3–4pm", sub: "Only S$28 avg", icon: Users, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4">
            <div className="text-white/40 text-xs mb-2 flex items-center gap-1.5">
              <s.icon size={12} className={s.color} />
              {s.label}
            </div>
            <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/30 text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-white font-semibold text-sm">Hourly Revenue Heatmap</h3>
          <span className="text-white/30 text-xs">— Last 4 weeks average</span>
        </div>

        {/* Hour labels */}
        <div className="flex items-center gap-1 ml-12 mb-1.5">
          {HOURS.map(h => (
            <div key={h} className="flex-1 text-center text-[10px] text-white/30">{h}</div>
          ))}
        </div>

        {/* Grid rows */}
        <div className="space-y-1">
          {DAYS.map((day, di) => (
            <div key={day} className="flex items-center gap-1">
              <div className="w-10 text-right text-[11px] text-white/40 mr-1 flex-shrink-0">{day}</div>
              {HOURS.map((hour, hi) => {
                const cell = grid[di * HOURS.length + hi] || { value: 0, revenue: 0, orders: 0 };
                const isSelected = selectedCell?.day === day && selectedCell?.hour === hour;
                return (
                  <div
                    key={hour}
                    className={`flex-1 aspect-square rounded-md cursor-pointer transition-all border
                      ${getColor(cell.value)}
                      ${isSelected ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#1A1A1A]" : "border-transparent hover:border-white/20"}`}
                    onClick={() => setSelectedCell({ day, hour, value: cell.value })}
                    title={`${day} ${hour}: S$${cell.revenue}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-4">
          <span className="text-white/30 text-xs mr-1">Less</span>
          {[0, 20, 40, 60, 80, 100].map(v => (
            <div key={v} className={`w-4 h-4 rounded-sm ${getColor(v)}`} />
          ))}
          <span className="text-white/30 text-xs ml-1">More</span>
        </div>

        {/* Selected cell tooltip */}
        {selectedCell && (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-4">
            <div>
              <div className="text-white/60 text-xs">{selectedCell.day} {selectedCell.hour}</div>
              <div className="text-white font-bold text-sm mt-0.5">
                S$ {Math.round(selectedCell.value * 4.8)} avg revenue
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-white/40 text-xs">Orders</div>
              <div className="text-white font-semibold text-sm">{Math.round(selectedCell.value * 0.5)}</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-white/40 text-xs">Avg basket</div>
              <div className="text-white font-semibold text-sm">S${(selectedCell.value * 0.1 + 7).toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">AI Insights</h3>
        <div className="space-y-2.5">
          {INSIGHTS.map((ins, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-all">
              <span className="text-xl flex-shrink-0">{ins.icon}</span>
              <span className="text-white/60 text-xs flex-1">{ins.text}</span>
              <button className="text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors flex-shrink-0">
                {ins.action} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top hours table */}
      <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Top Revenue Slots</h3>
        <div className="space-y-2">
          {TOP_HOURS.map((t, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-white/30 text-xs w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-xs font-medium">{t.day} {t.hour}</span>
                  <span className="text-emerald-400 text-xs font-bold">S$ {t.revenue}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(t.revenue / 500) * 100}%` }} />
                </div>
              </div>
              <span className="text-white/30 text-xs w-16 text-right">{t.orders} orders</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
