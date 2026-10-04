import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, RefreshCw, Upload, Eye } from 'lucide-react';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured?: (base64Image: string) => void;
}

export const VisionModal: React.FC<VisionModalProps> = ({
  isOpen,
  onClose,
  onImageCaptured,
}) => {
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('Camera Sensor Offline');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      setStatusText('Connecting to Optical Sensors...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
      setStatusText('Optical Sensor Online (60 FPS HUD Stream)');
    } catch (err: any) {
      console.warn('Camera error:', err);
      setStatusText('Camera permission not granted. Use file upload.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPreview(dataUrl);
        onImageCaptured?.(dataUrl);
        stopCamera();
        setStatusText('Visual Frame Captured & Analyzed');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCapturedPreview(result);
        onImageCaptured?.(result);
        setStatusText('Visual Asset Loaded for JARVIS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl glass-panel border border-[#ff1e42]/40 p-5 text-white shadow-[0_0_50px_rgba(255,30,66,0.3)] relative overflow-hidden"
      >
        {/* Corner HUD Reticles */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#ff1e42]" />

        <div className="flex items-center justify-between pb-3 border-b border-[#ff1e42]/20 mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#ff1e42] animate-pulse" />
            <h3 className="font-mono text-sm tracking-widest uppercase font-bold text-white">
              VISION RECON SENSOR
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Window */}
        <div className="relative aspect-video w-full rounded-2xl bg-[#0d0106] border border-[#ff1e42]/30 overflow-hidden flex items-center justify-center mb-3">
          {capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Captured Frame"
              className="w-full h-full object-cover"
            />
          ) : streamActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Camera className="w-8 h-8 text-[#ff1e42]/50" />
              <span className="text-[11px] font-mono tracking-wider">CAMERA FEED IDLE</span>
            </div>
          )}

          {/* Viewfinder HUD Target Overlay */}
          <div className="absolute inset-4 pointer-events-none border border-[#ff1e42]/20 flex items-center justify-center">
            <div className="w-8 h-8 border border-[#ff1e42]/40 rounded-full" />
            <div className="absolute w-4 h-[1px] bg-[#ff1e42]/60" />
            <div className="absolute h-4 w-[1px] bg-[#ff1e42]/60" />
          </div>
        </div>

        <p className="text-[11px] font-mono text-center text-[#ff708a] mb-4 tracking-wider">
          {statusText}
        </p>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!streamActive && !capturedPreview ? (
            <button
              onClick={startCamera}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#990022] to-[#ff1e42] text-white font-mono text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,30,66,0.4)]"
            >
              <Camera className="w-4 h-4" />
              ACTIVATE SENSOR
            </button>
          ) : streamActive ? (
            <button
              onClick={handleCapture}
              className="flex-1 py-2.5 rounded-xl bg-[#ff1e42] text-white font-mono text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_#ff1e42]"
            >
              <Camera className="w-4 h-4" />
              CAPTURE SCAN
            </button>
          ) : (
            <button
              onClick={() => {
                setCapturedPreview(null);
                startCamera();
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#990022] text-white font-mono text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              RE-SCAN
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl glass-pill-hud text-slate-300 hover:text-white"
            title="Upload photo"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </motion.div>
    </div>
  );
};
