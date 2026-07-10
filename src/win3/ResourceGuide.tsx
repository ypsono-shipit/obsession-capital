import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, ArrowRight, ArrowLeft, Mail } from "lucide-react";

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

// ─── Guide data ───────────────────────────────────────────────────────────────

const INTRO =
  "This system turns your daily notes into a growing, intelligent knowledge base that actively finds connections, surfaces insights, and compounds over time.";

const PHASES: Phase[] = [
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
];

const QUICK_START = [
  "Create the vault + folders",
  "Install the 4–5 core plugins",
  "Make a simple daily note template",
  "Create one Claude Project called 'Second Brain'",
  "Tonight: Dump everything into today's note and run the Daily Synthesis prompt",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CodeBlock({ code, label, isPrompt }: { code: string; label?: string; isPrompt?: boolean }) {
  return (
    <div className={`border ${isPrompt ? "border-white/20 bg-white/[0.03]" : "border-[#222] bg-[#050505]"}`}>
      {label && (
        <div className={`border-b ${isPrompt ? "border-white/10" : "border-[#1a1a1a]"} px-4 py-2.5`}>
          <span className={`text-[9px] font-mono uppercase tracking-widest ${isPrompt ? "text-white/70" : "text-[#555]"}`}>
            {isPrompt ? "↳ Prompt · " : ""}{label}
          </span>
        </div>
      )}
      <pre className={`px-4 py-3 font-mono text-[10px] leading-relaxed whitespace-pre-wrap ${isPrompt ? "text-white/80" : "text-neutral-400"} overflow-x-auto`}>
        {code}
      </pre>
    </div>
  );
}

function GuidePhase({ phase }: { phase: Phase }) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-mono text-sm font-medium border-l-2 border-white/30 pl-3">
        {phase.title}
      </h3>
      {phase.blocks.map((block, i) => {
        if (block.type === "code") return <CodeBlock key={i} code={block.code!} label={block.label} />;
        if (block.type === "prompt") return <CodeBlock key={i} code={block.code!} label={block.label} isPrompt />;
        if (block.type === "list" || block.type === "steps") {
          return (
            <div key={i}>
              {block.label && (
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">{block.label}</div>
              )}
              <ul className="space-y-2">
                {block.items!.map((item, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span className="text-[#555] font-mono flex-shrink-0 mt-0.5">
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

// ─── Newsletter signup ────────────────────────────────────────────────────────

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "compounding-second-brain" }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="border border-white/10 bg-white/[0.03] px-5 py-4 flex items-center gap-3">
        <span className="text-white font-mono text-[11px]">✓ You're in. Next playbook drops soon.</span>
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-white/[0.03] px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-3.5 h-3.5 text-white/40" />
        <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Get the next playbook free</span>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-transparent border border-white/15 px-3 py-2 font-mono text-[11px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/40 transition min-w-0"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-white text-black font-mono text-[10px] font-bold px-4 py-2 uppercase tracking-widest hover:bg-neutral-200 transition disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-[9px] font-mono text-rose-400 mt-2">Something went wrong — try again.</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourceGuide() {
  const [profile] = useState<{ name: string; email: string } | null>(() => {
    const name = localStorage.getItem("w3_name");
    const email = localStorage.getItem("w3_email");
    return name && email ? { name, email } : null;
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
    window.location.href = "/resource";
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#d1d1d1] font-mono text-xs">

      {/* Header */}
      <div className="border-b border-[#222] bg-[#0a0a0a] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <a href="https://obsession.club" className="text-white font-bold bg-neutral-900 px-2 py-0.5 border border-neutral-800 tracking-wider text-xs">
          [ OBSESSION_OS ]
        </a>

        <div className="flex items-center gap-4">
          <a href="/resource" className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition flex items-center gap-1.5">
            <ArrowLeft className="w-3 h-3" /> Library
          </a>

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
                    <LogOut className="w-3 h-3" /> Log out
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

      {/* Article */}
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Meta */}
        <div className="mb-8">
          <div className="inline-block text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border mb-4 text-white/60 bg-white/5 border-white/10">
            Productivity · Starter · 20 min read
          </div>
          <h1 className="text-white font-mono text-2xl font-light leading-snug mb-3">
            Compounding Second Brain:<br />Claude Code + Obsidian
          </h1>
          <p className="text-neutral-500 font-mono text-[11px] leading-relaxed border-l-2 border-[#333] pl-4">
            {INTRO}
          </p>
        </div>

        {/* Newsletter */}
        <div className="mb-10">
          <NewsletterSignup />
        </div>

        {/* Phases */}
        <div className="space-y-10">
          {PHASES.map((phase, i) => <GuidePhase key={i} phase={phase} />)}

          {/* Quick Start */}
          <div className="border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <h3 className="text-white font-mono text-sm font-medium">Quick Start — Do This Today</h3>
            <ol className="space-y-2">
              {QUICK_START.map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-white/50 font-mono flex-shrink-0 font-bold">{i + 1}.</span>
                  <span className="text-neutral-200 font-mono text-[11px] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-10 pt-6 border-t border-[#1a1a1a] flex items-center justify-between">
          <a href="/resource" className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition flex items-center gap-1.5">
            <ArrowLeft className="w-3 h-3" /> Back to Library
          </a>
          <a
            href="/win"
            className="inline-flex items-center gap-2 bg-white text-black font-mono text-[10px] font-bold px-5 py-2.5 uppercase tracking-widest hover:bg-neutral-200 transition"
          >
            Apply this in Forge <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
