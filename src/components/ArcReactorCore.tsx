import React, { useMemo } from 'react';
import type { SessionState } from '../lib/LiveSession';

interface ArcReactorCoreProps {
  state: SessionState;
  audioLevel?: number;
  onCoreClick?: () => void;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  state,
  audioLevel = 0,
  onCoreClick,
}) => {
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isConnecting = state === 'connecting';
  const isActive = state !== 'disconnected';

  // 12 radial power capsules around the inner torus (matching screenshot)
  const powerPins = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 360) / 12;
      return { id: i, angle };
    });
  }, []);

  // Outer orbital energy blocks (amber and red segmented blocks)
  const orbitalBlocks = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const angle = (i * 360) / 10 + 18;
      const isAmber = i % 3 === 0;
      return { id: i, angle, isAmber };
    });
  }, []);

  // Outer ring ticks
  const outerTicks = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i * 360) / 24;
      const isMajor = i % 6 === 0;
      return { id: i, angle, isMajor };
    });
  }, []);

  // Audio level dynamic scaling (clamped for stability)
  const dynamicScale = 1 + Math.min(0.25, audioLevel * 0.4);
  const coreBrightness = isSpeaking ? 1.3 : isListening ? 1.1 + audioLevel * 0.3 : 1.0;

  return (
    <div
      onClick={onCoreClick}
      className="relative flex items-center justify-center w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] my-auto cursor-pointer select-none group"
      role="button"
      tabIndex={0}
      aria-label="JARVIS Quantum Core"
    >
      {/* 1. Deep Ambient Corona Glow Behind Core */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none transition-all duration-700 ${
          isActive ? 'animate-ambient-pulse' : 'opacity-40'
        }`}
        style={{
          background: isSpeaking
            ? 'radial-gradient(circle, rgba(255, 30, 66, 0.45) 0%, rgba(255, 10, 40, 0.2) 50%, transparent 75%)'
            : isListening
            ? 'radial-gradient(circle, rgba(255, 30, 66, 0.35) 0%, rgba(217, 4, 41, 0.15) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(255, 30, 66, 0.2) 0%, transparent 65%)',
          filter: 'blur(35px)',
          transform: `scale(${dynamicScale * 1.1})`,
        }}
      />

      {/* 2. SVG Vector Ring Assemblies (100% GPU Hardware Accelerated, Zero Lag) */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full overflow-visible pointer-events-none"
      >
        <defs>
          {/* Intense Sun Plasma Gradient */}
          <radialGradient id="plasmaSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fff9d6" />
            <stop offset="50%" stopColor="#ffdd44" />
            <stop offset="72%" stopColor="#ff224a" />
            <stop offset="92%" stopColor="#cc0029" />
            <stop offset="100%" stopColor="#7a0017" />
          </radialGradient>

          {/* Torus Ring Gradient */}
          <radialGradient id="torusGrad" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="#1a0208" stopOpacity="0" />
            <stop offset="70%" stopColor="#d90429" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#ff1e42" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff3b5c" stopOpacity="0.2" />
          </radialGradient>

          {/* Glow filter for vector elements */}
          <filter id="hudGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- LAYER A: Outer Reticle & Cardinal Crosshairs (Static / Steady Orientation) --- */}
        <g opacity="0.85">
          {/* Outer fine circle */}
          <circle
            cx="200"
            cy="200"
            r="188"
            fill="none"
            stroke="rgba(255, 30, 66, 0.22)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Cardinal Crosshair Ticks (North, East, South, West) */}
          <line x1="200" y1="6" x2="200" y2="24" stroke="#ff1e42" strokeWidth="2.5" />
          <line x1="200" y1="376" x2="200" y2="394" stroke="#ff1e42" strokeWidth="2.5" />
          <line x1="6" y1="200" x2="24" y2="200" stroke="#ff1e42" strokeWidth="2.5" />
          <line x1="376" y1="200" x2="394" y2="200" stroke="#ff1e42" strokeWidth="2.5" />

          {/* Diagonal minor ticks */}
          <line x1="72" y1="72" x2="82" y2="82" stroke="rgba(255,30,66,0.5)" strokeWidth="1.5" />
          <line x1="328" y1="72" x2="318" y2="82" stroke="rgba(255,30,66,0.5)" strokeWidth="1.5" />
          <line x1="72" y1="328" x2="82" y2="318" stroke="rgba(255,30,66,0.5)" strokeWidth="1.5" />
          <line x1="328" y1="328" x2="318" y2="318" stroke="rgba(255,30,66,0.5)" strokeWidth="1.5" />
        </g>

        {/* --- LAYER B: Rotating Clockwise Orbit (Segmented Arcs & Ticks) --- */}
        <g
          className={
            isSpeaking
              ? 'animate-spin-cw-fast'
              : isConnecting
              ? 'animate-spin-cw-fast'
              : 'animate-spin-cw-slow'
          }
          style={{ transformOrigin: '200px 200px' }}
        >
          {/* Segmented Arc Track */}
          <circle
            cx="200"
            cy="200"
            r="174"
            fill="none"
            stroke="rgba(255, 30, 66, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="28 14 6 14"
          />

          {/* 24 Perimeter Ticks */}
          {outerTicks.map((t) => (
            <line
              key={t.id}
              x1="200"
              y1={t.isMajor ? '164' : '168'}
              x2="200"
              y2="174"
              stroke={t.isMajor ? '#ff1e42' : 'rgba(255, 30, 66, 0.5)'}
              strokeWidth={t.isMajor ? '2' : '1'}
              transform={`rotate(${t.angle} 200 200)`}
            />
          ))}
        </g>

        {/* --- LAYER C: Counter-Clockwise Segmented Power Ring (Amber & Red Blocks) --- */}
        <g
          className={
            isSpeaking
              ? 'animate-spin-ccw-fast'
              : isConnecting
              ? 'animate-spin-ccw-fast'
              : 'animate-spin-ccw-slow'
          }
          style={{ transformOrigin: '200px 200px' }}
        >
          {/* Middle dashed circle track */}
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke="rgba(251, 191, 36, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="16 12"
          />

          {/* Glowing orbital energy blocks (Capsules on the track) */}
          {orbitalBlocks.map((b) => (
            <rect
              key={b.id}
              x="193"
              y="141"
              width="14"
              height="8"
              rx="2.5"
              fill={b.isAmber ? '#fbbf24' : '#ff1e42'}
              opacity={b.isAmber ? 0.95 : 0.85}
              filter="url(#hudGlow)"
              transform={`rotate(${b.angle} 200 200)`}
            />
          ))}

          {/* Secondary counter dashed circle */}
          <circle
            cx="200"
            cy="200"
            r="132"
            fill="none"
            stroke="rgba(255, 30, 66, 0.35)"
            strokeWidth="1"
            strokeDasharray="6 8"
          />
        </g>

        {/* --- LAYER D: Inner Reactor Housing Torus (Deep Crimson Gloss Rim) --- */}
        <g>
          {/* Torus Body */}
          <circle
            cx="200"
            cy="200"
            r="116"
            fill="none"
            stroke="#ff1e42"
            strokeWidth="18"
            strokeOpacity={isSpeaking ? '0.95' : '0.8'}
            filter="url(#hudGlow)"
          />
          {/* Torus Highlight Rim */}
          <circle
            cx="200"
            cy="200"
            r="125"
            fill="none"
            stroke="rgba(255, 120, 150, 0.7)"
            strokeWidth="1.5"
          />
          <circle
            cx="200"
            cy="200"
            r="107"
            fill="none"
            stroke="rgba(255, 20, 50, 0.9)"
            strokeWidth="2"
          />

          {/* 12 Inward-Facing Radial Power Capsules / Coils (Exact match to screenshot) */}
          {powerPins.map((p) => (
            <g key={p.id} transform={`rotate(${p.angle} 200 200)`}>
              {/* Radial Power Rod */}
              <rect
                x="197"
                y="98"
                width="6"
                height="18"
                rx="3"
                fill="#ffffff"
                filter="url(#hudGlow)"
              />
              <circle cx="200" cy="98" r="3.5" fill="#fff9d6" />
            </g>
          ))}
        </g>
      </svg>

      {/* --- LAYER E: The Central Fusion Sun / Core Orb (Pure HTML/CSS GPU Composited) --- */}
      <div
        className="absolute z-10 w-[124px] h-[124px] sm:w-[146px] sm:h-[146px] rounded-full flex items-center justify-center pointer-events-none transition-transform duration-300"
        style={{
          transform: `scale(${dynamicScale})`,
          filter: `brightness(${coreBrightness})`,
        }}
      >
        {/* Deep Ruby Plasma Halo */}
        <div
          className={`absolute inset-0 rounded-full animate-core-pulse`}
          style={{
            background:
              'radial-gradient(circle, #ffffff 0%, #fff099 20%, #ff1e42 60%, #990022 85%, transparent 100%)',
            boxShadow:
              '0 0 35px #ff1e42, 0 0 70px rgba(255, 30, 66, 0.7), inset 0 0 25px #ffffff',
          }}
        />

        {/* Hot Nuclear White-Yellow Center Star */}
        <div
          className="relative z-10 w-[62px] h-[62px] sm:w-[74px] sm:h-[74px] rounded-full animate-plasma-flare"
          style={{
            background:
              'radial-gradient(circle, #ffffff 0%, #fffbe6 35%, #ffd13b 70%, #ff2a55 100%)',
            boxShadow:
              '0 0 20px #ffffff, 0 0 45px #ffea75, 0 0 70px #ff1e42, inset 0 0 15px #ffffff',
          }}
        />
      </div>
    </div>
  );
};
