import React, { useEffect, useRef } from "react";

function AsciiSkull() {
  return (
    <video
      src="/ascii-magic-2.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
    />
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          {/* Snowflake/flower logo */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2v24M2 14h24M5.5 5.5l17 17M22.5 5.5l-17 17" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="2.5" fill="white"/>
          </svg>
          <span className="text-sm font-semibold tracking-widest uppercase">Obsession OS</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {["Features", "For F&B", "About", "Contact"].map(l => (
            <a key={l} href="#" className="text-xs font-semibold tracking-widest uppercase text-white/70 hover:text-white transition-colors">
              {l}
            </a>
          ))}
        </div>
        <a href="/win" className="border border-white text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-white hover:text-black transition-all">
          Enter
        </a>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <AsciiSkull />

        {/* Big title */}
        <div className="relative z-10 text-center px-4 mt-48">
          <h1
            className="font-light uppercase text-white leading-none tracking-tight"
            style={{
              fontSize: "clamp(56px, 9vw, 130px)",
              whiteSpace: "nowrap",
              fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
              fontWeight: 300,
              letterSpacing: "-0.02em",
            }}
          >
            OBSESSION OS
          </h1>
          <p className="mt-4 text-white/70 text-base font-light tracking-wide mx-auto"
            style={{ fontFamily: "'Georgia', serif", whiteSpace: "nowrap" }}>
            The Operating System built for those obsessed with winning
          </p>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-6 mt-16">
          {[
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 20v-8M10 20v-4M13 20v-6M16 20v-10"/>
                </svg>
              ),
              title: "Income Heatmap",
              desc: "Daily earnings visualization so you always know when your business makes money — and when it doesn't.",
            },
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/><path d="M9.5 3.5C6 5 3.5 8.2 3.5 12"/><path d="M14.5 3.5C18 5 20.5 8.2 20.5 12"/>
                </svg>
              ),
              title: "Idea Forge",
              desc: "Validate business ideas and map your path to first customers — before you spend a dollar.",
            },
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="9" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><path d="M3 21v-2a5 5 0 0 1 5-5h2"/><path d="M13 21v-2a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v2"/>
                </svg>
              ),
              title: "Obsession Pods",
              desc: "Accountability with other ambitious people. Ship faster when others are watching.",
            },
          ].map((f) => (
            <div key={f.title} className="border border-white/15 bg-white/5 backdrop-blur-sm p-6 flex gap-4">
              <div className="text-white/60 mt-0.5 flex-shrink-0">{f.icon}</div>
              <div>
                <h3 className="font-bold text-white text-sm tracking-wide mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative z-10 mt-12 text-center">
          <a
            href="/win"
            className="inline-flex items-center gap-4 bg-white text-black font-bold text-sm tracking-widest uppercase px-14 py-5 hover:bg-white/90 transition-colors"
          >
            Enter
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <p className="text-white/30 text-xs mt-4 tracking-wide">No setup. In 30 seconds you're in.</p>
        </div>

      </section>
    </div>
  );
}
