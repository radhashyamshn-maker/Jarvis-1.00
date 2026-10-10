import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Sparkles } from 'lucide-react';
import { LiveSession, type SessionState } from './lib/LiveSession';
import { ArcReactorCore } from './components/ArcReactorCore';
import { StarkHudGrid } from './components/StarkHudGrid';
import { TopHudHeader } from './components/TopHudHeader';
import { BottomDock } from './components/BottomDock';
import { VisionModal } from './components/VisionModal';
import { HistoryModal } from './components/HistoryModal';
import { ConfigModal } from './components/ConfigModal';
import { FeatureMatrixModal } from './components/FeatureMatrixModal';
import { FakeCallModal } from './components/FakeCallModal';
import { BreathingModal } from './components/BreathingModal';
import { NavigationModal } from './components/NavigationModal';
import { Futuristic2080Modal } from './components/Futuristic2080Modal';
import { ArtifactsModal } from './components/ArtifactsModal';
import { InAppBrowserModal } from './components/InAppBrowserModal';
import { RecentTabsModal, type RecentTabItem } from './components/RecentTabsModal';
import { SwipeNavigationIndicator } from './components/SwipeNavigationIndicator';
import { PermissionManager } from './components/PermissionManager';
import { checkSinglePermission, promptPermissionModal } from './lib/permissions';
import { subscribeToolExecution, type ToolExecutionEvent } from './lib/tools';
import { specialEvents } from './lib/specialEvents';
import { playHudBeep } from './lib/audioEffects';
import type { SassLevel } from './lib/systemPrompt';

export type ScreenId =
  | 'home'
  | 'features'
  | 'artifacts'
  | 'vision'
  | 'navigation'
  | '2080'
  | 'recent_tabs'
  | 'config'
  | 'history'
  | 'browser';

const SCREEN_CYCLE: ScreenId[] = [
  'home',
  'features',
  'artifacts',
  'vision',
  'navigation',
  '2080',
  'recent_tabs',
  'config',
  'history',
];

const SCREEN_NAMES: Record<ScreenId, string> = {
  home: 'Main Interface (Core)',
  features: '500+ Apps Matrix',
  artifacts: 'Stark Artifacts Studio',
  vision: 'Vision Sensor',
  navigation: 'Stark GPS Navigation',
  '2080': 'Year 2080 Matrix',
  recent_tabs: 'Recent Tabs & Apps',
  config: 'Settings & Config',
  history: 'Logs & History',
  browser: 'In-App Web Browser',
};

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
  const [showArtifacts, setShowArtifacts] = useState<boolean>(false);
  const [showNavigation, setShowNavigation] = useState<boolean>(false);
  const [show2080, setShow2080] = useState<boolean>(false);
  const [showBrowser, setShowBrowser] = useState<boolean>(false);
  const [browserUrl, setBrowserUrl] = useState<string>('');
  const [showRecentTabs, setShowRecentTabs] = useState<boolean>(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('normal');

  const [modelName, setModelName] = useState<string>(
    (import.meta as any).env?.VITE_MODEL || 'gemini-3.8-live'
  );

  const [voiceName, setVoiceName] = useState<string>(
    localStorage.getItem('jarvis_voice') || 'Aoede'
  );

  const [sassLevel, setSassLevel] = useState<SassLevel>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('jarvis_sass_level') as SassLevel) || 'sassy';
    }
    return 'sassy';
  });

  const liveSessionRef = useRef<LiveSession | null>(null);
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlePersonalityChangeRef = useRef<((level: SassLevel) => void) | null>(null);

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

    // Subscribe to personality changed events
    const unsubPersonality = specialEvents.on('personality_changed', (data: any) => {
      if (data?.level) {
        handlePersonalityChangeRef.current?.(data.level);
      }
    });

    // Subscribe to navigation events
    const unsubNav = specialEvents.on('open_navigation', () => {
      setShowNavigation(true);
    });

    // Subscribe to 2080 modal events
    const unsub2080 = specialEvents.on('open_2080_modal', () => {
      setShow2080(true);
    });

    // Subscribe to in-app browser and recent tabs events
    const unsubBrowser = specialEvents.on('open_inapp_browser', (data: any) => {
      if (data?.url) {
        setBrowserUrl(data.url);
        setShowBrowser(true);
      }
    });

    const unsubCloseBrowser = specialEvents.on('close_inapp_browser', () => {
      setShowBrowser(false);
    });

    const unsubTabs = specialEvents.on('open_recent_tabs', () => {
      setShowRecentTabs(true);
    });

    // Subscribe to artifacts studio events
    const unsubArtifacts = specialEvents.on('open_artifacts', () => {
      setShowArtifacts(true);
    });

    // Subscribe to device navigation commands
    const unsubDevNav = specialEvents.on('device_navigate', (data: any) => {
      const act = (data?.action || '').toLowerCase();
      const scr = (data?.screen || '').toLowerCase();

      if (act === 'back') {
        // First prioritize closing browser if open
        setShowBrowser((b) => {
          if (b) return false;
          return b;
        });
        // Next prioritize closing recent tabs if open
        setShowRecentTabs((t) => {
          if (t) return false;
          return t;
        });
        setShowArtifacts((a) => { if (a) return false; return a; });
        setShowVision((v) => { if (v) return false; return v; });
        setShowHistory((h) => { if (h) return false; return h; });
        setShowConfig((c) => { if (c) return false; return c; });
        setShowFeatures((f) => { if (f) return false; return f; });
        setShowNavigation((n) => { if (n) return false; return n; });
        setShow2080((q) => { if (q) return false; return q; });
        if (window.history.length > 1) window.history.back();
      } else if (act === 'home') {
        setShowBrowser(false);
        setShowRecentTabs(false);
        setShowArtifacts(false);
        setShowVision(false);
        setShowHistory(false);
        setShowConfig(false);
        setShowFeatures(false);
        setShowNavigation(false);
        setShow2080(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (act === 'recent_tabs' || act === 'tabs') {
        setShowRecentTabs(true);
      } else if (act === 'close_browser') {
        setShowBrowser(false);
      } else if (act === 'scroll_up') {
        window.scrollBy({ top: -400, behavior: 'smooth' });
      } else if (act === 'scroll_down') {
        window.scrollBy({ top: 400, behavior: 'smooth' });
      } else if (act === 'scroll_top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (act === 'scroll_bottom') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else if (act === 'open_screen') {
        if (scr.includes('setting') || scr.includes('config')) setShowConfig(true);
        else if (scr.includes('artifact') || scr.includes('blueprint') || scr.includes('studio')) setShowArtifacts(true);
        else if (scr.includes('vision') || scr.includes('camera')) setShowVision(true);
        else if (scr.includes('history')) setShowHistory(true);
        else if (scr.includes('app') || scr.includes('feature')) setShowFeatures(true);
        else if (scr.includes('nav') || scr.includes('map')) setShowNavigation(true);
        else if (scr.includes('2080') || scr.includes('quantum')) setShow2080(true);
      }
    });

    return () => {
      unsubscribe();
      unsubPersonality();
      unsubArtifacts();
      unsubNav();
      unsub2080();
      unsubBrowser();
      unsubCloseBrowser();
      unsubTabs();
      unsubDevNav();
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

  // Screen Management for Gesture & Modal Navigation
  const getActiveScreen = (): ScreenId => {
    if (showBrowser) return 'browser';
    if (showArtifacts) return 'artifacts';
    if (showVision) return 'vision';
    if (showFeatures) return 'features';
    if (showNavigation) return 'navigation';
    if (show2080) return '2080';
    if (showRecentTabs) return 'recent_tabs';
    if (showHistory) return 'history';
    if (showConfig) return 'config';
    return 'home';
  };

  const closeAllScreens = () => {
    setShowBrowser(false);
    setShowArtifacts(false);
    setShowVision(false);
    setShowFeatures(false);
    setShowNavigation(false);
    setShow2080(false);
    setShowRecentTabs(false);
    setShowHistory(false);
    setShowConfig(false);
  };

  const navigateToScreen = (target: ScreenId) => {
    closeAllScreens();
    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'features') {
      setShowFeatures(true);
    } else if (target === 'artifacts') {
      setShowArtifacts(true);
    } else if (target === 'vision') {
      setShowVision(true);
    } else if (target === 'navigation') {
      setShowNavigation(true);
    } else if (target === '2080') {
      setShow2080(true);
    } else if (target === 'recent_tabs') {
      setShowRecentTabs(true);
    } else if (target === 'history') {
      setShowHistory(true);
    } else if (target === 'config') {
      setShowConfig(true);
    } else if (target === 'browser') {
      setShowBrowser(true);
    }
  };

  // Horizontal Swipe Gesture Handling
  const [swipeFeedback, setSwipeFeedback] = useState<{
    direction: 'left' | 'right';
    screenName: string;
  } | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const mouseStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleSwipeNavigate = (direction: 'left' | 'right') => {
    const current = getActiveScreen();
    let nextScreen: ScreenId = 'home';

    if (current === 'browser') {
      if (direction === 'right') {
        nextScreen = 'home';
      } else {
        nextScreen = 'recent_tabs';
      }
    } else {
      const idx = SCREEN_CYCLE.indexOf(current);
      if (idx === -1) {
        nextScreen = direction === 'left' ? 'features' : 'home';
      } else if (direction === 'left') {
        const nextIdx = (idx + 1) % SCREEN_CYCLE.length;
        nextScreen = SCREEN_CYCLE[nextIdx];
      } else {
        const prevIdx = (idx - 1 + SCREEN_CYCLE.length) % SCREEN_CYCLE.length;
        nextScreen = SCREEN_CYCLE[prevIdx];
      }
    }

    try {
      if ('vibrate' in navigator) navigator.vibrate(15);
    } catch {}
    playHudBeep(980, 0.04);

    navigateToScreen(nextScreen);

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setSwipeFeedback({
      direction,
      screenName: SCREEN_NAMES[nextScreen] || nextScreen.toUpperCase(),
    });
    feedbackTimeoutRef.current = setTimeout(() => {
      setSwipeFeedback(null);
    }, 900);
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length === 0) return;
      const start = touchStartRef.current;
      touchStartRef.current = null;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - start.x;
      const dy = endY - start.y;
      const elapsed = Date.now() - start.time;

      if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.35 && elapsed < 800) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.getAttribute('role') === 'slider')
        ) {
          return;
        }
        if (dx < 0) {
          handleSwipeNavigate('left');
        } else {
          handleSwipeNavigate('right');
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('button') ||
        target?.closest('input') ||
        target?.closest('a') ||
        target?.closest('textarea') ||
        target?.closest('.no-swipe')
      ) {
        return;
      }
      mouseStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!mouseStartRef.current) return;
      const start = mouseStartRef.current;
      mouseStartRef.current = null;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const elapsed = Date.now() - start.time;

      if (Math.abs(dx) >= 65 && Math.abs(dx) > Math.abs(dy) * 1.35 && elapsed < 800) {
        if (dx < 0) {
          handleSwipeNavigate('left');
        } else {
          handleSwipeNavigate('right');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [
    showBrowser,
    showVision,
    showFeatures,
    showNavigation,
    show2080,
    showRecentTabs,
    showHistory,
    showConfig,
  ]);

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

  const handlePersonalityChange = async (newLevel: SassLevel) => {
    setSassLevel(newLevel);
    localStorage.setItem('jarvis_sass_level', newLevel);

    // If active session, reconnect with the updated personality system prompt
    if (state !== 'disconnected') {
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
        liveSessionRef.current = null;
      }
      setState('connecting');
      try {
        const session = new LiveSession(
          {
            model: modelName,
            voiceName,
            sassLevel: newLevel,
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
        console.error('Personality reconnect error:', err);
        setError(err?.message || 'Failed to reconnect with new personality.');
        setState('disconnected');
      }
    }
  };
  handlePersonalityChangeRef.current = handlePersonalityChange;

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
            sassLevel,
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
      {/* Background Stark HUD Grid Overlay with subtle breathing glow synchronized with audio input level */}
      <StarkHudGrid audioLevel={audioLevel} state={state} />

      {/* TOP HEADER: Framed HUD bar with corner reticles, JARVIS orb, Status Pill, PERMS, 500+ APPS & Clock */}
      <header className="relative z-10 w-full shrink-0 space-y-1">
        <TopHudHeader
          state={state}
          onOpenFeatures={() => setShowFeatures(true)}
          onOpenPermissions={() => promptPermissionModal('all')}
        />
        {/* HORIZONTAL SWIPE CAROUSEL & HUD CUES */}
        <SwipeNavigationIndicator
          activeScreen={getActiveScreen()}
          swipeFeedback={swipeFeedback}
          onSelectScreen={(screen) => {
            playHudBeep(920, 0.04);
            navigateToScreen(screen);
          }}
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

      <NavigationModal
        isOpen={showNavigation}
        onClose={() => setShowNavigation(false)}
      />

      <Futuristic2080Modal
        isOpen={show2080}
        onClose={() => setShow2080(false)}
      />

      <ArtifactsModal
        isOpen={showArtifacts}
        onClose={() => setShowArtifacts(false)}
      />

      {/* IN-APP STARK WEB BROWSER MODAL */}
      <InAppBrowserModal
        isOpen={showBrowser}
        url={browserUrl}
        onClose={() => setShowBrowser(false)}
        onOpenRecentTabs={() => setShowRecentTabs(true)}
      />

      {/* RECENT TABS & APPS SWITCHER MODAL */}
      <RecentTabsModal
        isOpen={showRecentTabs}
        onClose={() => setShowRecentTabs(false)}
        onSelectTab={(tab) => {
          if (tab.type === 'website' && tab.url) {
            setBrowserUrl(tab.url);
            setShowBrowser(true);
          } else if (tab.type === 'screen') {
            if (tab.screenName === 'navigation') setShowNavigation(true);
            else if (tab.screenName === 'vision') setShowVision(true);
            else if (tab.screenName === '2080') setShow2080(true);
            else if (tab.screenName === 'settings') setShowConfig(true);
          }
        }}
      />

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
        sassLevel={sassLevel}
        onPersonalityChange={handlePersonalityChange}
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
