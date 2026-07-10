import { motion, AnimatePresence } from "motion/react";
import { Trophy, Check, Flame, X, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface MilestoneCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyGoal: number;
  currentSum: number;
  metricUnit: string;
  metricName: string;
}

export default function MilestoneCelebration({
  isOpen,
  onClose,
  weeklyGoal,
  currentSum,
  metricUnit,
  metricName,
}: MilestoneCelebrationProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate randomized celebratory confetti particles on open
      const newParticles = Array.from({ length: 40 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 200;
        const colors = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#ffffff"];
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 20,
          size: 4 + Math.random() * 6,
          delay: Math.random() * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
      setParticles(newParticles);
    }
  }, [isOpen]);

  const percentage = Math.round((currentSum / weeklyGoal) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Backdrop Tap to Close */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          {/* Celebration Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { type: "spring", stiffness: 120, damping: 15 } 
            }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg bg-[#080808] border border-emerald-500/30 p-8 rounded-none overflow-hidden select-none shadow-[0_0_50px_rgba(16,185,129,0.15)]"
          >
            {/* Ambient radar rotation border line */}
            <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Calibration details corner overlay */}
            <div className="absolute top-0 right-0 bg-emerald-950/40 border-l border-b border-emerald-500/20 px-3 py-1 font-mono text-[9px] text-emerald-400 tracking-wider">
              MILESTONE_SUCCESS_OS
            </div>

            {/* Corner Bracket Elements */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500/60 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500/60 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500/60 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500/60 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-900 transition z-10"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Particle Burst Effects */}
            <div className="absolute left-1/2 top-1/3 pointer-events-none">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    opacity: 0,
                    scale: 1,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 1.2 + Math.random() * 0.8,
                    delay: p.delay,
                    ease: "easeOut",
                  }}
                  style={{
                    position: "absolute",
                    width: p.size,
                    height: p.size,
                    borderRadius: "50%",
                    backgroundColor: p.color,
                    boxShadow: `0 0 10px ${p.color}`,
                  }}
                />
              ))}
            </div>

            {/* Main Trophy Icon & Glow */}
            <div className="flex flex-col items-center text-center mt-4">
              <motion.div
                initial={{ rotate: -15, scale: 0.5 }}
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0], 
                  scale: 1,
                  transition: { 
                    delay: 0.15, 
                    duration: 1.5, 
                    type: "spring",
                    stiffness: 100 
                  } 
                }}
                className="relative bg-emerald-950/50 border border-emerald-500/50 p-5 rounded-full mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <Trophy className="w-12 h-12 text-emerald-400" />
                <motion.div 
                  className="absolute -top-1 -right-1 bg-amber-500 p-1.5 rounded-full border border-neutral-950"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Flame className="w-3.5 h-3.5 text-black fill-black" />
                </motion.div>
              </motion.div>

              {/* Title Header */}
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                className="font-mono text-lg uppercase tracking-widest text-emerald-400 font-bold"
              >
                100% Weekly Goal Reached
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                className="text-[10px] font-mono text-neutral-500 uppercase mt-1 tracking-wider"
              >
                Obsession Threshold Fully Saturated & Verified
              </motion.p>

              {/* Giant Metric Readout */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { delay: 0.5 } }}
                className="my-6 px-8 py-4 bg-neutral-950 border border-neutral-900 w-full relative"
              >
                <div className="text-[9px] font-mono text-emerald-500 absolute top-1.5 left-2 uppercase tracking-widest">
                  Signal Output Saturated
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-neutral-500 block uppercase">Weekly Saturated Accumulation</span>
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {currentSum.toLocaleString()} <span className="text-xs text-neutral-400">{metricUnit}</span>
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-neutral-500 block uppercase">Target Ratio</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Growth indicator bar */}
                <div className="w-full bg-neutral-900 h-1.5 mt-4 relative overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, percentage)}%` }}
                    transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                    className="bg-emerald-500 h-full relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[pulse_2s_infinite]" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Congratulatory copy */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.75 } }}
                className="text-center font-mono text-[11px] text-neutral-400 leading-relaxed max-w-sm mb-6"
              >
                "You have breached your weekly metric benchmark of <span className="text-white font-bold">{weeklyGoal} {metricUnit}</span> of <span className="text-white">{metricName}</span>. System is running at high productivity index. Keep compiling momentum."
              </motion.div>

              {/* Action Trigger Close buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.9 } }}
                className="w-full flex gap-3"
              >
                <button
                  id="celebrate-dismiss-btn"
                  onClick={onClose}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs py-3 font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer rounded-none shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
                >
                  <Sparkles className="w-4 h-4" />
                  Keep Crushing It
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
