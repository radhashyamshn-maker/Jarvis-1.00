import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ArrowLeft,
  X,
  ExternalLink,
  RotateCw,
  Shield,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { specialEvents } from '../lib/specialEvents';
import { playHudBeep } from '../lib/audioEffects';

interface InAppBrowserModalProps {
  isOpen: boolean;
  url: string;
  onClose: () => void;
  onOpenRecentTabs: () => void;
}

export const InAppBrowserModal: React.FC<InAppBrowserModalProps> = ({
  isOpen,
  url,
  onClose,
  onOpenRecentTabs,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(url);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (url) {
      setCurrentUrl(url);
      setIframeError(false);
      setIsLoading(true);
    }
  }, [url]);

  if (!isOpen) return null;

  const handleOpenExternal = () => {
    playHudBeep(900, 0.05);
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl h-[92vh] rounded-3xl glass-panel border border-[#ff1e42]/50 flex flex-col overflow-hidden shadow-[0_0_60px_rgba(255,30,66,0.35)] relative"
      >
        {/* Browser Top Navigation Bar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-[#140108] border-b border-[#ff1e42]/30 text-white shrink-0">
          <div className="flex items-center gap-1.5">
            {/* BACK / EXIT BUTTON */}
            <button
              type="button"
              onClick={() => {
                playHudBeep(700, 0.04);
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-[#ff1e42]/30 text-slate-300 hover:text-white flex items-center gap-1 text-xs font-mono font-bold transition-all"
              title="Go Back to JARVIS (Peeche Jao)"
            >
              <ArrowLeft className="w-4 h-4 text-[#ff1e42]" />
              <span className="hidden sm:inline">BACK</span>
            </button>

            {/* RECENT TABS BUTTON */}
            <button
              type="button"
              onClick={() => {
                playHudBeep(850, 0.04);
                onOpenRecentTabs();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-purple-900/40 text-purple-300 hover:text-white flex items-center gap-1 text-xs font-mono font-bold transition-all"
              title="Open Recent Tabs (Recent Tab me kholo)"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">RECENT TABS</span>
            </button>
          </div>

          {/* URL Address Bar */}
          <div className="flex-1 max-w-md mx-2 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-slate-300 truncate">
            <Globe className="w-3.5 h-3.5 text-[#ff708a] shrink-0" />
            <span className="truncate">{currentUrl}</span>
            <Shield className="w-3 h-3 text-emerald-400 shrink-0 ml-auto" />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Open in external Chrome Tab */}
            <button
              type="button"
              onClick={handleOpenExternal}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-cyan-900/40 text-cyan-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-all"
              title="Open in new Chrome Tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">CHROME</span>
            </button>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => {
                playHudBeep(600, 0.03);
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Close Browser"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Content Area */}
        <div className="flex-1 w-full h-full relative bg-black/80 flex flex-col items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm space-y-2">
              <RotateCw className="w-6 h-6 text-[#ff1e42] animate-spin" />
              <span className="text-xs font-mono text-slate-300">
                Loading Stark Webview: {currentUrl}
              </span>
            </div>
          )}

          {/* Fallback Card for headers blocking iframe embedding (X-Frame-Options) */}
          {iframeError ? (
            <div className="p-6 max-w-md text-center rounded-3xl bg-[#150209] border border-[#ff1e42]/40 space-y-4">
              <Globe className="w-12 h-12 text-[#ff1e42] mx-auto animate-pulse" />
              <div>
                <h4 className="text-sm font-mono font-bold text-white uppercase">
                  SECURITY POLICY NOTICE
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  This website ({currentUrl}) prevents direct in-frame loading. Click below to launch in Chrome!
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenExternal}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#990022] to-[#ff1e42] text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_#ff1e42]"
              >
                OPEN IN CHROME TAB
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <iframe
              src={currentUrl}
              title="Stark In-App Browser"
              className="w-full h-full border-none rounded-b-2xl bg-white"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setIframeError(true);
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};
