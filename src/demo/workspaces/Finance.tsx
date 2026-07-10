import React, { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, ChevronRight, Calculator } from "lucide-react";
import { REVENUE_SERIES, WASTE_SERIES, KPI_DATA, FINANCE_SCENARIOS } from "../data/mockData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHLY_REVENUE = MONTHS.slice(0,7).map((m, i) => ({ month: m, revenue: 28000 + i * 1200 + Math.sin(i) * 2000, cogs: 16000 + i * 600, profit: 12000 + i * 600 }));
const COST_BREAKDOWN = [
  { name: "Food & Bev", value: 38, color: "#4ADE80" },
  { name: "Labour", value: 28, color: "#60A5FA" },
  { name: "Rent", value: 18, color: "#F472B6" },
  { name: "Utilities", value: 8, color: "#FBBF24" },
  { name: "Other", value: 8, color: "#A78BFA" },
];

function TooltipRevenue({ active, payload, label }: any) {
  if (active && payload?.length) return (
    <div className="bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-white/50 mb-1">{label}</div>
      <div className="text-emerald-400 font-bold">S${payload[0]?.value?.toLocaleString()}</div>
      <div className="text-white/40 mt-0.5">Profit: S${payload[2]?.value?.toLocaleString()}</div>
    </div>
  );
  return null;
}

export default function Finance() {
  const [costRecoup, setCostRecoup] = useState({ food: 38, labour: 28, target: 65 });
  const [priceIncrease, setPriceIncrease] = useState(5);

  const simRevenue = KPI_DATA.revenue.value * 30 * (1 + priceIncrease / 100);
  const simMargin = Math.min(80, costRecoup.target + priceIncrease * 0.3);
  const simProfit = simRevenue * (simMargin / 100);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0D0D0D]">

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Monthly Revenue", value: "S$ 34,920", change: "+12%", up: true },
          { label: "Gross Profit", value: "S$ 23,867", change: "+18%", up: true },
          { label: "Gross Margin", value: "68.4%", change: "+3.2%", up: true },
          { label: "Net Profit", value: "S$ 8,230", change: "-2.1%", up: false },
        ].map(k => (
          <div key={k.label} className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4">
            <div className="text-white/40 text-xs mb-2">{k.label}</div>
            <div className="text-white text-xl font-bold">{k.value}</div>
            <div className={`flex items-center gap-1 mt-1.5 text-xs ${k.up ? "text-emerald-400" : "text-red-400"}`}>
              {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {k.change} vs last month
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">

        {/* P&L Chart */}
        <div className="col-span-2 bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Revenue vs COGS vs Profit</h3>
          <div className="text-white/40 text-xs mb-4">Last 7 months</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_REVENUE} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `S$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<TooltipRevenue />} />
              <Bar dataKey="revenue" fill="#4ADE80" radius={[3,3,0,0]} opacity={0.7} />
              <Bar dataKey="cogs" fill="#F87171" radius={[3,3,0,0]} opacity={0.7} />
              <Bar dataKey="profit" fill="#60A5FA" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            {[["#4ADE80","Revenue"],["#F87171","COGS"],["#60A5FA","Profit"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{background:c}} />
                <span className="text-white/40 text-xs">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            {COST_BREAKDOWN.map(c => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/60">{c.name}</span>
                  <span className="text-white/80 font-medium">{c.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${c.value * 2}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="text-white/40 text-xs mb-2">Industry benchmark</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/60">Food cost ratio</span>
              <span className="text-emerald-400 font-semibold">38%</span>
              <span className="text-white/30">/ 35% industry avg</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1.5">
              <span className="text-white/60">Labour ratio</span>
              <span className="text-yellow-400 font-semibold">28%</span>
              <span className="text-white/30">/ 25% industry avg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenarios / Recoup Calculator */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={15} className="text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">Cost Recoup Calculator</h3>
          </div>
          <div className="text-white/40 text-xs mb-4">Simulate price increases to hit your target margin</div>

          <div className="space-y-4">
            <div>
              <label className="text-white/50 text-xs block mb-2">Menu price increase: <span className="text-emerald-400 font-semibold">{priceIncrease}%</span></label>
              <input
                type="range" min="0" max="20" value={priceIncrease}
                onChange={e => setPriceIncrease(Number(e.target.value))}
                className="w-full h-1.5 rounded-full bg-white/10 accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-white/25 text-xs mt-1">
                <span>0%</span><span>20%</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Projected monthly revenue</span>
              <span className="text-emerald-400 font-bold">S$ {Math.round(simRevenue / 1000)}k</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Projected gross margin</span>
              <span className="text-emerald-400 font-bold">{simMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Projected gross profit</span>
              <span className="text-emerald-400 font-bold">S$ {Math.round(simProfit / 1000)}k</span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-emerald-500/15">
              <span className="text-white/50">Extra profit vs now</span>
              <span className="text-emerald-300 font-bold">+S$ {Math.round((simProfit - 8230) / 100) * 100}</span>
            </div>
          </div>
        </div>

        {/* Finance Events / Scenarios */}
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={15} className="text-yellow-400" />
            <h3 className="text-white font-semibold text-sm">Upcoming Finance Events</h3>
          </div>
          <div className="space-y-3">
            {FINANCE_SCENARIOS.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/6 hover:border-white/12 transition-all cursor-pointer group">
                <span className={`text-xl mt-0.5`}>{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-xs font-medium">{s.event}</div>
                  <div className="text-white/40 text-xs mt-0.5">{s.date}</div>
                  <div className={`text-xs mt-1.5 font-semibold ${s.impact > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {s.impact > 0 ? "+" : ""}S$ {s.impact.toLocaleString()} projected impact
                  </div>
                </div>
                <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-400 text-xs font-medium">AI Forecast</span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
              Based on current trajectory, you're on track for <span className="text-emerald-400 font-medium">S$12,400 net profit</span> in July —
              highest this year if food cost stays below 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
