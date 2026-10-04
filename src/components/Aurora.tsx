import React from 'react';
import { motion } from 'framer-motion';
import type { SessionState } from '../lib/LiveSession';

interface AuroraProps {
  state: SessionState;
  audioLevel?: number;
}

export const Aurora: React.FC<AuroraProps> = ({ state, audioLevel = 0 }) => {
  const isActive = state !== 'disconnected';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isConnecting = state === 'connecting';

  // Base opacity based on state
  const baseOpacity = !isActive ? 0.25 : isSpeaking ? 0.75 : isListening ? 0.55 : 0.45;
  const levelBoost = audioLevel * 0.3;
  const effectiveOpacity = Math.min(1, baseOpacity + levelBoost);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Aurora Blob 1: Neon Pink */}
      <motion.div
        animate={{
          x: isSpeaking ? [0, 40, -30, 0] : isListening ? [0, -20, 20, 0] : [0, 15, 0],
          y: isSpeaking ? [0, -50, 30, 0] : isListening ? [0, 25, -25, 0] : [0, -10, 0],
          scale: isSpeaking ? [1, 1.25, 1.05, 1] : isListening ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: effectiveOpacity,
        }}
        transition={{
          duration: isSpeaking ? 5 : isListening ? 7 : 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-[15%] -left-[10%] w-[420px] h-[420px] sm:w-[600px] sm:h-[600px] rounded-full blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,46,196,0.6) 0%, rgba(255,46,196,0) 70%)',
        }}
      />

      {/* Aurora Blob 2: Neon Purple */}
      <motion.div
        animate={{
          x: isSpeaking ? [0, -45, 35, 0] : isListening ? [0, 30, -20, 0] : [0, -15, 0],
          y: isSpeaking ? [0, 40, -40, 0] : isListening ? [0, -30, 20, 0] : [0, 15, 0],
          scale: isSpeaking ? [1.1, 1.35, 1] : isListening ? [1, 1.18, 1] : [1, 1.03, 1],
          opacity: effectiveOpacity * 0.9,
        }}
        transition={{
          duration: isSpeaking ? 6 : isListening ? 8 : 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[25%] -right-[15%] w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.65) 0%, rgba(139,92,246,0) 70%)',
        }}
      />

      {/* Aurora Blob 3: Neon Cyan */}
      <motion.div
        animate={{
          x: isSpeaking ? [0, 30, -35, 0] : isConnecting ? [0, -20, 20, 0] : [0, 10, 0],
          y: isSpeaking ? [0, -30, 25, 0] : [0, 20, -15, 0],
          scale: isSpeaking ? [1, 1.3, 0.95, 1] : [1, 1.1, 1],
          opacity: effectiveOpacity * 0.7,
        }}
        transition={{
          duration: isSpeaking ? 7 : isConnecting ? 4 : 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-[15%] left-[10%] w-[400px] h-[400px] sm:w-[580px] sm:h-[580px] rounded-full blur-[115px]"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.55) 0%, rgba(34,211,238,0) 70%)',
        }}
      />

      {/* Ambient background noise/grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
