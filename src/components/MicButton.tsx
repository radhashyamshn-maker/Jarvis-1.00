import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import type { SessionState } from '../lib/LiveSession';

interface MicButtonProps {
  state: SessionState;
  onClick: () => void;
  disabled?: boolean;
}

export const MicButton: React.FC<MicButtonProps> = ({ state, onClick, disabled }) => {
  const isActive = state !== 'disconnected';
  const isConnecting = state === 'connecting';
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  const handleClick = () => {
    if (disabled) return;
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // ignore
    }
    onClick();
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* 1. Halo Pulse (Always active when session is running) */}
      {isActive && (
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: isSpeaking ? 1.6 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute h-48 w-48 sm:h-56 sm:w-56 rounded-full pointer-events-none"
          style={{
            background: isSpeaking
              ? 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(34,211,238,0.2) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,46,196,0.4) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)',
            filter: 'blur(16px)',
          }}
        />
      )}

      {/* 2. Rotating ring when connecting */}
      {isConnecting && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-3 rounded-full border-2 border-dashed border-cyan-400/70 pointer-events-none"
        />
      )}

      {/* 3. Expanding pink ring when listening */}
      {isListening && (
        <motion.div
          animate={{
            scale: [0.95, 1.35, 1.5],
            opacity: [0.8, 0.3, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute -inset-4 rounded-full border-2 border-pink-500/80 pointer-events-none"
        />
      )}

      {/* 4. Double expanding purple + cyan rings when speaking */}
      {isSpeaking && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.4, 1.6],
              opacity: [0.85, 0.4, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className="absolute -inset-5 rounded-full border-2 border-purple-500/80 pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1.75],
              opacity: [0.75, 0.25, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.4,
            }}
            className="absolute -inset-5 rounded-full border-2 border-cyan-400/70 pointer-events-none"
          />
        </>
      )}

      {/* 5. Main 36x36 (9rem / 144px) Touch Button */}
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        whileTap={{ scale: 0.94 }}
        className={`relative z-10 h-36 w-36 sm:h-40 sm:w-40 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl focus:outline-none ${
          isActive
            ? 'neon-gradient-btn text-white shadow-pink-500/30 ring-4 ring-pink-500/20'
            : 'glass text-slate-200 hover:text-white hover:border-pink-500/40 shadow-black/60'
        }`}
        style={{
          boxShadow: isActive
            ? '0 0 35px rgba(255, 46, 196, 0.45), 0 0 70px rgba(139, 92, 246, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        }}
        aria-label={isActive ? 'End session' : 'Talk with JARVIS'}
      >
        <AnimatePresence mode="wait">
          {isConnecting ? (
            <motion.div
              key="connecting"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <Loader2 className="w-10 h-10 animate-spin text-cyan-300" />
              <span className="text-[11px] tracking-wider uppercase font-semibold text-cyan-200 mt-1">
                Connecting
              </span>
            </motion.div>
          ) : isActive ? (
            <motion.div
              key="active"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <Square className="w-9 h-9 fill-current text-white drop-shadow" />
              <span className="text-[11px] tracking-wider uppercase font-semibold text-pink-100 mt-1">
                Stop
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="relative">
                <Mic className="w-10 h-10 text-white/90 group-hover:text-white transition-colors" />
                <motion.div
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-neon-pink"
                />
              </div>
              <span className="text-[11px] tracking-widest uppercase font-medium text-slate-300">
                Tap to Talk
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
