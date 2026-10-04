import React from 'react';
import { motion } from 'framer-motion';
import type { SessionState } from '../lib/LiveSession';

interface StatusPillProps {
  state: SessionState;
  modelName?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ state, modelName }) => {
  const getStatusConfig = () => {
    switch (state) {
      case 'connecting':
        return {
          label: 'Connecting...',
          dotClass: 'bg-cyan-400',
          glowColor: 'rgba(34, 211, 238, 0.6)',
          borderClass: 'border-cyan-500/30',
          textClass: 'text-cyan-200',
        };
      case 'listening':
        return {
          label: 'Sun rahi hoon...',
          dotClass: 'bg-neon-pink',
          glowColor: 'rgba(255, 46, 196, 0.7)',
          borderClass: 'border-pink-500/30',
          textClass: 'text-pink-200',
        };
      case 'speaking':
        return {
          label: 'Bol rahi hoon...',
          dotClass: 'bg-neon-cyan',
          glowColor: 'rgba(34, 211, 238, 0.8)',
          borderClass: 'border-purple-500/40',
          textClass: 'text-cyan-200',
        };
      case 'disconnected':
      default:
        return {
          label: 'Ready, Sir?',
          dotClass: 'bg-slate-400',
          glowColor: 'rgba(148, 163, 184, 0.3)',
          borderClass: 'border-white/10',
          textClass: 'text-slate-300',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <motion.div
        layout
        className={`glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-2 border ${config.borderClass} shadow-lg transition-colors duration-300`}
      >
        <span className="relative flex h-2.5 w-2.5">
          {state !== 'disconnected' && (
            <motion.span
              animate={{
                scale: [1, 2, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: state === 'speaking' ? 1.2 : 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dotClass}`}
            style={{
              boxShadow: `0 0 8px ${config.glowColor}`,
            }}
          />
        </span>
        <span className={`text-xs font-medium tracking-wide ${config.textClass}`}>
          {config.label}
        </span>
      </motion.div>
    </div>
  );
};
