import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, ArrowRight, Lock } from "lucide-react";

const COMING_SOON = [
  { category: "Revenue", title: "The $0 Customer Acquisition Stack" },
  { category: "Validation", title: "The 48-Hour Idea Validation Playbook" },
  { category: "Sales", title: "Cold Outreach Templates That Convert" },
  { category: "Planning", title: "The 90-Day Revenue Roadmap" },
  { category: "Research", title: "The Reddit Research Method" },
];

export default function ResourceApp() {
  const [profile, setProfile] = useState<{ name: string; hustle: string; email: string } | null>(() => {
    const name = localStorage.getItem("w3_name");
    const hustle = localStorage.getItem("w3_hustle");
    const email = localStorage.getItem("w3_email");
    return name && hustle && email ? { name, hustle, email } : null;
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    ["w3_name", "w3_hustle", "w3_email"].forEach(k => localStorage.removeItem(k));
    setProfile(null);
    setShowProfileMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#d1d1d1] font-mono text-xs">

      {/* Header */}
      <div className="border-b border-[#222] bg-[#0a0a0a] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <a href="/" className="text-white font-bold bg-neutral-900 px-2 py-0.5 border border-neutral-800 tracking-wider text-xs">
          [ OBSESSION_OS ]
        </a>

        <div className="flex items-center gap-4">
          {profile && (
            <a href="/win" className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition">
              ← Dashboard
            </a>
          )}

          {profile ? (
            <div className="relative border-l border-neutral-800 pl-4" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="flex items-center gap-1.5 text-[#555] hover:text-white transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono uppercase tracking-widest">{profile.name}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0d0d0d] border border-[#333] z-50">
                  <div className="px-3 py-2.5 border-b border-[#222]">
                    <div className="text-[10px] font-mono text-white truncate">{profile.name}</div>
                    <div className="text-[9px] font-mono text-[#555] truncate">{profile.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-mono text-rose-400 hover:bg-rose-950/30 transition cursor-pointer uppercase tracking-widest"
                  >
                    <LogOut className="w-3 h-3" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/win" className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition border-l border-neutral-800 pl-4">
              Login →
            </a>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <div className="text-[9px] font-mono text-[#444] uppercase tracking-widest mb-2">Resource Library</div>
          <h1 className="text-white font-mono text-xl font-light">Playbooks & Frameworks</h1>
          <p className="text-neutral-600 font-mono text-[10px] mt-1">1 live · 5 coming soon</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ── Live card ── */}
          <a
            href="/resource/compounding-second-brain"
            className="group border border-[#333] bg-[#0a0a0a] hover:border-neutral-500 transition text-left flex flex-col h-[220px]"
          >
            <div className="border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border text-white/70 bg-white/5 border-white/10">
                Productivity
              </span>
              <span className="text-[9px] font-mono text-[#444]">20 min read</span>
            </div>
            <div className="flex-1 px-4 py-4 flex flex-col justify-between">
              <div>
                <h3 className="text-white font-mono text-sm font-light leading-snug mb-2">
                  Compounding Second Brain:<br />Claude Code + Obsidian
                </h3>
                <p className="text-neutral-600 font-mono text-[10px] leading-relaxed line-clamp-2">
                  Turn your daily notes into a growing, intelligent knowledge base that actively finds connections and compounds over time.
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-[#444] group-hover:bg-neutral-500 transition" />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-neutral-500 group-hover:text-white transition uppercase tracking-widest flex items-center gap-1">
                  Read <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </a>

          {/* ── Coming soon cards ── */}
          {COMING_SOON.map((item, i) => (
            <div
              key={i}
              className="relative border border-[#1a1a1a] bg-[#0a0a0a] flex flex-col h-[220px] overflow-hidden"
            >
              <div className="flex-1 flex flex-col blur-sm pointer-events-none select-none opacity-40">
                <div className="border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border text-neutral-500 bg-neutral-950 border-neutral-900">
                    {item.category}
                  </span>
                  <span className="text-[9px] font-mono text-[#333]">— min read</span>
                </div>
                <div className="flex-1 px-4 py-4 flex flex-col justify-between">
                  <h3 className="text-neutral-500 font-mono text-sm font-light leading-snug">{item.title}</h3>
                  <div className="flex gap-1.5 mt-auto">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="w-1.5 h-1.5 bg-[#222]" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-[#0a0a0a]/80 border border-[#333] px-3 py-1.5">
                  <Lock className="w-3 h-3 text-[#555]" />
                  <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest">Coming Soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle login nudge */}
        {!profile && (
          <div className="mt-10 border-t border-[#141414] pt-8 flex items-center justify-between">
            <p className="text-[#444] font-mono text-[10px] leading-relaxed">
              Have a business idea you're obsessed with?<br />
              <span className="text-[#555]">Forge it, track your income, and join a pod of builders.</span>
            </p>
            <a
              href="/win"
              className="flex-shrink-0 ml-6 text-[10px] font-mono text-neutral-500 hover:text-white uppercase tracking-widest border border-[#333] hover:border-neutral-600 px-4 py-2 transition flex items-center gap-2"
            >
              Get started <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
