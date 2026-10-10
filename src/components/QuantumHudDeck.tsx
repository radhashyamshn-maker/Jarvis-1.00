import React from 'react';
import {
  Smile,
  Eye,
  Music,
  Battery,
  Zap,
  Activity,
  Radio,
} from 'lucide-react';
import type { SessionState } from '../lib/LiveSession';
import { playHudBeep } from '../lib/audioEffects';

interface QuantumHudDeckProps {
  state: SessionState;
  audioLevel?: number;
  onQuickPrompt: (prompt: string) => void;
  visualMode: 'reactor' | 'waveform';
  onToggleVisualMode: (mode: 'reactor' | 'waveform') => void;
}

export const QuantumHudDeck: React.FC<QuantumHudDeckProps> = ({
  state,
  audioLevel = 0,
  onQuickPrompt,
  visualMode,
  onToggleVisualMode,
}) => {
  const quickPrompts = [
    {
      id: 'joke',
      label: 'Ek mast joke sunao',
      icon: Smile,
      text: 'Jarvis, ek bohot hi funny aur mast joke sunao!',
    },
    {
      id: 'vision',
      label: 'Vision scan karo',
      icon: Eye,
      text: 'Jarvis, camera vision scan karke batao kya dikh raha hai!',
    },
    {
      id: 'shayari',
      label: 'Shayari sunao',
      icon: Music,
      text: 'Jarvis, mere liye ek romantic aur witty shayari sunao na!',
    },
    {
      id: 'battery',
      label: 'Battery & status check',
      icon: Battery,
      text: 'Jarvis, mere phone ki battery aur system diagnostic check karo!',
    },
    {
      id: 'system',
      label: 'System diagnostics',
      icon: Zap,
      text: 'Jarvis, sabhi Stark defense systems aur core diagnostics run karo!',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-2 px-1 select-none">
      {/* 1. VISUALIZER MODE SELECTOR */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Visualizer Mode Toggle */}
        <div className="flex items-center p-0.5 rounded-xl bg-[#120207]/60 border border-[#ff1e42]/30 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              playHudBeep(700, 0.05);
              onToggleVisualMode('reactor');
            }}
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-all flex items-center gap-1 ${
              visualMode === 'reactor'
                ? 'bg-gradient-to-r from-[#990022] to-[#ff1e42] text-white shadow-[0_0_10px_#ff1e42]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>REACTOR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playHudBeep(850, 0.05);
              onToggleVisualMode('waveform');
            }}
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-all flex items-center gap-1 ${
              visualMode === 'waveform'
                ? 'bg-gradient-to-r from-purple-700 to-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>SPECTRUM</span>
          </button>
        </div>
      </div>

      {/* 2. QUICK HUD ACTION CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {quickPrompts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playHudBeep(800, 0.04);
                onQuickPrompt(item.text);
              }}
              className="shrink-0 px-2.5 py-1 rounded-xl glass-pill border border-[#ff1e42]/20 hover:border-[#ff1e42] bg-[#100106]/60 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 active:scale-95 transition-all shadow-[0_0_8px_rgba(255,30,66,0.1)]"
            >
              <Icon className="w-3 h-3 text-[#ff1e42]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
