import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Activity,
  Shield,
  Cpu,
  Radio,
  Sparkles,
  Heart,
  Satellite,
  Layers,
  Wrench,
  CheckCircle2,
  X,
  Volume2,
  Lock,
  Globe,
  Flame,
  Gauge,
  Sliders,
  Play,
  Square,
  RefreshCw,
} from 'lucide-react';
import { playHudBeep } from '../lib/audioEffects';
import { specialEvents } from '../lib/specialEvents';

interface Futuristic2080ModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: 'quantum' | 'neural' | 'biometrics' | 'orbital' | 'nanite' | 'permissions';
}

export const Futuristic2080Modal: React.FC<Futuristic2080ModalProps> = ({
  isOpen,
  onClose,
  activeTab = 'quantum',
}) => {
  const [tab, setTab] = useState<'quantum' | 'neural' | 'biometrics' | 'orbital' | 'nanite' | 'permissions'>(activeTab);
  
  // 1. Quantum Core State
  const [coreOverdrive, setCoreOverdrive] = useState<boolean>(false);
  const [coreOutput, setCoreOutput] = useState<number>(1.21); // GW
  const [coreStability, setCoreStability] = useState<number>(99.8); // %
  
  // 2. Neural Waveform State
  const [playingWave, setPlayingWave] = useState<'alpha' | 'theta' | 'gamma' | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscNodes, setOscNodes] = useState<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  // 3. Biometric Vitals State
  const [isScanningVitals, setIsScanningVitals] = useState<boolean>(false);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [spO2, setSpO2] = useState<number>(99);
  const [stressLevel, setStressLevel] = useState<'Optimal (Low)' | 'Mild' | 'High'>('Optimal (Low)');
  const [bioAura, setBioAura] = useState<string>('432 Hz Harmonics');

  // 4. Orbital Relay State
  const [satellitePing, setSatellitePing] = useState<number>(11);
  const [orbitalDefense, setOrbitalDefense] = useState<boolean>(true);
  const [solarRadiation, setSolarRadiation] = useState<string>('0.04 mSv (Nominal)');

  // 5. Nanite Self-Repair State
  const [naniteRepairProgress, setNaniteRepairProgress] = useState<number>(0);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [repairStatus, setRepairStatus] = useState<string>('All Systems 100% Operational');

  // 6. 2080 Permissions State
  const [perm2080, setPerm2080] = useState<Record<string, boolean>>({
    quantum_core_auth: true,
    neural_synapse_link: true,
    holographic_reticle: true,
    nanite_biometrics: true,
    orbital_subspace: true,
    zero_trust_defense: true,
    subharmonic_audio: true,
  });

  // Listen to special events from voice session
  useEffect(() => {
    const unsub1 = specialEvents.on('open_2080_modal', (data: any) => {
      if (data?.tab) setTab(data.tab);
    });
    const unsub2 = specialEvents.on('scan_biometrics', () => {
      setTab('biometrics');
      triggerBioScan();
    });
    const unsub3 = specialEvents.on('activate_quantum_core', (data: any) => {
      setTab('quantum');
      if (data?.overdrive !== undefined) setCoreOverdrive(data.overdrive);
    });
    const unsub4 = specialEvents.on('start_nanite_repair', () => {
      setTab('nanite');
      triggerNaniteRepair();
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  // Stop binaural audio on unmount or close
  useEffect(() => {
    return () => {
      stopBinauralAudio();
    };
  }, []);

  const startBinauralAudio = (type: 'alpha' | 'theta' | 'gamma') => {
    stopBinauralAudio();
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gain = ctx.createGain();
      gain.gain.value = 0.08;

      let baseFreq = 200;
      let diff = 10; // Alpha: 10Hz
      if (type === 'theta') diff = 6; // Theta: 6Hz (Deep Sleep & Relaxation)
      if (type === 'gamma') diff = 40; // Gamma: 40Hz (Super Cognition)

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = baseFreq;
      osc2.frequency.value = baseFreq + diff;

      // Stereo panner if supported
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      setAudioCtx(ctx);
      setOscNodes({ osc1, osc2, gain });
      setPlayingWave(type);
      playHudBeep(900, 0.05);
    } catch (err) {
      console.warn('Binaural generator error:', err);
    }
  };

  const stopBinauralAudio = () => {
    if (oscNodes) {
      try {
        oscNodes.osc1.stop();
        oscNodes.osc2.stop();
        oscNodes.osc1.disconnect();
        oscNodes.osc2.disconnect();
      } catch {}
    }
    if (audioCtx) {
      try {
        audioCtx.close();
      } catch {}
    }
    setAudioCtx(null);
    setOscNodes(null);
    setPlayingWave(null);
  };

  const triggerBioScan = () => {
    setIsScanningVitals(true);
    playHudBeep(1200, 0.1);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setHeartRate(Math.floor(68 + Math.random() * 12));
      setSpO2(98 + (Math.random() > 0.5 ? 1 : 0));
      if (step >= 6) {
        clearInterval(interval);
        setIsScanningVitals(false);
        setStressLevel('Optimal (Low)');
        setBioAura('432 Hz Pure Resonance');
        playHudBeep(1500, 0.15);
      }
    }, 400);
  };

  const triggerNaniteRepair = () => {
    if (isRepairing) return;
    setIsRepairing(true);
    setNaniteRepairProgress(0);
    setRepairStatus('Deploying Silicon Sub-Nanites...');
    playHudBeep(800, 0.08);

    const interval = setInterval(() => {
      setNaniteRepairProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRepairing(false);
          setRepairStatus('All 2080 Neural & Hardware Subsystems 100% Calibrated!');
          playHudBeep(1600, 0.2);
          return 100;
        }
        if (prev === 30) setRepairStatus('Acoustic Cavitation Cleaning Core...');
        if (prev === 60) setRepairStatus('Re-aligning Optical Neural Bus...');
        if (prev === 85) setRepairStatus('Flushing Zero-Point Thermal Residue...');
        return prev + 5;
      });
    }, 150);
  };

  const grantAll2080Permissions = () => {
    playHudBeep(1400, 0.15);
    const updated = { ...perm2080 };
    Object.keys(updated).forEach((k) => (updated[k] = true));
    setPerm2080(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className="w-full max-w-xl rounded-3xl glass-panel border border-[#ff1e42]/60 p-4 sm:p-5 text-white shadow-[0_0_60px_rgba(255,30,66,0.35)] relative overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Futuristic 2080 Reticles */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#ff1e42]" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ff1e42]/30 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-[#ff1e42]/20 border border-[#ff1e42] shadow-[0_0_15px_#ff1e42]">
              <Cpu className="w-5 h-5 text-[#ff1e42] animate-pulse" />
            </div>
            <div>
              <h3 className="font-mono text-sm tracking-widest uppercase font-bold text-white flex items-center gap-1.5">
                YEAR 2080 STARK TECH MATRIX
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#ff1e42]/30 text-[#ff708a] border border-[#ff1e42]/40 font-mono font-bold">
                  v2080.4 QUANTUM
                </span>
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Zero-Point Energy • Neural Synapse • Nanite Biometrics • Orbital Relay
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2080 Category Navigation Tabs */}
        <div className="grid grid-cols-6 gap-1 p-1 rounded-2xl bg-[#140108] border border-[#ff1e42]/20 mb-3 shrink-0 overflow-x-auto">
          {[
            { id: 'quantum', label: 'Quantum', icon: Zap },
            { id: 'neural', label: 'Neural', icon: Radio },
            { id: 'biometrics', label: 'Vitals', icon: Heart },
            { id: 'orbital', label: 'Orbital', icon: Satellite },
            { id: 'nanite', label: 'Nanite', icon: Wrench },
            { id: 'permissions', label: 'Perms', icon: Shield },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  playHudBeep(750, 0.04);
                  setTab(t.id as any);
                }}
                className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 font-mono text-[9.5px] font-bold uppercase transition-all ${
                  isSel
                    ? 'bg-gradient-to-r from-[#990022] to-[#ff1e42] text-white shadow-[0_0_10px_#ff1e42]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-mono">
          {/* TAB 1: QUANTUM CORE */}
          {tab === 'quantum' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#150209] border border-[#ff1e42]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#ff1e42]" />
                    ZERO-POINT QUANTUM ARC CORE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {coreOverdrive ? '🔥 OVERDRIVE 2.40 GW' : '⚡ NOMINAL 1.21 GW'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                    <span className="text-[9.5px] text-slate-400 block">PLASMA FLUX</span>
                    <span className="text-xs font-bold text-cyan-300">
                      {coreOverdrive ? '2.40 GW' : '1.21 GW'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                    <span className="text-[9.5px] text-slate-400 block">CONTAINMENT</span>
                    <span className="text-xs font-bold text-emerald-400">{coreStability}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                    <span className="text-[9.5px] text-slate-400 block">CORE TEMP</span>
                    <span className="text-xs font-bold text-[#ff708a]">
                      {coreOverdrive ? '142 MK' : '84 MK'}
                    </span>
                  </div>
                </div>

                {/* Overdrive Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    playHudBeep(coreOverdrive ? 600 : 1300, 0.1);
                    setCoreOverdrive(!coreOverdrive);
                    setCoreOutput(coreOverdrive ? 1.21 : 2.4);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${
                    coreOverdrive
                      ? 'bg-gradient-to-r from-amber-600 to-[#ff1e42] text-white shadow-[0_0_20px_rgba(255,30,66,0.6)] animate-pulse'
                      : 'bg-black/60 border-white/10 text-slate-300 hover:border-[#ff1e42] hover:text-white'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  {coreOverdrive ? 'DISENGAGE QUANTUM OVERDRIVE' : 'ENGAGE ZERO-POINT OVERDRIVE'}
                </button>
              </div>

              {/* Quantum Telemetry Specs */}
              <div className="p-3 rounded-2xl bg-[#110106] border border-white/10 space-y-1.5 text-[11px] text-slate-300">
                <p className="flex justify-between">
                  <span className="text-slate-400">Nanotech Thermal Cycling:</span>
                  <span className="text-emerald-400">Cryo-Superconducting</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Antimatter Injector:</span>
                  <span className="text-cyan-300">Sub-Atomic Pulse Synchronized</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">EMP Shock Absorption:</span>
                  <span className="text-white">100% Grounded Zero-Loss</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: NEURAL SYNAPSE & BINAURAL WAVES */}
          {tab === 'neural' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#150209] border border-[#ff1e42]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-[#ff1e42]" />
                    NEURAL BINAURAL SYNAPSE GENERATOR
                  </span>
                  {playingWave && (
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
                      ACTIVE {playingWave.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-slate-300 font-sans leading-relaxed">
                  Genuine 2080 subharmonic binaural acoustic pulses generate direct neural brainwave resonance for focus, deep sleep, and hyper-cognition.
                </p>

                {/* Wave selector buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'alpha', title: 'ALPHA (10 Hz)', desc: 'Calm & Flow State', color: 'from-cyan-900 to-blue-900' },
                    { id: 'theta', title: 'THETA (6 Hz)', desc: 'Deep Sleep & Healing', color: 'from-purple-900 to-indigo-900' },
                    { id: 'gamma', title: 'GAMMA (40 Hz)', desc: 'Hyper-Intelligence', color: 'from-amber-900 to-rose-900' },
                  ].map((w) => {
                    const isPlaying = playingWave === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          if (isPlaying) stopBinauralAudio();
                          else startBinauralAudio(w.id as any);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isPlaying
                            ? 'bg-[#ff1e42]/30 border-[#ff1e42] text-white shadow-[0_0_12px_#ff1e42]'
                            : 'bg-black/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[11px] text-white">{w.title}</span>
                          {isPlaying ? <Square className="w-3 h-3 text-[#ff1e42]" /> : <Play className="w-3 h-3 text-slate-400" />}
                        </div>
                        <span className="text-[9.5px] text-slate-300 font-sans block">{w.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {playingWave && (
                  <button
                    type="button"
                    onClick={stopBinauralAudio}
                    className="w-full py-1.5 rounded-xl bg-black/60 border border-white/20 text-slate-300 hover:text-white text-[11px] flex items-center justify-center gap-1.5"
                  >
                    <Square className="w-3 h-3 text-red-400" />
                    MUTE NEURAL PULSE
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BIOMETRIC VITALS */}
          {tab === 'biometrics' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#150209] border border-[#ff1e42]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#ff1e42] animate-pulse" />
                    NANITE BIOMETRIC HEALTH SCANNER
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {isScanningVitals ? 'SCANNING...' : 'VITALS OPTIMAL'}
                  </span>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                    <span className="text-[9.5px] text-slate-400 block">HEART RATE</span>
                    <span className="text-sm font-bold text-red-400">{heartRate} BPM</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                    <span className="text-[9.5px] text-slate-400 block">BLOOD SpO2</span>
                    <span className="text-sm font-bold text-cyan-300">{spO2}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                    <span className="text-[9.5px] text-slate-400 block">CORTISOL STRESS</span>
                    <span className="text-sm font-bold text-emerald-300">{stressLevel}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                    <span className="text-[9.5px] text-slate-400 block">BIO-AURA</span>
                    <span className="text-sm font-bold text-purple-300">432 Hz</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerBioScan}
                  disabled={isScanningVitals}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#990022] to-[#ff1e42] text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_#ff1e42] active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanningVitals ? 'animate-spin' : ''}`} />
                  {isScanningVitals ? 'CALIBRATING CELLULAR TELEMETRY...' : 'RUN FULL 2080 BIOMETRIC SCAN'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ORBITAL RELAY & SATELLITE DEFENSE */}
          {tab === 'orbital' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#150209] border border-[#ff1e42]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Satellite className="w-4 h-4 text-[#ff1e42]" />
                    STARK ORBITAL SATELLITE UPLINK
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    LATENCY: {satellitePing}ms
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300">
                  <p className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Primary Orbital Node:</span>
                    <span className="text-white font-bold">Stark-Sat-09 (Geostationary 35,786 km)</span>
                  </p>
                  <p className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Solar Storm & Geomagnetic:</span>
                    <span className="text-emerald-400">{solarRadiation}</span>
                  </p>
                  <p className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Orbital Quantum Firewall:</span>
                    <span className={orbitalDefense ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {orbitalDefense ? '🛡️ ZERO-TRUST ENCRYPTED' : 'STANDBY'}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playHudBeep(1100, 0.08);
                    setOrbitalDefense(!orbitalDefense);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-950/80 to-[#120108] border border-cyan-400/60 text-cyan-200 font-bold flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95"
                >
                  <Globe className="w-4 h-4 text-cyan-400" />
                  {orbitalDefense ? 'RE-SYNC ORBITAL TELEMETRY' : 'CONNECT DEEP SPACE UPLINK'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: NANITE SELF-REPAIR */}
          {tab === 'nanite' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#150209] border border-[#ff1e42]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#ff1e42]" />
                    AUTONOMOUS NANOTECH SELF-HEALING
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] bg-[#ff1e42]/20 text-[#ff708a] border border-[#ff1e42]/30">
                    {isRepairing ? `${naniteRepairProgress}% IN PROGRESS` : 'READY'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 rounded-full bg-black/70 border border-white/10 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#990022] via-[#ff1e42] to-cyan-400 transition-all duration-300"
                      style={{ width: `${naniteRepairProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-center">
                    {repairStatus}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={triggerNaniteRepair}
                  disabled={isRepairing}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#990022] to-[#ff1e42] text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_#ff1e42] active:scale-95"
                >
                  <Wrench className={`w-4 h-4 ${isRepairing ? 'animate-spin' : ''}`} />
                  {isRepairing ? 'NANITES ACTIVELY HEALING...' : 'EXECUTE NANITE HARDWARE DE-DUSTING & REPAIR'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: 2080 ALL PERMISSIONS & HARDWARE AUTHORIZATION */}
          {tab === 'permissions' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#150209] border border-[#ff1e42]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#ff1e42]" />
                    YEAR 2080 STARK AUTHORIZATION MATRIX
                  </span>
                  <button
                    type="button"
                    onClick={grantAll2080Permissions}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.5)] active:scale-95"
                  >
                    GRANT ALL (100%)
                  </button>
                </div>

                {/* 2080 Permissions Checklist */}
                <div className="space-y-1.5">
                  {[
                    { id: 'quantum_core_auth', name: 'Quantum Core Zero-Point Bus', desc: 'Authorizes 1.21 GW plasma overdrive and energy telemetry' },
                    { id: 'neural_synapse_link', name: 'Neural Synaptic Brainwave Link', desc: 'Allows BHI intent synchronization and acoustic waves' },
                    { id: 'holographic_reticle', name: '3D Spatial Holographic Overlay', desc: 'Empowers AR spatial reticles and optic camera tracking' },
                    { id: 'nanite_biometrics', name: 'Cellular Biometrics & SpO2', desc: 'Access to heart rate, stress, and aura frequency analyzer' },
                    { id: 'orbital_subspace', name: 'Stark Orbital Satellite Uplink', desc: 'Sub-millimeter interplanetary GPS and deep satellite ping' },
                    { id: 'zero_trust_defense', name: 'Zero-Trust Defense Shield 2080', desc: 'EMP shock dampening and encrypted firewall channels' },
                    { id: 'subharmonic_audio', name: 'Subharmonic Voice Synthesis', desc: 'Ultra-clarity 24kHz Web Audio neural streaming pipeline' },
                  ].map((p) => {
                    const isGranted = perm2080[p.id];
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          playHudBeep(isGranted ? 700 : 1200, 0.04);
                          setPerm2080((prev) => ({ ...prev, [p.id]: !prev[p.id] }));
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isGranted
                            ? 'bg-black/40 border-emerald-500/40 text-white'
                            : 'bg-black/40 border-white/10 text-slate-400'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-[11px] block">{p.name}</span>
                          <span className="text-[9.5px] text-slate-400 font-sans">{p.desc}</span>
                        </div>
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ml-2 ${
                            isGranted ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
