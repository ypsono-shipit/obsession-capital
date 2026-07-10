import React, { useState, useRef, useEffect } from "react";
import { Bot, Zap, Send, ChevronRight, Sparkles } from "lucide-react";
import { AI_MESSAGES } from "../data/mockData";

const AGENTS = [
  { id: "admin", label: "Admin Agent", icon: "🛠", color: "bg-blue-500/20 text-blue-400" },
  { id: "supply", label: "Supply Agent", icon: "📦", color: "bg-purple-500/20 text-purple-400" },
  { id: "menu", label: "Menu Agent", icon: "🍽", color: "bg-orange-500/20 text-orange-400" },
];

const QUICK_PROMPTS = [
  "What should I reorder?",
  "Explain why margins dropped",
  "Best items to promote this weekend?",
  "Compare supplier pricing",
];

export default function AIPanel() {
  const [messages, setMessages] = useState(AI_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeAgent, setActiveAgent] = useState("admin");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { agent: "You", time: "now", message: text, action: null, sub: null };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const replies: Record<string, string> = {
        "What should I reorder?": "Based on current stock levels and your sales velocity, I recommend: Fresh Milk (1.2L left, runs out tomorrow), Sourdough Bread (12 loaves, 1 day left), and Avocado (2.3kg, 2 days left). Total reorder cost estimate: S$127.40.",
        "Explain why margins dropped": "Your gross margin dipped 1.8% last Tuesday due to a 22% spike in milk usage (Iced Matcha Latte sold 67 units vs 45 avg) and a delivery surcharge from Poultry Plus. I'd recommend switching to Supplier B for chicken to recover S$28.40/week.",
        "Best items to promote this weekend?": "Promote Iced Matcha Latte (S$1.42 margin/serve, trending up 34%) and Cold Brew (S$2.10 margin/serve). I've drafted 2 Instagram posts and 1 TikTok for your Growth OS review.",
        "Compare supplier pricing": "Fresh Milk: Current S$3.50/L vs Supplier B S$3.22/L (saves 8%). Chicken: Current S$8.90/kg vs Poultry Direct S$8.45/kg (saves 5%). Combined annual savings: ~S$1,460.",
      };
      const reply = replies[text] || "I'm analysing your business data right now. Give me a moment to pull the latest insights from your inventory, finance, and menu modules...";
      setMessages(prev => [...prev, {
        agent: AGENTS.find(a => a.id === activeAgent)?.label || "Admin Agent",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        message: reply,
        action: null,
        sub: null,
      }]);
      setTyping(false);
    }, 1400);
  };

  return (
    <aside className="w-[280px] flex-shrink-0 bg-[#111111] border-l border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-white text-sm font-semibold">AI Agents</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs">Active</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {AGENTS.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveAgent(a.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-all text-center
                ${activeAgent === a.id ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/5 bg-white/3 hover:bg-white/8"}`}
            >
              <span className="text-base">{a.icon}</span>
              <span className={`text-[9px] font-medium leading-tight ${activeAgent === a.id ? "text-emerald-400" : "text-white/40"}`}>
                {a.label.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((m, i) => {
          const isUser = m.agent === "You";
          return (
            <div key={i} className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={13} className="text-white/60" />
                </div>
              )}
              <div className={`max-w-[86%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {!isUser && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/50 text-[10px] font-medium">{m.agent}</span>
                    <span className="text-white/25 text-[10px]">{m.time}</span>
                  </div>
                )}
                <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed
                  ${isUser ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-white/8 text-white/75 rounded-tl-sm"}`}>
                  {m.message}
                </div>
                {m.sub && (
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-full">
                    <p className="text-white/50 text-[10px] whitespace-pre-line leading-relaxed">{m.sub}</p>
                  </div>
                )}
                {m.action && (
                  <button className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium hover:text-emerald-300 transition-colors">
                    {m.action} <ChevronRight size={10} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Bot size={13} className="text-white/60" />
            </div>
            <div className="bg-white/8 rounded-xl px-3 py-2.5 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-3 pb-2">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {QUICK_PROMPTS.slice(0, 2).map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-[10px] text-white/50 bg-white/5 border border-white/8 rounded-full px-2.5 py-1 hover:bg-white/10 hover:text-white/70 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="Ask AI anything..."
            className="flex-1 bg-transparent text-xs text-white/70 placeholder-white/25 outline-none"
          />
          <button
            onClick={() => send(input)}
            className="text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
