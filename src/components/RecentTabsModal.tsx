import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  X,
  ExternalLink,
  Globe,
  Trash2,
  Clock,
  ArrowRight,
  Sparkles,
  Smartphone,
  Eye,
  Navigation,
  Settings,
  Cpu,
} from 'lucide-react';
import { playHudBeep } from '../lib/audioEffects';

export interface RecentTabItem {
  id: string;
  title: string;
  url?: string;
  type: 'website' | 'screen';
  screenName?: string;
  timestamp: number;
}

interface RecentTabsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: RecentTabItem) => void;
}

export const RecentTabsModal: React.FC<RecentTabsModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [tabs, setTabs] = useState<RecentTabItem[]>([]);

  const loadTabs = () => {
    try {
      const stored = localStorage.getItem('jarvis_recent_tabs');
      if (stored) {
        setTabs(JSON.parse(stored));
      } else {
        // Default initial tabs
        const defaults: RecentTabItem[] = [
          {
            id: 'tab-1',
            title: 'Google Search',
            url: 'https://www.google.com',
            type: 'website',
            timestamp: Date.now() - 60000,
          },
          {
            id: 'tab-2',
            title: 'Wikipedia Science',
            url: 'https://en.wikipedia.org',
            type: 'website',
            timestamp: Date.now() - 120000,
          },
          {
            id: 'tab-3',
            title: 'Stark GPS Navigation',
            type: 'screen',
            screenName: 'navigation',
            timestamp: Date.now() - 180000,
          },
          {
            id: 'tab-4',
            title: 'Vision Optical Sensor',
            type: 'screen',
            screenName: 'vision',
            timestamp: Date.now() - 240000,
          },
        ];
        setTabs(defaults);
        localStorage.setItem('jarvis_recent_tabs', JSON.stringify(defaults));
      }
    } catch {
      setTabs([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTabs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playHudBeep(600, 0.03);
    const updated = tabs.filter((t) => t.id !== id);
    setTabs(updated);
    localStorage.setItem('jarvis_recent_tabs', JSON.stringify(updated));
  };

  const clearAllTabs = () => {
    playHudBeep(500, 0.05);
    setTabs([]);
    localStorage.removeItem('jarvis_recent_tabs');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-lg rounded-3xl glass-panel border border-[#ff1e42]/50 p-4 sm:p-5 text-white shadow-[0_0_60px_rgba(255,30,66,0.35)] relative overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ff1e42]/30 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-900/40 border border-purple-500/50">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-mono text-sm tracking-widest uppercase font-bold text-white flex items-center gap-1.5">
                RECENT TABS & APPS SWITCHER
                <span className="px-1.5 py-0.2 rounded text-[8.5px] bg-[#ff1e42]/30 text-[#ff708a] border border-[#ff1e42]/40 font-mono">
                  {tabs.length} ACTIVE
                </span>
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Switch between opened websites and recent system modules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {tabs.length > 0 && (
              <button
                type="button"
                onClick={clearAllTabs}
                className="px-2 py-1 rounded-xl text-[10px] font-mono text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                title="Clear all tabs"
              >
                CLEAR
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {tabs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs space-y-2">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No recent tabs open yet.</p>
              <p className="text-[10.5px] text-slate-500">
                Ask JARVIS: "Open website" or open any module to populate tabs!
              </p>
            </div>
          ) : (
            tabs.map((tab) => {
              const isWeb = tab.type === 'website';
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    playHudBeep(900, 0.05);
                    onSelectTab(tab);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-[#140108] border border-white/10 hover:border-[#ff1e42]/60 hover:bg-[#1a020b] transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isWeb
                          ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300'
                          : 'bg-[#ff1e42]/20 border border-[#ff1e42]/40 text-[#ff708a]'
                      }`}
                    >
                      {isWeb ? <Globe className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-200 block truncate">
                        {tab.title}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 block truncate">
                        {tab.url || `Screen: ${tab.screenName}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => removeTab(tab.id, e)}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/10 transition-colors"
                      title="Close Tab"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
