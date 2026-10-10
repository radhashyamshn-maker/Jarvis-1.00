import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SessionState } from '../lib/LiveSession';

interface WaveformProps {
  state: SessionState;
  audioLevel?: number;
  onCoreClick?: () => void;
}

export const Waveform: React.FC<WaveformProps> = ({
  state,
  audioLevel = 0,
  onCoreClick,
}) => {
  const isActive = state !== 'disconnected';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';

  // 36 vertical frequency equalizer bars
  const barCount = 36;

  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
      const envelope = Math.cos(distFromCenter * (Math.PI / 2.2));
      const minH = 8;
      const maxH = Math.max(22, Math.round(96 * envelope));

      return {
        id: i,
        envelope,
        minH,
        maxH,
        duration: 0.5 + (i % 6) * 0.1,
        delay: (i * 0.02) % 0.35,
      };
    });
  }, [barCount]);

  return (
    <div
      onClick={onCoreClick}
      className="relative flex flex-col items-center justify-center w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] my-auto cursor-pointer select-none group"
      role="button"
      tabIndex={0}
      aria-label="Quantum Holographic Audio Spectrum"
    >
      {/* Background Holographic Concentric Grid Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer Orbital Tech Ring */}
        <div
          className={`absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-[#ff1e42]/20 border-dashed ${
            isActive ? 'animate-spin-slow' : 'opacity-30'
          }`}
        />
        {/* Cyan Frequency Ring */}
        <div
          className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-cyan-500/30 ${
            isActive ? 'animate-reverse-spin' : 'opacity-20'
          }`}
          style={{
            transform: `scale(${1 + audioLevel * 0.3})`,
            transition: 'transform 0.1s ease-out',
          }}
        />
        {/* Ambient Neon Glow */}
        <div
          className="absolute w-44 h-44 rounded-full"
          style={{
            background: isSpeaking
              ? 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(255,30,66,0.2) 60%, transparent 80%)'
              : isListening
              ? 'radial-gradient(circle, rgba(255,30,66,0.35) 0%, rgba(168,85,247,0.15) 60%, transparent 80%)'
              : 'radial-gradient(circle, rgba(255,30,66,0.15) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
      </div>

      {/* Center Oscilloscope Wave Display */}
      <div className="relative z-10 flex items-center justify-center gap-[3px] sm:gap-[5px] h-32 sm:h-40 px-3 w-full max-w-xs sm:max-w-sm">
        {bars.map((bar) => {
          let targetHeight = bar.minH;

          if (isSpeaking) {
            targetHeight = Math.max(
              bar.minH * 2.5,
              Math.round(bar.maxH * (0.55 + Math.sin(bar.id * 1.4) * 0.4 + audioLevel * 0.9))
            );
          } else if (isListening) {
            targetHeight = Math.max(
              bar.minH,
              Math.round(bar.maxH * (0.25 + audioLevel * 1.6 * bar.envelope))
            );
          } else if (isActive) {
            targetHeight = bar.minH + 6;
          }

          const ratio = bar.id / (barCount - 1);
          let barColor = '#ff1e42'; // default red
          if (ratio < 0.28) {
            barColor = '#22d3ee'; // cyan left
          } else if (ratio < 0.55) {
            barColor = '#ec4899'; // magenta mid-left
          } else if (ratio < 0.8) {
            barColor = '#a855f7'; // purple mid-right
          } else {
            barColor = '#f59e0b'; // amber right
          }

          return (
            <motion.div
              key={bar.id}
              initial={{ height: bar.minH }}
              animate={{
                height: isActive ? [bar.minH, targetHeight, bar.minH + 2] : bar.minH,
                opacity: isActive ? (isSpeaking ? 0.95 : 0.8) : 0.25,
              }}
              transition={{
                duration: isActive ? (isSpeaking ? bar.duration : 1.0) : 0.4,
                repeat: isActive ? Infinity : 0,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: isActive ? bar.delay : 0,
              }}
              style={{
                backgroundColor: barColor,
                boxShadow: isActive
                  ? `0 0 10px ${barColor}90, 0 0 20px ${barColor}40`
                  : 'none',
              }}
              className="w-[3px] sm:w-[4px] rounded-full transition-all duration-150"
            />
          );
        })}
      </div>

      {/* Holographic Reticle Overlay */}
      <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none opacity-40">
        <span className="font-mono text-[9px] text-[#ff708a]">[FREQ: 24kHz]</span>
        <span className="font-mono text-[9px] text-cyan-400">[HOLO: ON]</span>
      </div>
    </div>
  );
};
