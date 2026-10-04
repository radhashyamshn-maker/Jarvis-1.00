import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Wind } from 'lucide-react';
import { specialEvents } from '../lib/specialEvents';
import { playMeditationBell } from '../lib/audioEffects';

export const BreathingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [countdown, setCountdown] = useState<number>(4);

  useEffect(() => {
    const unsub = specialEvents.on('start_breathing', () => {
      setIsOpen(true);
      playMeditationBell();
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let currentPhase: 'Inhale' | 'Hold' | 'Exhale' = 'Inhale';
    let count = 4;
    setPhase('Inhale');
    setCountdown(4);

    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (currentPhase === 'Inhale') {
          currentPhase = 'Hold';
          count = 7;
        } else if (currentPhase === 'Hold') {
          currentPhase = 'Exhale';
          count = 8;
        } else {
          currentPhase = 'Inhale';
          count = 4;
          playMeditationBell();
        }
        setPhase(currentPhase);
      }
      setCountdown(count);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl glass-panel border border-cyan-500/30 p-6 text-white text-center shadow-[0_0_50px_rgba(6,182,212,0.25)] relative"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 text-cyan-400 font-mono text-xs tracking-widest uppercase">
          <Wind className="w-4 h-4" />
          <span>4-7-8 RELAXATION MATRIX</span>
        </div>
        <p className="text-xs text-slate-400 mb-8 font-sans">
          Follow the core rhythm, Sir. Let your stress fade away.
        </p>

        {/* Breathing Orb */}
        <div className="relative flex items-center justify-center w-48 h-48 mx-auto my-4">
          <motion.div
            animate={{
              scale: phase === 'Inhale' ? 1.5 : phase === 'Hold' ? 1.5 : 1,
              opacity: phase === 'Hold' ? 0.9 : 0.6,
            }}
            transition={{
              duration: phase === 'Inhale' ? 4 : phase === 'Hold' ? 0.3 : 8,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                phase === 'Inhale'
                  ? 'radial-gradient(circle, #22d3ee 0%, #0891b2 50%, transparent 75%)'
                  : phase === 'Hold'
                  ? 'radial-gradient(circle, #a855f7 0%, #6b21a8 50%, transparent 75%)'
                  : 'radial-gradient(circle, #ec4899 0%, #be185d 50%, transparent 75%)',
              filter: 'blur(20px)',
            }}
          />

          <motion.div
            animate={{
              scale: phase === 'Inhale' ? 1.3 : phase === 'Hold' ? 1.3 : 0.9,
            }}
            transition={{
              duration: phase === 'Inhale' ? 4 : phase === 'Hold' ? 0.3 : 8,
              ease: 'easeInOut',
            }}
            className="relative z-10 w-28 h-28 rounded-full border-2 border-white/40 flex flex-col items-center justify-center shadow-2xl"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
            }}
          >
            <span className="font-mono text-2xl font-extrabold">{countdown}</span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-cyan-300">
              {phase}
            </span>
          </motion.div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="mt-6 w-full py-2.5 rounded-xl bg-cyan-600/50 hover:bg-cyan-600 font-mono text-xs tracking-wider uppercase"
        >
          COMPLETE SESSION
        </button>
      </motion.div>
    </div>
  );
};
