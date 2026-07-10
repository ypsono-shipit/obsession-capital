import React, { useState, useEffect } from "react";
import { Terminal, Shield, Mail, Briefcase, User, Sparkles, Database, CheckCircle, ChevronRight, List } from "lucide-react";

interface Operator {
  name: string;
  hustle: string;
  status: "ACTIVE" | "STANDBY" | "INITIALIZING";
}

interface AsciiLandingProps {
  onActivate: (profile: { name: string; hustle: string; email: string }) => void;
  currentProfile?: { name: string; hustle: string; email: string } | null;
  onClose?: () => void;
}

const DEFAULT_OPERATORS: Operator[] = [
  { name: "Root Operator", hustle: "SEO Audit Micro-Agency", status: "ACTIVE" },
  { name: "cyber_hustler", hustle: "Niche Substack Curation", status: "ACTIVE" },
  { name: "quantum_coder", hustle: "API SaaS Boilerplates", status: "STANDBY" },
  { name: "zen_negotiator", hustle: "Enterprise Raise Coaching", status: "ACTIVE" },
];

export default function AsciiLanding({ onActivate, currentProfile, onClose }: AsciiLandingProps) {
  const [name, setName] = useState(currentProfile?.name || "");
  const [hustle, setHustle] = useState(currentProfile?.hustle || "");
  const [email, setEmail] = useState(currentProfile?.email || "");
  
  // Registration ledger
  const [operators, setOperators] = useState<Operator[]>([]);
  
  // Boot and error states
  const [error, setError] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [currentLogIdx, setCurrentLogIdx] = useState(0);

  // Load live operators from Supabase
  useEffect(() => {
    fetch("/api/operators")
      .then(r => r.json())
      .then((data: Operator[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setOperators(data);
        } else {
          setOperators(DEFAULT_OPERATORS);
        }
      })
      .catch(() => setOperators(DEFAULT_OPERATORS));
  }, []);

  // Boot sequence logs to print on successful sign-up
  const BOOT_STEPS = [
    "SYS_INIT: ESTABLISHING SECURE SUBNET PROXIES...",
    "SYS_INIT: MOUNTING COGNITIVE DATA BLOCK CHAINS...",
    "SYS_INIT: RETRIEVING REGISTERED DISTRIBUTED LEDGER...",
    "SYS_INIT: REGISTRY FOUND. ATTACHING CURRENT OPERATOR...",
    "SYS_INIT: PARSING INTERACTIVE OBSESSION MATRIX...",
    "SYS_INIT: PRE-HEATING MULTI-STREAM HEATMAP CELLS...",
    "SYS_INIT: ESTABLISHING COMMS LINK WITH ALPHA_EARNERS COHORT...",
    "SYS_INIT: DOWNLOADING CRITICAL SUBREDDIT OPPORTUNITY METRICS...",
    "SYS_INIT: AI CO-PILOT INITIALIZATION IN PROGRESS...",
    "SYS_INIT: GEMINI LARGE COGNITIVE ENGINE STATUS... ONLINE_READY",
    "SYS_INIT: CONSOLE ACTIVATED. PREVIEWING OBSESSION OS SCOREBOARD..."
  ];

  // Run boot logger sequence
  useEffect(() => {
    if (!isBooting) return;

    if (currentLogIdx < BOOT_STEPS.length) {
      const timer = setTimeout(() => {
        setBootLogs((prev) => [...prev, BOOT_STEPS[currentLogIdx]]);
        setCurrentLogIdx((prev) => prev + 1);
      }, 180 + Math.random() * 150); // random natural typing pauses
      return () => clearTimeout(timer);
    } else {
      // Boot complete, transition to dashboard
      const endTimer = setTimeout(() => {
        onActivate({ name, hustle, email });
        setIsBooting(false);
        setBootLogs([]);
        setCurrentLogIdx(0);
      }, 600);
      return () => clearTimeout(endTimer);
    }
  }, [isBooting, currentLogIdx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("OPERATOR CALLSIGN REQUIRED.");
      return;
    }
    if (!hustle.trim()) {
      setError("ACTIVE COGNITIVE INITIATIVE / SIDE HUSTLE REQUIRED.");
      return;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setError("SECURE TRANSMISSION CHANNEL (VALID EMAIL) REQUIRED.");
      return;
    }

    // Start boot sequence animation
    setIsBooting(true);
    setBootLogs([`SYS_INIT: INITIATING SYSTEM ACCESS FOR OPERATOR: ${newOp.name.toUpperCase()}...`]);
    setCurrentLogIdx(0);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#d1d1d1] font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-white selection:text-black">
      
      {/* Top Banner Accent */}
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center text-[10px] text-neutral-600 border-b border-neutral-900 pb-3 mb-6 select-none">
        <div>SYS_GATEWAY: //PORTAL_3000</div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>GATEWAY STATUS: READY_FOR_ACTIVATION</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center my-4 space-y-8">
        
        {/* ASCII Header Frame */}
        <div className="text-center overflow-x-auto select-none no-scrollbar py-2">
          <pre className="text-emerald-500 font-mono text-[10px] md:text-xs leading-none inline-block text-left whitespace-pre">
{`   ____  ____   ____  _____ ____ ____ ___ ___  _   _    ___  ____  
  / __ \\|  _ \\ / ___|| ____/ ___/ ___|_ _/ _ \\| \\ | |  / _ \\/ ___| 
 | |  | | |_) |\\___ \\|  _| \\___ \\___ \\ | | | | |  \\| | | | | \\___ \\ 
 | |__| |  _ <  ___) | |___ ___) |__) ) | |_| | |\\  | | |_| |___) |
  \\____/|_| \\_\\|____/|_____|____/____/___\\___/|_| \\_|  \\___/|____/ `}
          </pre>
          <div className="text-[10px] tracking-widest text-[#888] font-bold uppercase mt-3">
            [ S Y S T E M   I N I T I A L I Z A T I O N   P O R T A L ]
          </div>
        </div>

        {isBooting ? (
          /* BOOT SEQUENCE CONSOLE WRAPPER */
          <div className="border border-emerald-500/40 bg-[#090909] p-6 shadow-lg shadow-emerald-950/20 max-w-xl mx-auto w-full animate-pulse">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4">
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-2">
                <Terminal className="w-4 h-4 animate-spin text-emerald-400" />
                CONSOLE BOOT SEQUENCE ACTIVE
              </span>
              <span className="text-[10px] text-emerald-500/60 font-mono">
                {Math.round((currentLogIdx / BOOT_STEPS.length) * 100)}% COMPLETE
              </span>
            </div>

            {/* Scrolling Logs Panel */}
            <div className="space-y-2 h-64 overflow-y-auto font-mono text-[10px] text-emerald-400 leading-relaxed scrollbar-none pr-2">
              {bootLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-1">
                  <span className="text-emerald-600 font-bold select-none">&gt;</span>
                  <span className="whitespace-pre-wrap">{log}</span>
                </div>
              ))}
              <div className="flex items-center gap-1 mt-1 text-white">
                <span className="text-emerald-500 font-bold select-none">&gt;</span>
                <span className="bg-emerald-500/30 text-white px-1.5 py-0.5 animate-pulse rounded-xs uppercase tracking-wider text-[9px] font-bold">
                  {currentLogIdx < BOOT_STEPS.length ? "BOOTING_UP..." : "LOADING SCOREBOARD_OS..."}
                </span>
                <span className="w-1.5 h-3 bg-emerald-500 caret-blink inline-block"></span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-500/20 flex justify-between text-[9px] text-emerald-600 select-none uppercase">
              <span>SECURE_IP: ENCRYPTED_AES256</span>
              <span>NODE: SH-X92-HQ</span>
            </div>
          </div>
        ) : (
          /* TWO-COLUMN LAYOUT: SIGN-UP FORM & OPERATOR LEDGER */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: INTERACTIVE ACTIVATION FORM */}
            <div className="md:col-span-6 relative border border-neutral-800 bg-[#0a0a0a] p-6 shadow-md">
              <div className="absolute top-[-10px] left-[15px] bg-[#050505] px-2 text-[10px] text-emerald-400 tracking-wider uppercase font-bold">
                SYSTEM REGISTER & LOGIN
              </div>
              
              <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                Welcome to <span className="text-white font-semibold">Obsession OS</span>. 
                Enter your terminal credentials below to seed your personalized high-intensity side hustle scoreboard, 
                unlock AI-powered opportunity audits, and establish your status in the distributed operator community.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name Input */}
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    Operator Callsign (Name)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={24}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Neo, Jane Doe, Root Operator"
                      className="w-full bg-[#0d0d0d] border border-neutral-800 p-2.5 pl-3 text-white font-mono focus:outline-none focus:border-emerald-500 text-xs transition-colors rounded-none placeholder:text-neutral-700"
                    />
                  </div>
                </div>

                {/* Side Hustle Input */}
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                    Active Cognitive Hustle
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={32}
                      value={hustle}
                      onChange={(e) => setHustle(e.target.value)}
                      placeholder="e.g. SEO speed audits, micro-SaaS"
                      className="w-full bg-[#0d0d0d] border border-neutral-800 p-2.5 pl-3 text-white font-mono focus:outline-none focus:border-emerald-500 text-xs transition-colors rounded-none placeholder:text-neutral-700"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    Secure Transmission Channel (Email)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. operator@obsessionos.net"
                      className="w-full bg-[#0d0d0d] border border-neutral-800 p-2.5 pl-3 text-white font-mono focus:outline-none focus:border-emerald-500 text-xs transition-colors rounded-none placeholder:text-neutral-700"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-rose-950/20 border border-rose-900/40 text-rose-400 font-mono text-[10px] leading-relaxed uppercase">
                    <div className="font-bold flex items-center gap-1.5 mb-0.5">
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      [!] GATEWAY_REJECTED
                    </div>
                    {error}
                  </div>
                )}

                {/* Submission Action Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/10 active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-black animate-pulse" />
                  INITIALIZE OBSESSION OS
                </button>
                
                {currentProfile && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-all cursor-pointer text-xs uppercase font-mono tracking-wider"
                  >
                    Return to Scoreboard
                  </button>
                )}
              </form>
            </div>

            {/* COLUMN 2: ACTIVE REGISTERED OPERATORS LEDGER (ASCII TABLE) */}
            <div className="md:col-span-6 relative border border-neutral-800 bg-[#0a0a0a] p-6 shadow-md flex flex-col h-full self-stretch justify-between">
              <div>
                <div className="absolute top-[-10px] left-[15px] bg-[#050505] px-2 text-[10px] text-emerald-400 tracking-wider uppercase font-bold">
                  DISTRIBUTED OPERATOR REGISTER
                </div>
                
                <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-500/80" />
                    Distributed Operational Ledger
                  </span>
                  <span className="text-[9px] text-neutral-600 font-mono">
                    {operators.length} PEERS CONNECTED
                  </span>
                </div>

                <p className="text-[#888] text-[10px] leading-relaxed mb-4">
                  Real-time synchronization log of operators who activated console grids. Join other micro-SaaS builders and niche marketers in the operational circles.
                </p>

                {/* ASCII Ledger Grid Layout */}
                <div className="border border-neutral-900 bg-black/40 overflow-x-auto rounded-none text-[10px] font-mono leading-none">
                  {/* Ledger Table Headers */}
                  <div className="grid grid-cols-12 border-b border-neutral-900 bg-neutral-950 p-2 text-neutral-500 uppercase tracking-wider font-bold">
                    <span className="col-span-4">CALLSIGN</span>
                    <span className="col-span-5">COGNITIVE HUSTLE</span>
                    <span className="col-span-3 text-right">STATUS</span>
                  </div>

                  {/* Ledger Rows */}
                  <div className="divide-y divide-neutral-900/40 max-h-56 overflow-y-auto no-scrollbar">
                    {operators.map((op, idx) => (
                      <div 
                        key={idx} 
                        className={`grid grid-cols-12 p-2 hover:bg-neutral-900/30 transition-colors items-center ${
                          name && op.name.toLowerCase() === name.toLowerCase() ? "bg-emerald-950/20 text-emerald-400 border-l-2 border-l-emerald-500 pl-1.5" : "text-neutral-300"
                        }`}
                      >
                        <span className="col-span-4 truncate font-semibold pr-1">
                          {op.name}
                        </span>
                        <span className="col-span-5 truncate text-neutral-400 text-[9px] uppercase pr-1">
                          {op.hustle}
                        </span>
                        <span className="col-span-3 text-right">
                          <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold rounded-xs tracking-wider border ${
                            op.status === "ACTIVE" 
                              ? "bg-emerald-950/50 text-emerald-400 border-emerald-900/50" 
                              : "bg-amber-950/40 text-amber-500 border-amber-900/30"
                          }`}>
                            {op.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secure Key Metadata Box */}
              <div className="mt-6 p-3 bg-[#0c0c0c] border border-neutral-900 text-[9px] text-neutral-600 leading-relaxed font-mono space-y-1">
                <div className="font-bold text-neutral-500 flex items-center gap-1 uppercase">
                  <CheckCircle className="w-3 h-3 text-emerald-500/60" />
                  LEDGER CRYPTO ACCENTS
                </div>
                <div>SECURE_SHIELD: LOCAL_PERSISTENCE_LAYER_V2</div>
                <div>HASH_IDENTIFIER: SHA256//OB_OS_GATEWAY_INTEGRITY</div>
                <div>TRANS_PROTOCOL: HTTPS_TLS_P2P</div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Footer System Details */}
      <div className="max-w-4xl mx-auto w-full pt-6 border-t border-neutral-900 mt-6 text-center text-[9px] text-neutral-600 font-mono flex flex-col sm:flex-row justify-between items-center gap-2 select-none uppercase">
        <span>OBSESSION MATRIX TERMINAL GATEWAY © 2026 // RETRO OPERATING MATRIX</span>
        <span>ACCESS GRANTED FOR SECURED OPERATORS ONLY</span>
      </div>

    </div>
  );
}
