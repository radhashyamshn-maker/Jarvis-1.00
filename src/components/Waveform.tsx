import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SessionState } from '../lib/LiveSession';

interface WaveformProps {
  state: SessionState;
  audioLevel?: number;
}

export const Waveform: React.FC<WaveformProps> = ({ state, audioLevel = 0 }) => {
  const isActive = state !== 'disconnected';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';

  // 28 vertical bars
  const barCount = 28;

  // Precompute harmonic wave patterns and animation durations for organic visual motion
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      // Bell-curve distribution: center bars taller than edges
      const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
      const envelope = Math.cos(distFromCenter * (Math.PI / 2.3));
      const minH = 6;
      const maxH = Math.max(18, Math.round(72 * envelope));
      const speed = 0.5 + Math.sin(i * 1.3) * 0.25;

      return {
        id: i,
        envelope,
        minH,
        maxH,
        duration: 0.6 + (i % 5) * 0.12,
        delay: (i * 0.03) % 0.4,
      };
    });
  }, [barCount]);

  return (
    <div className="flex items-center justify-center gap-[4px] sm:gap-[6px] h-24 sm:h-28 px-4 w-full max-w-sm sm:max-w-md mx-auto">
      {bars.map((bar) => {
        let targetHeight = bar.minH;

        if (isSpeaking) {
          // Dynamic tall dancing bars
          targetHeight = Math.max(
            bar.minH * 2,
            Math.round(bar.maxH * (0.6 + Math.sin(bar.id * 1.5) * 0.35 + audioLevel * 0.8))
          );
        } else if (isListening) {
          // Gentle pulsing waves responsive to microphone level
          targetHeight = Math.max(
            bar.minH,
            Math.round(bar.maxH * (0.2 + audioLevel * 1.4 * bar.envelope))
          );
        } else if (isActive) {
          // Connecting state: subtle breathing pulse
          targetHeight = bar.minH + 4;
        }

        // Color gradient distribution across bars
        const ratio = bar.id / (barCount - 1);
        let barColor = '#8b5cf6'; // purple center
        if (ratio < 0.35) {
          barColor = '#ff2ec4'; // pink left
        } else if (ratio > 0.65) {
          barColor = '#22d3ee'; // cyan right
        }

        return (
          <motion.div
            key={bar.id}
            initial={{ height: bar.minH }}
            animate={{
              height: isActive ? [bar.minH + 2, targetHeight, bar.minH + 4] : bar.minH,
              opacity: isActive ? (isSpeaking ? 0.95 : 0.75) : 0.3,
            }}
            transition={{
              duration: isActive ? (isSpeaking ? bar.duration : 1.2) : 0.4,
              repeat: isActive ? Infinity : 0,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: isActive ? bar.delay : 0,
            }}
            style={{
              backgroundColor: barColor,
              boxShadow: isActive
                ? `0 0 10px ${barColor}70, 0 0 20px ${barColor}30`
                : 'none',
            }}
            className="w-[3px] sm:w-[4px] rounded-full transition-colors duration-300"
          />
        );
      })}
    </div>
  );
};
