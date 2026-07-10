import React, { useState, useRef } from "react";
import { ArrowRight, Github, Briefcase, X } from "lucide-react";

interface Props {
  onSubmit: (idea: string, github: string, bizInfo: string) => void;
  loading?: boolean;
}

export default function ForgeHero({ onSubmit, loading }: Props) {
  const [idea, setIdea] = useState("");
  const [github, setGithub] = useState("");
  const [bizInfo, setBizInfo] = useState("");
  const [showGithub, setShowGithub] = useState(false);
  const [showBiz, setShowBiz] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasAttachments = showGithub || showBiz;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    onSubmit(idea.trim(), github.trim(), bizInfo.trim());
    setIdea("");
    setGithub("");
    setBizInfo("");
    setShowGithub(false);
    setShowBiz(false);
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "55vh" }}>
      {/* Video background */}
      <video
        src="/ascii-magic-2.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
      />

      {/* Dark overlay gradient — denser at bottom so chat bar reads clearly */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070707]/40 via-[#070707]/50 to-[#070707]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 py-12" style={{ minHeight: "55vh" }}>

        {/* Headline */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h1
            className="font-light uppercase text-white leading-none tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.02em" }}
          >
            How will you win?
          </h1>
          <p className="text-white/30 font-mono text-xs uppercase tracking-widest mt-4">
            Describe your idea · attach your repo · share your context
          </p>
        </div>

        {/* Chat bar */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-[#333] focus-within:border-neutral-500 transition-colors">

            {/* Main input row */}
            <div className="flex items-end gap-2 p-3">
              <textarea
                ref={textareaRef}
                value={idea}
                onChange={e => { setIdea(e.target.value); autoResize(e.target); }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                placeholder="Describe your business idea, side hustle, or what you're building..."
                rows={1}
                className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder-neutral-600 resize-none leading-relaxed"
                style={{ maxHeight: "200px" }}
              />

              <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
                <button
                  type="button"
                  onClick={() => setShowGithub(v => !v)}
                  className={`p-1.5 transition cursor-pointer ${showGithub ? "text-white" : "text-neutral-600 hover:text-neutral-400"}`}
                  title="Attach GitHub repo"
                >
                  <Github className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowBiz(v => !v)}
                  className={`p-1.5 transition cursor-pointer ${showBiz ? "text-white" : "text-neutral-600 hover:text-neutral-400"}`}
                  title="Add business context"
                >
                  <Briefcase className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!idea.trim() || loading}
                  className="ml-1 bg-white text-black p-2 hover:bg-neutral-200 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    : <ArrowRight className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Attachment panels — expand downward */}
            {showGithub && (
              <div className="border-t border-[#222] p-3 flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                <input
                  autoFocus
                  type="url"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder-neutral-700"
                />
                <button type="button" onClick={() => { setShowGithub(false); setGithub(""); }} className="text-neutral-600 hover:text-white transition cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {showBiz && (
              <div className="border-t border-[#222] p-3 flex items-start gap-2">
                <Briefcase className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0 mt-0.5" />
                <textarea
                  autoFocus={!showGithub}
                  value={bizInfo}
                  onChange={e => setBizInfo(e.target.value)}
                  placeholder="Current business info — revenue, model, traction, constraints..."
                  rows={3}
                  className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder-neutral-700 resize-none leading-relaxed"
                />
                <button type="button" onClick={() => { setShowBiz(false); setBizInfo(""); }} className="text-neutral-600 hover:text-white transition cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </form>

        </div>

      </div>
    </div>
  );
}
