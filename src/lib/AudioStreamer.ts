/**
 * AudioStreamer handles microphone capture (16kHz PCM16)
 * and seamless audio response playback (24kHz Web Audio API) with echo-gating
 * and dynamic emotional prosody adjustment (speed, pitch, and intonation).
 */

export type EmotionCue = 'normal' | 'whisper' | 'excitement' | 'tiredness' | 'calm';

export interface ProsodySettings {
  playbackRate: number; // speed: 0.85x to 1.25x
  detune: number;       // pitch: -150 to +150 cents
  filterFreq: number;   // intonation warmth / brightness (Hz)
  gain: number;         // volume modulation (0.6 to 1.15)
  emotion: EmotionCue;
}

export const PROSODY_PRESETS: Record<EmotionCue, ProsodySettings> = {
  normal: {
    playbackRate: 1.0,
    detune: 0,
    filterFreq: 11000,
    gain: 1.0,
    emotion: 'normal',
  },
  whisper: {
    playbackRate: 0.92,
    detune: -25,
    filterFreq: 4200,
    gain: 0.76,
    emotion: 'whisper',
  },
  excitement: {
    playbackRate: 1.15,
    detune: 75,
    filterFreq: 14000,
    gain: 1.10,
    emotion: 'excitement',
  },
  tiredness: {
    playbackRate: 0.88,
    detune: -50,
    filterFreq: 3400,
    gain: 0.82,
    emotion: 'tiredness',
  },
  calm: {
    playbackRate: 0.96,
    detune: -10,
    filterFreq: 8500,
    gain: 0.95,
    emotion: 'calm',
  },
};

export class AudioStreamer {
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  // Dynamic emotional prosody
  private currentProsody: ProsodySettings = { ...PROSODY_PRESETS.normal };

  // Playback queue & scheduled end tracking
  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private isPlaying: boolean = false;
  private micMuted: boolean = false;
  private playbackCheckTimer: ReturnType<typeof setInterval> | null = null;

  private onPlaybackStateChange?: (playing: boolean) => void;
  private onPlaybackFinished?: () => void;
  private onAudioLevel?: (level: number) => void;

  constructor(options?: {
    onPlaybackStateChange?: (playing: boolean) => void;
    onPlaybackFinished?: () => void;
    onAudioLevel?: (level: number) => void;
  }) {
    this.onPlaybackStateChange = options?.onPlaybackStateChange;
    this.onPlaybackFinished = options?.onPlaybackFinished;
    this.onAudioLevel = options?.onAudioLevel;
  }

  /**
   * Dynamically adjust prosody (speed, pitch, and intonation) based on emotional cues
   */
  public setProsody(cueOrSettings: EmotionCue | Partial<ProsodySettings>): void {
    if (typeof cueOrSettings === 'string') {
      const preset = PROSODY_PRESETS[cueOrSettings] || PROSODY_PRESETS.normal;
      this.currentProsody = { ...preset };
    } else {
      this.currentProsody = {
        ...this.currentProsody,
        ...cueOrSettings,
      };
    }
  }

  public getProsody(): ProsodySettings {
    return { ...this.currentProsody };
  }

  /**
   * Initializes output audio context (24kHz for Gemini Live Audio)
   */
  public async initOutput(): Promise<void> {
    if (!this.outputContext || this.outputContext.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.outputContext = new AudioContextClass({ sampleRate: 24000 });
    }
    if (this.outputContext.state === 'suspended') {
      await this.outputContext.resume();
    }
  }

  /**
   * Mute or unmute microphone streaming to prevent echo cancellation loops
   */
  public setMicMuted(muted: boolean) {
    this.micMuted = muted;
  }

  public isMicMuted(): boolean {
    return this.micMuted;
  }

  /**
   * Check if audio output is currently actively playing or scheduled
   */
  public isAudioPlaying(): boolean {
    if (!this.outputContext) return false;
    return this.outputContext.currentTime < this.nextStartTime || this.activeSources.size > 0;
  }

  /**
   * Start microphone recording at 16kHz PCM
   */
  public async startMic(onChunk: (base64PCM: string) => void): Promise<void> {
    await this.initOutput();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.inputContext = new AudioContextClass({ sampleRate: 16000 });

    if (this.inputContext.state === 'suspended') {
      await this.inputContext.resume();
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      console.error('Microphone access failed:', err);
      throw new Error('Microphone permission denied or device not found.');
    }

    this.sourceNode = this.inputContext.createMediaStreamSource(this.mediaStream);
    // 4096 buffer size yields approx 256ms frames at 16kHz
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);

      // Calculate audio energy / RMS for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      const level = Math.min(1, rms * 5);

      if (this.onAudioLevel) {
        this.onAudioLevel(level);
      }

      // If mic is muted (e.g. while JARVIS is speaking), DO NOT stream chunks to Gemini!
      // This prevents phone speakers from triggering Gemini's VAD self-interruption!
      if (this.micMuted) {
        return;
      }

      // If sample rate doesn't match 16k, resample
      const sampleRate = this.inputContext?.sampleRate || 16000;
      let pcm16: ArrayBuffer;
      if (sampleRate !== 16000) {
        const resampled = this.downsampleBuffer(inputData, sampleRate, 16000);
        pcm16 = this.floatTo16BitPCM(resampled);
      } else {
        pcm16 = this.floatTo16BitPCM(inputData);
      }

      const base64 = this.arrayBufferToBase64(pcm16);
      onChunk(base64);
    };

    this.sourceNode.connect(this.processor);
    this.processor.connect(this.inputContext.destination);

    // Periodic check for playback completion
    if (this.playbackCheckTimer) clearInterval(this.playbackCheckTimer);
    this.playbackCheckTimer = setInterval(() => {
      if (this.isPlaying && this.outputContext) {
        if (this.outputContext.currentTime >= this.nextStartTime && this.activeSources.size === 0) {
          this.isPlaying = false;
          this.onPlaybackStateChange?.(false);
          this.onPlaybackFinished?.();
        }
      }
    }, 150);
  }

  /**
   * Stop microphone streaming
   */
  public stopMic(): void {
    if (this.playbackCheckTimer) {
      clearInterval(this.playbackCheckTimer);
      this.playbackCheckTimer = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.inputContext) {
      try {
        this.inputContext.close();
      } catch (e) {
        console.warn(e);
      }
      this.inputContext = null;
    }
  }

  /**
   * Play a chunk of PCM16 24kHz audio from Gemini Live
   */
  public async playChunk(base64PCM16: string): Promise<void> {
    await this.initOutput();
    if (!this.outputContext) return;

    const uint8Array = this.base64ToUint8Array(base64PCM16);
    const int16Array = new Int16Array(
      uint8Array.buffer,
      uint8Array.byteOffset,
      uint8Array.byteLength / 2
    );

    // Convert Int16 [-32768, 32767] to Float32 [-1.0, 1.0]
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }

    const audioBuffer = this.outputContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.copyToChannel(float32Array, 0);

    const source = this.outputContext.createBufferSource();
    source.buffer = audioBuffer;

    // Apply dynamic prosody (speed & pitch)
    source.playbackRate.value = this.currentProsody.playbackRate;
    if (source.detune) {
      source.detune.value = this.currentProsody.detune;
    }

    // Apply intonation biquad filter (warmth / intimacy / brightness)
    const filterNode = this.outputContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = this.currentProsody.filterFreq;

    // Apply dynamic gain (whisper softness or excitement projection)
    const gainNode = this.outputContext.createGain();
    gainNode.gain.value = this.currentProsody.gain;

    source.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.outputContext.destination);

    const currentTime = this.outputContext.currentTime;
    // Calculate scheduled duration accounting for adjusted playback rate
    const scheduledDuration = audioBuffer.duration / Math.max(0.2, this.currentProsody.playbackRate);
    const startTime = Math.max(currentTime + 0.015, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + scheduledDuration;

    this.activeSources.add(source);
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.onPlaybackStateChange?.(true);
    }

    source.onended = () => {
      this.activeSources.delete(source);
      if (this.outputContext && this.outputContext.currentTime >= this.nextStartTime && this.activeSources.size === 0) {
        this.isPlaying = false;
        this.onPlaybackStateChange?.(false);
        this.onPlaybackFinished?.();
      }
    };
  }

  /**
   * Stop audio playback immediately when user manually interrupts
   */
  public stopPlayback(): void {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // Source might have already finished
      }
    });
    this.activeSources.clear();
    if (this.outputContext) {
      this.nextStartTime = this.outputContext.currentTime;
    } else {
      this.nextStartTime = 0;
    }
    if (this.isPlaying) {
      this.isPlaying = false;
      this.onPlaybackStateChange?.(false);
      this.onPlaybackFinished?.();
    }
  }

  public resumeOutput(): void {
    if (this.outputContext && this.outputContext.state === 'suspended') {
      this.outputContext.resume();
    }
  }

  public cleanup(): void {
    this.stopMic();
    this.stopPlayback();
    if (this.outputContext) {
      try {
        this.outputContext.close();
      } catch (e) {
        console.warn(e);
      }
      this.outputContext = null;
    }
  }

  // Helper conversions
  private floatTo16BitPCM(float32: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true); // Little-endian
    }
    return buffer;
  }

  private downsampleBuffer(
    buffer: Float32Array,
    inputRate: number,
    outputRate: number
  ): Float32Array {
    if (outputRate === inputRate) return buffer;
    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
