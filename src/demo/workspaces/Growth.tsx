import React, { useState } from "react";
import { Sparkles, Instagram, Star, TrendingUp, RefreshCw, Copy, Check, BarChart2, Users } from "lucide-react";
import { SOCIAL_POSTS } from "../data/mockData";

const PLATFORMS = ["Instagram", "TikTok", "Facebook"];
const TONES = ["Warm & Personal", "Bold & Punchy", "Professional", "Casual & Fun"];
const GOALS = ["Drive foot traffic", "Promote item", "Build brand", "Flash sale"];

const AI_POSTS: Record<string, string[]> = {
  "Drive foot traffic": [
    "☕ Start your Saturday right.\n\nFresh matcha, warm sourdough, and a corner table waiting just for you.\n\nKopi Cafe · Tiong Bahru · Open 8am–9pm",
    "We know you're choosing between staying in or coming out.\n\nHere's your sign. 🍃\n\n#TiongBahru #KopiCafe #SaturdayVibes",
  ],
  "Promote item": [
    "Our Iced Matcha Latte isn't just a drink — it's a ritual. 🍵\n\n4 simple ingredients. Zero compromise.\n\nTry it at S$6.50 · Kopi Cafe, Tiong Bahru",
    "The drink your friends keep asking about is back in stock. Limited batch matcha, now available all day.\n\n#MatchaLatte #SingaporeCafe",
  ],
  "Build brand": [
    "2 years ago, we started with one recipe and a dream.\n\nToday, we're serving 200+ cups a day.\n\nThank you for making Kopi Cafe your second home. 🙏",
    "We're obsessed with quality. Every cup. Every day.\n\nBecause you deserve nothing less than the best Singapore has to offer.",
  ],
  "Flash sale": [
    "⚡ FLASH: Next 2 hours only.\n\nAny coffee + pastry for S$10.\nWalk in, show this post, done.\n\nKopi Cafe · Tiong Bahru · Today only",
    "🔥 Happy Hour starts NOW.\n\nAll cold brews 1-for-1 until 6pm.\n\nSee you soon 👋",
  ],
};

const METRICS = [
  { label: "Followers", value: "4,820", change: "+124 this month", up: true },
  { label: "Avg Reach", value: "2,100", change: "+31% vs last month", up: true },
  { label: "Engagement", value: "6.2%", change: "+0.8% vs last month", up: true },
  { label: "Posts This Month", value: "12", change: "4 scheduled", up: true },
];

export default function Growth() {
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Warm & Personal");
  const [goal, setGoal] = useState("Drive foot traffic");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const generate = () => {
    setGenerating(true);
    setGenerated([]);
    setTimeout(() => {
      setGenerated(AI_POSTS[goal] || AI_POSTS["Drive foot traffic"]);
      setGenerating(false);
    }, 1600);
  };

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0D0D0D]">

      {/* Header */}
      <div>
        <h2 className="text-white text-lg font-bold">Growth OS</h2>
        <p className="text-white/40 text-xs mt-0.5">AI-generated content, social performance & customer growth</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {METRICS.map(m => (
          <div key={m.label} className="bg-[#1A1A1A] border border-white/6 rounded-xl p-4">
            <div className="text-white/40 text-xs mb-1.5">{m.label}</div>
            <div className="text-white text-xl font-bold">{m.value}</div>
            <div className={`text-xs mt-1 ${m.up ? "text-emerald-400" : "text-red-400"}`}>{m.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Post Generator */}
        <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} className="text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">AI Post Generator</h3>
          </div>

          {/* Platform */}
          <div className="mb-4">
            <div className="text-white/40 text-xs mb-2">Platform</div>
            <div className="flex gap-1.5">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`text-xs px-3 py-2 rounded-lg font-medium flex-1 transition-all
                    ${platform === p ? "bg-emerald-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="mb-4">
            <div className="text-white/40 text-xs mb-2">Campaign Goal</div>
            <div className="grid grid-cols-2 gap-1.5">
              {GOALS.map(g => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition-all
                    ${goal === g ? "bg-emerald-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="mb-5">
            <div className="text-white/40 text-xs mb-2">Tone</div>
            <div className="grid grid-cols-2 gap-1.5">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition-all
                    ${tone === t ? "bg-white/15 text-white border border-white/20" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            {generating ? (
              <><RefreshCw size={14} className="animate-spin" /> Generating...</>
            ) : (
              <><Sparkles size={14} /> Generate Posts</>
            )}
          </button>

          {/* Generated posts */}
          {generated.length > 0 && (
            <div className="mt-4 space-y-3">
              {generated.map((post, i) => (
                <div key={i} className="bg-white/4 border border-white/8 rounded-xl p-4">
                  <pre className="text-white/75 text-xs leading-relaxed font-sans whitespace-pre-wrap">{post}</pre>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => copy(post, i)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all
                        ${copied === i ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/50 hover:text-white/80"}`}
                    >
                      {copied === i ? <Check size={11} /> : <Copy size={11} />}
                      {copied === i ? "Copied!" : "Copy"}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white/70 transition-all">
                      <Instagram size={11} />
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Posts + Social Feed */}
        <div className="space-y-3">
          {/* Upcoming posts */}
          <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Scheduled Posts</h3>
            <div className="space-y-3">
              {SOCIAL_POSTS.map(p => (
                <div key={p.id} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 text-base">
                    {p.platform === "Instagram" ? "📸" : p.platform === "TikTok" ? "🎵" : "👍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white/60 text-xs font-medium">{p.platform}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                        ${p.status === "scheduled" ? "bg-blue-500/15 text-blue-400" : p.status === "published" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs truncate">{p.caption}</p>
                    <div className="text-white/25 text-[10px] mt-1">{p.scheduledFor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth tip */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={13} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold">AI Growth Tip</span>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              Post your Matcha content between <span className="text-white/80 font-medium">Sat 10–11am</span> for maximum reach —
              your audience is most active then and your Matcha Latte has 34% higher engagement than your other menu posts.
            </p>
            <button className="mt-3 text-emerald-400 text-xs font-medium hover:text-emerald-300">Schedule for this Saturday →</button>
          </div>

          {/* Reviews */}
          <div className="bg-[#1A1A1A] border border-white/6 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Recent Reviews</h3>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-bold">4.8</span>
                <span className="text-white/30 text-xs">(127)</span>
              </div>
            </div>
            {[
              { name: "Jun H.", stars: 5, text: "Best matcha in Tiong Bahru by far! The vibe is perfect." },
              { name: "Sarah T.", stars: 5, text: "Love the new seating area. Staff so friendly too." },
              { name: "Ravi M.", stars: 4, text: "Great food, slightly slow on Sundays but worth it." },
            ].map((r, i) => (
              <div key={i} className="py-2.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {Array(r.stars).fill(0).map((_, s) => (
                      <Star key={s} size={10} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-white/60 text-xs font-medium">{r.name}</span>
                </div>
                <p className="text-white/40 text-xs">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
