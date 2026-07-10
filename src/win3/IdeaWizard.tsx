import React, { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { ForgeIdea } from "../types";

interface Props {
  idea: ForgeIdea;
  onComplete: (goal: string, tasks: string[]) => void;
  onClose: () => void;
}

type Step = "critique" | "goals" | "launch";

const STEPS = [
  { id: "critique" as const, label: "Critique" },
  { id: "goals" as const, label: "Goals" },
  { id: "launch" as const, label: "Launch" },
];

export default function IdeaWizard({ idea, onComplete, onClose }: Props) {
  const [step, setStep] = useState<Step>("critique");
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goal, setGoal] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<number | null>(null);

  const stepIdx = STEPS.findIndex(s => s.id === step);
  const critiqueReady = !!idea.critique;

  const fetchGoals = async () => {
    setGoalsLoading(true);
    try {
      const res = await fetch("/api/generate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          critique: idea.critique,
          assumption: idea.assumption,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGoal(data.goal || "");
        setTasks(data.tasks || []);
      }
    } catch (e) { console.error(e); }
    finally { setGoalsLoading(false); }
  };

  const handleAdvanceToGoals = () => {
    setStep("goals");
    fetchGoals();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070707]/95 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#333]">

        {/* Stepper header */}
        <div className="border-b border-[#222] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 ${
                  i === stepIdx ? "text-white bg-white/10" :
                  i < stepIdx ? "text-emerald-400" : "text-[#444]"
                }`}>
                  {i < stepIdx ? "✓ " : ""}{s.label}
                </span>
                {i < STEPS.length - 1 && <span className="text-[#2a2a2a] text-xs mx-0.5">→</span>}
              </React.Fragment>
            ))}
          </div>
          <button onClick={onClose} className="text-[#444] hover:text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">

          {/* STEP 1: CRITIQUE */}
          {step === "critique" && (
            <div className="space-y-5">
              <div>
                <div className="text-[9px] font-mono text-[#444] uppercase tracking-widest mb-1">Idea</div>
                <h2 className="text-white text-sm font-mono leading-snug">{idea.title}</h2>
              </div>

              {!critiqueReady ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <span className="w-6 h-6 border-2 border-[#333] border-t-white rounded-full animate-spin" />
                  <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Red-teaming your idea...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border border-[#222] p-4 bg-[#0d0d0d]">
                    <div className="text-[9px] font-mono text-rose-400 uppercase tracking-widest mb-2">⚡ Reality Check</div>
                    <p className="text-xs font-mono text-neutral-300 leading-relaxed">{idea.critique}</p>
                  </div>

                  <div className="border border-[#222] p-4 bg-[#0d0d0d]">
                    <div className="text-[9px] font-mono text-amber-400 uppercase tracking-widest mb-2">◎ Fatal Assumption</div>
                    <p className="text-xs font-mono text-neutral-300 leading-relaxed">{idea.assumption}</p>
                  </div>

                  {idea.experiments && idea.experiments.length > 0 && (
                    <div className="border border-[#222] p-4 bg-[#0d0d0d]">
                      <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest mb-2">→ $0 Validation Experiments</div>
                      <ul className="space-y-2">
                        {idea.experiments.map((exp, i) => (
                          <li key={i} className="text-xs font-mono text-neutral-300 leading-relaxed flex gap-2">
                            <span className="text-emerald-700 flex-shrink-0">{i + 1}.</span>
                            {exp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={onClose} className="text-[10px] font-mono text-[#444] uppercase tracking-widest hover:text-white transition cursor-pointer">
                  ← Dismiss
                </button>
                <button
                  onClick={handleAdvanceToGoals}
                  disabled={!critiqueReady}
                  className="bg-white text-black font-mono text-[10px] font-bold px-5 py-2.5 uppercase tracking-widest hover:bg-neutral-200 transition flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  This holds up <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GOALS */}
          {step === "goals" && (
            <div className="space-y-5">
              <div>
                <div className="text-[9px] font-mono text-[#444] uppercase tracking-widest mb-1">Define the win</div>
                <h2 className="text-white text-sm font-mono">What does winning look like?</h2>
              </div>

              {goalsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <span className="w-5 h-5 border-2 border-[#333] border-t-white rounded-full animate-spin" />
                  <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Building your roadmap...</p>
                </div>
              ) : (
                <>
                  <div className="border border-[#222] p-4 bg-[#0d0d0d]">
                    <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest mb-2">90-Day Goal</div>
                    <textarea
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      className="w-full bg-transparent text-white font-mono text-xs leading-relaxed outline-none resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="border border-[#222] bg-[#0d0d0d]">
                    <div className="border-b border-[#1a1a1a] px-4 py-2.5 flex items-center justify-between">
                      <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Weekly Tasks</div>
                      <div className="text-[9px] font-mono text-[#444]">Click to edit</div>
                    </div>
                    <div className="divide-y divide-[#1a1a1a]">
                      {tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                          <span className="text-[#333] font-mono text-[10px] flex-shrink-0">{i + 1}.</span>
                          {editingTask === i ? (
                            <input
                              autoFocus
                              value={task}
                              onChange={e => setTasks(prev => prev.map((t, j) => j === i ? e.target.value : t))}
                              onBlur={() => setEditingTask(null)}
                              onKeyDown={e => {
                                if (e.key === "Enter" || e.key === "Escape") setEditingTask(null);
                              }}
                              className="flex-1 bg-transparent text-white font-mono text-xs outline-none border-b border-neutral-700"
                            />
                          ) : (
                            <span
                              onClick={() => setEditingTask(i)}
                              className="flex-1 text-xs font-mono text-neutral-300 leading-relaxed cursor-text hover:text-white transition"
                            >
                              {task || <span className="text-[#444] italic">empty — click to add</span>}
                            </span>
                          )}
                          <button
                            onClick={() => setTasks(prev => prev.filter((_, j) => j !== i))}
                            className="text-[#333] hover:text-rose-400 transition cursor-pointer flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-[#1a1a1a]">
                      <button
                        onClick={() => {
                          setTasks(prev => [...prev, ""]);
                          setTimeout(() => setEditingTask(tasks.length), 0);
                        }}
                        className="text-[10px] font-mono text-[#444] uppercase tracking-widest hover:text-white transition cursor-pointer"
                      >
                        + Add task
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep("critique")} className="text-[10px] font-mono text-[#444] uppercase tracking-widest hover:text-white transition cursor-pointer">
                  ← Back
                </button>
                <button
                  onClick={() => setStep("launch")}
                  disabled={!goal.trim() || tasks.filter(t => t.trim()).length === 0 || goalsLoading}
                  className="bg-white text-black font-mono text-[10px] font-bold px-5 py-2.5 uppercase tracking-widest hover:bg-neutral-200 transition flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Lock it in <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LAUNCH */}
          {step === "launch" && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest mb-3">You're live.</div>
                <h2 className="text-white text-lg font-mono font-light leading-snug">{idea.title}</h2>
              </div>

              <div className="border border-emerald-500/30 p-4 bg-emerald-950/20">
                <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest mb-2">Your 90-Day Goal</div>
                <p className="text-xs font-mono text-neutral-200 leading-relaxed">{goal}</p>
              </div>

              <div className="border border-[#222] p-4 bg-[#0d0d0d]">
                <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest mb-3">
                  {tasks.filter(t => t.trim()).length} tasks locked in
                </div>
                <ul className="space-y-2">
                  {tasks.filter(t => t.trim()).map((t, i) => (
                    <li key={i} className="text-xs font-mono text-neutral-400 flex gap-2 leading-relaxed">
                      <span className="text-[#333] flex-shrink-0">→</span> {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center text-[10px] font-mono text-[#444] uppercase tracking-widest">
                Check your scoreboard daily · your pod is watching
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => onComplete(goal, tasks.filter(t => t.trim()))}
                  className="bg-emerald-500 text-black font-mono text-[10px] font-bold px-8 py-3 uppercase tracking-widest hover:bg-emerald-400 transition flex items-center gap-2 cursor-pointer"
                >
                  Go to Scoreboard <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
