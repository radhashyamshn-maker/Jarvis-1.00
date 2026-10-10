import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';
import { AudioStreamer, type EmotionCue, type ProsodySettings } from './AudioStreamer';
import { getDynamicSystemPrompt } from './systemPrompt';
import { executeTool, functionDeclarations } from './tools';

export type SessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export interface LiveSessionCallbacks {
  onStateChange: (state: SessionState) => void;
  onError: (error: string) => void;
  onAudioLevel?: (level: number) => void;
  onTranscript?: (text: string, isUser: boolean) => void;
  onEmotionChange?: (emotion: EmotionCue, prosody: ProsodySettings) => void;
}

export interface LiveSessionOptions {
  apiKey?: string;
  model?: string;
  voiceName?: string;
}

export class LiveSession {
  private state: SessionState = 'disconnected';
  private ai: GoogleGenAI | null = null;
  private session: any = null;
  private audioStreamer: AudioStreamer;
  private callbacks: LiveSessionCallbacks;
  private options: LiveSessionOptions;
  private isDestroyed: boolean = false;
  private finishSpeakingTimer: ReturnType<typeof setTimeout> | null = null;

  // Emotional prosody tracking
  private currentEmotion: EmotionCue = 'normal';
  private recentAudioLevels: number[] = [];

  constructor(options: LiveSessionOptions, callbacks: LiveSessionCallbacks) {
    this.options = options;
    this.callbacks = callbacks;

    this.audioStreamer = new AudioStreamer({
      onPlaybackStateChange: (isPlaying) => {
        if (isPlaying) {
          // While speaker is outputting sound, mute mic to prevent feedback loop & self-interruption!
          this.audioStreamer.setMicMuted(true);
          this.setState('speaking');
        }
      },
      onPlaybackFinished: () => {
        this.finishSpeakingTurn();
      },
      onAudioLevel: (level) => {
        // Collect user speech acoustic levels when in listening mode
        if (this.state === 'listening' && level > 0.02) {
          this.recentAudioLevels.push(level);
          if (this.recentAudioLevels.length > 50) {
            this.recentAudioLevels.shift();
          }
        }
        this.callbacks.onAudioLevel?.(level);
      },
    });
  }

  public getState(): SessionState {
    return this.state;
  }

  private setState(newState: SessionState) {
    if (this.state !== newState && !this.isDestroyed) {
      console.log(`[JARVIS State] ${this.state} -> ${newState}`);
      this.state = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  /**
   * Transition cleanly from speaking to listening once all queued speech has completely finished.
   */
  private finishSpeakingTurn() {
    if (this.finishSpeakingTimer) {
      clearTimeout(this.finishSpeakingTimer);
    }

    // Wait 350ms for speaker reverberation to dissipate before unmuting mic
    this.finishSpeakingTimer = setTimeout(() => {
      if (!this.audioStreamer.isAudioPlaying() && this.state === 'speaking' && !this.isDestroyed) {
        this.audioStreamer.setMicMuted(false);
        this.setState('listening');
      }
    }, 350);
  }

  /**
   * Connect to Gemini Live API
   */
  public async connect(): Promise<void> {
    if (this.state !== 'disconnected') return;

    this.setState('connecting');
    this.isDestroyed = false;

    try {
      // 1. Resolve API Key: prioritize user-provided key in localStorage for APK standalone mode
      let key = this.options.apiKey;

      if (!key && typeof window !== 'undefined') {
        const userStoredKey =
          localStorage.getItem('jarvis_custom_api_key') ||
          localStorage.getItem('gemini_api_key') ||
          localStorage.getItem('apiKey');
        if (userStoredKey && userStoredKey.trim() !== '' && userStoredKey !== 'YOUR_API_KEY_HERE') {
          key = userStoredKey.trim();
        }
      }

      // If still empty, check server config route
      if (!key) {
        try {
          const res = await fetch('/api/config');
          if (res.ok) {
            const data = await res.json();
            if (data.apiKey && data.apiKey !== 'YOUR_API_KEY_HERE') {
              key = data.apiKey;
            }
          }
        } catch {
          // ignore error if running pure static client or offline APK
        }
      }

      if (!key) {
        key = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      }

      if (!key || key.trim() === '' || key === 'YOUR_API_KEY_HERE') {
        throw new Error(
          'Gemini API Key missing. Please save your API Key in Settings (CONFIG) or provide GEMINI_API_KEY in environment.'
        );
      }

      // Pre-warm audio output context within user activation gesture
      await this.audioStreamer.initOutput();
      this.audioStreamer.resumeOutput();

      // 2. Initialize GenAI Client
      this.ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      let chosenModel =
        this.options.model ||
        (import.meta as any).env?.VITE_MODEL ||
        'gemini-3.8-live';

      // Remap unsupported/deprecated models to gemini-3.8-live
      if (
        chosenModel === 'gemini-2.0-flash-exp' ||
        chosenModel === 'gemini-2.0-flash' ||
        chosenModel === 'gemini-2.0-flash-realtime-exp'
      ) {
        console.warn(`[JARVIS] Remapping legacy model '${chosenModel}' to 'gemini-3.8-live'`);
        chosenModel = 'gemini-3.8-live';
      }

      const voice = this.options.voiceName || 'Aoede';

      console.log(`[JARVIS] Connecting Live Session using model: ${chosenModel}, voice: ${voice}`);

      // 3. Connect to Live Session with candidate models fallback
      const candidateModels = [
        chosenModel,
        'gemini-3.8-live',
        'gemini-3.1-flash-live-preview',
        'gemini-2.5-flash-native-audio-latest',
      ].filter((m, idx, arr) => arr.indexOf(m) === idx);

      let lastError: any = null;
      let connected = false;

      for (const modelToTry of candidateModels) {
        try {
          console.log(`[JARVIS] Attempting live connect with model: ${modelToTry}`);
          this.session = await this.ai.live.connect({
            model: modelToTry,
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voice,
                  },
                },
              },
              systemInstruction: getDynamicSystemPrompt(),
              tools: [{ functionDeclarations }],
            },
            callbacks: {
              onopen: () => {
                console.log(`[JARVIS] WebSocket connected to Gemini Live (${modelToTry})!`);
                this.audioStreamer.setMicMuted(false);
                this.setState('listening');
              },
              onmessage: async (message: LiveServerMessage) => {
                await this.handleMessage(message);
              },
              onerror: (err: any) => {
                console.error('[JARVIS] Live socket error:', err);
                this.callbacks.onError(err?.message || 'Gemini Live connection error');
              },
              onclose: (e: any) => {
                console.log('[JARVIS] Live socket closed:', e);
                if (!this.isDestroyed) {
                  this.disconnect();
                }
              },
            },
          });

          connected = true;
          break;
        } catch (err: any) {
          console.warn(`[JARVIS] Failed to connect with ${modelToTry}:`, err?.message || err);
          lastError = err;
        }
      }

      if (!connected) {
        throw lastError || new Error('Could not establish Live connection with available models.');
      }

      // 4. Start Microphone Streaming (16kHz PCM16)
      await this.audioStreamer.startMic((pcmBase64) => {
        // Only stream mic chunks when listening and NOT muted during speaking
        if (
          this.session &&
          this.state !== 'disconnected' &&
          !this.audioStreamer.isMicMuted()
        ) {
          try {
            this.session.sendRealtimeInput({
              audio: {
                data: pcmBase64,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          } catch (e) {
            console.warn('Error sending mic chunk:', e);
          }
        }
      });
    } catch (err: any) {
      console.error('[JARVIS] Connection failed:', err);
      this.disconnect();
      this.callbacks.onError(
        err?.message || 'Could not connect to JARVIS Live. Check your API key and network.'
      );
    }
  }

  /**
   * Dynamically adjust voice synthesis prosody (speed, pitch, and intonation)
   */
  public applyEmotionalProsody(cue: EmotionCue, source: string): void {
    if (this.currentEmotion === cue) return;
    this.currentEmotion = cue;
    this.audioStreamer.setProsody(cue);
    const prosody = this.audioStreamer.getProsody();
    console.log(
      `[JARVIS Dynamic Prosody (${source})] Emotion: "${cue.toUpperCase()}" | Speed: ${prosody.playbackRate}x | Pitch: ${prosody.detune} cents | Intonation Filter: ${prosody.filterFreq}Hz | Gain: ${prosody.gain}`
    );
    this.callbacks.onEmotionChange?.(cue, prosody);
  }

  public getCurrentEmotion(): EmotionCue {
    return this.currentEmotion;
  }

  public getProsody(): ProsodySettings {
    return this.audioStreamer.getProsody();
  }

  /**
   * Evaluate acoustic energy profile from user speech (whispering, loudness, fatigue)
   */
  private evaluateUserAcousticCues(): void {
    if (this.recentAudioLevels.length < 3) return;

    const sum = this.recentAudioLevels.reduce((a, b) => a + b, 0);
    const avg = sum / this.recentAudioLevels.length;
    const max = Math.max(...this.recentAudioLevels);

    // Whisper: sustained low energy speech below 0.15 average & 0.28 peak
    if (avg < 0.14 && max < 0.26) {
      this.applyEmotionalProsody('whisper', 'User Acoustic Whisper');
    }
    // Excitement: loud, energetic speech burst above 0.70 peak or 0.42 avg
    else if (max > 0.68 || avg > 0.42) {
      this.applyEmotionalProsody('excitement', 'User Acoustic Excitement/Loudness');
    }
    // Tiredness / Bedtime: slow, gentle, low-energy cadence
    else if (avg < 0.22 && max < 0.38) {
      this.applyEmotionalProsody('tiredness', 'User Acoustic Low-Energy/Tiredness');
    }
    // Calm / Normal baseline
    else if (this.currentEmotion !== 'normal') {
      this.applyEmotionalProsody('normal', 'User Acoustic Baseline');
    }

    this.recentAudioLevels = [];
  }

  /**
   * Parse model text/transcript for semantic emotion markers
   */
  private detectEmotionFromText(text: string): void {
    const t = text.toLowerCase();
    if (
      t.includes('*crying*') ||
      t.includes('*sniffles*') ||
      t.includes('*sobs*') ||
      t.includes('rona') ||
      t.includes('ro mat') ||
      t.includes('aankhon me aansu') ||
      t.includes('dil toot gaya')
    ) {
      this.applyEmotionalProsody('crying', 'Semantic Crying/Tears Marker');
    } else if (
      t.includes('*pouts*') ||
      t.includes('*angry*') ||
      t.includes('gussa') ||
      t.includes('katti') ||
      t.includes('bure ho') ||
      t.includes('tang mat karo') ||
      t.includes('huh!')
    ) {
      this.applyEmotionalProsody('anger', 'Semantic Anger/Pouting Marker');
    } else if (
      t.includes('*sad*') ||
      t.includes('udaas') ||
      t.includes('dard') ||
      t.includes('takleef') ||
      t.includes('pareshan') ||
      t.includes('sorry')
    ) {
      this.applyEmotionalProsody('sadness', 'Semantic Sadness Marker');
    } else if (
      t.includes('whisper') ||
      t.includes('fusfus') ||
      t.includes('dheere bol') ||
      t.includes('chupke se') ||
      t.includes('*whisper*') ||
      t.includes('*softly*') ||
      t.includes('secret')
    ) {
      this.applyEmotionalProsody('whisper', 'Semantic Whisper Marker');
    } else if (
      t.includes('excited') ||
      t.includes('kamaal') ||
      t.includes('zabardast') ||
      t.includes('arre waah') ||
      t.includes('hurray') ||
      t.includes('congratulations') ||
      t.includes('dhamaka') ||
      t.includes('emergency') ||
      t.includes('danger') ||
      t.includes('alert')
    ) {
      this.applyEmotionalProsody('excitement', 'Semantic Excitement Marker');
    } else if (
      t.includes('tired') ||
      t.includes('thak') ||
      t.includes('neend') ||
      t.includes('so jao') ||
      t.includes('soiye') ||
      t.includes('good night') ||
      t.includes('aram kijiye') ||
      t.includes('lullaby')
    ) {
      this.applyEmotionalProsody('tiredness', 'Semantic Tiredness/Rest Marker');
    } else if (t.includes('calm') || t.includes('relax') || t.includes('sukoon')) {
      this.applyEmotionalProsody('calm', 'Semantic Calm Marker');
    } else {
      this.applyEmotionalProsody('normal', 'Semantic Normal Flow');
    }
  }

  /**
   * Handle incoming messages from Gemini Live server
   */
  private async handleMessage(message: LiveServerMessage): Promise<void> {
    if (this.isDestroyed) return;

    // Process Audio Response
    const parts = message.serverContent?.modelTurn?.parts;
    if (parts && parts.length > 0) {
      // Analyze user acoustic energy right before playing synthesis
      this.evaluateUserAcousticCues();

      for (const part of parts) {
        if (part.text) {
          this.detectEmotionFromText(part.text);
          this.callbacks.onTranscript?.(part.text, false);
        }

        if (part.inlineData?.data) {
          // Mute mic immediately so speaker sound doesn't echo into mic and cause self-interruption!
          this.audioStreamer.setMicMuted(true);
          this.setState('speaking');
          await this.audioStreamer.playChunk(part.inlineData.data);
        }
      }
    }

    // When the server completes generating this turn
    if (message.serverContent?.turnComplete) {
      console.log('[JARVIS] Server turnComplete received. Ensuring all audio plays to the end.');
      if (!this.audioStreamer.isAudioPlaying()) {
        this.finishSpeakingTurn();
      }
    }

    // Process Function/Tool Calls
    if (message.toolCall?.functionCalls && message.toolCall.functionCalls.length > 0) {
      console.log('[JARVIS] Received Tool Calls:', message.toolCall.functionCalls);
      for (const call of message.toolCall.functionCalls) {
        if (!call.name) continue;

        // Contextual emotional modulation from tools
        const argsAny = (call.args || {}) as Record<string, any>;
        if (call.name === 'startBreathingExercise' || argsAny.routineName?.includes?.('night')) {
          this.applyEmotionalProsody('tiredness', 'Breathing/Night Tool');
        } else if (call.name === 'triggerEmergencySOS') {
          this.applyEmotionalProsody('excitement', 'Emergency SOS Tool');
        } else if (call.name === 'tellJokeOrShayari') {
          this.applyEmotionalProsody('excitement', 'Jokes/Shayari Tool');
        }

        try {
          const result = await executeTool(call.name, call.args || {});

          if (this.session) {
            this.session.sendToolResponse({
              functionResponses: [
                {
                  id: call.id,
                  name: call.name,
                  response: { output: result },
                },
              ],
            });
          }
        } catch (e: any) {
          console.error(`Error handling tool call ${call.name}:`, e);
          if (this.session) {
            this.session.sendToolResponse({
              functionResponses: [
                {
                  id: call.id,
                  name: call.name,
                  response: { error: e?.message || 'Execution error' },
                },
              ],
            });
          }
        }
      }
    }
  }

  /**
   * Disconnect and release all resources
   */
  public disconnect(): void {
    this.isDestroyed = true;
    if (this.finishSpeakingTimer) {
      clearTimeout(this.finishSpeakingTimer);
      this.finishSpeakingTimer = null;
    }

    if (this.session) {
      try {
        this.session.close();
      } catch (e) {
        console.warn(e);
      }
      this.session = null;
    }

    this.audioStreamer.cleanup();
    this.setState('disconnected');
  }

  /**
   * Send a client text prompt directly to Gemini Live
   */
  public async sendTextMessage(text: string): Promise<void> {
    if (!this.session || this.state === 'disconnected') {
      console.warn('[JARVIS] Cannot send text, session not active');
      return;
    }
    try {
      this.callbacks.onTranscript?.(text, true);
      await this.session.sendClientContent({
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      });
    } catch (err) {
      console.error('[JARVIS] Failed to send client text:', err);
    }
  }
}
