import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Grid,
  Eye,
  Navigation,
  Cpu,
  Layers,
  Settings,
  History,
} from 'lucide-react';
import type { ScreenId } from '../App';

interface SwipeNavigationIndicatorProps {
  activeScreen: ScreenId;
  swipeFeedback: {
    direction: 'left' | 'right';
    screenName: string;
  } | null;
  onSelectScreen: (screen: ScreenId) => void;
}

const SCREENS: { id: ScreenId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'home', label: 'CORE', icon: Home },
  { id: 'features', label: 'APPS', icon: Grid },
  { id: 'vision', label: 'VISION', icon: Eye },
  { id: 'navigation', label: 'NAV', icon: Navigation },
  { id: '2080', label: '2080', icon: Cpu },
  { id: 'recent_tabs', label: 'TABS', icon: Layers },
  { id: 'config', label: 'CONFIG', icon: Settings },
  { id: 'history', label: 'LOGS', icon: History },
];

export const SwipeNavigationIndicator: React.FC<SwipeNavigationIndicatorProps> = ({
  activeScreen,
  swipeFeedback,
  onSelectScreen,
}) => {
  return (
    <>
      {/* 1. Subtle Top HUD Carousel Dots & Cues */}
      <div className="relative z-20 w-full flex items-center justify-center py-1 select-none pointer-events-auto">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-[#ff1e42]/20 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          <ChevronLeft className="w-2.5 h-2.5 text-slate-500 animate-pulse" />

          <div className="flex items-center gap-1">
            {SCREENS.map((screen) => {
              const isActive = screen.id === activeScreen;
              const Icon = screen.icon;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => onSelectScreen(screen.id)}
                  className={`transition-all duration-300 flex items-center gap-1 rounded-full px-1.5 py-0.5 ${
                    isActive
                      ? 'bg-[#ff1e42]/30 border border-[#ff1e42]/60 text-white shadow-[0_0_8px_#ff1e42]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={`Navigate to ${screen.label}`}
                >
                  <Icon className={`w-2.5 h-2.5 ${isActive ? 'text-[#ff708a]' : 'text-slate-500'}`} />
                  {isActive && (
                    <span className="text-[8px] font-mono font-bold tracking-widest text-[#ff708a]">
                      {screen.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <ChevronRight className="w-2.5 h-2.5 text-slate-500 animate-pulse" />
        </div>
      </div>

      {/* 2. Transient Stark HUD Swipe Holographic Banner */}
      <AnimatePresence>
        {swipeFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: swipeFeedback.direction === 'left' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-1.5 rounded-full bg-[#1c020b]/90 border border-[#ff1e42]/80 backdrop-blur-xl shadow-[0_0_25px_rgba(255,30,66,0.6)] flex items-center gap-2"
          >
            {swipeFeedback.direction === 'right' ? (
              <ChevronLeft className="w-4 h-4 text-[#ff1e42] animate-bounce" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#ff1e42] animate-bounce" />
            )}
            <span className="font-mono text-[10px] font-bold tracking-wider text-white uppercase">
              HUD SWIPE: {swipeFeedback.screenName}
            </span>
            {swipeFeedback.direction === 'left' ? (
              <ChevronRight className="w-4 h-4 text-[#ff1e42] animate-bounce" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#ff1e42] animate-bounce" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
