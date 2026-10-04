import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User, Mic } from 'lucide-react';
import { specialEvents } from '../lib/specialEvents';

export const FakeCallModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [callerName, setCallerName] = useState<string>('Incoming Call');
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected'>('ringing');
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    const unsub = specialEvents.on('fake_call', (data) => {
      setCallerName(data?.caller || 'Home / Urgent');
      setCallStatus('ringing');
      setSeconds(0);
      setIsOpen(true);
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([400, 200, 400, 200, 400]);
        }
      } catch {}
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  if (!isOpen) return null;

  const handleAccept = () => {
    setCallStatus('connected');
    try {
      if ('vibrate' in navigator) navigator.vibrate(50);
    } catch {}
  };

  const handleDecline = () => {
    setIsOpen(false);
    setCallStatus('ringing');
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white p-6 backdrop-blur-2xl">
      {/* Top Caller Info */}
      <div className="flex flex-col items-center mt-14 space-y-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center shadow-2xl border-2 border-white/20">
          <User className="w-12 h-12 text-slate-200" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold font-sans tracking-wide">{callerName}</h2>
          <p className="text-sm font-mono text-slate-400 mt-1">
            {callStatus === 'ringing' ? 'Incoming Mobile Call...' : formatDuration(seconds)}
          </p>
        </div>
      </div>

      {/* Middle Interactive Status */}
      <div className="flex items-center justify-center">
        {callStatus === 'ringing' ? (
          <div className="flex flex-col items-center text-xs font-mono text-slate-500">
            <span className="animate-pulse text-[#ff708a]">Swipe or tap accept to rescue</span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center max-w-xs">
            <p className="text-xs text-slate-300 font-sans italic">
              "Sir, I'm calling to give you an excuse to step away. Whenever you're ready, tap end call."
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="mb-10 flex items-center justify-around w-full max-w-sm mx-auto">
        {callStatus === 'ringing' ? (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDecline}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg shadow-red-900/50"
              aria-label="Decline Call"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </motion.button>

            <motion.button
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAccept}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg shadow-green-900/50"
              aria-label="Accept Call"
            >
              <Phone className="w-7 h-7 text-white" />
            </motion.button>
          </>
        ) : (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDecline}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg shadow-red-900/50"
            aria-label="End Call"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </motion.button>
        )}
      </div>
    </div>
  );
};
