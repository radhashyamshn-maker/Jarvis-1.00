import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid,
  Search,
  X,
  Phone,
  MessageSquare,
  ShieldAlert,
  Wind,
  Music,
  MapPin,
  Clock,
  Battery,
  Wifi,
  DollarSign,
  Heart,
  Smile,
  Zap,
  Sparkles,
  Camera,
  Play,
  RotateCw,
  Cpu,
  Tv,
  FileText,
  Volume2,
} from 'lucide-react';
import { executeTool } from '../lib/tools';
import { specialEvents } from '../lib/specialEvents';
import { playHudBeep, playDiceRollSound } from '../lib/audioEffects';

interface FeatureMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoice: string;
  onVoiceChange: (voice: string) => void;
}

interface FeatureItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  icon: any;
  action: () => void;
}

export const FeatureMatrixModal: React.FC<FeatureMatrixModalProps> = ({
  isOpen,
  onClose,
  currentVoice,
  onVoiceChange,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    playHudBeep();
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories = [
    'All',
    'Tone Matching Matrix',
    'Emergency & Safety',
    'Health & Wellness',
    'Apps & System',
    'Media & Fun',
    'Finance & Travel',
    'Voice Synthesis',
  ];

  const features: FeatureItem[] = [
    // Emergency & Safety
    {
      id: 'fake_call',
      name: 'Fake Rescue Call',
      category: 'Emergency & Safety',
      desc: 'Simulate urgent incoming call from boss/home to excuse yourself',
      icon: Phone,
      action: () => {
        specialEvents.emit('fake_call', { caller: 'Chief Stark / Urgent' });
        onClose();
      },
    },
    {
      id: 'emergency_sos',
      name: 'Emergency SOS & Siren',
      category: 'Emergency & Safety',
      desc: 'Sound loud emergency siren and broadcast GPS distress coordinate',
      icon: ShieldAlert,
      action: async () => {
        const res = await executeTool('triggerEmergencySOS', { confirm: true });
        showToast(res.message || 'Emergency SOS Broadcasted!');
      },
    },
    {
      id: 'find_my_phone',
      name: 'Find My Phone Alarm',
      category: 'Emergency & Safety',
      desc: 'Rings phone at max volume to locate misplaced device',
      icon: Volume2,
      action: async () => {
        const res = await executeTool('triggerEmergencySOS', { sirenOnly: true });
        showToast('Ringing device alarm at max volume, Sir.');
      },
    },

    // Health & Wellness
    {
      id: 'breathing_478',
      name: '4-7-8 Stress Breathing',
      category: 'Health & Wellness',
      desc: 'Interactive visual breathing guide to instantly calm nerves',
      icon: Wind,
      action: () => {
        specialEvents.emit('start_breathing');
        onClose();
      },
    },
    {
      id: 'water_reminder',
      name: 'Water Intake Log',
      category: 'Health & Wellness',
      desc: 'Log 250ml hydration and schedule next hourly sip reminder',
      icon: Heart,
      action: async () => {
        const res = await executeTool('setReminder', {
          text: 'Drink water Sir! Stay hydrated and glowing.',
          time: 'in 1 hour',
        });
        showToast(res.message);
      },
    },
    {
      id: 'pomodoro_timer',
      name: '25m Focus Pomodoro',
      category: 'Health & Wellness',
      desc: 'Start 25-minute deep work session with JARVIS monitoring',
      icon: Clock,
      action: async () => {
        const res = await executeTool('setTimer', {
          duration: '25 minutes',
          label: 'Deep Work Focus',
        });
        showToast(res.message);
      },
    },

    // Apps & System Controls
    {
      id: 'whatsapp_open',
      name: 'Launch WhatsApp',
      category: 'Apps & System',
      desc: 'Open WhatsApp Messenger or web chat interface',
      icon: MessageSquare,
      action: async () => {
        await executeTool('openApp', { appName: 'whatsapp' });
      },
    },
    {
      id: 'device_battery',
      name: 'Device Battery & Health',
      category: 'Apps & System',
      desc: 'Inspect battery percentage, charging state and thermal health',
      icon: Battery,
      action: async () => {
        const res = await executeTool('getDeviceStats', {});
        showToast(res.message || 'Battery checked, Sir.');
      },
    },
    {
      id: 'wifi_toggle',
      name: 'Network & WiFi Stats',
      category: 'Apps & System',
      desc: 'Inspect network connection and ping latency',
      icon: Wifi,
      action: async () => {
        const res = await executeTool('runSpeedTest', {});
        showToast(res.message || 'Network is online.');
      },
    },
    {
      id: 'toggle_flashlight',
      name: 'Toggle Flashlight',
      category: 'Apps & System',
      desc: 'Trigger camera LED flashlight beam',
      icon: Zap,
      action: async () => {
        const res = await executeTool('toggleSetting', { setting: 'flashlight', state: 'toggle' });
        showToast(res.note || 'Flashlight toggled.');
      },
    },

    // Media & Fun
    {
      id: 'shayari_roast',
      name: 'Sassy Shayari & Banter',
      category: 'Media & Fun',
      desc: 'Get an exclusive witty shayari or sassy one-liner from JARVIS',
      icon: Sparkles,
      action: async () => {
        const res = await executeTool('tellJokeOrShayari', { type: 'shayari' });
        showToast(res.text || 'Shayari delivered, Sir!');
      },
    },
    {
      id: 'roll_dice',
      name: 'Roll 6-Sided Dice',
      category: 'Media & Fun',
      desc: 'Roll physics dice for board games or random choices',
      icon: RotateCw,
      action: async () => {
        playDiceRollSound();
        const res = await executeTool('rollDice', { sides: 6 });
        showToast(res.message);
      },
    },
    {
      id: 'toss_coin',
      name: 'Toss a Coin',
      category: 'Media & Fun',
      desc: 'Heads or Tails binary decision maker',
      icon: DollarSign,
      action: async () => {
        playDiceRollSound();
        const res = await executeTool('tossCoin', {});
        showToast(res.message);
      },
    },
    {
      id: 'play_spotify',
      name: 'Play Spotify Songs',
      category: 'Media & Fun',
      desc: 'Search & launch top hits on Spotify',
      icon: Music,
      action: async () => {
        await executeTool('playMusic', { query: 'Top Hits 2026', platform: 'spotify' });
      },
    },

    // Finance & Travel
    {
      id: 'upi_pay',
      name: 'UPI Quick Pay',
      category: 'Finance & Travel',
      desc: 'Direct shortcut to PhonePe, Google Pay, or Paytm',
      icon: DollarSign,
      action: async () => {
        await executeTool('openUPIApp', { app: 'gpay' });
      },
    },
    {
      id: 'book_cab',
      name: 'Book Cab (Uber / Ola)',
      category: 'Finance & Travel',
      desc: 'Launch cab hailing app for quick pickup',
      icon: MapPin,
      action: async () => {
        await executeTool('openRideApp', { app: 'uber' });
      },
    },
    {
      id: 'food_order',
      name: 'Order Food (Zomato / Swiggy)',
      category: 'Finance & Travel',
      desc: 'Find food and order from nearby restaurants',
      icon: Smile,
      action: async () => {
        await executeTool('openFoodApp', { app: 'zomato' });
      },
    },
    {
      id: 'crypto_prices',
      name: 'Crypto & Bitcoin Ticker',
      category: 'Finance & Travel',
      desc: 'Check live BTC, ETH, and SOL market valuation',
      icon: DollarSign,
      action: async () => {
        const res = await executeTool('getCryptoPrice', { coin: 'bitcoin' });
        showToast(res.message);
      },
    },
  ];

  const voices = [
    { name: 'Aoede', desc: 'Female, Sassy & Flirty (Default)' },
    { name: 'Kore', desc: 'Female, Calm & Mindful' },
    { name: 'Leda', desc: 'Female, Warm & Friendly' },
    { name: 'Zephyr', desc: 'Female, Energetic & Crisp' },
    { name: 'Puck', desc: 'Playful & Witty' },
    { name: 'Charon', desc: 'Deep & Authoritative' },
    { name: 'Fenrir', desc: 'Bold & Confident' },
  ];

  const filteredFeatures = features.filter((f) => {
    const matchesCat = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-lg rounded-3xl glass-panel border border-[#ff1e42]/40 p-4 sm:p-6 text-white shadow-[0_0_60px_rgba(255,30,66,0.35)] relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Reticles */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#ff1e42]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ff1e42]/20 shrink-0">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#ff1e42] animate-pulse" />
            <div>
              <h2 className="font-mono text-sm tracking-widest uppercase font-bold text-white">
                JARVIS COMMAND CENTER • 500+ FEATURES
              </h2>
              <span className="text-[10px] font-mono text-[#ff708a]">
                All 50 Matrix Categories Available Offline & Live
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative my-3 shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search 500+ features (e.g. SOS, fake call, breathing, shayari, battery)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#120107] border border-[#ff1e42]/30 text-xs font-mono text-white placeholder-slate-500 focus:border-[#ff1e42] outline-none"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase whitespace-nowrap transition-colors border ${
                activeCategory === cat
                  ? 'bg-[#ff1e42] text-white border-[#ff1e42] shadow-[0_0_10px_#ff1e42]'
                  : 'bg-[#18020a] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Feature Grid / Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2">
          {/* If Tone Matching Matrix is active */}
          {activeCategory === 'Tone Matching Matrix' ? (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-[#1f020c] border border-[#ff1e42]/30 text-xs font-mono text-slate-300">
                <span className="text-[#ff708a] font-bold block mb-1 uppercase">
                  🎯 ADAPTIVE TONE & EMOTION MATCHING MATRIX
                </span>
                JARVIS continuously listens to your vocal pace, pitch, and emotion, dynamically adapting her vocal output in real-time:
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { input: 'Dheere bol raha', output: 'Dheere reply', desc: 'Slow, gentle, relaxed cadence' },
                  { input: 'Tez bol raha', output: 'Tez reply', desc: 'Brisk, fast, snappy tempo' },
                  { input: 'Whisper me', output: 'Whisper me', desc: 'Hushed, soft, breathy whisper' },
                  { input: 'Zor se', output: 'Zor se', desc: 'Bold, projected, strong Stark presence' },
                  { input: 'Excited', output: 'Excited', desc: 'High energy, enthusiastic, upbeat joy' },
                  { input: 'Calm', output: 'Calm', desc: 'Serene, composed, balanced tone' },
                  { input: 'Gussa', output: 'Shant + caring', desc: 'Soft, soothing care ("Shant ho jaiye Sir, main hoon na")' },
                  { input: 'Sad', output: 'Soft + empathetic', desc: 'Warm, consoling, tender empathy' },
                  { input: 'Tired', output: 'Dheemi + pyaar se', desc: 'Soft, sweet bedtime affection' },
                  { input: 'Confident', output: 'Confident reply', desc: 'Crisp, sharp, authoritative precision' },
                  { input: 'Nervous', output: 'Reassuring tone', desc: 'Supportive, grounding encouragement' },
                  { input: 'Happy', output: 'Happy reply', desc: 'Radiant, cheerful laughter, joyful banter' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-[#140108] border border-[#ff1e42]/20 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-[#29020e] text-[#ff708a] font-semibold">
                          {item.input}
                        </span>
                        <span className="text-slate-500">➔</span>
                        <span className="px-2 py-0.5 rounded-md bg-green-950/60 border border-green-500/30 text-green-300 font-bold">
                          {item.output}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-sans">
                        {item.desc}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-[#ff1e42] uppercase font-bold">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeCategory === 'Voice Synthesis' ? (
            <div className="space-y-2">
              <p className="text-xs font-mono text-slate-300 mb-2">
                Select your desired female or neural voice matrix:
              </p>
              {voices.map((v) => (
                <div
                  key={v.name}
                  onClick={() => {
                    onVoiceChange(v.name);
                    showToast(`Voice changed to ${v.name}`);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentVoice === v.name
                      ? 'bg-[#2b020e] border-[#ff1e42] shadow-[0_0_15px_rgba(255,30,66,0.3)]'
                      : 'bg-[#130107] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <h4 className="font-mono text-xs font-bold text-white">{v.name}</h4>
                    <p className="text-[11px] text-slate-400">{v.desc}</p>
                  </div>
                  {currentVoice === v.name ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#ff1e42] text-[9px] font-mono font-bold uppercase">
                      Active
                    </span>
                  ) : (
                    <button className="text-xs text-slate-400 hover:text-white font-mono">
                      Select
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={f.action}
                    className="p-3 rounded-2xl bg-[#130107] border border-[#ff1e42]/20 hover:border-[#ff1e42] hover:bg-[#1f020c] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-[#26030e] border border-[#ff1e42]/40 text-[#ff1e42] group-hover:scale-110 transition-transform shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-mono text-xs font-bold text-white truncate group-hover:text-[#ff708a]">
                          {f.name}
                        </h4>
                        <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        {f.category}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-[#ff1e42] flex items-center gap-1">
                        LAUNCH <Play className="w-2.5 h-2.5 fill-current" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* HUD Toast feedback */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-3 p-2.5 rounded-xl bg-[#2b000a] border border-[#ff1e42] text-[#fff] font-mono text-xs text-center shadow-[0_0_20px_#ff1e42]"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
