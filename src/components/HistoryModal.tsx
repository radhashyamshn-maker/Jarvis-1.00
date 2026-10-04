import React from 'react';
import { motion } from 'framer-motion';
import { FileText, X, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import type { ToolExecutionEvent } from '../lib/tools';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  actions: ToolExecutionEvent[];
  onClear: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  actions,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl glass-panel border border-[#ff1e42]/40 p-5 text-white shadow-[0_0_50px_rgba(255,30,66,0.3)] relative overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Corner HUD Reticles */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#ff1e42]" />

        <div className="flex items-center justify-between pb-3 border-b border-[#ff1e42]/20 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#ff1e42]" />
            <h3 className="font-mono text-sm tracking-widest uppercase font-bold text-white">
              COMMAND LOGS & HISTORY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
          {actions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 font-mono text-xs">
              <Clock className="w-6 h-6 mb-2 text-[#ff1e42]/40" />
              <span>NO RECORDED INTERACTIONS YET</span>
              <span className="text-[10px] text-slate-600 mt-1">
                Say "Sir, play YouTube" or "Set alarm" to start
              </span>
            </div>
          ) : (
            actions.map((act, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-[#160209] border border-[#ff1e42]/20 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#ff1e42] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#ff708a] uppercase tracking-wider text-[11px]">
                      {act.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(act.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs mt-1 truncate">
                    {act.result?.message ||
                      act.args?.query ||
                      act.args?.url ||
                      act.args?.appName ||
                      JSON.stringify(act.args)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer controls */}
        {actions.length > 0 && (
          <div className="pt-3 border-t border-[#ff1e42]/20 mt-2 shrink-0">
            <button
              onClick={onClear}
              className="w-full py-2 rounded-xl glass-pill-hud text-slate-300 hover:text-white font-mono text-xs tracking-wider uppercase flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              CLEAR LOG ARCHIVE
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
