import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Sparkles } from 'lucide-react';
import { LiveSession, type SessionState } from './lib/LiveSession';
import { ArcReactorCore } from './components/ArcReactorCore';
import { TopHudHeader } from './components/TopHudHeader';
import { BottomDock } from './components/BottomDock';
import { VisionModal } from './components/VisionModal';
import { HistoryModal } from './components/HistoryModal';
import { ConfigModal } from './components/ConfigModal';
import { FeatureMatrixModal } from './components/FeatureMatrixModal';
import { FakeCallModal } from './components/FakeCallModal';
import { BreathingModal } from './components/BreathingModal';
import { PermissionManager } from './components/PermissionManager';
import { checkSinglePermission, promptPermissionModal } from './lib/permissions';
import { subscribeToolExecution, type ToolExecutionEvent } from './lib/tools';

export default function App() {
  const [state, setState] = useState<SessionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [lastAction, setLastAction] = useState<ToolExecutionEvent | null>(null);
  const [historyList, setHistoryList] = useState<ToolExecutionEvent[]>([]);

  // Modals
  const [showVision, setShowVision] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showFeatures, setShowFeatures] = useState<boolean>(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('normal');

  const [modelName, setModelName] = useState<string>(
    (import.meta as any).env?.VITE_MODEL || 'gemini-3.8-live'
  );

  const [voiceName, setVoiceName] = useState<string>(
    localStorage.getItem('jarvis_voice') || 'Aoede'
  );

  const liveSessionRef = useRef<LiveSession | null>(null);
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to tool execution events
  useEffect(() => {
    const unsubscribe = subscribeToolExecution((event) => {
      setLastAction(event);
      setHistoryList((prev) => [event, ...prev].slice(0, 30));

      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      actionTimeoutRef.current = setTimeout(() => {
        setLastAction(null);
      }, 5000);
    });

    return () => {
      unsubscribe();
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
      }
    };
  }, []);

  const handleVoiceChange = (newVoice: string) => {
    setVoiceName(newVoice);
    localStorage.setItem('jarvis_voice', newVoice);
    if (state !== 'disconnected') {
      // Reconnect with new voice
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
        liveSessionRef.current = null;
      }
      setState('disconnected');
    }
  };

  const handleVisionClick = async () => {
    const cam = await checkSinglePermission('camera');
    if (cam !== 'granted') {
      promptPermissionModal('camera');
    } else {
      setShowVision(true);
    }
  };

  const handleToggle = async () => {
    setError(null);

    if (state === 'disconnected') {
      // Check microphone permission first
      const mic = await checkSinglePermission('microphone');
      if (mic !== 'granted') {
        promptPermissionModal('microphone');
        return;
      }

      try {
        const session = new LiveSession(
          {
            model: modelName,
            voiceName,
          },
          {
            onStateChange: (newState) => {
              setState(newState);
            },
            onError: (err) => {
              setError(err);
              setState('disconnected');
            },
            onAudioLevel: (level) => {
              setAudioLevel(level);
            },
            onEmotionChange: (emotion) => {
              setCurrentEmotion(emotion);
            },
          }
        );

        liveSessionRef.current = session;
        await session.connect();
      } catch (err: any) {
        console.error('Session start error:', err);
        setError(err?.message || 'Failed to start JARVIS session.');
        setState('disconnected');
      }
    } else {
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
        liveSessionRef.current = null;
      }
      setState('disconnected');
    }
  };

  // Get Sub-Core HUD Status Text
  const getSubCoreText = () => {
    if (lastAction) {
      return `EXECUTED: ${lastAction.name.toUpperCase()}`;
    }
    switch (state) {
      case 'connecting':
        return 'INITIALIZING QUANTUM PROTOCOLS...';
      case 'listening':
        return 'TRANSCRIBING VOICE INPUT...';
      case 'speaking':
        if (currentEmotion === 'whisper') {
          return 'VOCAL SYNTHESIS [WHISPER PROSODY • 0.92x • 4.2kHz]';
        } else if (currentEmotion === 'excitement') {
          return 'VOCAL SYNTHESIS [HIGH EXCITEMENT • 1.15x • +75¢]';
        } else if (currentEmotion === 'tiredness') {
          return 'VOCAL SYNTHESIS [SOOTHING BEDTIME • 0.88x • -50¢]';
        } else if (currentEmotion === 'calm') {
          return 'VOCAL SYNTHESIS [CALM SERENE • 0.96x]';
        }
        return 'JARVIS VOCAL SYNTHESIS ACTIVE...';
      case 'disconnected':
      default:
        return '';
    }
  };

  return (
    <main className="relative flex flex-col justify-between h-screen w-screen max-w-lg mx-auto bg-[#060104] text-slate-100 overflow-hidden select-none px-3.5 safe-top safe-bottom">
      {/* Background Stark HUD Grid Overlay */}
      <div className="absolute inset-0 hud-grid pointer-events-none opacity-60 z-0" />

      {/* Ambient Vignette & Core Lighting */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 30, 66, 0.12) 0%, rgba(6, 1, 4, 0.95) 75%)',
        }}
      />

      {/* TOP HEADER: Framed HUD bar with corner reticles, JARVIS orb, Status Pill, PERMS, 500+ APPS & Clock */}
      <header className="relative z-10 w-full shrink-0">
        <TopHudHeader
          state={state}
          onOpenFeatures={() => setShowFeatures(true)}
          onOpenPermissions={() => promptPermissionModal('all')}
        />
      </header>

      {/* CENTER STAGE: Animated Arc Reactor Core + Sub-Core Monospace Status */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto w-full py-2">
        {/* Animated Lag-Free Arc Reactor Core */}
        <ArcReactorCore
          state={state}
          audioLevel={audioLevel}
          onCoreClick={handleToggle}
        />

        {/* Sub-Core Monospace Status Text */}
        <div className="mt-6 sm:mt-8 px-4 text-center max-w-sm min-h-[24px] flex items-center justify-center">
          {getSubCoreText() ? (
            <motion.p
              key={getSubCoreText()}
              initial={{ opacity: 0.6, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs sm:text-[13px] tracking-[0.24em] font-semibold text-[#ff708a] uppercase drop-shadow-[0_0_8px_rgba(255,30,66,0.5)]"
            >
              {getSubCoreText()}
            </motion.p>
          ) : null}

          {/* Quick Tool Execution Banner if an action was executed */}
          <AnimatePresence>
            {lastAction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="mt-3 px-3 py-1.5 rounded-full glass-pill-hud border border-[#ff1e42]/50 text-[11px] font-mono text-[#fff] flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,30,66,0.3)] mx-auto max-w-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ff1e42] animate-pulse" />
                <span className="truncate">
                  {lastAction.result?.message ||
                    lastAction.args?.query ||
                    lastAction.args?.appName ||
                    'Action completed, Sir.'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* BOTTOM CONTROL DOCK: [ACTIVE] [VISION] [MIC ORB] [APPS (500+)] [CONFIG] */}
      <footer className="relative z-20 w-full shrink-0 pb-2">
        <BottomDock
          state={state}
          onMicToggle={handleToggle}
          onVisionClick={handleVisionClick}
          onHistoryClick={() => setShowHistory(true)}
          onFeaturesClick={() => setShowFeatures(true)}
          onConfigClick={() => setShowConfig(true)}
        />
      </footer>

      {/* RUNTIME PERMISSION MANAGER */}
      <PermissionManager />

      {/* INTERACTIVE MODALS & FEATURES */}
      <FeatureMatrixModal
        isOpen={showFeatures}
        onClose={() => setShowFeatures(false)}
        currentVoice={voiceName}
        onVoiceChange={handleVoiceChange}
      />

      <FakeCallModal />

      <BreathingModal />

      <VisionModal
        isOpen={showVision}
        onClose={() => setShowVision(false)}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        actions={historyList}
        onClear={() => setHistoryList([])}
      />

      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        model={modelName}
        onModelChange={(newModel) => setModelName(newModel)}
      />

      {/* HUD ERROR TOAST */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-50 p-3.5 rounded-2xl glass-panel border border-red-500/60 bg-[#2b0008]/85 backdrop-blur-xl shadow-[0_0_30px_rgba(255,0,0,0.4)] flex items-start gap-3 text-red-200"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs font-mono leading-relaxed">
              <strong className="font-bold block text-red-100 uppercase tracking-wider mb-0.5">
                SYSTEM PROTOCOL ALERT
              </strong>
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-red-300"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
