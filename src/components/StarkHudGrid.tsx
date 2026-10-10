import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { SessionState } from '../lib/LiveSession';

interface StarkHudGridProps {
  audioLevel?: number;
  state?: SessionState;
  className?: string;
}

export const StarkHudGrid: React.FC<StarkHudGridProps> = ({
  audioLevel = 0,
  state = 'disconnected',
  className = '',
}) => {
  // Smooth the incoming audio level using quick attack & smooth decay for organic breathing response
  const [smoothedLevel, setSmoothedLevel] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const currentLevelRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    const target = Math.min(1, Math.max(0, audioLevel));

    const step = () => {
      if (!active) return;
      const current = currentLevelRef.current;
      // Responsive attack (0.35) for instant voice detection, graceful decay (0.12) for smooth breathing dissipation
      const rate = target > current ? 0.35 : 0.12;
      const next = current + (target - current) * rate;
      currentLevelRef.current = next;

      if (Math.abs(target - next) > 0.003) {
        setSmoothedLevel(next);
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        currentLevelRef.current = target;
        setSmoothedLevel(target);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [audioLevel]);

  // Dynamic calculated intensities based on smoothed level & state
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isActive = state !== 'disconnected';

  // Base opacity: 0.40 breathing standby + audio boost up to +0.50
  const gridOpacity = useMemo(() => {
    const base = isActive ? 0.52 : 0.42;
    return Math.min(0.96, base + smoothedLevel * 0.46);
  }, [isActive, smoothedLevel]);

  // Glow shadow radius & intensity
  const glowShadow = useMemo(() => {
    const blur = 1.5 + smoothedLevel * 8;
    const alpha = (0.2 + smoothedLevel * 0.6).toFixed(2);
    return `drop-shadow(0 0 ${blur}px rgba(255, 30, 66, ${alpha}))`;
  }, [smoothedLevel]);

  // Radial ambient aura expansion
  const auraOpacity = useMemo(() => {
    if (!isActive) return 0.35 + smoothedLevel * 0.35;
    if (isListening) return 0.5 + smoothedLevel * 0.45;
    if (isSpeaking) return 0.6 + smoothedLevel * 0.4;
    return 0.45 + smoothedLevel * 0.35;
  }, [isActive, isListening, isSpeaking, smoothedLevel]);

  const auraRadius = useMemo(() => {
    // Expands outward as voice energy increases
    return 48 + Math.round(smoothedLevel * 28);
  }, [smoothedLevel]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Synchronized Radial Breathing Core Glow behind the grid */}
      <div
        className="absolute inset-0 transition-all duration-150 ease-out will-change-transform"
        style={{
          opacity: auraOpacity,
          background: `radial-gradient(circle at 50% 50%, rgba(255, 30, 66, ${
            0.14 + smoothedLevel * 0.22
          }) 0%, rgba(255, 30, 66, ${
            0.04 + smoothedLevel * 0.08
          }) ${auraRadius}%, rgba(6, 1, 4, 0.95) 78%)`,
        }}
      />

      {/* 2. Micro Stark HUD Grid (32px) with subtle ambient breathing + audio synchronization */}
      <div
        className="absolute inset-0 hud-grid animate-hud-grid-breathe will-change-[opacity,filter] transition-[opacity,filter] duration-100 ease-out"
        style={{
          opacity: gridOpacity,
          filter: glowShadow,
        }}
      />

      {/* 3. Major Tactical HUD Grid (128px) with subtle cross-hair reticle accents */}
      <div
        className="absolute inset-0 hud-grid-major will-change-opacity transition-opacity duration-150 ease-out"
        style={{
          opacity: Math.min(0.85, 0.28 + smoothedLevel * 0.52),
          filter: `drop-shadow(0 0 ${2 + smoothedLevel * 5}px rgba(255, 30, 66, ${
            0.2 + smoothedLevel * 0.45
          }))`,
        }}
      />

      {/* 4. Subtle Audio-Responsive Waveform Scanline Pulse */}
      <div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff1e42]/60 to-transparent pointer-events-none will-change-transform"
        style={{
          top: '50%',
          transform: `translateY(-50%) scaleX(${0.4 + smoothedLevel * 0.6})`,
          opacity: 0.15 + smoothedLevel * 0.65,
          boxShadow: `0 0 ${4 + smoothedLevel * 12}px rgba(255, 30, 66, ${
            0.3 + smoothedLevel * 0.6
          })`,
          transition: 'transform 100ms ease-out, opacity 100ms ease-out',
        }}
      />

      {/* 5. Stark HUD Tactical Telemetry Edge Accents (breathing & reactive) */}
      <div className="absolute top-3 left-4 flex items-center gap-1.5 opacity-40 font-mono text-[9px] tracking-widest text-[#ff1e42]">
        <div
          className="w-1.5 h-1.5 rounded-full bg-[#ff1e42] transition-all duration-150"
          style={{
            transform: `scale(${1 + smoothedLevel * 0.8})`,
            boxShadow: `0 0 ${4 + smoothedLevel * 8}px #ff1e42`,
            opacity: 0.4 + smoothedLevel * 0.6,
          }}
        />
        <span className="hidden sm:inline">STARK.HUD // GRID.32PX</span>
        {smoothedLevel > 0.05 && (
          <span
            className="text-[8px] font-bold text-[#ff708a] transition-opacity duration-100"
            style={{ opacity: Math.min(1, smoothedLevel * 2) }}
          >
            AUDIO: {(smoothedLevel * 100).toFixed(0)}%
          </span>
        )}
      </div>

      <div className="absolute top-3 right-4 flex items-center gap-1.5 opacity-40 font-mono text-[9px] tracking-widest text-[#ff1e42]">
        <span className="hidden sm:inline">MATRIX.SYNC</span>
        <div
          className="w-1.5 h-1.5 border border-[#ff1e42] rotate-45 transition-transform duration-150"
          style={{
            transform: `rotate(45deg) scale(${1 + smoothedLevel * 0.6})`,
            opacity: 0.4 + smoothedLevel * 0.6,
          }}
        />
      </div>

      {/* 6. Subtle Edge Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 40%, rgba(6, 1, 4, 0.75) 100%)',
        }}
      />
    </div>
  );
};
