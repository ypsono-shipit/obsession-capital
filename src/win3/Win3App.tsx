import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, LogOut, User } from "lucide-react";
import { MetricConfig, DailyLog, ForgeIdea, PodMember, CodexPlaybook } from "../types";
import Heatmap from "../components/Heatmap";
import ForgeSection from "../components/ForgeSection";
import SwipeCards3 from "./SwipeCards3";
import ForgeHero from "./ForgeHero";
import AsciiLanding from "../components/AsciiLanding";
import IdeaWizard from "./IdeaWizard";

const DEFAULT_METRIC: MetricConfig = { name: "Side Hustle Revenue", unit: "USD", weeklyGoal: 700 };

const TODAY = new Date().toISOString().split("T")[0];

const POD_MEMBERS: PodMember[] = [
  { name: "You", role: "Audits & Speed Opt", streak: 8, commitment: "15 audits shipped", heatmapSeed: [4, 3, 4, 0, 4, 3, 4] },
  { name: "cyber_hustler", role: "Niche Substack", streak: 12, commitment: "1 newsletter published", heatmapSeed: [2, 3, 2, 4, 3, 0, 2] },
  { name: "quantum_coder", role: "API SaaS", streak: 5, commitment: "Send 20 cold pitches", heatmapSeed: [0, 4, 0, 4, 0, 4, 2] },
  { name: "zen_negotiator", role: "Enterprise Sales", streak: 3, commitment: "Draft 2 proposals", heatmapSeed: [3, 0, 3, 0, 3, 2, 3] },
];

type Tab = "scoreboard" | "ideas" | "forge" | "pod";

export default function Win3App() {
  const [showLanding, setShowLanding] = useState<boolean>(() => !localStorage.getItem("w3_email"));
  const [profile, setProfile] = useState<{ name: string; hustle: string; email: string } | null>(() => {
    const name = localStorage.getItem("w3_name");
    const hustle = localStorage.getItem("w3_hustle");
    const email = localStorage.getItem("w3_email");
    return name && hustle && email ? { name, hustle, email } : null;
  });
  const [tab, setTab] = useState<Tab>("forge");
  const [showPathModal, setShowPathModal] = useState(false);
  const [metric, setMetric] = useState<MetricConfig>(() => {
    const s = localStorage.getItem("obsession_metric");
    if (s) { try { return JSON.parse(s); } catch { /* */ } }
    return DEFAULT_METRIC;
  });
  const [weeklyGoal, setWeeklyGoal] = useState(() => Number(localStorage.getItem("w3_weekly_goal") || 0));
  const [longTermGoal, setLongTermGoal] = useState(() => localStorage.getItem("w3_long_term_goal") || "");
  const [editingGoals, setEditingGoals] = useState(() => !Number(localStorage.getItem("w3_weekly_goal")));
  const [goalDraft, setGoalDraft] = useState({ weekly: 0, longTerm: "" });
  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const s = localStorage.getItem("obsession_logs");
    if (s) { try { return JSON.parse(s); } catch { /* */ } }
    return [];
  });
  const [ideas, setIdeas] = useState<ForgeIdea[]>(() => {
    const s = localStorage.getItem("w3_ideas");
    if (s) { try { return JSON.parse(s); } catch { /* */ } }
    return [];
  });
  const [aiInsight, setAiInsight] = useState("");
  const [aiBadge, setAiBadge] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [commitment, setCommitment] = useState("Ship 15 audits per week & log daily");
  const [editingCommitment, setEditingCommitment] = useState(false);
  const [commitDraft, setCommitDraft] = useState(commitment);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Wizard state
  const [wizardIdeaId, setWizardIdeaId] = useState<string | null>(null);
  const wizardIdea = wizardIdeaId ? ideas.find(i => i.id === wizardIdeaId) ?? null : null;

  // Active mission (set when wizard completes)
  const [activeGoal, setActiveGoal] = useState(() => localStorage.getItem("w3_goal") || "");
  const [activeTasks, setActiveTasks] = useState<string[]>(() => {
    const s = localStorage.getItem("w3_task_list");
    if (s) try { return JSON.parse(s); } catch {}
    return [];
  });
  const [taskChecks, setTaskChecks] = useState<boolean[]>(() => {
    const s = localStorage.getItem(`w3_checks_${TODAY}`);
    if (s) try { return JSON.parse(s); } catch {}
    const list = localStorage.getItem("w3_task_list");
    const count = list ? JSON.parse(list).length : 0;
    return new Array(count).fill(false);
  });

  useEffect(() => { localStorage.setItem("obsession_logs", JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem("w3_ideas", JSON.stringify(ideas)); }, [ideas]);

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
    ["w3_name", "w3_hustle", "w3_email", "w3_ideas", "w3_goal", "w3_task_list",
     "w3_weekly_goal", "w3_long_term_goal", `w3_checks_${TODAY}`].forEach(k => localStorage.removeItem(k));
    setProfile(null);
    setIdeas([]);
    setLogs([]);
    setActiveGoal("");
    setActiveTasks([]);
    setTaskChecks([]);
    setWeeklyGoal(0);
    setLongTermGoal("");
    setEditingGoals(true);
    setWizardIdeaId(null);
    setShowProfileMenu(false);
    setTab("forge");
    setShowLanding(true);
  };

  const handleSaveGoals = () => {
    const wg = goalDraft.weekly;
    const lt = goalDraft.longTerm;
    setWeeklyGoal(wg);
    setLongTermGoal(lt);
    setMetric(prev => ({ ...prev, weeklyGoal: wg }));
    setEditingGoals(false);
    localStorage.setItem("w3_weekly_goal", String(wg));
    localStorage.setItem("w3_long_term_goal", lt);
    localStorage.setItem("obsession_metric", JSON.stringify({ ...metric, weeklyGoal: wg }));
    if (profile) {
      fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, weekly_goal: wg, long_term_goal: lt }),
      }).catch(console.error);
    }
  };

  // Load all user data from Supabase when profile is known
  useEffect(() => {
    if (!profile) return;
    const email = encodeURIComponent(profile.email);
    Promise.all([
      fetch(`/api/ideas?email=${email}`).then(r => r.json()),
      fetch(`/api/logs?email=${email}`).then(r => r.json()),
      fetch(`/api/mission?email=${email}`).then(r => r.json()),
      fetch(`/api/task-checks?email=${email}&date=${TODAY}`).then(r => r.json()),
      fetch(`/api/profile?email=${email}`).then(r => r.json()),
    ]).then(([remoteIdeas, remoteLogs, mission, checksData, profileData]) => {
      if (profileData?.weekly_goal) {
        const wg = Number(profileData.weekly_goal);
        setWeeklyGoal(wg);
        setMetric(prev => ({ ...prev, weeklyGoal: wg }));
        setEditingGoals(false);
        localStorage.setItem("w3_weekly_goal", String(wg));
      }
      if (profileData?.long_term_goal) {
        setLongTermGoal(profileData.long_term_goal);
        localStorage.setItem("w3_long_term_goal", profileData.long_term_goal);
      }
      if (Array.isArray(remoteIdeas) && remoteIdeas.length > 0) {
        const mapped = remoteIdeas.map((i: any) => ({
          id: i.id, title: i.title, category: i.category,
          description: i.description, metricsGoals: i.metrics_goals,
          githubUrl: i.github_url ?? undefined,
          bizInfo: i.biz_info ?? undefined,
          critique: i.critique, assumption: i.assumption, experiments: i.experiments,
          status: i.status, createdAt: i.created_at,
        }));
        setIdeas(mapped);
      }
      if (Array.isArray(remoteLogs) && remoteLogs.length > 0) setLogs(remoteLogs);
      if (mission?.goal) {
        setActiveGoal(mission.goal);
        setActiveTasks(mission.tasks || []);
        localStorage.setItem("w3_goal", mission.goal);
        localStorage.setItem("w3_task_list", JSON.stringify(mission.tasks || []));
      }
      if (checksData?.checks) setTaskChecks(checksData.checks);
    }).catch(e => console.error("[DB] Load failed, using localStorage cache:", e));
  }, [profile?.email]);

  const fetchInsight = async () => {
    if (logs.length === 0) return;
    setLoadingInsight(true);
    try {
      const res = await fetch("/api/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metricName: metric.name, metricUnit: metric.unit, logs }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsight(data.insight);
        setAiBadge(data.badge);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingInsight(false); }
  };

  const handleSaveLog = (date: string, value: number, note: string) => {
    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === date);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { date, value, note };
        return updated;
      }
      return [...prev, { date, value, note }].sort((a, b) => b.date.localeCompare(a.date));
    });
    if (profile) {
      fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, date, value, note }),
      }).catch(console.error);
    }
  };

  const handleBulkUpdateLogs = (newLogs: DailyLog[]) => setLogs(newLogs);

  const handleAddIdea = (newIdea: Omit<ForgeIdea, "id" | "createdAt" | "status">) => {
    setIdeas(prev => [{ ...newIdea, id: `idea-${Date.now()}`, createdAt: new Date().toISOString(), status: "Draft" }, ...prev]);
  };
  const handleUpdateIdea = (id: string, updates: Partial<ForgeIdea>) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };
  const handleDeleteIdea = (id: string) => setIdeas(prev => prev.filter(i => i.id !== id));

  const fetchCritique = async (ideaId: string, title: string, category: string, description: string, metricsGoals: string) => {
    try {
      const res = await fetch("/api/forge-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, description, metricsGoals }),
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(prev => prev.map(i => i.id === ideaId
          ? { ...i, critique: data.critique, assumption: data.assumption, experiments: data.experiments, status: "Validation Active" }
          : i
        ));
        fetch(`/api/ideas/${ideaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ critique: data.critique, assumption: data.assumption, experiments: data.experiments, status: "Validation Active" }),
        }).catch(console.error);
      }
    } catch (e) { console.error(e); }
  };

  const handleForgeSubmit = (ideaText: string, github: string, bizInfo: string) => {
    const title = ideaText.split(/[.!?\n]/)[0].slice(0, 80) || ideaText.slice(0, 80);

    const newIdea: ForgeIdea = {
      id: `idea-${Date.now()}`,
      title,
      category: "Side Hustle",
      description: ideaText,
      metricsGoals: "",
      githubUrl: github || undefined,
      bizInfo: bizInfo || undefined,
      createdAt: new Date().toISOString(),
      status: "Draft",
    };

    setIdeas(prev => [newIdea, ...prev]);
    setWizardIdeaId(newIdea.id);
    if (profile) {
      fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newIdea, email: profile.email }),
      }).catch(console.error);
    }
    // Give AI the full context but store fields separately
    const aiDescription = [
      ideaText,
      github ? `\nGitHub: ${github}` : "",
      bizInfo ? `\nBusiness context: ${bizInfo}` : "",
    ].filter(Boolean).join("\n");
    fetchCritique(newIdea.id, newIdea.title, newIdea.category, aiDescription, "");
  };

  const handleImportPlaybook = async (playbook: CodexPlaybook) => {
    const existing = ideas.find(i => i.title === playbook.title);
    if (existing) {
      setWizardIdeaId(existing.id);
      return;
    }

    const description = `${playbook.summary}\n\nSteps:\n${playbook.steps.join("\n")}`;
    const newIdea: ForgeIdea = {
      id: `idea-${Date.now()}`,
      title: playbook.title,
      category: "Side Hustle",
      description,
      metricsGoals: playbook.metrics,
      createdAt: new Date().toISOString(),
      status: "Draft",
    };

    setIdeas(prev => [newIdea, ...prev]);
    setWizardIdeaId(newIdea.id);
    if (profile) {
      fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newIdea, email: profile.email }),
      }).catch(console.error);
    }
    fetchCritique(newIdea.id, newIdea.title, newIdea.category, description, playbook.metrics);
  };

  const handleWizardComplete = (goal: string, tasks: string[]) => {
    setActiveGoal(goal);
    setActiveTasks(tasks);
    const checks = new Array(tasks.length).fill(false);
    setTaskChecks(checks);
    localStorage.setItem("w3_goal", goal);
    localStorage.setItem("w3_task_list", JSON.stringify(tasks));
    localStorage.setItem(`w3_checks_${TODAY}`, JSON.stringify(checks));
    setWizardIdeaId(null);
    setTab("scoreboard");
    if (profile) {
      fetch("/api/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, goal, tasks }),
      }).catch(console.error);
    }
  };

  const toggleTask = (i: number) => {
    setTaskChecks(prev => {
      const next = [...prev];
      next[i] = !next[i];
      localStorage.setItem(`w3_checks_${TODAY}`, JSON.stringify(next));
      if (profile) {
        fetch("/api/task-checks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: profile.email, date: TODAY, checks: next }),
        }).catch(console.error);
      }
      return next;
    });
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const weeklySum = last7.reduce((s, d) => s + (logs.find(l => l.date === d)?.value || 0), 0);
  const monthStr = TODAY.slice(0, 7);
  const monthTotal = logs.filter(l => l.date.startsWith(monthStr)).reduce((s, l) => s + l.value, 0);

  const TABS: { id: Tab; label: string }[] = [
    { id: "ideas", label: "Ideas" },
    { id: "forge", label: "Forge" },
    { id: "scoreboard", label: "Scoreboard" },
    { id: "pod", label: "Pod" },
  ];

  if (showLanding) {
    return (
      <AsciiLanding
        onActivate={(p) => {
          localStorage.setItem("w3_name", p.name);
          localStorage.setItem("w3_hustle", p.hustle);
          localStorage.setItem("w3_email", p.email);
          setProfile(p);
          setShowLanding(false);
          setShowPathModal(true);
          fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p),
          }).catch(console.error);
        }}
        currentProfile={profile}
        onClose={profile ? () => setShowLanding(false) : undefined}
      />
    );
  }

  return (
    <div className="h-screen bg-[#070707] text-[#d1d1d1] font-mono text-xs flex flex-col selection:bg-white selection:text-black">

      {/* Path selection modal */}
      {showPathModal && (
        <div className="fixed inset-0 z-50 bg-[#070707]/95 flex items-center justify-center p-6">
          <div className="w-full max-w-lg">
            <div className="mb-8 text-center">
              <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest mb-2">Welcome back{profile?.name ? `, ${profile.name}` : ""}</div>
              <h2 className="text-white font-mono text-xl font-light">What brings you here today?</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setTab("forge"); setShowPathModal(false); }}
                className="group border border-[#333] bg-[#0a0a0a] p-6 text-left hover:border-white transition cursor-pointer"
              >
                <div className="text-2xl mb-3">⚡</div>
                <div className="text-white font-mono text-sm font-bold mb-1 group-hover:text-white">I have an idea</div>
                <div className="text-[#555] font-mono text-[10px] leading-relaxed group-hover:text-neutral-400 transition">Forge it, pressure-test it, and build a plan of attack</div>
              </button>

              <button
                onClick={() => { setTab("ideas"); setShowPathModal(false); }}
                className="group border border-[#333] bg-[#0a0a0a] p-6 text-left hover:border-white transition cursor-pointer"
              >
                <div className="text-2xl mb-3">🔍</div>
                <div className="text-white font-mono text-sm font-bold mb-1 group-hover:text-white">I want to explore</div>
                <div className="text-[#555] font-mono text-[10px] leading-relaxed group-hover:text-neutral-400 transition">Browse today's high-signal opportunities from the field</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard overlay */}
      {wizardIdea && (
        <IdeaWizard
          idea={wizardIdea}
          onComplete={handleWizardComplete}
          onClose={() => setWizardIdeaId(null)}
        />
      )}

      {/* Header */}
      <div className="flex-none border-b border-[#222] bg-[#0a0a0a] px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold bg-neutral-900 px-2 py-0.5 border border-neutral-800 tracking-wider">
          [ OBSESSION_OS ]
        </span>

        <div className="flex items-center gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold transition ${
                tab === t.id ? "bg-white text-black" : "text-[#666] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-right">
            <div className="border-l border-neutral-800 pl-4">
              <div className="text-[9px] text-[#555] uppercase">This Week</div>
              <div className="text-emerald-400 font-bold">${weeklySum}{weeklyGoal > 0 ? ` / $${weeklyGoal.toLocaleString()}` : ""}</div>
            </div>
            <div className="border-l border-neutral-800 pl-4">
              <div className="text-[9px] text-[#555] uppercase">Month Total</div>
              <div className="text-white font-bold">${monthTotal}</div>
            </div>
          </div>

          {/* Account menu */}
          <div className="relative border-l border-neutral-800 pl-4" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(v => !v)}
              className="flex items-center gap-1.5 text-[#555] hover:text-white transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-widest">{profile?.name || "Account"}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0d0d0d] border border-[#333] z-40">
                <div className="px-3 py-2.5 border-b border-[#222]">
                  <div className="text-[10px] font-mono text-white truncate">{profile?.name}</div>
                  <div className="text-[9px] font-mono text-[#555] truncate">{profile?.email}</div>
                  {profile?.hustle && <div className="text-[9px] font-mono text-emerald-600 truncate mt-0.5">{profile.hustle}</div>}
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

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* TAB: SCOREBOARD */}
        {tab === "scoreboard" && (
          <div className="space-y-6 max-w-5xl mx-auto">

            {/* Income Targets */}
            {editingGoals ? (
              <div className="relative border border-emerald-500/40 p-5 bg-[#0a0a0a]">
                <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                  Set Your Targets
                </div>
                <div className="mt-1 space-y-4">
                  <div>
                    <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest mb-1.5">Weekly Income Goal</div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 font-mono text-sm">$</span>
                      <input
                        autoFocus
                        type="number"
                        min={0}
                        value={goalDraft.weekly || ""}
                        onChange={e => setGoalDraft(p => ({ ...p, weekly: Number(e.target.value) }))}
                        className="flex-1 bg-[#0d0d0d] border border-[#333] px-3 py-2 text-white font-mono text-sm outline-none focus:border-neutral-500 max-w-xs"
                        placeholder="2000"
                      />
                      <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">/week</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest mb-1.5">Long-Term Goal</div>
                    <input
                      type="text"
                      value={goalDraft.longTerm}
                      onChange={e => setGoalDraft(p => ({ ...p, longTerm: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter" && goalDraft.weekly > 0) handleSaveGoals(); }}
                      className="w-full bg-[#0d0d0d] border border-[#333] px-3 py-2 text-white font-mono text-xs outline-none focus:border-neutral-500"
                      placeholder="e.g. Hit $10k MRR by Q4 2026"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    {weeklyGoal > 0 && (
                      <button onClick={() => setEditingGoals(false)} className="text-[10px] font-mono text-[#444] uppercase tracking-widest hover:text-white transition cursor-pointer">
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleSaveGoals}
                      disabled={!goalDraft.weekly}
                      className="ml-auto bg-emerald-500 text-black font-mono text-[10px] font-bold px-5 py-2 uppercase tracking-widest hover:bg-emerald-400 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Lock in targets →
                    </button>
                  </div>
                </div>
              </div>
            ) : weeklyGoal > 0 && (
              <div className="relative border border-[#333] p-4 bg-[#0a0a0a]">
                <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                  Income Targets
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-white font-mono font-bold text-sm">${weeklyGoal.toLocaleString()}<span className="text-[#555] font-normal text-xs">/wk</span></span>
                    {longTermGoal && <span className="text-neutral-400 font-mono text-xs">· {longTermGoal}</span>}
                  </div>
                  <button
                    onClick={() => { setGoalDraft({ weekly: weeklyGoal, longTerm: longTermGoal }); setEditingGoals(true); }}
                    className="text-[9px] font-mono text-[#444] uppercase tracking-widest hover:text-white transition cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

            {/* Active Mission */}
            {activeGoal && activeTasks.length > 0 && (
              <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
                <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                  Active Mission
                </div>
                <div className="mt-1 space-y-4">
                  <p className="text-xs font-mono text-white leading-relaxed">{activeGoal}</p>
                  <div className="space-y-2.5">
                    {activeTasks.map((task, i) => (
                      <label key={i} onClick={() => toggleTask(i)} className="flex items-start gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 border flex-shrink-0 mt-0.5 flex items-center justify-center transition ${
                          taskChecks[i] ? "border-emerald-500 bg-emerald-950" : "border-[#444] group-hover:border-neutral-500"
                        }`}>
                          {taskChecks[i] && <span className="text-emerald-400 text-[9px] leading-none">✓</span>}
                        </div>
                        <span className={`text-xs font-mono leading-relaxed transition ${
                          taskChecks[i] ? "text-neutral-600 line-through" : "text-neutral-300 group-hover:text-white"
                        }`}>
                          {task}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-mono text-[#444] uppercase tracking-widest">
                      {taskChecks.filter(Boolean).length}/{activeTasks.length} done today
                    </span>
                    <button onClick={() => setTab("pod")} className="text-[9px] font-mono text-[#444] uppercase tracking-widest hover:text-white transition cursor-pointer">
                      View Pod →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Income Heatmap */}
            <div className="relative border border-[#333] p-4 bg-[#0a0a0a]">
              <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                Income Heatmap
              </div>
              <div className="mt-1">
                <Heatmap logs={logs} metric={metric} onSaveLog={handleSaveLog} onBulkUpdateLogs={handleBulkUpdateLogs} />
              </div>
            </div>

            {/* AI Co-Pilot */}
            <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
              <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                AI Co-Pilot
              </div>
              <div className="mt-1 space-y-3">
                {aiInsight ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900 px-1.5 py-0.5 uppercase tracking-widest font-bold">{aiBadge}</span>
                      <button onClick={fetchInsight} disabled={loadingInsight} className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest hover:text-white transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                        {loadingInsight ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Refresh
                      </button>
                    </div>
                    <p className="text-xs font-mono text-neutral-300 leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neutral-600">Log your income to activate AI analysis.</span>
                    {logs.length > 0 && (
                      <button onClick={fetchInsight} disabled={loadingInsight} className="bg-white text-black font-mono text-[10px] px-3 py-1.5 uppercase font-bold hover:bg-neutral-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                        {loadingInsight ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Analyse"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: IDEAS */}
        {tab === "ideas" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="relative border border-[#333] p-6 bg-[#0a0a0a]">
              <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                Idea Feed // Swipe to Forge
              </div>
              <div className="mt-2">
                <SwipeCards3 onImport={handleImportPlaybook} onGoToForge={() => setTab("forge")} />
              </div>
            </div>
          </div>
        )}

        {/* TAB: FORGE */}
        {tab === "forge" && (
          <div className="space-y-8">
            {/* Hero with video + chat bar */}
            <div className="-mx-6 -mt-6">
              <ForgeHero onSubmit={handleForgeSubmit} loading={false} />
            </div>

            {/* Existing ideas */}
            {ideas.length > 0 && (
              <div className="max-w-5xl mx-auto">
                <div className="relative border border-[#333] px-1 pt-1 bg-[#0a0a0a]">
                  <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                    Active Concepts · {ideas.length}
                  </div>
                  <ForgeSection
                    ideas={ideas}
                    onAddIdea={handleAddIdea}
                    onUpdateIdea={handleUpdateIdea}
                    onDeleteIdea={handleDeleteIdea}
                  />
                </div>
              </div>
            )}

            {ideas.length === 0 && (
              <div className="max-w-5xl mx-auto text-center text-[10px] font-mono text-neutral-700 uppercase tracking-widest py-4">
                Your forged ideas will appear here
              </div>
            )}
          </div>
        )}

        {/* TAB: POD */}
        {tab === "pod" && (
          <div className="space-y-6 max-w-5xl mx-auto">

            <div className="relative border border-[#333] p-5 bg-[#0a0a0a]">
              <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                My Commitment
              </div>
              <div className="mt-1">
                {editingCommitment ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={commitDraft}
                      onChange={e => setCommitDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { setCommitment(commitDraft); setEditingCommitment(false); }
                        if (e.key === "Escape") setEditingCommitment(false);
                      }}
                      className="flex-1 bg-[#0d0d0d] border border-neutral-800 p-2 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
                    />
                    <button
                      onClick={() => { setCommitment(commitDraft); setEditingCommitment(false); }}
                      className="bg-white text-black font-bold px-4 text-xs uppercase cursor-pointer"
                    >
                      Set
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs">"{commitment}"</span>
                    <button
                      onClick={() => { setCommitDraft(commitment); setEditingCommitment(true); }}
                      className="text-[#555] text-[10px] uppercase tracking-widest hover:text-white transition ml-4 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="relative border border-[#333] bg-[#0a0a0a]">
              <div className="absolute top-[-8px] left-[10px] bg-[#070707] px-1 text-[10px] text-emerald-400 tracking-widest uppercase font-bold">
                ALPHA_EARNERS · {POD_MEMBERS.length} builders
              </div>
              <div className="divide-y divide-[#1a1a1a] mt-1">
                {POD_MEMBERS.map((member, idx) => {
                  const isMe = idx === 0;
                  const barColors = ["bg-neutral-900", "bg-emerald-900", "bg-emerald-700", "bg-emerald-500", "bg-emerald-400"];
                  return (
                    <div key={member.name} className={`p-4 flex items-center justify-between gap-4 ${isMe ? "bg-neutral-900/30" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white font-bold text-xs">{member.name}</span>
                          <span className="text-[8px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-neutral-500 uppercase font-mono">
                            {member.role}
                          </span>
                          {isMe && (
                            <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 font-mono uppercase font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate">"{isMe ? commitment : member.commitment}"</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-mono text-emerald-400">{member.streak}D streak</span>
                        <div className="flex gap-1">
                          {member.heatmapSeed.map((v, i) => (
                            <div key={i} className={`w-3 h-3 ${barColors[v]}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
