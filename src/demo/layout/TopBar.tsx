import React, { useState } from "react";
import { Bell, ChevronDown, Search, Command } from "lucide-react";
import { NOTIFICATIONS, BUSINESS } from "../data/mockData";

interface Props {
  onSearch: () => void;
  workspace: string;
}

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  insights: "Insights",
  inventory: "Inventory",
  orders: "Orders & Suppliers",
  menu: "Menu Engineering",
  finance: "Finance",
  heatmap: "Income Heatmap",
  growth: "Growth OS",
};

export default function TopBar({ onSearch, workspace }: Props) {
  const [showNotif, setShowNotif] = useState(false);
  const unread = NOTIFICATIONS.filter(n => !n.read).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="h-[60px] border-b border-white/5 bg-[#0D0D0D] flex items-center px-6 gap-4 flex-shrink-0 relative">
      {/* Greeting */}
      <div className="flex-1">
        <div className="text-white font-semibold text-sm">
          {greeting}, {BUSINESS.owner} 👋
        </div>
        <div className="text-white/40 text-xs mt-0.5">
          Here's what's happening at {BUSINESS.name} today.
        </div>
      </div>

      {/* Business selector */}
      <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-medium hover:bg-white/10 transition-all">
        <div className="w-4 h-4 rounded-sm bg-emerald-600 flex-shrink-0" />
        {BUSINESS.name} ({BUSINESS.location.split(",")[0]})
        <ChevronDown size={13} className="text-white/40" />
      </button>

      {/* Date range */}
      <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs hover:bg-white/10 transition-all">
        <span className="text-white/60">7 May</span>
        <span className="text-white/30">–</span>
        <span className="text-white/60">13 May 2025</span>
        <ChevronDown size={13} className="text-white/40" />
      </button>

      {/* Search */}
      <button
        onClick={onSearch}
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/40 text-xs hover:bg-white/10 transition-all"
      >
        <Search size={13} />
        <span>Search...</span>
        <div className="flex items-center gap-0.5 ml-2 bg-white/10 rounded px-1.5 py-0.5">
          <Command size={10} className="text-white/30" />
          <span className="text-white/30" style={{fontSize: 10}}>K</span>
        </div>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <Bell size={15} className="text-white/60" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-black text-[9px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        {showNotif && (
          <div className="absolute right-0 top-11 w-80 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-white text-sm font-semibold">Notifications</span>
              <button className="text-emerald-400 text-xs hover:text-emerald-300">Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${!n.read ? "bg-white/3" : ""}`}>
                  <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${n.read ? "text-white/50" : "text-white/80"}`}>{n.text}</p>
                    <p className="text-white/30 text-xs mt-1">{n.time}</p>
                  </div>
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:bg-emerald-600 transition-all">
        SC
      </div>
    </header>
  );
}
