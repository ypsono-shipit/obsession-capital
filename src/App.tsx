import React, { useState, useEffect } from "react";
import { MetricConfig, DailyLog, ForgeIdea, Pod, CodexPlaybook } from "./types";
import Heatmap from "./components/Heatmap";
import ForgeSection from "./components/ForgeSection";
import AsciiLanding from "./components/AsciiLanding";
import MilestoneCelebration from "./components/MilestoneCelebration";
import { 
  Terminal, 
  TrendingUp, 
  Flame, 
  BookOpen, 
  Users, 
  Settings, 
  CheckSquare, 
  HelpCircle, 
  Plus, 
  RefreshCw, 
  ArrowRight, 
  Search,
  Check,
  Menu,
  X
} from "lucide-react";

// Default/Seed state
const DEFAULT_METRIC: MetricConfig = {
  name: "Side Hustle Revenue",
  unit: "USD",
  weeklyGoal: 700, // $100/day
};

const SEED_LOGS: DailyLog[] = [
  { date: "2026-06-25", value: 120, note: "Closed first audit client from local directory outbound" },
  { date: "2026-06-24", value: 150, note: "Delivered SEO speed audit package to local dentist" },
  { date: "2026-06-23", value: 0, note: "No outreach completed due to primary job launch blocker" },
  { date: "2026-06-22", value: 85, note: "Configured analytics dashboard for agency prototype" },
  { date: "2026-06-21", value: 200, note: "Retainer deposit received for content curation draft" },
  { date: "2026-06-19", value: 110, note: "Sold 1 classified slot on real estate newsletter" },
  { date: "2026-06-18", value: 90, note: "Outreach test: 15 messages sent, 3 warm replies received" },
  { date: "2026-06-17", value: 0, note: "Refined cold outreach copy, no revenue events" },
  { date: "2026-06-15", value: 300, note: "Milestone bonus for custom migration script" },
  { date: "2026-06-12", value: 50, note: "Single-hour consulting call on micro-SaaS deployment" },
  { date: "2026-06-10", value: 120, note: "Retainer payment for local speed audit support" },
  { date: "2026-06-08", value: 80, note: "Delivered zoning report newsletter draft" }
];

const SEED_IDEAS: ForgeIdea[] = [
  {
    id: "idea-1",
    title: "Cold Video SEO Audit Micro-Agency",
    category: "Side Hustle",
    description: "Pitching speed improvements to high-ticket local niches via brief Loom audits. Easy entry point using Lighthouse.",
    metricsGoals: "$2,500/mo in 45 days",
    createdAt: "2026-06-20T10:00:00Z",
    status: "Validation Active",
    critique: "While speed fixes are direct, local clients are notoriously hard to reach over cold email. Phone or direct LinkedIn messages work 3x faster.",
    assumption: "Assumes business owners understand that slower load times are costing them prospective customers.",
    experiments: [
      "Find 10 dentists in Chicago suburbs with Lighthouse speed scores under 50.",
      "Send them a 1-sentence LinkedIn message with a 1-click speed suggestion and measure open rate."
    ]
  },
  {
    id: "idea-2",
    title: "Out-Of-Cycle Promotion Case Study",
    category: "Career Advancement",
    description: "Creating a formal business value ledger tracking exactly how my code optimization reduced AWS infrastructure cost by 15%. Use this to skip the annual cycle.",
    metricsGoals: "+$18,000 base salary jump",
    createdAt: "2026-06-22T14:30:00Z",
    status: "Draft"
  }
];

const SEED_PODS: Pod[] = [
  {
    id: "pod-1",
    name: "ALPHA_EARNERS",
    description: "High-conviction builders shipping micro-services, agency models, and curational media.",
    category: "Side Hustles",
    weeklyTarget: "$1,000/week collective",
    myCommitment: "Ship 15 audits per week & log daily velocity",
    membersCount: 4,
    mockMembers: [
      { name: "Root Operator", role: "Audits & Speed Opt", streak: 8, commitment: "15 audits shipped", heatmapSeed: [4, 3, 4, 0, 4, 3, 4] },
      { name: "cyber_hustler", role: "Niche Substack Curation", streak: 12, commitment: "1 newsletter draft published", heatmapSeed: [2, 3, 2, 4, 3, 0, 2] },
      { name: "quantum_coder", role: "API SaaS Boilerplates", streak: 5, commitment: "Send 20 cold pitches", heatmapSeed: [0, 4, 0, 4, 0, 4, 2] },
      { name: "zen_negotiator", role: "Enterprise Sales Playbook", streak: 3, commitment: "Draft 2 client proposals", heatmapSeed: [3, 0, 3, 0, 3, 2, 3] }
    ]
  },
  {
    id: "pod-2",
    name: "NEGOTIATION_MASTERS",
    description: "Tech & Corporate climbers practicing leverage playbooks, offer-matching, and raise timing.",
    category: "Career & Salary",
    weeklyTarget: "2 mock negotiation rounds",
    myCommitment: "Build AWS ROI cost justification ledger",
    membersCount: 3,
    mockMembers: [
      { name: "Root Operator", role: "Software Architect", streak: 2, commitment: "Refining base raise brief", heatmapSeed: [0, 2, 2, 0, 0, 3, 4] },
      { name: "deal_maker", role: "Enterprise Account Exec", streak: 15, commitment: "Mock negotiate 1 live offer", heatmapSeed: [4, 4, 4, 4, 3, 4, 4] },
      { name: "raise_seeker", role: "VP Product Management", streak: 0, commitment: "Review market base salaries", heatmapSeed: [1, 0, 0, 2, 0, 0, 0] }
    ]
  }
];

export default function App() {
  // --- STATE ---
  const [operatorProfile, setOperatorProfile] = useState<{ name: string; hustle: string; email: string } | null>(() => {
    const name = localStorage.getItem("operator_name");
    const hustle = localStorage.getItem("operator_hustle");
    const email = localStorage.getItem("operator_email");
    if (name && hustle && email) {
      return { name, hustle, email };
    }
    return null;
  });
  const [showLanding, setShowLanding] = useState<boolean>(() => !localStorage.getItem("operator_email"));

  const [activeTab, setActiveTab] = useState<"hq" | "forge" | "pods">("hq");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [metric, setMetric] = useState<MetricConfig>(() => {
    const stored = localStorage.getItem("obsession_metric");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return DEFAULT_METRIC;
  });

  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const stored = localStorage.getItem("obsession_logs");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return SEED_LOGS;
  });

  const [ideas, setIdeas] = useState<ForgeIdea[]>(SEED_IDEAS);
  const [pods, setPods] = useState<Pod[]>(() => {
    const name = localStorage.getItem("operator_name");
    const hustle = localStorage.getItem("operator_hustle");
    if (name) {
      return SEED_PODS.map(p => ({
        ...p,
        mockMembers: p.mockMembers.map(m => 
          m.name === "Root Operator" ? { ...m, name: name, role: hustle || m.role } : m
        )
      }));
    }
    return SEED_PODS;
  });
  const [selectedPodId, setSelectedPodId] = useState<string>("pod-1");

  // Milestone celebration popup state
  const [showCelebration, setShowCelebration] = useState(false);

  // Custom metric config modal or form
  const [showConfigMetric, setShowConfigMetric] = useState(false);
  const [tempMetricName, setTempMetricName] = useState(metric.name);
  const [tempMetricUnit, setTempMetricUnit] = useState(metric.unit);
  const [tempMetricGoal, setTempMetricGoal] = useState(metric.weeklyGoal);

  // Codex matching situation
  const [userSituation, setUserSituation] = useState("");
  const [matchedPlaybooks, setMatchedPlaybooks] = useState<CodexPlaybook[]>([]);
  const [matchedPlaybookId, setMatchedPlaybookId] = useState<string | null>(null);
  const [codexAiAdvice, setCodexAiAdvice] = useState<string>("");
  const [loadingCodex, setLoadingCodex] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Swipeable card deck state
  const [swipedCardIds, setSwipedCardIds] = useState<string[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [dragX, setDragX] = useState<number>(0);
  const [dragY, setDragY] = useState<number>(0);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // AI Co-Pilot Summary
  const [coPilotInsight, setCoPilotInsight] = useState("-> GATHERING METRIC INTENSITY...\n-> ANALYZING INCOMING SIGNAL FEED...\nClick 'Force Sync' to run real-time analysis.");
  const [coPilotBadge, setCoPilotBadge] = useState("CO-PILOT READY");
  const [loadingCoPilot, setLoadingCoPilot] = useState(false);

  // Quick Income Log variables
  const [quickValue, setQuickValue] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [logSuccessMessage, setLogSuccessMessage] = useState(false);

  // Pod state controls
  const [newPodCommitment, setNewPodCommitment] = useState("");

  // Leaderboard states
  const [optInLeaderboard, setOptInLeaderboard] = useState(true);
  const [leaderboardName, setLeaderboardName] = useState(() => {
    const storedName = localStorage.getItem("operator_name");
    return storedName ? `${storedName} (You)` : "Root Operator (You)";
  });
  const [shareDetails, setShareDetails] = useState(true);
  const [selectedLeaderboardUser, setSelectedLeaderboardUser] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<{ [key: string]: boolean }>({});
  const [messageText, setMessageText] = useState("");

  // Get current state time for display
  const [currentTime, setCurrentTime] = useState("2026-06-25_12:00:58");

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("obsession_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("obsession_metric", JSON.stringify(metric));
  }, [metric]);

  // Generate the last 140 days ending 2026-06-25
  const generatePastDays = (count: number) => {
    const today = new Date("2026-06-25");
    const days = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      days.push(dateString);
    }
    return days;
  };

  const last7Days = generatePastDays(7);
  const currentWeeklySum = last7Days.reduce((sum, dStr) => {
    const log = logs.find((l) => l.date === dStr);
    return sum + (log ? log.value : 0);
  }, 0);
  const weeklyProgressPercent = Math.round((currentWeeklySum / metric.weeklyGoal) * 100);

  const getWeeklySum = (currentLogs: DailyLog[]) => {
    return last7Days.reduce((sum, dStr) => {
      const log = currentLogs.find((l) => l.date === dStr);
      return sum + (log ? log.value : 0);
    }, 0);
  };

  useEffect(() => {
    // Sync Co-pilot once on mount if logs are present
    handleSyncCoPilot();
    handleFetchCodex();
  }, []);

  // --- CORE HANDLERS ---
  const handleSaveLog = (date: string, value: number, note: string) => {
    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.date === date);
      let updated;
      if (existingIdx > -1) {
        updated = [...prev];
        updated[existingIdx] = { date, value, note };
      } else {
        updated = [...prev, { date, value, note }].sort((a, b) => b.date.localeCompare(a.date));
      }

      // Check if this save crosses the 100% weekly goal threshold
      const prevSum = getWeeklySum(prev);
      const newSum = getWeeklySum(updated);
      if (newSum >= metric.weeklyGoal && prevSum < metric.weeklyGoal) {
        setShowCelebration(true);
      }

      return updated;
    });
  };

  const handleBulkUpdateLogs = (newLogs: DailyLog[]) => {
    const prevSum = getWeeklySum(logs);
    const newSum = getWeeklySum(newLogs);
    setLogs(newLogs);
    if (newSum >= metric.weeklyGoal && prevSum < metric.weeklyGoal) {
      setShowCelebration(true);
    }
    // Refresh Co-Pilot insights with new data
    setTimeout(() => {
      handleSyncCoPilot();
    }, 500);
  };

  const handleSyncCoPilot = async () => {
    setLoadingCoPilot(true);
    try {
      const response = await fetch("/api/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricName: metric.name,
          metricUnit: metric.unit,
          logs: logs,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setCoPilotInsight(data.insight);
        setCoPilotBadge(data.badge);
      }
    } catch (err) {
      console.error("Co-Pilot analysis failure:", err);
    } finally {
      setLoadingCoPilot(false);
    }
  };

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickValue) return;

    const val = parseFloat(quickValue) || 0;
    const todayStr = "2026-06-25"; // Consistent local anchor
    handleSaveLog(todayStr, val, quickNote || "Quick telemetry entry");
    
    setQuickValue("");
    setQuickNote("");
    setLogSuccessMessage(true);
    setTimeout(() => {
      setLogSuccessMessage(false);
    }, 3000);

    // Auto trigger co-pilot refresh shortly after
    setTimeout(() => {
      handleSyncCoPilot();
    }, 500);
  };

  const handleAddIdea = (newIdea: Omit<ForgeIdea, "id" | "createdAt" | "status">) => {
    const idea: ForgeIdea = {
      ...newIdea,
      id: `idea-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "Draft",
    };
    setIdeas((prev) => [idea, ...prev]);
  };

  const handleUpdateIdea = (id: string, updates: Partial<ForgeIdea>) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const handleFetchCodex = async (situation = "") => {
    setLoadingCodex(true);
    try {
      const response = await fetch("/api/codex-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSituation: situation }),
      });
      if (response.ok) {
        const data = await response.json();
        setMatchedPlaybooks(data.playbooks);
        setMatchedPlaybookId(data.matchedPlaybookId);
        setCodexAiAdvice(data.aiAnalysis);
        setSwipedCardIds([]);
        setExpandedCardId(null);
      }
    } catch (err) {
      console.error("Codex matching error:", err);
    } finally {
      setLoadingCodex(false);
    }
  };

  const handleImportOpportunity = (playbook: CodexPlaybook) => {
    const exists = ideas.some(i => i.title === playbook.title);
    if (exists) {
      setImportNotification(`"${playbook.title}" is already in your Idea Forge!`);
      setTimeout(() => setImportNotification(null), 3000);
      setActiveTab("forge");
      return;
    }

    const newIdea: Omit<ForgeIdea, "id" | "createdAt" | "status"> = {
      title: playbook.title,
      category: playbook.category.includes("SaaS") ? "Side Hustle" : 
                playbook.category.includes("Local") ? "Side Hustle" : "Skill Prototypes",
      description: `[IMPORTED FROM BLACKHOLE - Sourced from ${playbook.author}]\n\nConcept:\n${playbook.summary}\n\nKey Steps:\n${playbook.steps.join("\n")}`,
      metricsGoals: playbook.metrics,
    };

    handleAddIdea(newIdea);

    setImportNotification(`Successfully imported "${playbook.title}" to the Forge!`);
    setTimeout(() => setImportNotification(null), 4000);

    setActiveTab("forge");
  };

  const handleUpdateMetricConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setMetric({
      name: tempMetricName,
      unit: tempMetricUnit,
      weeklyGoal: Number(tempMetricGoal),
    });
    setShowConfigMetric(false);
    // Refresh Co-pilot with new metric configuration
    setTimeout(() => {
      handleSyncCoPilot();
    }, 200);
  };

  const handleUpdatePodCommitment = (podId: string) => {
    if (!newPodCommitment) return;
    setPods(prev => prev.map(p => {
      if (p.id === podId) {
        return {
          ...p,
          myCommitment: newPodCommitment,
          mockMembers: p.mockMembers.map(m => 
            m.name === "Root Operator" ? { ...m, commitment: newPodCommitment } : m
          )
        };
      }
      return p;
    }));
    setNewPodCommitment("");
  };

  // Derived stats
  const activePod = pods.find((p) => p.id === selectedPodId) || pods[0];
  const activeLogCount = logs.filter((l) => l.value > 0).length;
  const currentMonthTotal = logs
    .filter((l) => l.date.startsWith("2026-06"))
    .reduce((sum, l) => sum + l.value, 0);

  if (showLanding) {
    return (
      <AsciiLanding
        onActivate={(profile) => {
          localStorage.setItem("operator_name", profile.name);
          localStorage.setItem("operator_hustle", profile.hustle);
          localStorage.setItem("operator_email", profile.email);
          setOperatorProfile(profile);
          setLeaderboardName(`${profile.name} (You)`);
          
          // Dynamically adjust pods
          setPods(prev => prev.map(p => ({
            ...p,
            mockMembers: p.mockMembers.map(m => 
              m.name === "Root Operator" || m.name === profile.name
                ? { ...m, name: profile.name, role: profile.hustle } 
                : m
            )
          })));

          // Dynamically update default metric to reflect their new side hustle if it is default
          if (metric.name === DEFAULT_METRIC.name) {
            const updatedMetric = { ...metric, name: profile.hustle };
            setMetric(updatedMetric);
            localStorage.setItem("obsession_metric", JSON.stringify(updatedMetric));
          }

          setShowLanding(false);
        }}
        currentProfile={operatorProfile}
        onClose={operatorProfile ? () => setShowLanding(false) : undefined}
      />
    );
  }

  return (
    <div className="h-screen bg-[#070707] text-[#d1d1d1] font-mono text-xs flex flex-col selection:bg-white selection:text-black">
      
      {/* HEADER BAR (HIGH DENSITY THEME) */}
      <div className="flex-none p-4 pb-3 border-b border-[#222] bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-40">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <a href="https://obsession.club" className="text-white font-bold bg-neutral-900 px-2 py-0.5 border border-neutral-800 tracking-wider text-xs">
              [ OBSESSION_OS ]
            </a>
            <span className="text-[#666] text-[10px]">v1.0.48_STABLE</span>
          </div>
          <div className="text-[#888] text-[10px] mt-1.5 flex items-center gap-1.5 uppercase tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM_STATUS: OPTIMIZING_FOR_INCOME_MAXIMIZATION
          </div>
        </div>

        {/* Top-Right Side: Overview Stats + Hamburger Trigger */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-900">
          <div className="flex flex-wrap gap-4 md:gap-6 text-left">
            <div className="flex flex-col border-l border-neutral-800 pl-3 md:pl-4">
              <span className="text-[9px] text-[#666] uppercase tracking-wider">Metric Tracked</span>
              <span className="text-white font-semibold text-[11px] md:text-xs">
                {metric.name.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col border-l border-neutral-800 pl-3 md:pl-4">
              <span className="text-[9px] text-[#666] uppercase tracking-wider">June Intake</span>
              <span className="text-emerald-400 font-bold text-[11px] md:text-xs">
                +{currentMonthTotal.toLocaleString()} {metric.unit}
              </span>
            </div>
            <div className="flex flex-col border-l border-neutral-800 pl-3 md:pl-4">
              <span className="text-[9px] text-[#666] uppercase tracking-wider">Consistency</span>
              <span className="text-white font-bold text-[11px] md:text-xs">
                {Math.round((activeLogCount / 371) * 100)}%
              </span>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button
            id="hamburger-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 border border-neutral-800 hover:border-neutral-500 bg-neutral-950 text-white transition focus:outline-none flex items-center justify-center gap-2 hover:bg-neutral-900 cursor-pointer"
          >
            {isMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-emerald-400" />}
            <span className="text-[10px] tracking-widest uppercase font-bold hidden sm:inline">MENU</span>
          </button>
        </div>
      </div>

      {/* SIDEBAR NAVIGATION DRAWER (HAMBURGER SLIDEOUT OVERLAY) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop blur */}
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* Sliding Panel */}
          <div className="relative w-80 max-w-full bg-[#0a0a0a] border-l border-[#222] h-full p-5 flex flex-col gap-6 overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
              <span className="text-emerald-400 font-bold text-[10px] tracking-widest uppercase">
                ● OBSESSION NAVIGATION
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 border border-neutral-800 hover:border-neutral-500 bg-neutral-900 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Box */}
            <div className="relative border border-[#333] p-4 bg-black">
              <div className="absolute top-[-8px] left-[10px] bg-[#0a0a0a] px-1 text-[10px] text-white tracking-widest uppercase font-bold text-emerald-400">
                Navigation
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <button
                  id="nav-hq"
                  onClick={() => {
                    setActiveTab("hq");
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left py-1.5 px-2 transition-all flex items-center justify-between ${
                    activeTab === "hq" ? "bg-white text-black font-bold" : "text-[#888] hover:text-white"
                  }`}
                >
                  <span>01. HQ: SCOREBOARD</span>
                  {activeTab === "hq" && <span className="text-[9px]">●</span>}
                </button>
                <button
                  id="nav-forge"
                  onClick={() => {
                    setActiveTab("forge");
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left py-1.5 px-2 transition-all flex items-center justify-between ${
                    activeTab === "forge" ? "bg-white text-black font-bold" : "text-[#888] hover:text-white"
                  }`}
                >
                  <span>02. IDEA_FORGE</span>
                  {activeTab === "forge" && <span className="text-[9px]">●</span>}
                </button>
                <button
                  id="nav-pods"
                  onClick={() => {
                    setActiveTab("pods");
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left py-1.5 px-2 transition-all flex items-center justify-between ${
                    activeTab === "pods" ? "bg-white text-black font-bold" : "text-[#888] hover:text-white"
                  }`}
                >
                  <span>03. PODS_&_LEADERBOARD</span>
                  {activeTab === "pods" && <span className="text-[9px]">●</span>}
                </button>
                <button
                  id="nav-landing"
                  onClick={() => {
                    setShowLanding(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left py-1.5 px-2 transition-all flex items-center justify-between text-[#888] hover:text-white border-t border-neutral-900 mt-1 pt-2"
                >
                  <span>04. GATEWAY_PORTAL</span>
                  <span className="text-[9px] text-emerald-500">⚡</span>
                </button>
              </div>
            </div>

            {/* Quick Active Goal Config */}
            <div className="relative border border-[#333] p-4 bg-black">
              <div className="absolute top-[-8px] left-[10px] bg-[#0a0a0a] px-1 text-[10px] text-white tracking-widest uppercase font-bold text-emerald-400">
                Active Metric
              </div>
              <div className="mt-2 space-y-3">
                <div>
                  <span className="text-[10px] text-[#666] uppercase block">Current Target</span>
                  <span className="text-white font-bold block truncate">{metric.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666] uppercase block">Weekly Threshold</span>
                  <span className="text-white font-mono text-xs font-semibold">
                    {metric.weeklyGoal} {metric.unit} / week
                  </span>
                </div>
                <button
                  id="config-metric-btn"
                  onClick={() => {
                    setTempMetricName(metric.name);
                    setTempMetricUnit(metric.unit);
                    setTempMetricGoal(metric.weeklyGoal);
                    setShowConfigMetric(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center border border-neutral-800 hover:border-neutral-500 py-1 font-mono text-[10px] uppercase text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  Configure Metric
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="relative border border-[#333] p-4 bg-neutral-950">
              <div className="absolute top-[-8px] left-[10px] bg-[#0a0a0a] px-1 text-[10px] text-white tracking-widest uppercase font-bold text-emerald-400">
                Telemetry
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[10px]">
                <div>
                  <span className="text-[#666] uppercase block">Active Pods</span>
                  <span className="text-white font-semibold">{pods.length} Circles</span>
                </div>
                <div>
                  <span className="text-[#666] uppercase block">Forge Ideas</span>
                  <span className="text-white font-semibold">{ideas.length} Drafted</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-neutral-900">
                  <span className="text-[#666] uppercase block">Daily Goal Proximity</span>
                  <div className="w-full bg-neutral-950 h-1.5 mt-1">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, Math.round(((logs[0]?.value || 0) / (metric.weeklyGoal / 7)) * 100))}%` }}
                    ></div>
                  </div>
                  <span className="text-[#888] text-[9px] mt-1 block">
                    Today: {logs[0]?.value || 0} / {(metric.weeklyGoal / 7).toFixed(0)} {metric.unit}
                  </span>
                </div>

                {/* Weekly Goal Progress */}
                <div className="col-span-2 pt-2 border-t border-neutral-900 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[#666] uppercase block">Weekly Goal Progress</span>
                    {weeklyProgressPercent >= 100 && (
                      <button 
                        id="trigger-celebration-manual"
                        onClick={() => {
                          setShowCelebration(true);
                          setIsMenuOpen(false);
                        }}
                        className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 uppercase font-mono hover:bg-emerald-900/60 transition cursor-pointer"
                      >
                        🎉 Celebrate
                      </button>
                    )}
                  </div>
                  <div className="w-full bg-neutral-950 h-1.5 mt-1 relative">
                    <div 
                      className="bg-emerald-400 h-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, weeklyProgressPercent)}%` }}
                    ></div>
                  </div>
                  <span className="text-[#888] text-[9px] mt-1 block">
                    This Week: {currentWeeklySum} / {metric.weeklyGoal} {metric.unit} ({weeklyProgressPercent}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 text-[9px] text-[#444] text-center border-t border-neutral-900 font-mono">
              OBSESSION ENGINE © 2026 // ALL SYSTEM TELEMETRY ACTIVE
            </div>
          </div>
        </div>
      )}

      {/* MAIN SCREEN CANVAS */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        
        {/* MIDDLE COLUMN: CONTENT PORT (THE CORE CONTAINER) */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070707]">
          
          {importNotification && (
            <div className="mb-6 p-3.5 bg-[#0a1e12] border border-emerald-500/40 text-emerald-400 font-mono text-xs flex justify-between items-center animate-fadeIn rounded-none">
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>SYSTEM: {importNotification}</span>
              </span>
              <button 
                onClick={() => setImportNotification(null)}
                className="hover:text-white uppercase font-bold text-[9px] border border-emerald-500/20 px-1 py-0.5 bg-emerald-950/40 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* TAB 1: HQ: SCOREBOARD & DISCOVERY */}
          {activeTab === "hq" && (
            <div id="hq-dashboard-view" className="space-y-8">
              
              {/* INCOME HEATMAP */}
              <div className="space-y-3">
                <div className="relative border border-[#333] p-4 bg-[#0a0a0a]">
                  <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1.5 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                    Scoreboard // Daily Income Pulse Heatmap
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed mt-1">
                    Your visual daily scoreboard for income progress. Daily squares show earnings intensity in green shades. Click any square below to overwrite or initialize entries, track focus streaks, and review dynamic growth metrics.
                  </p>
                </div>

                <div className="bg-[#090909] border border-neutral-900 p-2">
                  <Heatmap 
                    logs={logs} 
                    metric={metric} 
                    onSaveLog={handleSaveLog} 
                    onBulkUpdateLogs={handleBulkUpdateLogs}
                  />
                </div>
              </div>

              {/* IDEA BLACKHOLE */}
              <div className="space-y-4 pt-4 border-t border-neutral-900">
                <div className="relative border border-[#333] p-4 bg-[#0a0a0a]">
                  <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1.5 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                    Discovery // Idea Blackhole Feed
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed mt-1">
                    Weekly discovery feed of fresh opportunities aggregated from trending developer repositories on GitHub and active entrepreneurship subreddits. Use the Situational Match Engine to discover high-signal ideas or instantly import them directly into your Forge Strategy crucible.
                  </p>
                </div>

                {/* Match Finder Input */}
                <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
                  <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase">
                    Situational Match Engine
                  </div>
                  
                  <div className="space-y-4 mt-2">
                    <div>
                      <label className="block text-[10px] text-[#666] uppercase mb-1.5">
                        Describe your skillset, current constraints, or target revenue niches
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="user-situation-input"
                          type="text"
                          placeholder="e.g. Next.js developer, B2B sales experience, or $1,000/mo side hustle target with 10 hours/week"
                          value={userSituation}
                          onChange={(e) => setUserSituation(e.target.value)}
                          className="flex-1 bg-[#0d0d0d] border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
                        />
                        <button
                          id="match-playbooks-btn"
                          onClick={() => handleFetchCodex(userSituation)}
                          disabled={loadingCodex}
                          className="bg-white text-black font-bold px-4 hover:bg-neutral-200 transition text-xs font-mono uppercase flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          {loadingCodex ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Search className="w-3.5 h-3.5" />
                              Scan Feed
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {codexAiAdvice && (
                      <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-none">
                        <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest mb-1.5 font-bold">
                          ● AI Opportunity Synthesis
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                          {codexAiAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opportunity Swipeable Deck */}
                <div className="space-y-6">
                  {(() => {
                    const activeCards = matchedPlaybooks.filter((p) => !swipedCardIds.includes(p.id));
                    
                    if (activeCards.length === 0) {
                      return (
                        <div className="border border-dashed border-neutral-800 p-8 text-center bg-[#090909] max-w-md mx-auto flex flex-col items-center justify-center gap-4 min-h-[320px]">
                          <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-950 text-emerald-400 animate-pulse font-mono font-bold text-lg">
                            ✔
                          </div>
                          <div>
                            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-mono">Cosmic Deck Processed</h4>
                            <p className="text-neutral-400 text-xs mt-1 max-w-xs leading-relaxed">
                              You have swiped through all available playbooks in the blackhole feed. Scan a new situation above or restart to review them again.
                            </p>
                          </div>
                          <div className="flex gap-2 w-full max-w-xs">
                            <button
                              onClick={() => {
                                setSwipedCardIds([]);
                                setExpandedCardId(null);
                              }}
                              className="flex-1 bg-white text-black font-bold py-2 px-4 font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-200 transition cursor-pointer"
                            >
                              Restart Deck
                            </button>
                            <button
                              onClick={() => setActiveTab("forge")}
                              className="flex-1 border border-neutral-800 hover:border-neutral-500 py-2 px-4 font-mono text-[10px] uppercase tracking-wider text-neutral-400 hover:text-white transition cursor-pointer"
                            >
                              Go to Forge &rarr;
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col items-center">
                        <div className="relative w-full max-w-md h-[430px] flex items-center justify-center select-none touch-none">
                          {activeCards.slice(0, 2).reverse().map((playbook) => {
                            const isTop = playbook.id === activeCards[0].id;
                            const isRecommended = matchedPlaybookId === playbook.id;
                            const isExpanded = expandedCardId === playbook.id;

                            if (!isTop) {
                              // Secondary card peeking behind
                              return (
                                <div
                                  key={playbook.id}
                                  className="absolute w-full h-[390px] border border-neutral-900 bg-[#070707] p-5 opacity-40 scale-95 translate-y-4 pointer-events-none transition-all duration-300 flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-[9px] bg-neutral-950 border border-neutral-850 px-2 py-0.5 text-neutral-500 font-mono uppercase">
                                        {playbook.category}
                                      </span>
                                      <span className="text-[10px] text-neutral-600 font-mono">
                                        {playbook.timeline}
                                      </span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-neutral-500 mt-1 line-clamp-1">
                                      {playbook.title}
                                    </h3>
                                    <p className="text-neutral-500 text-xs mt-3 italic line-clamp-3">
                                      "{playbook.summary}"
                                    </p>
                                  </div>
                                  <div className="text-[9px] text-neutral-600 font-mono text-center tracking-widest uppercase">
                                    Next up in deck...
                                  </div>
                                </div>
                              );
                            }

                            // Interactive Drag Handlers for Top Card
                            const handleStart = (clientX: number, clientY: number) => {
                              setIsDragging(true);
                              setDragStartX(clientX);
                              setDragStartY(clientY);
                            };

                            const handleMove = (clientX: number, clientY: number) => {
                              if (!isDragging) return;
                              setDragX(clientX - dragStartX);
                              setDragY(clientY - dragStartY);
                            };

                            const handleEnd = () => {
                              if (!isDragging) return;
                              setIsDragging(false);
                              if (dragX > 110) {
                                // Swipe Right -> Like / Import
                                setSwipedCardIds((prev) => [...prev, playbook.id]);
                                setExpandedCardId(null);
                                handleImportOpportunity(playbook);
                              } else if (dragX < -110) {
                                // Swipe Left -> Pass
                                setSwipedCardIds((prev) => [...prev, playbook.id]);
                                setExpandedCardId(null);
                              }
                              setDragX(0);
                              setDragY(0);
                            };

                            const rotation = dragX * 0.08;
                            const transformStyle = isDragging
                              ? `translate3d(${dragX}px, ${dragY}px, 0) rotate(${rotation}deg)`
                              : "translate3d(0, 0, 0) rotate(0deg)";

                            return (
                              <div
                                key={playbook.id}
                                onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                                onMouseUp={handleEnd}
                                onMouseLeave={handleEnd}
                                onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                                onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                                onTouchEnd={handleEnd}
                                style={{ transform: transformStyle }}
                                className={`absolute w-full h-[390px] border p-5 flex flex-col justify-between transition-transform duration-75 select-none bg-neutral-950 cursor-grab active:cursor-grabbing shadow-2xl z-20 ${
                                  isRecommended ? "border-emerald-800/80 bg-[#090b09]" : "border-[#333] bg-[#0a0a0a]"
                                }`}
                              >
                                {/* Swipe Action Indicators */}
                                {isDragging && dragX > 30 && (
                                  <div 
                                    className="absolute inset-0 bg-emerald-950/20 border-2 border-emerald-500 flex items-center justify-center z-30 pointer-events-none"
                                    style={{ opacity: Math.min(0.9, dragX / 80) }}
                                  >
                                    <div className="bg-emerald-900 border border-emerald-400 text-emerald-400 font-mono font-bold text-sm px-4 py-1.5 tracking-widest uppercase rotate-[-10deg] shadow-lg">
                                      FORGE IT (LIKE)
                                    </div>
                                  </div>
                                )}
                                {isDragging && dragX < -30 && (
                                  <div 
                                    className="absolute inset-0 bg-rose-950/20 border-2 border-rose-500 flex items-center justify-center z-30 pointer-events-none"
                                    style={{ opacity: Math.min(0.9, -dragX / 80) }}
                                  >
                                    <div className="bg-rose-900 border border-rose-400 text-rose-400 font-mono font-bold text-sm px-4 py-1.5 tracking-widest uppercase rotate-[10deg] shadow-lg">
                                      PASS (SKIP)
                                    </div>
                                  </div>
                                )}

                                {isRecommended && (
                                  <div className="absolute top-[-8px] right-[10px] bg-emerald-950 border border-emerald-700 px-1.5 text-[8px] text-emerald-300 tracking-widest uppercase font-bold">
                                    Best Fit Candidate
                                  </div>
                                )}

                                <div className="flex-1 flex flex-col overflow-hidden">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-400 font-mono uppercase">
                                      {playbook.category}
                                    </span>
                                    <span className="text-[10px] text-neutral-500 font-mono">
                                      {playbook.timeline}
                                    </span>
                                  </div>

                                  <h3 className="text-sm font-semibold text-white tracking-tight mt-1 underline decoration-neutral-800 underline-offset-4">
                                    {playbook.title}
                                  </h3>
                                  
                                  <div className="mt-2.5 flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                                    <span>Source: <strong className="text-white font-medium">{playbook.author}</strong></span>
                                    <span>Difficulty: <strong className="text-orange-400 font-medium">{playbook.difficulty}</strong></span>
                                  </div>

                                  <p className="text-neutral-300 text-xs mt-3 leading-relaxed font-sans italic bg-neutral-950 p-2.5 border border-neutral-900">
                                    "{playbook.summary}"
                                  </p>

                                  <div className="mt-auto pt-3 text-[10px] text-neutral-500 font-mono flex items-center justify-between">
                                    <span>Swipe Left to Pass</span>
                                    <span className="text-emerald-400">Swipe Right to Forge</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Control Buttons (Click support) */}
                        <div className="flex items-center justify-center gap-4 mt-2 select-none">
                          <button
                            onClick={() => {
                              const topCard = activeCards[0];
                              if (topCard) {
                                setSwipedCardIds((prev) => [...prev, topCard.id]);
                                setExpandedCardId(null);
                              }
                            }}
                            className="p-3.5 rounded-full border border-neutral-800 bg-neutral-950 text-rose-500 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/10 transition cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 animate-fadeIn"
                            title="Skip Idea (Swipe Left)"
                          >
                            <X className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => {
                              const topCard = activeCards[0];
                              if (topCard) {
                                setExpandedCardId(expandedCardId === topCard.id ? null : topCard.id);
                              }
                            }}
                            className="px-5 py-2.5 border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-500 transition cursor-pointer text-xs font-mono uppercase tracking-widest shadow-md hover:scale-105 active:scale-95"
                          >
                            {expandedCardId === activeCards[0].id ? "Collapse" : "Tap to learn more"}
                          </button>

                          <button
                            onClick={() => {
                              const topCard = activeCards[0];
                              if (topCard) {
                                setSwipedCardIds((prev) => [...prev, topCard.id]);
                                setExpandedCardId(null);
                                handleImportOpportunity(topCard);
                              }
                            }}
                            className="p-3.5 rounded-full border border-neutral-800 bg-neutral-950 text-emerald-500 hover:text-emerald-400 hover:border-emerald-900/50 hover:bg-emerald-950/10 transition cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
                            title="Import to Forge (Swipe Right)"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Tap to Learn More detail block if expanded */}
                        {expandedCardId && (() => {
                          const currentPlaybook = activeCards.find(p => p.id === expandedCardId);
                          if (!currentPlaybook) return null;
                          return (
                            <div className="w-full max-w-md mt-6 p-5 border border-neutral-800 bg-black/80 animate-fadeIn space-y-4">
                              <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-bold">
                                  ● PLAYBOOK TELEMETRY DETAILS
                                </span>
                                <button 
                                  onClick={() => setExpandedCardId(null)}
                                  className="text-[9px] font-mono text-neutral-500 hover:text-white"
                                >
                                  [CLOSE]
                                </button>
                              </div>

                              <div className="space-y-2">
                                <span className="text-[10px] text-neutral-500 block uppercase tracking-wider font-semibold">● Suggested Execution Steps</span>
                                <div className="space-y-1.5 pl-2.5 border-l border-neutral-800">
                                  {currentPlaybook.steps.map((step, idx) => (
                                    <div key={idx} className="text-[11px] font-mono text-neutral-300 flex items-start gap-1.5">
                                      <span className="text-emerald-500 font-bold">{idx + 1}.</span>
                                      <p className="flex-1 leading-relaxed">{step}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-neutral-900">
                                <span className="text-[10px] text-neutral-500 block uppercase tracking-wider font-semibold">● Revenue Metric Potential</span>
                                <p className="text-[11px] font-mono text-emerald-400 mt-1 pl-2.5 border-l border-neutral-800">
                                  {currentPlaybook.metrics}
                                </p>
                              </div>

                              {currentPlaybook.tests && currentPlaybook.tests.length > 0 && (
                                <div className="pt-2 border-t border-neutral-900">
                                  <span className="text-[10px] text-neutral-500 block uppercase tracking-wider font-semibold">● Validation Test Experiment</span>
                                  <p className="text-[11px] font-mono text-orange-400 mt-1 pl-2.5 border-l border-neutral-800">
                                    {currentPlaybook.tests[0]}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: IDEA FORGE */}
          {activeTab === "forge" && (
            <div id="forge-view" className="space-y-6 animate-fadeIn">
              <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
                <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase font-bold text-emerald-400">
                  Forge: Idea Crucible
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed mt-1">
                  Dissect side hustle concepts, prepare salary talks, or layout consulting playbooks. Submit your raw ideas below to have our simulated **AI Red-Team Co-Pilot** rigorously audit assumptions and compile immediate $0 launch tests.
                </p>
              </div>

              <ForgeSection
                ideas={ideas}
                onAddIdea={handleAddIdea}
                onUpdateIdea={handleUpdateIdea}
                onDeleteIdea={handleDeleteIdea}
              />
            </div>
          )}

          {/* TAB 5: ACCOUNTABILITY PODS & LEADERBOARD */}
          {activeTab === "pods" && (() => {
            const leaderboardEntries = [
              {
                id: "leader-1",
                name: "cyber_hustler",
                sideHustle: "Niche Substack Curation",
                weeklyEarnings: 2850,
                dailyStreak: 12,
                tactics: "Curating zoning PDF meeting address data. Blasting 10 new commercial brokers each Sunday with customized PDFs.",
                experiments: ["Automating municipal zoning address scraper", "Stripe payment widget direct link"],
                contactable: true,
                isMe: false,
              },
              {
                id: "leader-2",
                name: "deal_maker",
                sideHustle: "Enterprise Consulting",
                weeklyEarnings: 1950,
                dailyStreak: 15,
                tactics: "Preparing out-of-cycle leverage proposals by bundling AWS cost saving auditing scripts.",
                experiments: ["Deploy AWS audit serverless bundle", "LinkedIn cold outbound to SaaS directors"],
                contactable: true,
                isMe: false,
              },
              ...(optInLeaderboard ? [{
                id: "me",
                name: leaderboardName,
                sideHustle: "Active: " + metric.name,
                weeklyEarnings: currentWeeklySum,
                dailyStreak: logs.filter((l) => l.value > 0).length,
                tactics: shareDetails ? "Consistently registering outputs onto Pulse heatmap. Current Target is " + metric.weeklyGoal + " " + metric.unit + "/week." : "[REDACTED BY USER PRIVACY POLICY]",
                experiments: shareDetails ? ["Raise daily consistency rating", "Analyze telemetry logs in AI Co-pilot"] : ["[REDACTED]"],
                contactable: false,
                isMe: true,
              }] : []),
              {
                id: "leader-4",
                name: "quantum_coder",
                sideHustle: "API SaaS Boilerplates",
                weeklyEarnings: 820,
                dailyStreak: 5,
                tactics: "Marketing boilerplate code with interactive setup tutorials on developer forums.",
                experiments: ["React Native boilerplate package", "Launch self-hosted SQLite templates"],
                contactable: true,
                isMe: false,
              },
              {
                id: "leader-5",
                name: "zen_negotiator",
                sideHustle: "B2B Auditing",
                weeklyEarnings: 650,
                dailyStreak: 3,
                tactics: "Lighthouse optimization audits for plastic surgeons and dental clinics in high-density suburbs.",
                experiments: ["Send 20 Loom audios", "Revamp cold email template open metrics"],
                contactable: true,
                isMe: false,
              }
            ].sort((a, b) => b.weeklyEarnings - a.weeklyEarnings);

            const selectedUserObj = leaderboardEntries.find(u => u.id === selectedLeaderboardUser);

            return (
              <div id="pods-view" className="space-y-6 animate-fadeIn">
                <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
                  <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase">
                    Obsession Hub: Pods & Leaderboard
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed mt-1">
                    Connect and keep pace with high-conviction builders. Set mastermind commitments inside categorized accountability Pods, or opt-in to the global Income Leaderboard to benchmark your side-hustle revenue. Benchmark tactics, share active experiments, and connect directly under full privacy controls.
                  </p>
                </div>

                {/* Sub-Header Tabs */}
                <div className="flex border-b border-[#222] gap-1">
                  {pods.map((pod) => (
                    <button
                      key={pod.id}
                      id={`pod-tab-${pod.id}`}
                      onClick={() => setSelectedPodId(pod.id)}
                      className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition ${
                        selectedPodId === pod.id
                          ? "bg-neutral-900 border-t border-r border-l border-[#333] text-white font-bold"
                          : "text-[#666] hover:text-white"
                      }`}
                    >
                      Pod: {pod.name}
                    </button>
                  ))}
                </div>

                {/* Main Double Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  
                  {/* LEFT HAND: ACTIVE POD MASTERMIND */}
                  <div className="xl:col-span-7 space-y-6">
                    <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
                      <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase">
                        {activePod.name} Circle Parameters
                      </div>
                      
                      <div className="space-y-3 mt-2">
                        <div>
                          <span className="text-[10px] text-neutral-500 block uppercase">Objective</span>
                          <p className="text-neutral-300 text-xs font-semibold leading-relaxed mt-0.5">{activePod.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-900">
                          <div>
                            <span className="text-[10px] text-neutral-500 block uppercase">Weekly Target</span>
                            <span className="text-white text-xs font-medium">{activePod.weeklyTarget}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 block uppercase">Category</span>
                            <span className="text-emerald-400 text-xs font-medium">{activePod.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* My Commitment Panel */}
                    <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
                      <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase">
                        My Commitment Brief
                      </div>
                      
                      <div className="space-y-3 mt-2">
                        <div className="bg-[#111] p-3 border border-neutral-800">
                          <span className="text-[9px] text-[#666] uppercase block font-bold">● Active Sprint Contract</span>
                          <p className="text-white text-xs mt-1 leading-relaxed font-sans">
                            "{activePod.myCommitment}"
                          </p>
                        </div>

                        <div>
                          <label className="block text-[10px] text-neutral-500 uppercase mb-1.5 font-bold">
                            Revise My commitment for this sprint
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="pod-commitment-input"
                              type="text"
                              placeholder="e.g. ship 10 Loom audits by Friday"
                              value={newPodCommitment}
                              onChange={(e) => setNewPodCommitment(e.target.value)}
                              className="flex-1 bg-[#0d0d0d] border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
                            />
                            <button
                              id="submit-pod-commitment"
                              onClick={() => handleUpdatePodCommitment(activePod.id)}
                              className="bg-white hover:bg-neutral-200 text-neutral-950 px-4 font-mono font-bold uppercase text-xs cursor-pointer"
                            >
                              Commit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Circle Roster */}
                    <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
                      <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase">
                        Accountability Roster ({activePod.membersCount} Builders)
                      </div>

                      <div className="space-y-4 mt-2">
                        {activePod.mockMembers.map((member, idx) => {
                          const isItMe = member.name === "Root Operator";
                          return (
                            <div
                              key={idx}
                              className={`border p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                                isItMe ? "bg-neutral-900/40 border-neutral-800" : "bg-neutral-950 border-neutral-900"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-xs">{isItMe ? leaderboardName : member.name}</span>
                                  <span className="text-[8px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-neutral-400 font-mono uppercase font-semibold">
                                    {member.role}
                                  </span>
                                  {isItMe && (
                                    <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 font-mono uppercase font-bold">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                                  Sprint Commitment: <strong className="text-white font-mono text-[11px]">"{isItMe ? activePod.myCommitment : member.commitment}"</strong>
                                </p>
                              </div>

                              {/* Heatmap line */}
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[10px] font-mono text-emerald-400">
                                  Streak: {isItMe ? logs.filter(l => l.value > 0).length : member.streak} Days
                                </span>
                                <div className="flex gap-1">
                                  {member.heatmapSeed.map((val, hIdx) => {
                                    let bg = "bg-neutral-900";
                                    if (val === 4) bg = "bg-emerald-500";
                                    else if (val === 3) bg = "bg-emerald-700";
                                    else if (val === 2) bg = "bg-emerald-900";
                                    return (
                                      <div
                                        key={hIdx}
                                        className={`w-3 h-3 ${bg}`}
                                        title={`Consistency block ${hIdx + 1}`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* RIGHT HAND: OPT-IN INCOME LEADERBOARD */}
                  <div className="xl:col-span-5 space-y-6">
                    
                    <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
                      <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase">
                        Weekly Income Leaderboard
                      </div>

                      <div className="mt-2 space-y-4">
                        <div className="flex justify-between items-center text-[10px] text-neutral-500 border-b border-neutral-900 pb-2">
                          <span>BUILDER / HUSTLE</span>
                          <span className="font-mono">WEEKLY EARNINGS</span>
                        </div>

                        <div className="space-y-2">
                          {leaderboardEntries.map((user, index) => {
                            const isUserSelected = selectedLeaderboardUser === user.id;
                            return (
                              <div
                                key={user.id}
                                onClick={() => setSelectedLeaderboardUser(isUserSelected ? null : user.id)}
                                className={`border p-2.5 flex items-center justify-between cursor-pointer transition ${
                                  isUserSelected
                                    ? "bg-[#0f1f14] border-emerald-500"
                                    : user.isMe
                                    ? "bg-neutral-900/60 border-neutral-800 hover:bg-neutral-900"
                                    : "bg-neutral-950 border-neutral-900 hover:bg-neutral-900/40"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={`font-mono text-xs font-bold ${index === 0 ? "text-amber-400" : index === 1 ? "text-neutral-300" : "text-[#666]"}`}>
                                    #{index + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-white text-xs font-semibold hover:underline">
                                        {user.name}
                                      </span>
                                      {user.isMe && (
                                        <span className="text-[7px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-1 font-mono uppercase font-bold">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-neutral-400 block truncate max-w-[160px]">
                                      {user.sideHustle}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-xs font-mono font-bold text-emerald-400">
                                    {user.weeklyEarnings.toLocaleString()} {metric.unit}
                                  </span>
                                  <span className="text-[9px] text-neutral-500 block font-mono">
                                    🔥 {user.dailyStreak}D streak
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Consented details card on select */}
                    {selectedUserObj && (
                      <div className="relative border border-emerald-800 p-5 bg-[#070e0a] animate-fadeIn">
                        <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                          ● Builder Intel Drawer: {selectedUserObj.name}
                        </div>

                        <div className="space-y-3.5 mt-2">
                          <div>
                            <span className="text-[9px] text-neutral-500 block uppercase font-bold">Active Hustle / Model</span>
                            <span className="text-white text-xs font-medium font-mono">{selectedUserObj.sideHustle}</span>
                          </div>

                          <div>
                            <span className="text-[9px] text-neutral-500 block uppercase font-bold">Consented Tactical Stack</span>
                            <p className="text-neutral-300 text-xs mt-1 leading-relaxed bg-neutral-950/60 p-2 border border-emerald-900/30">
                              "{selectedUserObj.tactics}"
                            </p>
                          </div>

                          <div>
                            <span className="text-[9px] text-neutral-500 block uppercase font-bold">Live Experiments Tracker</span>
                            <div className="space-y-1.5 mt-1">
                              {selectedUserObj.experiments.map((exp, idx) => (
                                <div key={idx} className="text-[11px] font-mono text-neutral-400 flex items-start gap-1.5">
                                  <span className="text-emerald-500 font-bold">&raquo;</span>
                                  <span className="flex-1">{exp}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {!selectedUserObj.isMe && (
                            <div className="pt-2 border-t border-emerald-900/40">
                              {sentMessage[selectedUserObj.id] ? (
                                <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs p-2 text-center font-mono uppercase font-bold">
                                  ✔ connection message dispatched
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <textarea
                                    placeholder={`Send connection request to ${selectedUserObj.name}...`}
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    className="w-full bg-[#0d0d0d] border border-emerald-900/50 p-2 text-white font-mono focus:outline-none focus:border-emerald-500 text-xs"
                                    rows={2}
                                  />
                                  <button
                                    onClick={() => {
                                      setSentMessage(prev => ({ ...prev, [selectedUserObj.id]: true }));
                                      setMessageText("");
                                    }}
                                    className="w-full bg-emerald-500 text-neutral-950 font-mono text-[10px] py-1.5 uppercase font-bold tracking-widest hover:bg-emerald-400 cursor-pointer"
                                  >
                                    Connect & Request Pod Invite
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PRIVACY CONTROLS PANEL */}
                    <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
                      <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase">
                        My Privacy Settings
                      </div>

                      <div className="space-y-3.5 mt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-white font-semibold block">Opt-in to Public Leaderboard</span>
                            <span className="text-[9px] text-neutral-500 block">Benchmarks your logs against other builders</span>
                          </div>
                          <button
                            onClick={() => setOptInLeaderboard(prev => !prev)}
                            className={`px-2 py-1 font-mono text-[10px] uppercase font-bold border ${
                              optInLeaderboard
                                ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                                : "bg-neutral-950 border-neutral-800 text-neutral-500"
                            }`}
                          >
                            {optInLeaderboard ? "ACTIVE" : "REDACTED"}
                          </button>
                        </div>

                        {optInLeaderboard && (
                          <>
                            <div className="flex items-center justify-between pt-2.5 border-t border-neutral-900">
                              <div>
                                <span className="text-xs text-white font-semibold block">Share Consented Tactical Stack</span>
                                <span className="text-[9px] text-neutral-500 block">Allows members to see tactics and experiments</span>
                              </div>
                              <button
                                onClick={() => setShareDetails(prev => !prev)}
                                className={`px-2 py-1 font-mono text-[10px] uppercase font-bold border ${
                                  shareDetails
                                    ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                                    : "bg-neutral-950 border-neutral-800 text-neutral-500"
                                }`}
                              >
                                {shareDetails ? "SHARING" : "HIDDEN"}
                              </button>
                            </div>

                            <div className="pt-2.5 border-t border-neutral-900">
                              <label className="block text-[10px] text-neutral-500 uppercase mb-1 font-bold">
                                Leaderboard Display Handle
                              </label>
                              <input
                                type="text"
                                value={leaderboardName}
                                onChange={(e) => setLeaderboardName(e.target.value)}
                                className="w-full bg-[#0d0d0d] border border-neutral-800 p-2 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
                                placeholder="Display handle"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            );
          })()}

        </div>

        {/* RIGHT COLUMN: AI CO-PILOT LOGIC (HIGH DENSITY PANEL) */}
        <div className="w-full lg:w-64 flex flex-col gap-4 p-4 border-t lg:border-t-0 lg:border-l border-[#222] bg-[#090909] shrink-0">
          
          <div className="relative border border-[#333] p-4 bg-[#0a0a0a] flex flex-col justify-between h-full">
            <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase">
              AI_Co-Pilot
            </div>

            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#666] uppercase tracking-wider font-semibold">SIGNAL ASSESSMENT</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-950 px-1.5 py-0.5 border border-emerald-900">
                  {coPilotBadge}
                </span>
              </div>

              <div className="bg-neutral-950 border border-neutral-900 p-3 rounded-none relative">
                {loadingCoPilot && (
                  <div className="absolute inset-0 bg-neutral-950/80 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  </div>
                )}
                <div className="text-[11px] font-mono text-neutral-300 leading-relaxed whitespace-pre-wrap select-none">
                  {coPilotInsight}
                </div>
              </div>

              <button
                id="force-sync-copilot-btn"
                onClick={handleSyncCoPilot}
                disabled={loadingCoPilot}
                className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px] py-1.5 uppercase tracking-widest font-bold hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3 h-3 ${loadingCoPilot ? "animate-spin" : ""}`} />
                Force Strategic Sync
              </button>

              <div className="pt-4 border-t border-neutral-900 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-[#666]">COGNITIVE LOAD:</span>
                  <span className="text-white">OPTIMAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">LATENCY SIGNAL:</span>
                  <span className="text-white">12MS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">MODEL DIRECTIVE:</span>
                  <span className="text-emerald-400">GEMINI_3.5_FLASH</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#222]">
              <span className="text-[9px] text-[#555] uppercase block tracking-wider">OBSESSION QUOTE</span>
              <p className="text-[#777] text-[10px] italic leading-relaxed mt-1.5">
                "Amateurs wait for motivation. Obsessives log their parameters, execute cheap outbound tests, and scale their base velocity."
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* METRIC CONFIG MODAL (PORTAL DIALOG) */}
      {showConfigMetric && (
        <div id="metric-modal" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a] border border-[#333] p-6 max-w-sm w-full relative">
            <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-white tracking-widest uppercase">
              Configure Target Metric
            </div>

            <form onSubmit={handleUpdateMetricConfig} className="space-y-4 mt-2">
              <div>
                <label className="block text-[10px] text-[#666] uppercase mb-1">
                  Metric Name
                </label>
                <input
                  id="modal-metric-name"
                  type="text"
                  required
                  placeholder="e.g. Side Hustle Revenue"
                  value={tempMetricName}
                  onChange={(e) => setTempMetricName(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-neutral-800 p-2 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#666] uppercase mb-1">
                  Metric Unit
                </label>
                <input
                  id="modal-metric-unit"
                  type="text"
                  required
                  placeholder="e.g. USD, Deals, Hours"
                  value={tempMetricUnit}
                  onChange={(e) => setTempMetricUnit(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-neutral-800 p-2 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#666] uppercase mb-1">
                  Weekly Goal Threshold
                </label>
                <input
                  id="modal-metric-goal"
                  type="number"
                  required
                  placeholder="e.g. 700"
                  value={tempMetricGoal}
                  onChange={(e) => setTempMetricGoal(Number(e.target.value))}
                  className="w-full bg-[#0d0d0d] border border-neutral-800 p-2 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  id="save-metric-config-btn"
                  type="submit"
                  className="flex-1 bg-white text-black font-bold py-1.5 uppercase font-mono text-xs hover:bg-neutral-200 transition"
                >
                  Save Changes
                </button>
                <button
                  id="cancel-metric-config-btn"
                  type="button"
                  onClick={() => setShowConfigMetric(false)}
                  className="border border-neutral-800 px-4 py-1.5 uppercase font-mono text-xs text-neutral-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone achieved modal overlay */}
      <MilestoneCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        weeklyGoal={metric.weeklyGoal}
        currentSum={currentWeeklySum}
        metricUnit={metric.unit}
        metricName={metric.name}
      />

      {/* FOOTER BAR (HIGH DENSITY THEME) */}
      <div className="flex-none p-4 px-6 border-t border-[#222] bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-center text-[10px] text-[#444] gap-2">
        <div>CONNECTION: SECURE_ENCRYPTED_AES256</div>
        <div>LOC: NORTH_DATA_HUB</div>
        <div>TIME: {currentTime}</div>
        <div>USER_EMAIL: xaitoshi@gmail.com</div>
      </div>

    </div>
  );
}
