import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import type { SessionState } from '../lib/LiveSession';

interface TopHudHeaderProps {
  state: SessionState;
  onOpenFeatures?: () => void;
  onOpenPermissions?: () => void;
}

export const TopHudHeader: React.FC<TopHudHeaderProps> = ({
  state,
  onOpenFeatures,
  onOpenPermissions,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusLabel = () => {
    switch (state) {
      case 'connecting':
        return 'CONNECTING';
      case 'listening':
        return 'LISTENING';
      case 'speaking':
        return 'SPEAKING';
      case 'disconnected':
      default:
        return 'STANDBY';
    }
  };

  const isActive = state !== 'disconnected';

  return (
    <div className="relative w-full max-w-lg mx-auto pt-2 pb-1 px-1 z-30">
      {/* Corner Bracket Accents */}
      <div className="relative p-2.5 rounded-2xl border border-[#ff1e42]/20 bg-[#120207]/40 backdrop-blur-md">
        {/* Red HUD Corner Brackets */}
        <div className="absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2 border-[#ff1e42] pointer-events-none" />
        <div className="absolute -top-[2px] -right-[2px] w-3 h-3 border-t-2 border-r-2 border-[#ff1e42] pointer-events-none" />
        <div className="absolute -bottom-[2px] -left-[2px] w-3 h-3 border-b-2 border-l-2 border-[#ff1e42] pointer-events-none" />
        <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 border-b-2 border-r-2 border-[#ff1e42] pointer-events-none" />

        <div className="flex items-center justify-between">
          {/* 1. Glowing Red Orb + JARVIS Label */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-6 h-6">
              <span
                className={`absolute w-full h-full rounded-full ${
                  isActive ? 'animate-ping opacity-60' : 'opacity-40'
                }`}
                style={{
                  background: 'radial-gradient(circle, #ff1e42 0%, transparent 70%)',
                }}
              />
              <span
                className="relative w-4 h-4 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ffffff 10%, #ff4d6d 60%, #ff1e42 100%)',
                  boxShadow: '0 0 12px #ff1e42, 0 0 20px rgba(255,30,66,0.8)',
                }}
              />
            </div>
            <span className="font-mono font-extrabold text-sm sm:text-base tracking-[0.22em] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              JARVIS
            </span>
          </div>

          {/* 2. Status Pill: ● LISTENING / ● SPEAKING / ● STANDBY */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full glass-pill-hud border border-[#ff1e42]/40 shadow-[0_0_10px_rgba(255,30,66,0.15)]">
            <span className="relative flex h-2 w-2">
              {isActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff1e42] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isActive ? 'bg-[#ff1e42]' : 'bg-slate-500'
                }`}
                style={{
                  boxShadow: isActive ? '0 0 6px #ff1e42' : 'none',
                }}
              />
            </span>
            <span className="text-[9.5px] sm:text-[11px] font-mono font-bold tracking-[0.15em] text-[#ff708a] uppercase">
              {getStatusLabel()}
            </span>
          </div>

          {/* 3. Actions: Permissions Shield + 500+ Apps + Clock */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {onOpenPermissions && (
              <button
                type="button"
                onClick={onOpenPermissions}
                className="px-2 py-1 rounded-xl glass-pill-hud border border-[#ff1e42]/40 hover:border-[#ff1e42] transition-colors flex items-center gap-1 shadow-[0_0_8px_rgba(255,30,66,0.2)] active:scale-95 text-[#ff708a] hover:text-white"
                title="Systematic Permissions Manager (12 Critical)"
              >
                <Shield className="w-3.5 h-3.5 text-[#ff1e42]" />
                <span className="font-mono text-[9.5px] sm:text-[10px] font-bold tracking-wider hidden xs:inline">
                  PERMS
                </span>
              </button>
            )}

            {onOpenFeatures && (
              <button
                type="button"
                onClick={onOpenFeatures}
                className="px-2 py-1 rounded-xl glass-pill-hud border border-[#ff1e42]/40 hover:border-[#ff1e42] transition-colors flex items-center gap-1 shadow-[0_0_8px_rgba(255,30,66,0.2)] active:scale-95"
                title="Open 500+ Features Matrix"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff1e42] animate-pulse" />
                <span className="font-mono text-[9.5px] sm:text-[10px] font-bold tracking-wider text-white">
                  APPS
                </span>
              </button>
            )}

            <div className="px-2 py-1 rounded-xl glass-pill-hud border border-[#f59e0b]/30 shadow-[0_0_10px_rgba(245,158,11,0.12)]">
              <span className="font-mono text-[10px] sm:text-xs font-bold tracking-wider text-[#fbbf24] drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]">
                {timeStr || '2:26 AM'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
