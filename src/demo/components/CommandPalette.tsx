import React, { useState, useEffect, useRef } from "react";
import { Search, LayoutDashboard, Package, DollarSign, BarChart2, Flame, TrendingUp, ArrowRight } from "lucide-react";

const COMMANDS = [
  { label: "Go to Dashboard", icon: LayoutDashboard, shortcut: "G D", nav: "dashboard" },
  { label: "Go to Inventory", icon: Package, shortcut: "G I", nav: "inventory" },
  { label: "Go to Finance", icon: DollarSign, shortcut: "G F", nav: "finance" },
  { label: "Go to Income Heatmap", icon: BarChart2, shortcut: "G H", nav: "heatmap" },
  { label: "Go to Growth OS", icon: Flame, shortcut: "G G", nav: "growth" },
  { label: "Go to Insights", icon: TrendingUp, shortcut: "G N", nav: "insights" },
];

const RECENT = ["Matcha Powder", "Fresh Milk", "Revenue Report", "Supplier B"];

interface Props {
  open: boolean;
  onClose: () => void;
  onNav: (id: string) => void;
}

export default function CommandPalette({ open, onClose, onNav }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8">
          <Search size={16} className="text-white/40 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search or type a command..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
          />
          <kbd className="text-white/25 text-xs bg-white/5 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Content */}
        <div className="p-2 max-h-80 overflow-y-auto">
          {!query && (
            <>
              <div className="px-3 py-1.5">
                <span className="text-white/30 text-[10px] uppercase tracking-wider font-medium">Recent</span>
              </div>
              {RECENT.map(r => (
                <button key={r} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-left group">
                  <Search size={13} className="text-white/30" />
                  <span className="text-white/60 text-sm">{r}</span>
                  <ArrowRight size={12} className="text-white/20 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              <div className="px-3 py-1.5 mt-1">
                <span className="text-white/30 text-[10px] uppercase tracking-wider font-medium">Navigate</span>
              </div>
            </>
          )}

          {filtered.map(c => (
            <button
              key={c.label}
              onClick={() => { onNav(c.nav); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/8 text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <c.icon size={13} className="text-white/50" />
              </div>
              <span className="text-white/70 text-sm flex-1">{c.label}</span>
              <kbd className="text-white/25 text-[10px] bg-white/5 border border-white/8 rounded px-1.5 py-0.5">{c.shortcut}</kbd>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4">
          {[["↵", "Select"], ["↑↓", "Navigate"], ["ESC", "Close"]].map(([k, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <kbd className="text-white/25 text-[10px] bg-white/5 border border-white/8 rounded px-1.5 py-0.5">{k}</kbd>
              <span className="text-white/25 text-[10px]">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
