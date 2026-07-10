import React, { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Star, AlertTriangle, ChevronRight, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { MENU_ITEMS } from "../data/mockData";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const FULL_MENU = [
  { id: 1, name: "Iced Matcha Latte", category: "Beverages", price: 6.50, cost: 1.82, margin: 72, popularity: 94, sales30d: 847, action: "Promote", trend: "up", img: "🍵", bcg: "star" },
  { id: 2, name: "Cold Brew Coffee", category: "Beverages", price: 5.50, cost: 1.20, margin: 78, popularity: 88, sales30d: 732, action: "Promote", trend: "up", img: "☕", bcg: "star" },
  { id: 3, name: "Truffle Pasta", category: "Mains", price: 18.00, cost: 7.40, margin: 59, popularity: 62, sales30d: 312, action: "Promote", trend: "up", img: "🍝", bcg: "puzzlePiece" },
  { id: 4, name: "Sourdough Avocado Toast", category: "Brunch", price: 14.00, cost: 6.20, margin: 56, popularity: 58, sales30d: 278, action: "Optimise", trend: "flat", img: "🥑", bcg: "puzzlePiece" },
  { id: 5, name: "Hot Matcha Latte", category: "Beverages", price: 5.50, cost: 1.82, margin: 67, popularity: 71, sales30d: 451, action: "Promote", trend: "up", img: "🍵", bcg: "cashCow" },
  { id: 6, name: "Chicken Sandwich", category: "Mains", price: 12.00, cost: 8.20, margin: 32, popularity: 28, sales30d: 118, action: "Remove", trend: "down", img: "🥪", bcg: "dog" },
  { id: 7, name: "Flat White", category: "Beverages", price: 4.50, cost: 0.95, margin: 79, popularity: 82, sales30d: 612, action: "Promote", trend: "up", img: "☕", bcg: "star" },
  { id: 8, name: "Banana Bread", category: "Pastry", price: 4.00, cost: 1.10, margin: 73, popularity: 55, sales30d: 220, action: "Optimise", trend: "flat", img: "🍞", bcg: "cashCow" },
  { id: 9, name: "Caesar Salad", category: "Mains", price: 13.50, cost: 6.80, margin: 50, popularity: 38, sales30d: 156, action: "Optimise", trend: "down", img: "🥗", bcg: "puzzlePiece" },
  { id: 10, name: "Croissant", category: "Pastry", price: 3.50, cost: 0.90, margin: 74, popularity: 76, sales30d: 498, action: "Promote", trend: "up", img: "🥐", bcg: "cashCow" },
];

const BCG_COLOR: Record<string, string> = {
  star: "#4ADE80",
  cashCow: "#60A5FA",
  puzzlePiece: "#FBBF24",
  dog: "#F87171",
};

const BCG_LABEL: Record<string, { name: string; desc: string }> = {
  star: { name: "Star", desc: "High margin + high popularity — promote aggressively" },
  cashCow: { name: "Cash Cow", desc: "High margin, lower popularity — steady revenue" },
  puzzlePiece: { name: "Puzzle Piece", desc: "Lower margin but popular — optimise costs" },
  dog: { name: "Dog", desc: "Low margin + low popularity — consider removing" },
};

const ACTION_STYLES: Record<string, string> = {
  Promote: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Optimise: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Remove: "bg-red-500/15 text-red-400 border-red-500/20",
};

const CUSTOM_SCATTER_TOOLTIP = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#222] border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-xl">
        <div className="font-semibold text-white mb-1">{d.img} {d.name}</div>
        <div className="text-white/50">Margin: <span className="text-emerald-400">{d.margin}%</span></div>
        <div className="text-white/50">Popularity: <span className="text-blue-400">{d.popularity}%</span></div>
      </div>
    );
  }
  return null;
};

const CATEGORIES = ["All", "Beverages", "Mains", "Brunch", "Pastry"];

export default function Menu() {
  const [cat, setCat] = useState("All");
  const [view, setView] = useState<"table" | "matrix">("table");
  const [sort, setSort] = useState<"margin" | "popularity" | "sales30d" | "name">("margin");

  const filtered = FULL_MENU
    .filter(i => cat === "All" || i.category === cat)
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return (b[sort] as number) - (a[sort] as number);
    });

  const avgMargin = Math.round(FULL_MENU.reduce((s, i) => s + i.margin, 0) / FULL_MENU.length);
  const stars = FULL_MENU.filter(i => i.bcg === "star").length;
  const dogs = FULL_MENU.filter(i => i.bcg === "dog").length;
  const totalRevenue = FULL_MENU.reduce((s, i) => s + i.sales30d * i.price, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0D0D0D]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-bold">Menu Engineering</h2>
          <p className="text-white/40 text-xs mt-0.5">Profitability matrix, item-level margin analysis & AI recommendations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/4 p-1 rounded-lg">
            {(["table", "matrix"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`capitalize text-xs px-3 py-1.5 rounded-md font-medium transition-all
                  ${view === v ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
              >
                {v === "matrix" ? "BCG Matrix" : "Table"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Menu Items", value: FULL_MENU.length, color: "text-white/80" },
          { label: "Avg Gross Margin", value: `${avgMargin}%`, color: "text-emerald-400" },
          { label: "Star Items", value: stars, color: "text-emerald-400" },
          { label: "30-Day Menu Revenue", value: `S$ ${Math.round(totalRevenue / 1000)}k`, color: "text-white/80" },
        ].map(k => (
          <div key={k.label} className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4">
            <div className="text-white/40 text-xs mb-1.5">{k.label}</div>
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* AI Recommendations banner */}
      <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-emerald-400" />
          <h3 className="text-white text-sm font-semibold">AI Menu Recommendations</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "📈", title: "Promote Iced Matcha Latte", detail: "Highest margin + top seller. Feature in socials & update board placement.", impact: "+S$18/day" },
            { icon: "✂️", title: "Remove Chicken Sandwich", detail: "32% margin is below break-even threshold. Replaced by Grilled Chicken Bowl (proposed).", impact: "Save S$45/mo waste" },
            { icon: "💡", title: "Bundle: Flat White + Croissant", detail: "Both high-margin items. A S$7.50 combo (vs S$8.00 separate) increases basket size.", impact: "+S$22/day est." },
          ].map(r => (
            <div key={r.title} className="bg-white/3 border border-white/6 rounded-xl p-3 hover:border-white/12 transition-all cursor-pointer group">
              <div className="text-xl mb-2">{r.icon}</div>
              <div className="text-white/80 text-xs font-medium mb-1">{r.title}</div>
              <div className="text-white/40 text-xs leading-relaxed mb-2">{r.detail}</div>
              <div className="text-emerald-400 text-xs font-semibold">{r.impact}</div>
            </div>
          ))}
        </div>
      </div>

      {view === "table" && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all
                    ${cat === c ? "bg-emerald-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-white/30 text-xs">Sort:</span>
              {(["margin", "popularity", "sales30d", "name"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all capitalize
                    ${sort === s ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
                >
                  {s === "sales30d" ? "30-day sales" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#1A1A1A] border border-white/6 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/5 text-white/30 text-xs font-medium">
              <div className="col-span-3">Item</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">Cost</div>
              <div className="col-span-2">Margin</div>
              <div className="col-span-2">Popularity</div>
              <div className="col-span-1">30d Sales</div>
              <div className="col-span-1">Trend</div>
              <div className="col-span-1">Action</div>
            </div>
            {filtered.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-white/3 transition-all border-b border-white/3 last:border-0">
                <div className="col-span-3 flex items-center gap-2.5">
                  <span className="text-lg">{item.img}</span>
                  <div>
                    <div className="text-white/80 text-xs font-medium">{item.name}</div>
                    <div className="text-white/30 text-[10px] mt-0.5">{item.category}</div>
                  </div>
                </div>
                <div className="col-span-1 text-white/60 text-xs">S${item.price.toFixed(2)}</div>
                <div className="col-span-1 text-white/40 text-xs">S${item.cost.toFixed(2)}</div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.margin > 65 ? "bg-emerald-400" : item.margin > 45 ? "bg-yellow-400" : "bg-red-400"}`}
                        style={{ width: `${item.margin}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold w-8 text-right ${item.margin > 65 ? "text-emerald-400" : item.margin > 45 ? "text-yellow-400" : "text-red-400"}`}>
                      {item.margin}%
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${item.popularity}%` }} />
                    </div>
                    <span className="text-blue-400 text-xs font-semibold w-8 text-right">{item.popularity}%</span>
                  </div>
                </div>
                <div className="col-span-1 text-white/50 text-xs">{item.sales30d}</div>
                <div className="col-span-1">
                  {item.trend === "up" && <TrendingUp size={13} className="text-emerald-400" />}
                  {item.trend === "down" && <TrendingDown size={13} className="text-red-400" />}
                  {item.trend === "flat" && <Minus size={13} className="text-white/30" />}
                </div>
                <div className="col-span-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${ACTION_STYLES[item.action]}`}>
                    {item.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "matrix" && (
        <div className="grid grid-cols-3 gap-3">
          {/* Scatter plot */}
          <div className="col-span-2 bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-1">Profitability Matrix</h3>
            <p className="text-white/30 text-xs mb-4">X = Margin %, Y = Popularity %</p>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
                <XAxis dataKey="margin" name="Margin" type="number" domain={[20, 85]} tick={{ fill: "#6B7280", fontSize: 10 }} label={{ value: "Margin %", position: "insideBottom", offset: -10, fill: "#6B7280", fontSize: 10 }} />
                <YAxis dataKey="popularity" name="Popularity" type="number" domain={[20, 100]} tick={{ fill: "#6B7280", fontSize: 10 }} label={{ value: "Popularity %", angle: -90, position: "insideLeft", fill: "#6B7280", fontSize: 10 }} />
                <Tooltip content={<CUSTOM_SCATTER_TOOLTIP />} />
                <ReferenceLine x={55} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <ReferenceLine y={60} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <Scatter data={FULL_MENU} shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={14} fill={BCG_COLOR[payload.bcg]} opacity={0.15} />
                      <circle cx={cx} cy={cy} r={6} fill={BCG_COLOR[payload.bcg]} />
                      <text x={cx} y={cy - 14} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={10}>{payload.img}</text>
                    </g>
                  );
                }}>
                  {FULL_MENU.map((_, i) => <Cell key={i} fill={BCG_COLOR[FULL_MENU[i].bcg]} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* BCG legend + quadrant items */}
          <div className="space-y-3">
            {Object.entries(BCG_LABEL).map(([key, { name, desc }]) => {
              const items = FULL_MENU.filter(i => i.bcg === key);
              return (
                <div key={key} className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: BCG_COLOR[key] }} />
                    <span className="text-white/80 text-xs font-semibold">{name}</span>
                    <span className="ml-auto text-white/30 text-xs">{items.length} items</span>
                  </div>
                  <p className="text-white/30 text-[10px] leading-relaxed mb-2">{desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {items.map(i => (
                      <span key={i.id} className="text-[10px] bg-white/5 text-white/50 px-1.5 py-0.5 rounded-md">{i.img} {i.name.split(" ")[0]}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
