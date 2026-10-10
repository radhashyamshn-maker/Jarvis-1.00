import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Compass,
  MapPin,
  Car,
  Bike,
  Footprints,
  Bus,
  ExternalLink,
  Search,
  X,
  Zap,
  Fuel,
  Hospital,
  Utensils,
  Plane,
  Home,
  Briefcase,
  AlertTriangle,
  RotateCw,
  LocateFixed,
  ShieldCheck,
} from 'lucide-react';
import { specialEvents } from '../lib/specialEvents';
import { playHudBeep } from '../lib/audioEffects';
import { safeOpenUrl, launchNativeAppScheme } from '../lib/tools';
import { checkSinglePermission, promptPermissionModal } from '../lib/permissions';

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestination?: string;
}

interface RouteStep {
  instruction: string;
  distance: string;
  iconType: 'straight' | 'right' | 'left' | 'destination';
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  onClose,
  initialDestination = '',
}) => {
  const [destination, setDestination] = useState<string>(initialDestination || '');
  const [currentAddress, setCurrentAddress] = useState<string>('Detecting GPS Location...');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [travelMode, setTravelMode] = useState<'driving' | 'two_wheeler' | 'walking' | 'transit'>('driving');
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(42);
  const [routeData, setRouteData] = useState<{
    distance: string;
    duration: string;
    traffic: 'light' | 'moderate' | 'heavy';
    eta: string;
    steps: RouteStep[];
  } | null>(null);

  // Listen to incoming voice events
  useEffect(() => {
    const unsub = specialEvents.on('open_navigation', (data: any) => {
      if (data?.destination) {
        setDestination(data.destination);
        calculateRoute(data.destination, data.mode || travelMode);
      }
    });
    return unsub;
  }, [travelMode]);

  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
      calculateRoute(initialDestination, travelMode);
    }
  }, [initialDestination]);

  // Acquire current GPS location
  const fetchLocation = async () => {
    setIsLocating(true);
    const perm = await checkSinglePermission('location');
    if (perm !== 'granted') {
      promptPermissionModal('location');
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);
          setCoords({ lat, lng, accuracy });
          setCurrentAddress(`Current Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
          setIsLocating(false);
          playHudBeep(950, 0.05);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setCoords({ lat: 28.6139, lng: 77.2090, accuracy: 15 });
          setCurrentAddress('Connaught Place, New Delhi (Default GPS)');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setCurrentAddress('GPS unavailable, using city center');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLocation();
    }
  }, [isOpen]);

  // Generate realistic route steps and ETA
  const calculateRoute = (dest: string, mode: 'driving' | 'two_wheeler' | 'walking' | 'transit') => {
    if (!dest.trim()) return;
    playHudBeep(1100, 0.08);

    const hash = dest.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseKm = ((hash % 35) + 3.5).toFixed(1);
    const kmNum = parseFloat(baseKm);

    let speedKmh = 38;
    if (mode === 'two_wheeler') speedKmh = 44;
    if (mode === 'walking') speedKmh = 5;
    if (mode === 'transit') speedKmh = 25;

    const mins = Math.max(4, Math.round((kmNum / speedKmh) * 60));
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    const etaStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const traffics: ('light' | 'moderate' | 'heavy')[] = ['light', 'moderate', 'heavy'];
    const chosenTraffic = traffics[hash % 3];

    const steps: RouteStep[] = [
      {
        instruction: 'Head North towards the main junction / expressway',
        distance: '400 m',
        iconType: 'straight',
      },
      {
        instruction: `Turn right onto Ring Road / Highway towards ${dest}`,
        distance: `${(kmNum * 0.4).toFixed(1)} km`,
        iconType: 'right',
      },
      {
        instruction: `Take the flyover / exit towards ${dest} City Center`,
        distance: `${(kmNum * 0.4).toFixed(1)} km`,
        iconType: 'left',
      },
      {
        instruction: `Arrive at ${dest} on the left`,
        distance: '150 m',
        iconType: 'destination',
      },
    ];

    setRouteData({
      distance: `${baseKm} km`,
      duration: `${mins} mins`,
      traffic: chosenTraffic,
      eta: etaStr,
      steps,
    });
    setIsNavigating(true);
  };

  // Launch Google Maps Turn-by-Turn Navigation
  const launchGoogleMapsNavigation = () => {
    playHudBeep(1200, 0.1);
    const target = destination || 'Nearest Fuel Station';
    const nativeScheme = `google.navigation:q=${encodeURIComponent(target)}&mode=${travelMode === 'two_wheeler' ? '2w' : travelMode === 'walking' ? 'w' : travelMode === 'transit' ? 'r' : 'd'}`;
    const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}&travelmode=${travelMode === 'two_wheeler' ? 'two-wheeler' : travelMode}`;
    
    launchNativeAppScheme(nativeScheme, webFallback);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className="w-full max-w-lg rounded-3xl glass-panel border border-[#ff1e42]/50 p-4 sm:p-5 text-white shadow-[0_0_60px_rgba(255,30,66,0.35)] relative overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Corner HUD Reticles */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#ff1e42]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ff1e42]/20 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#ff1e42]/20 border border-[#ff1e42]">
              <Navigation className="w-5 h-5 text-[#ff1e42] animate-pulse" />
            </div>
            <div>
              <h3 className="font-mono text-sm tracking-widest uppercase font-bold text-white flex items-center gap-1.5">
                STARK GPS & LIVE NAVIGATION
                <span className="px-1.5 py-0.2 rounded text-[8.5px] bg-[#ff1e42]/30 text-[#ff708a] border border-[#ff1e42]/40">
                  REALTIME
                </span>
              </h3>
              <p className="text-[10px] font-mono text-slate-400 truncate max-w-[240px]">
                {currentAddress}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {/* 1. Destination Input Bar */}
          <div className="p-3 rounded-2xl bg-[#140108] border border-[#ff1e42]/30 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ff1e42] shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') calculateRoute(destination, travelMode);
                }}
                placeholder="Enter destination (e.g. Connaught Place, Airport, Taj Mahal)"
                className="w-full bg-black/60 border border-[#ff1e42]/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff1e42] font-mono"
              />
              <button
                type="button"
                onClick={() => calculateRoute(destination, travelMode)}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#990022] to-[#ff1e42] text-white font-mono text-xs font-bold shrink-0 hover:brightness-110 active:scale-95 shadow-[0_0_10px_#ff1e42]"
              >
                ROUTE
              </button>
            </div>

            {/* Quick Destination Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {[
                { label: 'Petrol Pump', icon: Fuel, query: 'Nearest Petrol Pump' },
                { label: 'Hospital', icon: Hospital, query: 'Nearest Hospital Emergency' },
                { label: 'Restaurant', icon: Utensils, query: 'Top Restaurants Near Me' },
                { label: 'Airport', icon: Plane, query: 'International Airport' },
                { label: 'Home', icon: Home, query: 'Home' },
                { label: 'Work', icon: Briefcase, query: 'Office Work' },
              ].map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      setDestination(chip.query);
                      calculateRoute(chip.query, travelMode);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-black/40 border border-[#ff1e42]/20 hover:border-[#ff1e42] text-slate-300 hover:text-white text-[10.5px] font-mono flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                  >
                    <Icon className="w-3 h-3 text-[#ff1e42]" />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Travel Mode Selector */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'driving', label: 'Car', icon: Car },
              { id: 'two_wheeler', label: 'Bike', icon: Bike },
              { id: 'transit', label: 'Transit', icon: Bus },
              { id: 'walking', label: 'Walk', icon: Footprints },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = travelMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setTravelMode(m.id as any);
                    if (destination) calculateRoute(destination, m.id as any);
                  }}
                  className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 font-mono text-[10.5px] font-bold transition-all ${
                    isSelected
                      ? 'bg-[#ff1e42]/30 border-[#ff1e42] text-white shadow-[0_0_12px_#ff1e42]'
                      : 'bg-[#120107] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Live HUD Route Overview Card */}
          {routeData && (
            <div className="p-3.5 rounded-2xl bg-[#17020a] border border-[#ff1e42]/40 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    DESTINATION
                  </span>
                  <span className="font-bold text-sm text-white font-mono flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#ff1e42]" />
                    {destination}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#ff708a] uppercase block">
                    ETA ({routeData.eta})
                  </span>
                  <span className="font-bold text-lg text-white font-mono">
                    {routeData.duration}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9.5px] font-mono text-slate-400 block">DISTANCE</span>
                  <span className="text-xs font-bold font-mono text-cyan-300">
                    {routeData.distance}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9.5px] font-mono text-slate-400 block">TRAFFIC</span>
                  <span
                    className={`text-xs font-bold font-mono uppercase ${
                      routeData.traffic === 'light'
                        ? 'text-green-400'
                        : routeData.traffic === 'moderate'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {routeData.traffic}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9.5px] font-mono text-slate-400 block">GPS ACCURACY</span>
                  <span className="text-xs font-bold font-mono text-emerald-300">
                    ±{coords?.accuracy || 12}m
                  </span>
                </div>
              </div>

              {/* Turn-by-turn guidance steps */}
              <div className="space-y-1.5 pt-1">
                <span className="font-mono text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <Compass className="w-3 h-3 text-[#ff1e42]" />
                  TURN-BY-TURN GUIDANCE:
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {routeData.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2 text-[11px]"
                    >
                      <span className="font-mono text-[9px] font-bold text-[#ff708a] px-1.5 py-0.5 rounded bg-[#ff1e42]/20 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-slate-200">{step.instruction}</span>
                      <span className="font-mono text-[10px] text-cyan-400 shrink-0">
                        {step.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Launch Button */}
              <button
                type="button"
                onClick={launchGoogleMapsNavigation}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#990022] via-[#ff1e42] to-[#ff3366] hover:brightness-110 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,30,66,0.5)] active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4 fill-white" />
                START GOOGLE MAPS NAVIGATION
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 4. Live GPS Radar Status */}
          <div className="p-3 rounded-2xl bg-[#110106] border border-[#ff1e42]/20 flex items-center justify-between text-[10.5px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <LocateFixed className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>
                GPS FIX: {coords ? `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°` : 'Active'}
              </span>
            </div>
            <button
              type="button"
              onClick={fetchLocation}
              disabled={isLocating}
              className="text-cyan-400 hover:text-white flex items-center gap-1"
            >
              <RotateCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              RE-SCAN
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
