import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Mic,
  Camera,
  MapPin,
  Users,
  PhoneCall,
  FolderLock,
  Layers,
  MonitorPlay,
  Activity,
  BellRing,
  BatteryCharging,
  Power,
  CheckCircle2,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  type PermissionType,
  type PermissionState,
  checkSinglePermission,
  requestSinglePermission,
} from '../lib/permissions';
import { specialEvents } from '../lib/specialEvents';
import { playHudBeep } from '../lib/audioEffects';

export interface PermissionConfigItem {
  id: PermissionType;
  title: string;
  hindiTitle: string;
  desc: string;
  icon: any;
  category: 'core' | 'communication' | 'advanced';
  androidManifestTag: string;
}

// Exactly 12 critical permissions systematically organized:
export const CRITICAL_PERMISSIONS: PermissionConfigItem[] = [
  // 1. Microphone
  {
    id: 'microphone',
    title: 'Microphone (Audio Live)',
    hindiTitle: 'माइक्रोफ़ोन',
    desc: 'Real-time 16kHz duplex audio for continuous bidirectional voice-to-voice stream.',
    icon: Mic,
    category: 'core',
    androidManifestTag: 'android.permission.RECORD_AUDIO',
  },
  // 2. Camera
  {
    id: 'camera',
    title: 'Camera (Vision HUD)',
    hindiTitle: 'कैमरा विज़न',
    desc: 'Real-time camera feed analysis, object recognition, document OCR & spatial vision.',
    icon: Camera,
    category: 'core',
    androidManifestTag: 'android.permission.CAMERA',
  },
  // 3. Location
  {
    id: 'location',
    title: 'GPS Location & Background',
    hindiTitle: 'लोकेशन (GPS & बैकग्राउंड)',
    desc: 'Precise GPS tracking for weather, route navigation & Emergency SOS broadcast.',
    icon: MapPin,
    category: 'core',
    androidManifestTag: 'android.permission.ACCESS_FINE_LOCATION',
  },
  // 4. Contacts
  {
    id: 'contacts',
    title: 'Contacts Directory',
    hindiTitle: 'कॉन्टैक्ट्स एक्सेस',
    desc: 'Contact list access for speed dialing, contact lookup & emergency contacts.',
    icon: Users,
    category: 'communication',
    androidManifestTag: 'android.permission.READ_CONTACTS',
  },
  // 5. Call/SMS
  {
    id: 'phone',
    title: 'Call / SMS Dispatch',
    hindiTitle: 'फ़ोन कॉल व SMS',
    desc: 'Initiate phone calls and send SMS alerts to emergency contacts directly.',
    icon: PhoneCall,
    category: 'communication',
    androidManifestTag: 'android.permission.CALL_PHONE, SEND_SMS',
  },
  // 6. Storage
  {
    id: 'storage',
    title: 'Storage (All Files Access)',
    hindiTitle: 'ऑल फाइल्स एक्सेस',
    desc: 'Read and write system files, documents, and media for memory indexing.',
    icon: FolderLock,
    category: 'communication',
    androidManifestTag: 'android.permission.MANAGE_EXTERNAL_STORAGE',
  },
  // 7. Accessibility
  {
    id: 'accessibility',
    title: 'Accessibility Service',
    hindiTitle: 'एक्सेसिबिलिटी सर्विस',
    desc: 'Automated button clicking, scrolling, and system interaction protocols.',
    icon: Activity,
    category: 'advanced',
    androidManifestTag: 'BIND_ACCESSIBILITY_SERVICE',
  },
  // 8. Notification Listener
  {
    id: 'notifications_listener',
    title: 'Notification Listener',
    hindiTitle: 'नोटिफिकेशन लिसनर',
    desc: 'Intercept incoming WhatsApp, Telegram & OTP alerts in real-time.',
    icon: BellRing,
    category: 'advanced',
    androidManifestTag: 'BIND_NOTIFICATION_LISTENER_SERVICE',
  },
  // 9. Overlay
  {
    id: 'overlay',
    title: 'Overlay (Display Over Apps)',
    hindiTitle: 'डिस्प्ले ओवर अदर ऐप्स',
    desc: 'Floating Arc Reactor HUD bubble over games, browser, and navigation.',
    icon: Layers,
    category: 'advanced',
    androidManifestTag: 'android.permission.SYSTEM_ALERT_WINDOW',
  },
  // 10. Screen Capture
  {
    id: 'screen_capture',
    title: 'Screen Capture (MediaProjection)',
    hindiTitle: 'स्क्रीन कैप्चर',
    desc: 'Real-time on-screen inspection, reading on-screen UI text & assistance.',
    icon: MonitorPlay,
    category: 'advanced',
    androidManifestTag: 'FOREGROUND_SERVICE_MEDIA_PROJECTION',
  },
  // 11. Battery Optimization
  {
    id: 'battery_optimization',
    title: 'Battery Optimization Ignore',
    hindiTitle: 'बैटरी ऑप्टिमाइजेशन इग्नोर',
    desc: 'Prevents OS background sleep killer; keeps JARVIS AI assistant alive 24/7.',
    icon: BatteryCharging,
    category: 'advanced',
    androidManifestTag: 'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
  },
  // 12. Auto-Start
  {
    id: 'auto_start',
    title: 'Auto-Start on Boot',
    hindiTitle: 'ऑटो-स्टार्ट ऑन बूट',
    desc: 'Starts JARVIS background service automatically when device finishes booting.',
    icon: Power,
    category: 'advanced',
    androidManifestTag: 'RECEIVE_BOOT_COMPLETED',
  },
];

export const PermissionManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [targetedPermission, setTargetedPermission] = useState<PermissionType>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'core' | 'communication' | 'advanced'>('all');
  const [statuses, setStatuses] = useState<Record<string, PermissionState>>({});
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [iterationProgress, setIterationProgress] = useState<{
    current: number;
    total: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    const initCheck = async () => {
      const mic = await checkSinglePermission('microphone');
      const cam = await checkSinglePermission('camera');
      const loc = await checkSinglePermission('location');
      const con = await checkSinglePermission('contacts');
      const scr = await checkSinglePermission('screen_capture');

      const initialStatuses: Record<string, PermissionState> = {
        microphone: mic,
        camera: cam,
        location: loc,
        contacts: con,
        phone: 'prompt',
        storage: 'prompt',
        accessibility: 'prompt',
        notifications_listener: 'prompt',
        overlay: 'prompt',
        screen_capture: scr,
        battery_optimization: 'prompt',
        auto_start: 'prompt',
      };
      setStatuses(initialStatuses);

      // Auto-prompt on initial launch if microphone is not yet granted
      const hasPrompted = localStorage.getItem('jarvis_permissions_systematic_prompted_v3');
      if (!hasPrompted && mic !== 'granted') {
        localStorage.setItem('jarvis_permissions_systematic_prompted_v3', 'true');
        setTargetedPermission('all');
        setIsOpen(true);
      }
    };

    initCheck();

    const unsub = specialEvents.on('request_runtime_permission', (data) => {
      const type: PermissionType = data?.type || 'all';
      setTargetedPermission(type);
      setIsOpen(true);
    });

    return () => unsub();
  }, []);

  const handleGrantSingle = async (type: PermissionType) => {
    setLoadingType(type);
    const success = await requestSinglePermission(type);
    setStatuses((prev) => ({
      ...prev,
      [type]: success ? 'granted' : 'denied',
    }));
    setLoadingType(null);
    playHudBeep();

    if (targetedPermission === type && success) {
      setTimeout(() => setIsOpen(false), 900);
    }
  };

  /**
   * Systematically iterates through all 12 critical permissions one by one
   */
  const handleGrantAllSystematically = async () => {
    const total = CRITICAL_PERMISSIONS.length;

    for (let i = 0; i < total; i++) {
      const perm = CRITICAL_PERMISSIONS[i];
      setIterationProgress({
        current: i + 1,
        total,
        title: perm.title,
      });
      setLoadingType(perm.id);

      // Systematically execute grant/request
      const success = await requestSinglePermission(perm.id);
      setStatuses((prev) => ({
        ...prev,
        [perm.id]: success ? 'granted' : 'denied',
      }));

      playHudBeep();

      // Small delay between iterations for visual confirmation
      await new Promise((resolve) => setTimeout(resolve, 220));
    }

    setLoadingType(null);
    setIterationProgress(null);
    setTimeout(() => setIsOpen(false), 900);
  };

  if (!isOpen) return null;

  const filteredItems =
    activeTab === 'all'
      ? CRITICAL_PERMISSIONS
      : CRITICAL_PERMISSIONS.filter((item) => item.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        className="w-full max-w-lg rounded-3xl glass-panel border border-[#ff1e42]/50 p-4 sm:p-6 text-white shadow-[0_0_60px_rgba(255,30,66,0.35)] relative overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Reticles */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#ff1e42]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ff1e42]/20 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#26030e] border border-[#ff1e42]/50 text-[#ff1e42] shadow-[0_0_12px_#ff1e42]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-sm tracking-wider uppercase font-bold text-white">
                ANDROID RUNTIME PERMISSIONS (12 CRITICAL)
              </h3>
              <p className="text-[10px] font-mono text-[#ff708a]">
                Systematic Hardware, Communication, Overlay & Service Engine
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
            aria-label="Dismiss permissions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Systematic Iteration Progress Banner */}
        <AnimatePresence>
          {iterationProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-2 rounded-xl bg-[#2b020e] border border-[#ff1e42] flex items-center justify-between font-mono text-xs shadow-[0_0_15px_#ff1e42]"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#ff1e42] animate-spin" />
                <span>
                  Iterating [{iterationProgress.current}/{iterationProgress.total}]:{' '}
                  <span className="text-white font-bold">{iterationProgress.title}</span>
                </span>
              </div>
              <span className="text-[10px] text-green-400 font-bold">
                {Math.round((iterationProgress.current / iterationProgress.total) * 100)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none">
          {[
            { id: 'all', label: 'All 12 Critical' },
            { id: 'core', label: 'Core Hardware (3)' },
            { id: 'communication', label: 'Call, Contacts & Storage (3)' },
            { id: 'advanced', label: 'Services, Overlay & Boot (6)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase whitespace-nowrap transition-colors border ${
                activeTab === tab.id
                  ? 'bg-[#ff1e42] text-white border-[#ff1e42] shadow-[0_0_10px_#ff1e42]'
                  : 'bg-[#18020a] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 12 Permissions List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
          {filteredItems.map((perm, idx) => {
            const Icon = perm.icon;
            const isGranted = statuses[perm.id] === 'granted';
            const isTargeted = targetedPermission === perm.id;
            const isLoading = loadingType === perm.id;

            return (
              <div
                key={perm.id}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
                  isTargeted || isLoading
                    ? 'bg-[#290212] border-[#ff1e42] shadow-[0_0_15px_rgba(255,30,66,0.35)]'
                    : 'bg-[#120107] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl border mt-0.5 shrink-0 ${
                        isGranted
                          ? 'bg-green-950/60 border-green-500/40 text-green-400'
                          : isLoading
                          ? 'bg-[#ff1e42]/20 border-[#ff1e42] text-[#ff1e42] animate-pulse'
                          : 'bg-[#29030f] border-[#ff1e42]/40 text-[#ff708a]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                        <h4 className="font-mono text-xs font-bold text-white">{perm.title}</h4>
                        <span className="text-[10px] text-[#ff99ac] font-sans">
                          ({perm.hindiTitle})
                        </span>
                        {isTargeted && (
                          <span className="px-1.5 py-0.2 rounded bg-[#ff1e42] text-[8px] font-mono uppercase font-bold">
                            INVOKED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{perm.desc}</p>
                      <span className="text-[9px] font-mono text-cyan-300/80 mt-1 block truncate">
                        ➔ {perm.androidManifestTag}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 self-center">
                    {isGranted ? (
                      <span className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-[9.5px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ALLOWED
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleGrantSingle(perm.id)}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 rounded-xl bg-[#ff1e42] hover:bg-[#d90429] text-white font-mono text-[10px] font-bold shadow-[0_0_10px_#ff1e42] active:scale-95 transition-transform"
                      >
                        {isLoading ? '...' : 'GRANT'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGrantAllSystematically}
            disabled={iterationProgress !== null}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#990022] via-[#d90429] to-[#ff1e42] hover:brightness-110 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,30,66,0.4)] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            {iterationProgress ? 'ITERATING PERMISSIONS...' : 'GRANT ALL 12 PERMISSIONS (SYSTEMATIC)'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-mono text-xs uppercase"
          >
            LATER
          </button>
        </div>
      </motion.div>
    </div>
  );
};
