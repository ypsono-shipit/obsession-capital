import React, { useState } from "react";
import { ForgeIdea } from "../types";
import { Plus, Flame, ShieldAlert, Sparkles, AlertCircle, Trash2, ArrowUpRight, Zap, RefreshCw } from "lucide-react";

interface ForgeSectionProps {
  ideas: ForgeIdea[];
  onAddIdea: (idea: Omit<ForgeIdea, "id" | "createdAt" | "status">) => void;
  onUpdateIdea: (id: string, updates: Partial<ForgeIdea>) => void;
  onDeleteIdea: (id: string) => void;
}

export default function ForgeSection({ ideas, onAddIdea, onUpdateIdea, onDeleteIdea }: ForgeSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ForgeIdea["category"]>("Side Hustle");
  const [description, setDescription] = useState("");
  const [metricsGoals, setMetricsGoals] = useState("");

  const [loadingFeedbackId, setLoadingFeedbackId] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(
    ideas.length > 0 ? ideas[0].id : null
  );

  React.useEffect(() => {
    if (ideas.length > 0) {
      // Auto-select the first idea if nothing is selected or if the first idea was just added
      const exists = ideas.some(i => i.id === selectedIdeaId);
      if (!exists || (ideas[0] && ideas[0].id !== selectedIdeaId && ideas[0].createdAt === new Date("2026-06-25").toISOString().split("T")[0] && !ideas.find(i => i.id === selectedIdeaId)?.critique)) {
        setSelectedIdeaId(ideas[0].id);
      }
    }
  }, [ideas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    onAddIdea({
      title,
      category,
      description,
      metricsGoals,
    });

    setTitle("");
    setDescription("");
    setMetricsGoals("");
    setShowAddForm(false);
  };

  // Run server-side Gemini red-team feedback
  const handleRedTeam = async (idea: ForgeIdea) => {
    setLoadingFeedbackId(idea.id);
    try {
      const response = await fetch("/api/forge-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          category: idea.category,
          description: idea.description,
          metricsGoals: idea.metricsGoals,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateIdea(idea.id, {
          critique: data.critique,
          assumption: data.assumption,
          experiments: data.experiments,
          status: "Validation Active",
        });
      } else {
        console.error("Failed to fetch red-team advice");
      }
    } catch (err) {
      console.error("Error red-teaming idea:", err);
    } finally {
      setLoadingFeedbackId(null);
    }
  };

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) || ideas[0];

  return (
    <div id="forge-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar: Idea list & Creation */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              Idea Crucible
            </h3>
            <button
              id="new-idea-toggle-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white hover:bg-neutral-200 text-neutral-950 font-mono text-[10px] px-2 py-1 uppercase tracking-wider font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {showAddForm ? "Cancel" : "Forge New"}
            </button>
          </div>

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-neutral-900">
              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">
                  Title
                </label>
                <input
                  id="idea-title"
                  type="text"
                  required
                  placeholder="e.g., Cold Email Agency for SaaS"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono p-2 text-xs focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">
                  Category
                </label>
                <select
                  id="idea-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ForgeIdea["category"])}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono p-2 text-xs focus:outline-none focus:border-neutral-500"
                >
                  <option value="Side Hustle">Side Hustle</option>
                  <option value="Career Advancement">Career Advancement</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Skill Prototypes">Skill Prototypes</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">
                  Core Concept
                </label>
                <textarea
                  id="idea-description"
                  required
                  rows={3}
                  placeholder="What is the high-income play? What are you selling or negotiating, and to whom?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono p-2 text-xs focus:outline-none focus:border-neutral-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">
                  Target Metric Goal
                </label>
                <input
                  id="idea-goals"
                  type="text"
                  placeholder="e.g., $1,500/mo within 30 days"
                  value={metricsGoals}
                  onChange={(e) => setMetricsGoals(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono p-2 text-xs focus:outline-none focus:border-neutral-500"
                />
              </div>

              <button
                id="submit-idea-btn"
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs py-2 uppercase tracking-widest font-bold transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Forge Concept
              </button>
            </form>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {ideas.length === 0 ? (
                <div className="text-center py-6 text-xs font-mono text-neutral-600 border border-dashed border-neutral-900">
                  NO ACTIVE CONCEPTS.
                  <br />FORGE AN IDEA TO SHAPE IT.
                </div>
              ) : (
                ideas.map((idea) => {
                  const isSelected = selectedIdea?.id === idea.id;
                  return (
                    <button
                      key={idea.id}
                      id={`idea-btn-${idea.id}`}
                      onClick={() => setSelectedIdeaId(idea.id)}
                      className={`w-full text-left p-3 border transition flex flex-col justify-between ${
                        isSelected
                          ? "bg-neutral-900 border-neutral-700"
                          : "bg-neutral-950 border-neutral-900 hover:border-neutral-800"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[9px] font-mono bg-neutral-850 px-1.5 py-0.5 text-neutral-400 uppercase tracking-wider border border-neutral-800">
                          {idea.category}
                        </span>
                        <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 ${
                          idea.status === "Verified" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                          idea.status === "Validation Active" ? "bg-orange-950 text-orange-400 border border-orange-900" :
                          idea.status === "Killed" ? "bg-red-950 text-red-400 border border-red-900" :
                          "bg-neutral-900 text-neutral-500 border border-neutral-800"
                        }`}>
                          {idea.status}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-white font-medium truncate w-full">
                        {idea.title}
                      </div>
                      <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-neutral-500 w-full">
                        <span>Goal: {idea.metricsGoals || "N/A"}</span>
                        <span className="text-[9px] text-neutral-600">{idea.createdAt.split("T")[0]}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Panel: Selected Idea Analysis & Red-Teaming */}
      <div className="lg:col-span-8">
        {selectedIdea ? (
          <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-none relative h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-neutral-900 border-l border-b border-neutral-800 px-3 py-1 font-mono text-[10px] text-neutral-500 tracking-wider">
              CRUCIBLE_PORT_B
            </div>

            <div>
              {/* Header Details */}
              <div className="border-b border-neutral-900 pb-4 mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px] px-2 py-0.5 uppercase tracking-wider">
                    {selectedIdea.category}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Created: {new Date(selectedIdea.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="font-mono text-lg text-white font-bold tracking-tight">
                  {selectedIdea.title}
                </h2>
              </div>

              {/* Concept Narrative */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-950 border border-neutral-900 p-4">
                  <h4 className="font-mono text-[10px] text-neutral-500 uppercase mb-2 tracking-widest">
                    Operational Blueprint
                  </h4>
                  <p className="font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {selectedIdea.description}
                  </p>
                </div>

                <div className="bg-neutral-950 border border-neutral-900 p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-[10px] text-neutral-500 uppercase mb-2 tracking-widest">
                      Primary Income Target
                    </h4>
                    <div className="font-mono text-sm text-emerald-400 font-medium">
                      {selectedIdea.metricsGoals || "No specific metric goal configured."}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-900">
                    <h4 className="font-mono text-[10px] text-neutral-500 uppercase mb-2 tracking-widest">
                      Crucible Validation Status
                    </h4>
                    <div className="flex gap-2">
                      {(["Draft", "Validation Active", "Verified", "Killed"] as const).map((status) => (
                        <button
                          key={status}
                          id={`status-btn-${status}`}
                          onClick={() => onUpdateIdea(selectedIdea.id, { status })}
                          className={`text-[9px] font-mono px-2 py-1 uppercase tracking-wider border transition-all ${
                            selectedIdea.status === status
                              ? "bg-white text-neutral-950 border-white font-bold"
                              : "bg-neutral-950 text-neutral-500 border-neutral-900 hover:border-neutral-700"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI RED-TEAM FEEDBACK PANEL */}
              {selectedIdea.critique ? (
                <div className="space-y-4 border-t border-neutral-900 pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                    <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-300">
                      Red-Team Analysis & Validation Plan
                    </h3>
                    <Sparkles className="w-3.5 h-3.5 text-neutral-500 animate-pulse" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brutal Critique */}
                    <div className="bg-orange-950/10 border border-orange-900/30 p-4">
                      <div className="text-[9px] font-mono text-orange-400 uppercase tracking-wider mb-2 font-bold">
                        ● Brutal Critique
                      </div>
                      <p className="font-mono text-xs text-neutral-300 leading-relaxed">
                        {selectedIdea.critique}
                      </p>
                    </div>

                    {/* Fatal Leap of Faith */}
                    <div className="bg-neutral-950 border border-neutral-900 p-4">
                      <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-2">
                        ● Core Unproven Assumption
                      </div>
                      <p className="font-mono text-xs text-neutral-300 leading-relaxed">
                        {selectedIdea.assumption}
                      </p>
                    </div>
                  </div>

                  {/* Experiments */}
                  <div className="bg-neutral-950 border border-neutral-900 p-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 uppercase tracking-wider mb-3 font-semibold">
                      <Zap className="w-3.5 h-3.5" />
                      Two Cheap $0 Validation Experiments (Launch in &lt;48h)
                    </div>
                    <div className="space-y-3">
                      {selectedIdea.experiments?.map((exp, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs font-mono">
                          <span className="text-emerald-500 font-bold mt-0.5">[{idx + 1}]</span>
                          <p className="text-neutral-300 leading-relaxed flex-1">{exp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-950 border border-neutral-900 p-6 text-center border-dashed mt-4">
                  <AlertCircle className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
                  <p className="font-mono text-xs text-neutral-400 mb-4 max-w-md mx-auto">
                    This concept has not been red-teamed. Initiate the simulated advisory session to dissect assumptions and map cheap experiments.
                  </p>
                  <button
                    id="trigger-redteam-btn"
                    onClick={() => handleRedTeam(selectedIdea)}
                    disabled={loadingFeedbackId === selectedIdea.id}
                    className="mx-auto bg-orange-500 hover:bg-orange-400 text-neutral-950 font-mono text-xs py-2 px-4 uppercase tracking-wider font-bold flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {loadingFeedbackId === selectedIdea.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Dissecting Blueprint...
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Execute Red-Team Audit
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Action footer */}
            <div className="flex items-center justify-between border-t border-neutral-900 pt-6 mt-6">
              <button
                id="delete-idea-btn"
                onClick={() => {
                  onDeleteIdea(selectedIdea.id);
                  setSelectedIdeaId(null);
                }}
                className="text-[10px] font-mono text-neutral-500 hover:text-red-400 uppercase tracking-wider flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Scrap Concept
              </button>

              {selectedIdea.status === "Verified" && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                  <ArrowUpRight className="w-4 h-4 animate-bounce" />
                  <span>IDEAL RIPE FOR DAILY METRIC LINKING IN PULSE</span>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-neutral-800 p-12 text-center h-full flex flex-col justify-center items-center">
            <Flame className="w-8 h-8 text-neutral-700 mb-3" />
            <h3 className="font-mono text-sm uppercase tracking-widest text-neutral-400 mb-2">
              No Concept Highlighted
            </h3>
            <p className="font-mono text-xs text-neutral-600 max-w-sm mb-4">
              Select an existing concept or generate a fresh income play from the sidebar to start optimization.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
