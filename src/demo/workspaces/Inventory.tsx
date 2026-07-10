import React, { useState } from "react";
import { Search, Plus, AlertTriangle, TrendingDown, TrendingUp, Package, ChevronDown, Filter } from "lucide-react";
import { INVENTORY } from "../data/mockData";

const RISK_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  critical: { badge: "bg-red-500/15 text-red-400 border border-red-500/20", dot: "bg-red-400", label: "Critical" },
  high:     { badge: "bg-orange-500/15 text-orange-400 border border-orange-500/20", dot: "bg-orange-400", label: "High" },
  medium:   { badge: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20", dot: "bg-yellow-400", label: "Medium" },
  low:      { badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", dot: "bg-emerald-400", label: "Low" },
};

const CATEGORIES = ["All", "Dairy", "Produce", "Protein", "Beverage", "Bakery", "Dry Goods", "Spices"];

export default function Inventory() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  const filtered = INVENTORY.filter(i => {
    const matchQ = i.name.toLowerCase().includes(query.toLowerCase());
    const matchC = cat === "All" || i.category === cat;
    const matchR = riskFilter === "All" || i.risk === riskFilter.toLowerCase();
    return matchQ && matchC && matchR;
  });

  const criticalCount = INVENTORY.filter(i => i.risk === "critical").length;
  const highCount = INVENTORY.filter(i => i.risk === "high").length;
  const totalValue = INVENTORY.reduce((acc, i) => acc + i.value, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0D0D0D]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-bold">Operations / Inventory OS</h2>
          <p className="text-white/40 text-xs mt-0.5">Real-time stock tracking & reorder intelligence</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={14} />
          Add Item
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Items", value: INVENTORY.length, icon: Package, color: "text-white/70" },
          { label: "Critical Risk", value: criticalCount, icon: AlertTriangle, color: "text-red-400" },
          { label: "High Risk", value: highCount, icon: AlertTriangle, color: "text-orange-400" },
          { label: "Total Value", value: `S$ ${totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={16} />
            </div>
            <div>
              <div className="text-white/40 text-xs">{s.label}</div>
              <div className={`font-bold text-base mt-0.5 ${s.color}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="text-white/30 flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search inventory..."
            className="bg-transparent text-white/70 text-xs outline-none w-full placeholder-white/25"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${cat === c ? "bg-emerald-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {["All", "Critical", "High", "Medium", "Low"].map(r => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-all
                ${riskFilter === r ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-white/6 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-white/30 text-xs font-medium">
          <div className="col-span-3">Item</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Stock</div>
          <div className="col-span-1">Min Level</div>
          <div className="col-span-1">Days Left</div>
          <div className="col-span-1">Value</div>
          <div className="col-span-1">Last Order</div>
          <div className="col-span-1">Risk</div>
          <div className="col-span-1">Action</div>
        </div>
        <div>
          {filtered.map((item, idx) => {
            const rs = RISK_STYLES[item.risk];
            const stockPct = Math.min(100, (item.stock / item.maxStock) * 100);
            return (
              <div
                key={item.id}
                className={`grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-white/3 transition-all cursor-pointer border-b border-white/3 last:border-0 ${idx % 2 === 0 ? "" : ""}`}
              >
                <div className="col-span-3 flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${rs.dot}`} />
                  <span className="text-white/80 text-xs font-medium">{item.name}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-white/40 text-xs bg-white/5 px-2 py-0.5 rounded-md">{item.category}</span>
                </div>
                <div className="col-span-1">
                  <div className="text-white/70 text-xs font-medium">{item.stock} <span className="text-white/30">{item.unit}</span></div>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.risk === "critical" ? "bg-red-400" : item.risk === "high" ? "bg-orange-400" : "bg-emerald-400"}`}
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>
                </div>
                <div className="col-span-1 text-white/30 text-xs">{item.minStock} {item.unit}</div>
                <div className={`col-span-1 text-xs font-semibold ${item.daysLeft <= 1 ? "text-red-400" : item.daysLeft <= 3 ? "text-orange-400" : "text-white/60"}`}>
                  {item.daysLeft}d
                </div>
                <div className="col-span-1 text-white/50 text-xs">S${item.value}</div>
                <div className="col-span-1 text-white/30 text-xs">{item.lastOrder}</div>
                <div className="col-span-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${rs.badge}`}>{rs.label}</span>
                </div>
                <div className="col-span-1">
                  {item.risk !== "low" && (
                    <button className="text-emerald-400 text-[10px] font-medium hover:text-emerald-300 transition-colors">
                      Reorder →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reorder Banner */}
      {criticalCount > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
            <div>
              <div className="text-white/80 text-sm font-medium">{criticalCount} item{criticalCount > 1 ? "s" : ""} critically low</div>
              <div className="text-white/40 text-xs mt-0.5">Immediate reorder recommended to avoid stockouts</div>
            </div>
          </div>
          <button className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
            Reorder All Critical
          </button>
        </div>
      )}
    </div>
  );
}
