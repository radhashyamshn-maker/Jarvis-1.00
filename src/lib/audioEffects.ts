/**
 * JARVIS Audio Synthesizer
 * Generates acoustic feedback (Emergency Siren, Shutter, Beep, Dice, Meditation Bell)
 * without needing external MP3 asset downloads.
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let activeSirenOsc: OscillatorNode | null = null;
let activeSirenGain: GainNode | null = null;

export function playEmergencySiren(durationMs: number = 4000): void {
  try {
    const ctx = getContext();
    if (activeSirenOsc) {
      stopEmergencySiren();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    // Modulate pitch between 600Hz and 1200Hz
    const now = ctx.currentTime;
    for (let t = 0; t < durationMs / 1000; t += 0.5) {
      osc.frequency.setValueAtTime(700, now + t);
      osc.frequency.linearRampToValueAtTime(1250, now + t + 0.25);
      osc.frequency.linearRampToValueAtTime(700, now + t + 0.5);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    activeSirenOsc = osc;
    activeSirenGain = gain;

    setTimeout(() => {
      stopEmergencySiren();
    }, durationMs);
  } catch (err) {
    console.warn('Siren audio failed:', err);
  }
}

export function stopEmergencySiren(): void {
  if (activeSirenOsc) {
    try {
      activeSirenOsc.stop();
      activeSirenOsc.disconnect();
    } catch {}
    activeSirenOsc = null;
  }
  if (activeSirenGain) {
    try {
      activeSirenGain.disconnect();
    } catch {}
    activeSirenGain = null;
  }
}

export function playHudBeep(): void {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {
    console.warn(e);
  }
}

export function playMeditationBell(): void {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, ctx.currentTime); // Relaxing 432Hz tuning

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 3.1);
  } catch (e) {
    console.warn(e);
  }
}

export function playDiceRollSound(): void {
  try {
    const ctx = getContext();
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn(e);
  }
}
