import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Package, AlertTriangle, CheckSquare, ArrowRight, Sparkles } from "lucide-react";
import { KPI_DATA, REVENUE_SERIES, WASTE_SERIES, WASTE_BREAKDOWN, TOP_WASTE, INVENTORY, MENU_ITEMS, TASKS } from "../data/mockData";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / (max - min + 1)) * 100;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 40" className="w-full h-10" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function KPICard({ title, value, unit, change, changePct, sparkData, sparkColor, suffix = "" }: any) {
  const positive = change >= 0;
  return (
    <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4 flex flex-col gap-2 hover:border-white/12 transition-all cursor-pointer group">
      <div className="text-white/40 text-xs font-medium">{title}</div>
      <div className="text-white text-2xl font-bold tracking-tight">
        {unit && <span className="text-white/70 text-base mr-0.5">{unit}</span>}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix && <span className="text-white/50 text-base ml-0.5">{suffix}</span>}
      </div>
      <div className="flex items-center gap-1.5">
        {positive ? <TrendingUp size={11} className="text-emerald-400" /> : <TrendingDown size={11} className="text-red-400" />}
        <span className={`text-xs font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {positive ? "+" : ""}{changePct}%
        </span>
        <span className="text-white/30 text-xs">vs yesterday</span>
      </div>
      {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
    </div>
  );
}

const INVENTORY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-400/10",
  high: "text-orange-400 bg-orange-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  low: "text-emerald-400 bg-emerald-400/10",
};

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-xs text-white shadow-xl">
        <div className="text-white/50 mb-1">{label}</div>
        <div className="font-bold">S$ {payload[0].value?.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ onNav }: { onNav: (id: string) => void }) {
  const [revenue, setRevenue] = useState(KPI_DATA.revenue.value);
  const [savings, setSavings] = useState(KPI_DATA.savings.value);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(v => v + Math.floor(Math.random() * 40 - 5));
      setSavings(v => v + Math.floor(Math.random() * 10 - 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sparkRevenue = REVENUE_SERIES.map(d => d.value);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0D0D0D]">

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-3">
        <KPICard title="Today's Revenue" value={revenue} unit="S$" change={1} changePct="12.6" sparkData={sparkRevenue} sparkColor="#4ADE80" />
        <KPICard title="Today's Savings" value={savings} unit="S$" change={1} changePct="18.3" sparkData={[400,420,410,450,460,480,savings]} sparkColor="#4ADE80" />
        <KPICard title="Waste Today" value={KPI_DATA.waste.value} suffix="kg" change={-1} changePct="-8.7" sparkData={WASTE_SERIES.map(d => d.value)} sparkColor="#F87171" />
        <KPICard title="Gross Margin" value={KPI_DATA.grossMargin.value} suffix="%" change={1} changePct="3.2" sparkData={[64,65,66,67,67,68,68.4]} sparkColor="#4ADE80" />
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4 hover:border-white/12 transition-all cursor-pointer">
          <div className="text-white/40 text-xs font-medium mb-2">Orders Due</div>
          <div className="text-white text-2xl font-bold">{KPI_DATA.ordersDue.value}</div>
          <div className="text-white/30 text-xs mt-1">{KPI_DATA.ordersDue.pending} pending approval</div>
          <button className="mt-3 flex items-center gap-1 text-emerald-400 text-xs font-medium hover:text-emerald-300">
            View orders <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* Row 2: Inventory + Waste + Menu */}
      <div className="grid grid-cols-3 gap-3">

        {/* Inventory Overview */}
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Inventory Overview</h3>
            <Package size={15} className="text-white/30" />
          </div>
          <div className="flex items-start gap-6 mb-4">
            <div>
              <div className="text-white/40 text-xs mb-1">Health Score</div>
              <div className="text-emerald-400 text-3xl font-bold">96%</div>
              <div className="text-emerald-400/60 text-xs mt-0.5">Healthy</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1">Inventory Value</div>
              <div className="text-white text-xl font-bold">S$ 5,842</div>
              <div className="text-emerald-400 text-xs mt-0.5 flex items-center gap-1"><TrendingUp size={10} /> +5.3% vs last week</div>
            </div>
          </div>

          {/* Health bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: "96%" }} />
          </div>

          <div className="text-white/40 text-xs font-medium mb-2">Top Items at Risk</div>
          <div className="space-y-2">
            {INVENTORY.filter(i => i.risk !== "low").slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <AlertTriangle size={11} className={item.risk === "critical" ? "text-red-400" : "text-orange-400"} />
                <span className="text-white/70 flex-1">{item.name}</span>
                <span className="text-white/40">{item.stock} {item.unit}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${INVENTORY_COLORS[item.risk]}`}>
                  {item.daysLeft}d
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => onNav("inventory")} className="mt-4 flex items-center gap-1.5 text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors">
            View all inventory <ArrowRight size={11} />
          </button>
        </div>

        {/* Waste & Cost Insights */}
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Waste & Cost Insights</h3>
          </div>
          <div className="text-white/40 text-xs mb-1">Waste This Week</div>
          <div className="text-white text-2xl font-bold mb-0.5">12.4 <span className="text-white/40 text-sm">kg</span></div>
          <div className="flex items-center gap-1 mb-4">
            <TrendingDown size={11} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs">-8.7% vs last week</span>
          </div>

          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={WASTE_SERIES} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {WASTE_SERIES.map((_, i) => (
                  <Cell key={i} fill={i === WASTE_SERIES.length - 1 ? "#4ADE80" : "#374151"} />
                ))}
              </Bar>
              <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            </BarChart>
          </ResponsiveContainer>

          <div className="text-white/40 text-xs font-medium mt-4 mb-2">Top Waste Contributors</div>
          <div className="space-y-1.5">
            {TOP_WASTE.map(w => (
              <div key={w.item} className="flex items-center gap-2 text-xs">
                <span className="text-white/60 flex-1">{w.item}</span>
                <span className="text-white/40">{w.amount} kg</span>
                <span className="text-white/30">({w.pct}%)</span>
              </div>
            ))}
          </div>
          <button onClick={() => onNav("insights")} className="mt-4 flex items-center gap-1.5 text-emerald-400 text-xs font-medium hover:text-emerald-300">
            View waste report <ArrowRight size={11} />
          </button>
        </div>

        {/* Menu Engineering */}
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Menu Engineering</h3>
          </div>
          <div className="text-white/40 text-xs font-medium mb-3">Top Recommendations</div>
          <div className="space-y-3">
            {MENU_ITEMS.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                  {item.img}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-xs font-medium truncate">{item.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                      ${item.margin === "high" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                      {item.margin === "high" ? "High margin" : "Low margin"}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full
                      ${item.popularity === "high" ? "bg-blue-500/15 text-blue-400" : "bg-white/5 text-white/30"}`}>
                      {item.popularity === "high" ? "High popularity" : item.popularity + " popularity"}
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 font-medium ${item.marginPerServe > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {item.marginPerServe > 0 ? "+" : ""}S${item.marginPerServe.toFixed(2)} margin/serve
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0
                  ${item.action === "Promote" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {item.action}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => onNav("menu")} className="mt-4 flex items-center gap-1.5 text-emerald-400 text-xs font-medium hover:text-emerald-300">
            View all recommendations <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* Row 3: Daily Performance + Tasks */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Daily Performance</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="text-white text-2xl font-bold">S$ {revenue.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs">
                  <TrendingUp size={11} /> +12.6% vs yesterday
                </div>
              </div>
            </div>
            <select className="bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg px-2 py-1.5 outline-none">
              <option>Revenue</option>
              <option>Waste</option>
              <option>Margins</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={REVENUE_SERIES} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `S$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Line type="monotone" dataKey="value" stroke="#4ADE80" strokeWidth={2.5} dot={{ fill: "#4ADE80", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#4ADE80" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks */}
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Tasks & Reminders</h3>
            <CheckSquare size={14} className="text-white/30" />
          </div>
          <div className="space-y-2.5">
            {TASKS.map(t => (
              <div key={t.id} className="flex items-center gap-3 group">
                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center cursor-pointer transition-all
                  ${t.urgent ? "border-orange-400/50" : "border-white/15"} hover:border-emerald-400`}>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/70 text-xs truncate group-hover:text-white/90 transition-colors">{t.title}</div>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0
                  ${t.due === "today" ? "text-orange-400 bg-orange-400/10" : "text-white/30 bg-white/5"}`}>
                  {t.due === "today" ? "Due today" : t.due === "tomorrow" ? "Tomorrow" : `Due ${t.due}`}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-5 flex items-center gap-1.5 text-emerald-400 text-xs font-medium hover:text-emerald-300">
            View all tasks <ArrowRight size={11} />
          </button>

          {/* Expected savings */}
          <div className="mt-5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
            <div className="text-white/40 text-xs mb-1">Expected savings this month</div>
            <div className="text-emerald-400 text-2xl font-bold">+S$623</div>
            <div className="text-white/30 text-xs mt-0.5">vs last month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
