import React, { useState, useRef, useEffect } from "react";
import { X, LogOut, User, ArrowRight, Lock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockType = "list" | "code" | "prompt" | "steps";

interface ContentBlock {
  type: BlockType;
  label?: string;
  items?: string[];
  code?: string;
}

interface Phase {
  title: string;
  blocks: ContentBlock[];
}

interface GuideContent {
  intro: string;
  phases: Phase[];
  quickStart: string[];
}

// ─── The one live guide ───────────────────────────────────────────────────────

const SECOND_BRAIN_GUIDE: GuideContent = {
  intro:
    "This system turns your daily notes into a growing, intelligent knowledge base that actively finds connections, surfaces insights, and compounds over time.",

  phases: [
    {
      title: "Phase 1 — Obsidian Setup (Foundation)",
      blocks: [
        {
          type: "steps",
          label: "Install Obsidian",
          items: [
            "Download from obsidian.md",
            "Create a new vault called Second Brain (or Obsession Brain)",
          ],
        },
        {
          type: "list",
          label: "Recommended Plugins (via Community Plugins)",
          items: [
            "Dataview — Query and surface connections",
            "Smart Connections — AI-powered semantic search (very powerful with Claude)",
            "Templater — Auto-generate daily note templates",
            "Calendar — Easy daily note access",
            "Excalidraw — Visual thinking (optional but useful)",
            "Style Settings + Minimal Theme — Clean dark interface",
          ],
        },
        {
          type: "code",
          label: "Create Core Folders",
          code: `Second Brain/
├── 00 Inbox/              ← Quick capture (everything goes here first)
├── 01 Daily Notes/        ← Templated daily logs
├── 02 Projects/           ← Business ideas, ventures, goals
├── 03 Areas/              ← Ongoing responsibilities (Health, Finance, Content, etc.)
├── 04 Resources/          ← Books, articles, notes, insights
├── 05 Maps of Content/    ← MOCs (big picture overviews)
└── 06 Archive/            ← Old or completed items`,
        },
      ],
    },
    {
      title: "Phase 2 — Daily Capture System",
      blocks: [
        {
          type: "list",
          label: "Create a Daily Note Template (using Templater)",
          items: [
            "Date + Day",
            "Wins / Key Outputs",
            "Ideas & Insights",
            "Things I Read / Watched",
            "Questions / Open Loops",
            "Quick Capture (random thoughts)",
          ],
        },
        {
          type: "list",
          label: "Daily Habit",
          items: [
            "Every evening (or morning), open today's note.",
            "Dump everything without overthinking — raw thoughts, links, screenshots, voice notes.",
            "Tag liberally (e.g., #idea, #business, #matcha, #finance).",
          ],
        },
      ],
    },
    {
      title: "Phase 3 — Connect Claude (The Intelligence Layer)",
      blocks: [
        {
          type: "list",
          label: "Create a Dedicated Claude Project",
          items: [
            "Name it: Second Brain or Obsession Brain",
            "Upload your Obsidian vault (or key folders) as knowledge files when possible.",
            "Or use the Projects feature + copy-paste important sections.",
          ],
        },
        {
          type: "prompt",
          label: "Daily Synthesis Prompt",
          code: `You are my compounding second brain.
Review today's daily note and connect it to my existing knowledge base.
- Summarize key insights
- Find connections to past ideas, projects, or readings
- Highlight potential synergies between business ideas and information I've consumed
- Suggest 2-3 actionable next steps
- Flag any open loops or contradictions`,
        },
        {
          type: "prompt",
          label: "Weekly Review Prompt",
          code: `Perform a weekly synthesis of my notes from the past 7 days.
Identify emerging patterns, recurring themes, and high-leverage connections across business ideas and research.
What should I double down on? What should I deprioritize?`,
        },
        {
          type: "prompt",
          label: "Idea Connection Prompt",
          code: `Take this new idea/business concept and cross-reference it with everything in my vault.
What related concepts, past experiments, or external knowledge already exist?
What synergies or gaps do you see?`,
        },
        {
          type: "steps",
          label: "Workflow",
          items: [
            "End of day → Dump notes into Obsidian",
            "Run the Daily Synthesis Prompt in Claude (paste today's note + relevant MOCs)",
            "Claude outputs insights + suggested connections",
            "Go back to Obsidian and create proper linked notes or MOCs based on Claude's output",
          ],
        },
      ],
    },
    {
      title: "Phase 4 — Make It Compound (Advanced Layer)",
      blocks: [
        {
          type: "list",
          label: "Build Maps of Content (MOCs)",
          items: [
            "Create one MOC per major area (e.g., MOC - Business Ideas, MOC - Matcha Pop-up Strategy)",
            "Regularly ask Claude to update these MOCs with new connections.",
          ],
        },
        {
          type: "list",
          label: "Weekly + Monthly Rituals",
          items: [
            "Weekly: Run the weekly synthesis prompt",
            "Monthly: Ask Claude to review the last 30 days and surface the biggest insights or pattern shifts",
          ],
        },
        {
          type: "list",
          label: "Smart Connections + Claude Combo",
          items: [
            "Use Obsidian's Smart Connections plugin for instant semantic search.",
            "Feed the most relevant notes into Claude for deeper reasoning.",
          ],
        },
      ],
    },
    {
      title: "Phase 5 — Pro Tips for Maximum Compounding",
      blocks: [
        {
          type: "list",
          items: [
            "Capture ruthlessly — Friction is the enemy. Use quick capture tools (mobile app, voice memos, web clipper).",
            "Link aggressively — Every time Claude finds a connection, create an actual [[wikilink]] in Obsidian.",
            "Review outputs — Don't just read Claude's summary. Act on the suggested connections by creating new notes or updating projects.",
            "Version your thinking — When an idea evolves significantly, create a new note and link it to the old one with dates.",
            "Privacy note: Keep sensitive financial or personal data out of Claude if needed (use local-only sections).",
          ],
        },
      ],
    },
  ],

  quickStart: [
    "Create the vault + folders",
    "Install the 4–5 core plugins",
    "Make a simple daily note template",
    "Create one Claude Project called 'Second Brain'",
    "Tonight: Dump everything into today's note and run the Daily Synthesis prompt",
  ],
};

// ─── Coming-soon placeholder titles ──────────────────────────────────────────

const COMING_SOON = [
  { category: "Revenue", title: "The $0 Customer Acquisition Stack" },
  { category: "Validation", title: "The 48-Hour Idea Validation Playbook" },
  { category: "Sales", title: "Cold Outreach Templates That Convert" },
  { category: "Planning", title: "The 90-Day Revenue Roadmap" },
  { category: "Research", title: "The Reddit Research Method" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CodeBlock({ code, label, isPrompt }: { code: string; label?: string; isPrompt?: boolean }) {
  return (
    <div className={`border ${isPrompt ? "border-emerald-900 bg-emerald-950/20" : "border-[#222] bg-[#050505]"}`}>
      {label && (
        <div className={`border-b ${isPrompt ? "border-emerald-900/60" : "border-[#1a1a1a]"} px-4 py-2.5`}>
          <span className={`text-[9px] font-mono uppercase tracking-widest ${isPrompt ? "text-emerald-400" : "text-[#555]"}`}>
            {isPrompt ? "↳ Prompt · " : ""}{label}
          </span>
        </div>
      )}
      <pre className={`px-4 py-3 font-mono text-[10px] leading-relaxed whitespace-pre-wrap ${isPrompt ? "text-emerald-300" : "text-neutral-400"} overflow-x-auto`}>
        {code}
      </pre>
    </div>
  );
}

function GuidePhase({ phase }: { phase: Phase }) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-mono text-sm font-medium border-l-2 border-emerald-500 pl-3">
        {phase.title}
      </h3>
      {phase.blocks.map((block, i) => {
        if (block.type === "code") {
          return <CodeBlock key={i} code={block.code!} label={block.label} />;
        }
        if (block.type === "prompt") {
          return <CodeBlock key={i} code={block.code!} label={block.label} isPrompt />;
        }
        if (block.type === "list" || block.type === "steps") {
          return (
            <div key={i}>
              {block.label && (
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">
                  {block.label}
                </div>
              )}
              <ul className="space-y-2">
                {block.items!.map((item, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span className="text-[#444] font-mono flex-shrink-0 mt-0.5">
                      {block.type === "steps" ? `${j + 1}.` : "→"}
                    </span>
                    <span className="text-neutral-300 font-mono text-[11px] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResourceApp() {
  const [profile, setProfile] = useState<{ name: string; hustle: string; email: string } | null>(() => {
    const name = localStorage.getItem("w3_name");
    const hustle = localStorage.getItem("w3_hustle");
    const email = localStorage.getItem("w3_email");
    return name && hustle && email ? { name, hustle, email } : null;
  });
  const [guideOpen, setGuideOpen] = useState(false);
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

      {/* Full guide overlay */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 bg-[#070707]/97 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12">

            {/* Guide header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="inline-block text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border mb-3 text-emerald-400 bg-emerald-950 border-emerald-900">
                  Productivity · Starter
                </div>
                <h2 className="text-white font-mono text-lg font-light leading-snug">
                  Compounding Second Brain:<br />Claude Code + Obsidian
                </h2>
                <p className="text-neutral-500 font-mono text-[10px] mt-1">20 min read · 5 phases</p>
              </div>
              <button
                onClick={() => setGuideOpen(false)}
                className="text-[#444] hover:text-white transition cursor-pointer ml-6 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Intro */}
            <p className="text-neutral-400 font-mono text-xs leading-relaxed mb-8 border-l-2 border-[#333] pl-4">
              {SECOND_BRAIN_GUIDE.intro}
            </p>

            {/* Phases */}
            <div className="space-y-10">
              {SECOND_BRAIN_GUIDE.phases.map((phase, i) => (
                <GuidePhase key={i} phase={phase} />
              ))}

              {/* Quick Start */}
              <div className="border border-white/10 bg-white/[0.02] p-5 space-y-3">
                <h3 className="text-white font-mono text-sm font-medium">Quick Start — Do This Today</h3>
                <ol className="space-y-2">
                  {SECOND_BRAIN_GUIDE.quickStart.map((step, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="text-emerald-500 font-mono flex-shrink-0 font-bold">{i + 1}.</span>
                      <span className="text-neutral-200 font-mono text-[11px] leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#1a1a1a]">
              <a
                href="/win"
                className="inline-flex items-center gap-2 bg-white text-black font-mono text-[10px] font-bold px-5 py-2.5 uppercase tracking-widest hover:bg-neutral-200 transition"
              >
                Apply this in Forge <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

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
          <button
            onClick={() => setGuideOpen(true)}
            className="group border border-[#333] bg-[#0a0a0a] hover:border-neutral-500 transition text-left flex flex-col h-[220px] cursor-pointer"
          >
            <div className="border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border text-emerald-400 bg-emerald-950 border-emerald-900">
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
                    <div key={i} className="w-1.5 h-1.5 bg-emerald-800 group-hover:bg-emerald-600 transition" />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-emerald-500 group-hover:text-emerald-300 transition uppercase tracking-widest flex items-center gap-1">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </button>

          {/* ── Coming soon cards ── */}
          {COMING_SOON.map((item, i) => (
            <div
              key={i}
              className="relative border border-[#1a1a1a] bg-[#0a0a0a] flex flex-col h-[220px] overflow-hidden"
            >
              {/* Blurred content */}
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

              {/* Coming soon overlay */}
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
