import React from "react";
import { TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { REVENUE_SERIES, WASTE_SERIES, WASTE_BREAKDOWN, TOP_WASTE } from "../data/mockData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const PIE_COLORS = ["#F87171", "#FB923C", "#FBBF24", "#60A5FA", "#A78BFA"];

const AI_RECS = [
  { icon: "💡", title: "Reduce avocado portion by 10%", impact: "+S$28/day savings", urgency: "high" },
  { icon: "📈", title: "Iced Matcha is your highest-margin item — promote it", impact: "+S$18/day profit", urgency: "medium" },
  { icon: "🔄", title: "Switch chicken supplier to Poultry Direct", impact: "+S$45/week savings", urgency: "high" },
  { icon: "⏰", title: "Order dairy 2× weekly instead of daily", impact: "Reduce spoilage 23%", urgency: "low" },
];

const URGENCY: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-white/5 text-white/40 border-white/10",
};

export default function Insights() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0D0D0D]">
      <div>
        <h2 className="text-white text-lg font-bold">Finance & Insights OS</h2>
        <p className="text-white/40 text-xs mt-0.5">AI-powered performance analysis and cost intelligence</p>
      </div>

      <div className="grid grid-cols-3 gap-3">

        {/* Revenue trend */}
        <div className="col-span-2 bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Revenue Trend (7 days)</h3>
            <div className="flex items-center gap-1 text-emerald-400 text-xs">
              <TrendingUp size={12} /> +12.6% week-on-week
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={REVENUE_SERIES}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `S$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#222", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, fontSize: 11, color: "#fff" }} />
              <Area type="monotone" dataKey="value" stroke="#4ADE80" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Waste breakdown donut */}
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5 flex flex-col">
          <h3 className="text-white font-semibold text-sm mb-4">Waste by Category</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={WASTE_BREAKDOWN} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {WASTE_BREAKDOWN.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {WASTE_BREAKDOWN.map((w, i) => (
              <div key={w.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-white/50 flex-1">{w.name}</span>
                <span className="text-white/70 font-medium">{w.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waste trend */}
      <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Waste Trend (7 days)</h3>
          <div className="flex items-center gap-1 text-emerald-400 text-xs">
            <TrendingDown size={12} /> -8.7% this week
          </div>
        </div>
        <div className="text-white/40 text-xs mb-3">Top contributors: Fresh Milk, Sourdough Bread, Avocado</div>
        <div className="space-y-2">
          {TOP_WASTE.map(w => (
            <div key={w.item} className="flex items-center gap-3">
              <span className="text-white/60 text-xs w-32 flex-shrink-0">{w.item}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-400/70 rounded-full" style={{ width: `${w.pct * 3}%` }} />
              </div>
              <span className="text-white/40 text-xs w-16 text-right">{w.amount} kg ({w.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={15} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">AI Recommendations</h3>
        </div>
        <div className="space-y-2.5">
          {AI_RECS.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 border rounded-xl transition-all hover:bg-white/3 cursor-pointer ${URGENCY[r.urgency]}`}>
              <span className="text-xl flex-shrink-0">{r.icon}</span>
              <div className="flex-1">
                <div className="text-white/80 text-xs font-medium">{r.title}</div>
                <div className="text-emerald-400 text-xs mt-0.5">{r.impact}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${URGENCY[r.urgency]}`}>{r.urgency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
