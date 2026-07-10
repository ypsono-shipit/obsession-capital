import React from "react";
import { LayoutDashboard, TrendingUp, Package, ShoppingCart, UtensilsCrossed, DollarSign, BarChart2, Settings, LogOut, Flame } from "lucide-react";
import { BUSINESS } from "../data/mockData";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "insights", label: "Insights", icon: TrendingUp },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders & Suppliers", icon: ShoppingCart },
  { id: "menu", label: "Menu Engineering", icon: UtensilsCrossed },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "heatmap", label: "Income Heatmap", icon: BarChart2 },
  { id: "growth", label: "Growth OS", icon: Flame },
];

interface Props {
  active: string;
  onNav: (id: string) => void;
}

export default function Sidebar({ active, onNav }: Props) {
  return (
    <aside className="w-[200px] flex-shrink-0 bg-[#111111] border-r border-white/5 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <path d="M14 2v24M2 14h24M5.5 5.5l17 17M22.5 5.5l-17 17" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="2.5" fill="white"/>
          </svg>
          <span className="text-white text-sm font-semibold tracking-wider">OBSESSION OS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNav(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group
              ${active === id
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
          >
            <Icon size={16} className={active === id ? "text-white" : "text-white/40 group-hover:text-white/60"} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom: business + settings */}
      <div className="border-t border-white/5 px-3 py-3 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <Settings size={16} />
          <span className="text-xs font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <LogOut size={16} />
          <span className="text-xs font-medium">Log out</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-3 mt-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {BUSINESS.owner[0]}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-white font-medium truncate">{BUSINESS.name}</div>
            <div className="text-xs text-white/40 truncate">{BUSINESS.location}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
