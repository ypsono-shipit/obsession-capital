import React, { useState, useEffect } from "react";
import { X, Plus, RefreshCw } from "lucide-react";
import { CodexPlaybook } from "../types";

const TODAY = new Date().toISOString().split("T")[0];
const CACHE_KEY = `w3_daily_ideas_${TODAY}`;

interface Props {
  onImport: (playbook: CodexPlaybook) => void;
  onGoToForge: () => void;
}

export default function SwipeCards3({ onImport, onGoToForge }: Props) {
  const [playbooks, setPlaybooks] = useState<CodexPlaybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheDate, setCacheDate] = useState("");

  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const loadIdeas = async () => {
    // Check localStorage cache for today
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CodexPlaybook[];
        setPlaybooks(parsed);
        setCacheDate(TODAY);
        setLoading(false);
        return;
      } catch { /* bad cache, re-fetch */ }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/daily-ideas");
      if (res.ok) {
        const data = await res.json();
        const ideas = (data.ideas || []).slice(0, 5) as CodexPlaybook[];
        setPlaybooks(ideas);
        setCacheDate(data.date || TODAY);
        localStorage.setItem(CACHE_KEY, JSON.stringify(ideas));
      }
    } catch (e) {
      console.error("Failed to load daily ideas:", e);
    } finally {
      setLoading(false);
    }
  };

  const refreshFeed = async () => {
    localStorage.removeItem(CACHE_KEY);
    setSwipedIds([]);
    setExpandedId(null);
    await loadIdeas();
  };

  useEffect(() => { loadIdeas(); }, []);

  const active = playbooks.filter(p => !swipedIds.includes(p.id));
  const topCard = active[0];
  const nextCard = active[1];

  const pass = (id: string) => { setSwipedIds(p => [...p, id]); setExpandedId(null); setDragX(0); setDragY(0); };
  const forge = (playbook: CodexPlaybook) => { setSwipedIds(p => [...p, playbook.id]); setExpandedId(null); setDragX(0); setDragY(0); onImport(playbook); };

  const handleStart = (clientX: number, clientY: number) => { setIsDragging(true); setDragStartX(clientX); setDragStartY(clientY); };
  const handleMove = (clientX: number, clientY: number) => { if (!isDragging) return; setDragX(clientX - dragStartX); setDragY(clientY - dragStartY); };
  const handleEnd = () => {
    if (!isDragging || !topCard) return;
    setIsDragging(false);
    if (dragX > 110) forge(topCard);
    else if (dragX < -110) pass(topCard.id);
    else { setDragX(0); setDragY(0); }
  };

  const rotation = dragX * 0.08;
  const transformStyle = isDragging
    ? `translate3d(${dragX}px, ${dragY}px, 0) rotate(${rotation}deg)`
    : "translate3d(0, 0, 0) rotate(0deg)";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Today's feed · 5 ideas · {cacheDate || TODAY}</div>
        </div>
        <button
          onClick={refreshFeed}
          disabled={loading}
          className="border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-500 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh Feed
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-neutral-600" />
          <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Scanning blackhole feed...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && active.length === 0 && playbooks.length > 0 && (
        <div className="border border-dashed border-neutral-800 p-8 text-center bg-[#090909] max-w-md mx-auto flex flex-col items-center justify-center gap-4 min-h-[320px]">
          <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-950 text-emerald-400 animate-pulse font-mono font-bold text-lg">✔</div>
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-mono">Deck Processed</h4>
            <p className="text-neutral-400 text-xs mt-1 max-w-xs leading-relaxed">All playbooks reviewed. Scan a new situation or restart.</p>
          </div>
          <div className="flex gap-2 w-full max-w-xs">
            <button
              onClick={() => { setSwipedIds([]); setExpandedId(null); }}
              className="flex-1 bg-white text-black font-bold py-2 px-4 font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-200 transition cursor-pointer"
            >
              Restart Deck
            </button>
            <button
              onClick={onGoToForge}
              className="flex-1 border border-neutral-800 hover:border-neutral-500 py-2 px-4 font-mono text-[10px] uppercase tracking-wider text-neutral-400 hover:text-white transition cursor-pointer"
            >
              Go to Forge →
            </button>
          </div>
        </div>
      )}

      {/* Card stack */}
      {!loading && active.length > 0 && (
        <>
          <div className="w-full flex justify-between text-[9px] font-mono text-neutral-600 uppercase tracking-widest max-w-md mx-auto">
            <span>{playbooks.length - active.length} / {playbooks.length} reviewed</span>
            <span>{swipedIds.length} processed</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md h-[430px] flex items-center justify-center select-none touch-none">
              {/* Background card */}
              {nextCard && (
                <div className="absolute w-full h-[390px] border border-neutral-900 bg-[#070707] p-5 opacity-40 scale-95 translate-y-4 pointer-events-none transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] bg-neutral-950 px-2 py-0.5 text-neutral-500 font-mono uppercase">{nextCard.category}</span>
                      <span className="text-[10px] text-neutral-600 font-mono">{nextCard.timeline}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-500 mt-1 line-clamp-1">{nextCard.title}</h3>
                    <p className="text-neutral-500 text-xs mt-3 italic line-clamp-3">"{nextCard.summary}"</p>
                  </div>
                  <div className="text-[9px] text-neutral-600 font-mono text-center tracking-widest uppercase">Next up in deck...</div>
                </div>
              )}

              {/* Top card */}
              {topCard && (
                <div
                  onMouseDown={e => handleStart(e.clientX, e.clientY)}
                  onMouseMove={e => handleMove(e.clientX, e.clientY)}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={e => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchMove={e => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handleEnd}
                  style={{ transform: transformStyle }}
                  className="absolute w-full h-[390px] border border-[#333] bg-[#0a0a0a] p-5 flex flex-col justify-between transition-transform duration-75 select-none cursor-grab active:cursor-grabbing shadow-2xl z-20"
                >
                  {/* Swipe indicators */}
                  {isDragging && dragX > 30 && (
                    <div className="absolute inset-0 bg-emerald-950/20 border-2 border-emerald-500 flex items-center justify-center z-30 pointer-events-none" style={{ opacity: Math.min(0.9, dragX / 80) }}>
                      <div className="bg-emerald-900 border border-emerald-400 text-emerald-400 font-mono font-bold text-sm px-4 py-1.5 tracking-widest uppercase rotate-[-10deg] shadow-lg">FORGE IT</div>
                    </div>
                  )}
                  {isDragging && dragX < -30 && (
                    <div className="absolute inset-0 bg-rose-950/20 border-2 border-rose-500 flex items-center justify-center z-30 pointer-events-none" style={{ opacity: Math.min(0.9, -dragX / 80) }}>
                      <div className="bg-rose-900 border border-rose-400 text-rose-400 font-mono font-bold text-sm px-4 py-1.5 tracking-widest uppercase rotate-[10deg] shadow-lg">PASS</div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-400 font-mono uppercase">{topCard.category}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">{topCard.timeline}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white tracking-tight mt-1 underline decoration-neutral-800 underline-offset-4">{topCard.title}</h3>

                    <div className="mt-2.5 flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                      <span>Source: <strong className="text-white font-medium">{topCard.author}</strong></span>
                      <span>Difficulty: <strong className="text-orange-400 font-medium">{topCard.difficulty}</strong></span>
                    </div>

                    <p className="text-neutral-300 text-xs mt-3 leading-relaxed font-sans italic bg-neutral-950 p-2.5 border border-neutral-900">"{topCard.summary}"</p>

                    <div className="mt-auto pt-3 text-[10px] text-neutral-500 font-mono flex items-center justify-between">
                      <span>Swipe Left to Pass</span>
                      <span className="text-emerald-400">Swipe Right to Forge</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4 select-none">
              <button onClick={() => topCard && pass(topCard.id)} className="p-3.5 rounded-full border border-neutral-800 bg-neutral-950 text-rose-500 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/10 transition cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 active:scale-95" title="Skip">
                <X className="w-5 h-5" />
              </button>
              <button onClick={() => topCard && setExpandedId(expandedId === topCard.id ? null : topCard.id)} className="px-5 py-2.5 border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-500 transition cursor-pointer text-xs font-mono uppercase tracking-widest shadow-md hover:scale-105 active:scale-95">
                {topCard && expandedId === topCard.id ? "Collapse" : "Tap to learn more"}
              </button>
              <button onClick={() => topCard && forge(topCard)} className="p-3.5 rounded-full border border-neutral-800 bg-neutral-950 text-emerald-500 hover:text-emerald-400 hover:border-emerald-900/50 hover:bg-emerald-950/10 transition cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 active:scale-95" title="Import to Forge">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Expanded detail */}
            {expandedId && (() => {
              const pb = active.find(p => p.id === expandedId);
              if (!pb) return null;
              return (
                <div className="w-full max-w-md mt-6 p-5 border border-neutral-800 bg-black/80 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-bold">● Playbook Details</span>
                    <button onClick={() => setExpandedId(null)} className="text-[9px] font-mono text-neutral-500 hover:text-white cursor-pointer">[CLOSE]</button>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-neutral-500 block uppercase tracking-wider font-semibold">● Execution Steps</span>
                    <div className="space-y-1.5 pl-2.5 border-l border-neutral-800">
                      {pb.steps.map((step, i) => (
                        <div key={i} className="text-[11px] font-mono text-neutral-300 flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">{i + 1}.</span>
                          <p className="flex-1 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-neutral-900">
                    <span className="text-[10px] text-neutral-500 block uppercase tracking-wider font-semibold">● Revenue Potential</span>
                    <p className="text-[11px] font-mono text-emerald-400 mt-1 pl-2.5 border-l border-neutral-800">{pb.metrics}</p>
                  </div>
                  {pb.tests?.length > 0 && (
                    <div className="pt-2 border-t border-neutral-900">
                      <span className="text-[10px] text-neutral-500 block uppercase tracking-wider font-semibold">● Validation Test</span>
                      <p className="text-[11px] font-mono text-orange-400 mt-1 pl-2.5 border-l border-neutral-800">{pb.tests[0]}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
