import React, { useState, useRef, useEffect } from "react";
import { X, LogOut, User, ArrowRight } from "lucide-react";
import AsciiLanding from "../components/AsciiLanding";

interface ResourceSection {
  heading: string;
  items: string[];
}

interface ResourcePack {
  id: string;
  category: string;
  difficulty: "Starter" | "Intermediate" | "Advanced";
  title: string;
  description: string;
  readTime: string;
  sections: ResourceSection[];
}

const RESOURCES: ResourcePack[] = [
  {
    id: "validation-48h",
    category: "Validation",
    difficulty: "Starter",
    title: "The 48-Hour Idea Validation Playbook",
    description: "A zero-cost framework to test whether people will actually pay for your idea before you build anything.",
    readTime: "8 min read",
    sections: [
      {
        heading: "Step 1 — Write the one-liner",
        items: [
          "Fill in: 'I help [WHO] achieve [OUTCOME] without [PAIN].'",
          "If you can't write this in under 30 seconds, your idea isn't clear enough yet.",
          "Post it to a relevant subreddit or Discord and note how many people ask for more info.",
        ],
      },
      {
        heading: "Step 2 — Find 10 real humans",
        items: [
          "Use Reddit, LinkedIn, or Twitter/X to find people who match your target customer.",
          "DM them: 'I'm building something for [problem]. Would you do a 10-min call?'",
          "Target: 3 out of 10 should say yes. If fewer respond, your targeting or messaging is off.",
        ],
      },
      {
        heading: "Step 3 — Run the problem interview",
        items: [
          "Ask: 'Walk me through the last time you dealt with [problem].'",
          "Never pitch. Just listen. Record the exact words they use.",
          "Ask: 'What have you tried? What did it cost? What was still broken?'",
        ],
      },
      {
        heading: "Step 4 — The pre-sale close",
        items: [
          "At the end of one interview, say: 'I'm building a solution. Would you pay $X to be a founding user?'",
          "If they say yes: 'Great — I can take a deposit now to hold your spot.'",
          "One paid commitment in 48 hours = validated. Zero commitments = back to step 1.",
        ],
      },
    ],
  },
  {
    id: "cold-outreach",
    category: "Sales",
    difficulty: "Starter",
    title: "Cold Outreach Templates That Actually Convert",
    description: "Proven DM and email scripts for landing your first clients — written to feel human, not like a pitch deck.",
    readTime: "6 min read",
    sections: [
      {
        heading: "The 3-line DM (LinkedIn / Twitter)",
        items: [
          "Line 1: Specific observation about them. ('Saw your post about X — that friction is real.')",
          "Line 2: What you do in one sentence. ('I help [WHO] fix exactly that.')",
          "Line 3: Tiny ask. ('Worth a 10-min call this week?')",
          "Do NOT include your portfolio, website, or pricing in the first message.",
        ],
      },
      {
        heading: "The cold email (under 80 words)",
        items: [
          "Subject: '[Their company] + [specific observation]'",
          "Body: 'Hi [Name], noticed [specific thing about their business]. Most [role] I talk to struggle with [problem]. I [what you do] — helped [similar company] achieve [result]. Worth a quick call? [Your name]'",
          "Send at 7–9 AM their timezone. Tuesday–Thursday get the highest reply rates.",
        ],
      },
      {
        heading: "The follow-up sequence",
        items: [
          "Day 3: 'Just bumping this up — still relevant?'",
          "Day 7: Share a relevant insight, no ask. ('Thought you'd find this useful: [link/stat]')",
          "Day 14: Final bump. 'Not the right time? No worries — I'll check back in 90 days.'",
          "Stop after 3 touches. Persistence is good; pestering kills deals.",
        ],
      },
      {
        heading: "What kills cold outreach",
        items: [
          "Opening with 'I hope this finds you well' — delete immediately.",
          "Attaching a deck or case study on first contact.",
          "Pitching before you've confirmed the problem exists for them.",
          "Personalisation that's clearly copy-pasted ('I love your company's work!').",
        ],
      },
    ],
  },
  {
    id: "pricing-first-offer",
    category: "Revenue",
    difficulty: "Starter",
    title: "How to Price Your First Offer",
    description: "Most first-time founders underprice by 3–5x. This framework helps you set a number that's defensible, profitable, and doesn't make clients distrust you.",
    readTime: "7 min read",
    sections: [
      {
        heading: "The value-based anchor",
        items: [
          "Ask: 'What is this worth to the client if it works perfectly?'",
          "Price at 10–20% of that value. If your solution saves them $50k, charge $5–10k.",
          "Never price based on your hours. Price based on their outcome.",
        ],
      },
      {
        heading: "The three-tier test",
        items: [
          "Always present 3 options: Basic / Core / Premium.",
          "Most clients pick the middle. Price your Core at your real target, not a compromise.",
          "Premium exists to make Core feel reasonable, not to actually sell.",
        ],
      },
      {
        heading: "How to handle 'that's too expensive'",
        items: [
          "Don't discount immediately. Ask: 'Too expensive compared to what?'",
          "Reframe to ROI: 'If this works, what's the return over 12 months?'",
          "Offer a smaller first engagement, not a lower price: 'Start with a pilot at $X.'",
        ],
      },
      {
        heading: "When to raise prices",
        items: [
          "When your close rate is above 70% — you're underpriced.",
          "Every 3 new clients, test raising 20%.",
          "If no one has ever said 'that's expensive', you're definitely underpriced.",
        ],
      },
    ],
  },
  {
    id: "90-day-roadmap",
    category: "Planning",
    difficulty: "Intermediate",
    title: "The 90-Day Revenue Roadmap",
    description: "A week-by-week execution plan to go from zero to your first $2k–$5k month without burning out or building the wrong thing.",
    readTime: "10 min read",
    sections: [
      {
        heading: "Weeks 1–2 — Nail the problem",
        items: [
          "Complete 10 problem interviews. Do not build anything.",
          "Identify the one problem that comes up in 7 of 10 interviews.",
          "Write your positioning statement and test it on 5 strangers.",
        ],
      },
      {
        heading: "Weeks 3–4 — Get one paying customer",
        items: [
          "Build nothing. Sell the outcome manually first.",
          "Send 50 cold DMs using your validated positioning.",
          "Target: 1 paid commitment at any price by end of week 4.",
        ],
      },
      {
        heading: "Weeks 5–8 — Deliver and document",
        items: [
          "Deliver your first engagement. Take notes on everything you do.",
          "Build the minimal thing needed to deliver the result (not the full vision).",
          "Get a testimonial or case study from client 1 before charging client 2 more.",
        ],
      },
      {
        heading: "Weeks 9–12 — Scale the channel",
        items: [
          "Identify where client 1 came from. Double down on that channel only.",
          "Raise prices for clients 3 and 4.",
          "By week 12, you should have 2–4 clients and a clear repeatable process.",
        ],
      },
    ],
  },
  {
    id: "reddit-research",
    category: "Research",
    difficulty: "Starter",
    title: "The Reddit Research Method",
    description: "How to use Reddit to find underserved markets, validate demand, and steal the exact words your customers use to describe their problems.",
    readTime: "5 min read",
    sections: [
      {
        heading: "Finding the right subreddits",
        items: [
          "Start with: r/Entrepreneur, r/smallbusiness, r/sidehustle, r/freelance.",
          "Search '[your niche] + problems' or '[your niche] + help' to find specific communities.",
          "Look for communities of 50k–500k members — large enough for signal, small enough to be specific.",
        ],
      },
      {
        heading: "The pain post scan",
        items: [
          "Filter by 'Top - This Month'. Look for posts starting with 'Does anyone else...', 'I'm struggling with...', 'Is there a tool that...'",
          "Copy the exact phrases people use. These become your marketing copy.",
          "High upvotes + many comments = high pain. That's your target.",
        ],
      },
      {
        heading: "Validating demand in comments",
        items: [
          "Find posts where someone asks 'does X exist?' and the answer is no.",
          "Count how many people upvoted or commented 'same problem here'.",
          "10+ people expressing the same pain = a market. 50+ = a real opportunity.",
        ],
      },
      {
        heading: "Building a research habit",
        items: [
          "Spend 20 minutes 3x per week scanning your target subreddits.",
          "Keep a swipe file of pain posts in Notion or a Google Doc.",
          "The person who understands the customer best always wins. This is your competitive edge.",
        ],
      },
    ],
  },
  {
    id: "zero-cost-marketing",
    category: "Marketing",
    difficulty: "Intermediate",
    title: "The $0 Customer Acquisition Stack",
    description: "How to get your first 10 customers without spending a dollar on ads — using content, communities, and direct outreach.",
    readTime: "9 min read",
    sections: [
      {
        heading: "Channel 1 — Community seeding",
        items: [
          "Join 3 communities where your target customers hang out (Slack, Discord, Reddit, Facebook Groups).",
          "Spend 2 weeks contributing value before mentioning what you do.",
          "When someone posts a problem you solve, offer a free 20-min audit in the comments.",
        ],
      },
      {
        heading: "Channel 2 — Content that converts",
        items: [
          "Post one 'how I did X' breakdown per week on LinkedIn or Twitter.",
          "Show the process, not just the result. Screenshots beat testimonials.",
          "End every post with: 'DM me if you want help doing this.'",
        ],
      },
      {
        heading: "Channel 3 — Strategic partnerships",
        items: [
          "Find 5 people who serve the same customer but don't compete with you.",
          "Offer to refer each other. Give them a commission for any client they send.",
          "One good partner can be worth 20 cold outreach attempts.",
        ],
      },
      {
        heading: "What to track",
        items: [
          "Track: conversations started, calls booked, proposals sent, clients closed.",
          "If your close rate is high but calls are low, fix your outreach volume.",
          "If calls are high but close rate is low, fix your sales conversation.",
        ],
      },
    ],
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Starter: "text-emerald-400 bg-emerald-950 border-emerald-900",
  Intermediate: "text-amber-400 bg-amber-950 border-amber-900",
  Advanced: "text-rose-400 bg-rose-950 border-rose-900",
};

export default function ResourceApp() {
  const [profile, setProfile] = useState<{ name: string; hustle: string; email: string } | null>(() => {
    const name = localStorage.getItem("w3_name");
    const hustle = localStorage.getItem("w3_hustle");
    const email = localStorage.getItem("w3_email");
    return name && hustle && email ? { name, hustle, email } : null;
  });
  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem("w3_email"));
  const [openId, setOpenId] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const openPack = RESOURCES.find(r => r.id === openId) ?? null;

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
    setShowLanding(true);
  };

  if (showLanding) {
    return (
      <AsciiLanding
        onActivate={(p) => {
          localStorage.setItem("w3_name", p.name);
          localStorage.setItem("w3_hustle", p.hustle);
          localStorage.setItem("w3_email", p.email);
          setProfile(p);
          setShowLanding(false);
        }}
        currentProfile={profile}
        onClose={profile ? () => setShowLanding(false) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#d1d1d1] font-mono text-xs">

      {/* Resource detail overlay */}
      {openPack && (
        <div className="fixed inset-0 z-50 bg-[#070707]/96 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className={`inline-block text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border mb-3 ${DIFFICULTY_COLORS[openPack.difficulty]}`}>
                  {openPack.category} · {openPack.difficulty}
                </div>
                <h2 className="text-white font-mono text-lg font-light leading-snug">{openPack.title}</h2>
                <p className="text-neutral-500 font-mono text-[10px] mt-1">{openPack.readTime}</p>
              </div>
              <button onClick={() => setOpenId(null)} className="text-[#444] hover:text-white transition cursor-pointer ml-6 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-neutral-400 font-mono text-xs leading-relaxed mb-8 border-l-2 border-[#333] pl-4">
              {openPack.description}
            </p>

            <div className="space-y-6">
              {openPack.sections.map((section, i) => (
                <div key={i} className="border border-[#222] bg-[#0a0a0a]">
                  <div className="border-b border-[#1a1a1a] px-4 py-3">
                    <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{section.heading}</div>
                  </div>
                  <ul className="divide-y divide-[#111]">
                    {section.items.map((item, j) => (
                      <li key={j} className="px-4 py-3 flex gap-3">
                        <span className="text-[#333] flex-shrink-0 font-mono">→</span>
                        <span className="text-neutral-300 font-mono text-xs leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
          <a href="/win" className="text-[10px] font-mono text-[#555] uppercase tracking-widest hover:text-white transition">
            ← Dashboard
          </a>

          <div className="relative border-l border-neutral-800 pl-4" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(v => !v)}
              className="flex items-center gap-1.5 text-[#555] hover:text-white transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-widest">{profile?.name || "Account"}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0d0d0d] border border-[#333] z-50">
                <div className="px-3 py-2.5 border-b border-[#222]">
                  <div className="text-[10px] font-mono text-white truncate">{profile?.name}</div>
                  <div className="text-[9px] font-mono text-[#555] truncate">{profile?.email}</div>
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
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <div className="text-[9px] font-mono text-[#444] uppercase tracking-widest mb-2">Resource Library</div>
          <h1 className="text-white font-mono text-xl font-light">Playbooks & Frameworks</h1>
          <p className="text-neutral-600 font-mono text-[10px] mt-1">{RESOURCES.length} packs · Updated regularly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RESOURCES.map(pack => (
            <button
              key={pack.id}
              onClick={() => setOpenId(pack.id)}
              className="group border border-[#222] bg-[#0a0a0a] hover:border-neutral-600 transition text-left flex flex-col h-[220px] cursor-pointer"
            >
              {/* Card header */}
              <div className="border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
                <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border ${DIFFICULTY_COLORS[pack.difficulty]}`}>
                  {pack.category}
                </span>
                <span className="text-[9px] font-mono text-[#444]">{pack.readTime}</span>
              </div>

              {/* Card body */}
              <div className="flex-1 px-4 py-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-mono text-sm font-light leading-snug group-hover:text-white mb-2">
                    {pack.title}
                  </h3>
                  <p className="text-neutral-600 font-mono text-[10px] leading-relaxed line-clamp-2">
                    {pack.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-1.5">
                    {pack.sections.map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-[#333] group-hover:bg-neutral-600 transition" />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-[#444] group-hover:text-white transition uppercase tracking-widest flex items-center gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
