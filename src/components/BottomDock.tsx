import React from 'react';
import { motion } from 'framer-motion';
import { Power, Eye, Mic, Square, Loader2, Grid, Settings } from 'lucide-react';
import type { SessionState } from '../lib/LiveSession';

interface BottomDockProps {
  state: SessionState;
  onMicToggle: () => void;
  onVisionClick: () => void;
  onHistoryClick: () => void;
  onConfigClick: () => void;
  onFeaturesClick?: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  state,
  onMicToggle,
  onVisionClick,
  onHistoryClick,
  onConfigClick,
  onFeaturesClick,
}) => {
  const isActive = state !== 'disconnected';
  const isConnecting = state === 'connecting';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';

  const handleMicClick = () => {
    try {
      if ('vibrate' in navigator) navigator.vibrate(12);
    } catch {
      // ignore
    }
    onMicToggle();
  };

  return (
    <div className="relative w-full max-w-md mx-auto px-2 z-30">
      {/* Outer Dock Container with Curved Capsule Glassmorphism */}
      <div className="relative flex items-center justify-between px-3 py-2.5 rounded-[36px] glass-panel border border-[#ff1e42]/30 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(255,30,66,0.12)]">
        {/* 1. ACTIVE / POWER BUTTON */}
        <button
          type="button"
          onClick={handleMicClick}
          className="flex-1 flex flex-col items-center justify-center py-1 group transition-transform active:scale-95"
          aria-label="Toggle Active State"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              isActive
                ? 'text-[#ff1e42] drop-shadow-[0_0_8px_#ff1e42]'
                : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <Power className="w-5 h-5" />
          </div>
          <span
            className={`text-[9.5px] font-mono tracking-widest font-semibold uppercase mt-0.5 transition-colors ${
              isActive ? 'text-[#ff3b5c]' : 'text-slate-400 group-hover:text-slate-300'
            }`}
          >
            ACTIVE
          </span>
        </button>

        {/* 2. VISION BUTTON */}
        <button
          type="button"
          onClick={onVisionClick}
          className="flex-1 flex flex-col items-center justify-center py-1 group transition-transform active:scale-95"
          aria-label="Open Vision Sensor"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-[9.5px] font-mono tracking-widest font-semibold uppercase text-slate-400 group-hover:text-slate-300 mt-0.5">
            VISION
          </span>
        </button>

        {/* 3. CENTER HERO MIC BUTTON (Prominently Elevated with Double Crimson Halo) */}
        <div className="relative -mt-5 mx-1 flex items-center justify-center">
          {/* Pulsing Core Ring when Active */}
          {isActive && (
            <motion.div
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.5, 0.9, 0.5],
              }}
              transition={{
                duration: isSpeaking ? 1.4 : 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-2.5 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,30,66,0.5) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
          )}

          <motion.button
            type="button"
            onClick={handleMicClick}
            whileTap={{ scale: 0.92 }}
            className={`relative z-10 w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 ${
              isActive
                ? 'bg-gradient-to-tr from-[#990022] via-[#d90429] to-[#ff1e42] border-[#ff708a] shadow-[0_0_25px_#ff1e42,0_0_50px_rgba(255,30,66,0.6)]'
                : 'bg-gradient-to-tr from-[#38020d] to-[#73051b] border-[#ff1e42]/60 hover:border-[#ff1e42] shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(255,30,66,0.25)]'
            }`}
            aria-label={isActive ? 'Stop recording' : 'Start speaking'}
          >
            {isConnecting ? (
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            ) : isActive ? (
              <Square className="w-6 h-6 fill-white text-white drop-shadow" />
            ) : (
              <Mic className="w-7 h-7 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
            )}
          </motion.button>
        </div>

        {/* 4. APPS / FEATURES MATRIX BUTTON */}
        <button
          type="button"
          onClick={onFeaturesClick || onHistoryClick}
          className="flex-1 flex flex-col items-center justify-center py-1 group transition-transform active:scale-95"
          aria-label="View 500+ Feature Matrix"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
            <Grid className="w-5 h-5 text-[#ff708a] group-hover:text-white" />
          </div>
          <span className="text-[9.5px] font-mono tracking-widest font-semibold uppercase text-slate-400 group-hover:text-slate-300 mt-0.5">
            APPS
          </span>
        </button>

        {/* 5. CONFIG BUTTON */}
        <button
          type="button"
          onClick={onConfigClick}
          className="flex-1 flex flex-col items-center justify-center py-1 group transition-transform active:scale-95"
          aria-label="Open Settings"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[9.5px] font-mono tracking-widest font-semibold uppercase text-slate-400 group-hover:text-slate-300 mt-0.5">
            CONFIG
          </span>
        </button>
      </div>
    </div>
  );
};
