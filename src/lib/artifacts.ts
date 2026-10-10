/**
 * JARVIS Stark Artifacts Engine
 * Manages modular, interactive, and exportable AI artifacts:
 * - Stark Engineering Blueprints (Schematics & SVG Diagrams)
 * - Code Scripts & Shaders (TypeScript, Python, Shell)
 * - Technical Dossiers & Research Documents (Markdown)
 * - System Architecture & Live Telemetry Visuals
 */

export type ArtifactType = 'blueprint' | 'code' | 'document' | 'svg' | 'data';

export interface StarkArtifact {
  id: string;
  title: string;
  hindiTitle: string;
  type: ArtifactType;
  category: string;
  description: string;
  tags: string[];
  content: string;
  createdAt: string;
  author: string;
  version: string;
}

const ARTIFACTS_STORAGE_KEY = 'jarvis_stark_artifacts_v1';

export const DEFAULT_ARTIFACTS: StarkArtifact[] = [
  {
    id: 'art_arc_reactor_schematic',
    title: 'Arc Reactor Mark-85 Core Schematic',
    hindiTitle: 'आर्क रिएक्टर मार्क-85 ब्लूप्रिंट',
    type: 'blueprint',
    category: 'Stark Engineering',
    description: 'Zero-point palladium-deuterium plasma containment grid and magnetic confinement manifold.',
    tags: ['ARC REACTOR', 'PLASMA', 'ENERGY', 'BLUEPRINT'],
    author: 'Satyam Sahani',
    version: '4.2.0',
    createdAt: new Date().toLocaleDateString(),
    content: `# STARK INDUSTRIES — CLASSIFIED SCHEMATIC
## MARK-85 ZERO-POINT ARC REACTOR CORE
**Project Lead:** Satyam Sahani
**Security Clearance:** LEVEL 10 (ALPHA)

### 1. CORE SPECIFICATIONS:
- **Output:** 2.40 GW Peak Plasma Wattage
- **Fuel Element:** Synthesized Palladium-Vibranium Ring
- **Containment Field:** Magnetic Toroidal Tokamak (3.8 Tesla)
- **Coolant Matrix:** Acoustic Cavitation Liquid Helium

\`\`\`
   [ + ] =================================== [ + ]
    |      STARK ZERO-POINT PLASMA RING       |
    |          (O)  MAGNETIC CORE  (O)        |
    |      ------------------------------     |
    |      Torus Temp: 14.8M Kelvin           |
    |      Flux Density: 99.98% Stable        |
   [ + ] =================================== [ + ]
\`\`\`

### 2. OPERATIONAL TELEMETRY:
1. Primary toroidal coil activation: OK (100%)
2. Antimatter buffer harmonic dampener: ENGAGED
3. Acoustic shock dispersal frequency: 440 Hz
4. Neural command relay bypass: ONLINE
`,
  },
  {
    id: 'art_quantum_crypto_module',
    title: 'Zero-Trust Quantum Cryptographic Shield',
    hindiTitle: 'क्वांटम एन्क्रिप्शन क्रिप्ट-शील्ड कोड',
    type: 'code',
    category: 'Cybersecurity',
    description: 'Post-quantum elliptic curve lattice cryptography engine with military-grade tamper telemetry.',
    tags: ['TYPESCRIPT', 'SECURITY', 'QUANTUM', 'CODE'],
    author: 'Satyam Sahani',
    version: '2.1.0',
    createdAt: new Date().toLocaleDateString(),
    content: `// STARK QUANTUM CRYPTOGRAPHIC PROTOCOL
// Engineered by Satyam Sahani for JARVIS Defense Grid

export interface QuantumToken {
  hash: string;
  entropy: number;
  timestamp: number;
  verified: boolean;
}

export class StarkQuantumCrypt {
  private static readonly SALT = 'STARK-TECH-2080-SATYAM-SAHANI';

  public static generateEntropyKey(seed: string): QuantumToken {
    const raw = seed + this.SALT + Date.now();
    let hash = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    const hex = (hash >>> 0).toString(16).padStart(8, '0');
    return {
      hash: \`0x\${hex.toUpperCase()}\`,
      entropy: 0.9997,
      timestamp: Date.now(),
      verified: true,
    };
  }

  public static verifyTelemetryNode(token: QuantumToken): boolean {
    return token.verified && (Date.now() - token.timestamp) < 30000;
  }
}
`,
  },
  {
    id: 'art_jarvis_neural_dossier',
    title: 'JARVIS Neural Core Architecture Dossier',
    hindiTitle: 'जार्विस न्यूरल आर्किटेक्चर डॉसियर',
    type: 'document',
    category: 'System Architecture',
    description: 'Comprehensive technical overview of bidirectional voice synthesis and 1.0x conversational pace.',
    tags: ['ARCHITECTURE', 'AI', 'VOICE', 'DOCUMENT'],
    author: 'Satyam Sahani',
    version: '1.0.0',
    createdAt: new Date().toLocaleDateString(),
    content: `# JARVIS AI SYSTEM ARCHITECTURE
**Lead Architect & Developer:** Satyam Sahani (सत्यम साहनी)

---

### EXECUTIVE SUMMARY:
JARVIS is a real-time, low-latency, empathetic conversational AI companion designed for native Android (Capacitor) and ultra-responsive web runtime.

### KEY SUBSYSTEMS:
1. **Bimodal WebRTC / WebSocket Audio Pipeline**:
   - 16 kHz mono PCM16 uplink streaming.
   - 24 kHz high-definition audio playback buffer with chunk-level drift compensation.

2. **Acoustic Cadence Lock (1.0x Speeds)**:
   - Fixed 1.00x conversational pace strictly maintained across all emotional cues (Whisper, Excitement, Empathy, Calm).
   - Zero-interruption echo dampening with dynamic mic gating.

3. **Multi-Category Hardware Intent Matrix**:
   - 50+ tool categories ranging from GPS turn-by-turn routing to deep space orbital relays.
   - Local offline fallback memory persistent in IndexedDB/LocalStorage.
`,
  },
  {
    id: 'art_stark_hud_radar_svg',
    title: 'Planetary Defense Vector Radar (Interactive SVG)',
    hindiTitle: 'प्लैनेटरी डिफेंस रडार (विजुअल SVG)',
    type: 'svg',
    category: 'Visual HUD',
    description: 'Vector-based holographic radar reticle with animated target telemetry and coordinate vectors.',
    tags: ['SVG', 'VECTOR', 'RADAR', 'VISUAL'],
    author: 'Satyam Sahani',
    version: '3.0.0',
    createdAt: new Date().toLocaleDateString(),
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff1e42" stop-opacity="0.3" />
      <stop offset="70%" stop-color="#ff1e42" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ff1e42" stop-opacity="0" />
    </radialGradient>
  </defs>
  <!-- Background Circles -->
  <circle cx="200" cy="200" r="180" fill="url(#radarGlow)" stroke="#ff1e42" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/>
  <circle cx="200" cy="200" r="130" fill="none" stroke="#ff1e42" stroke-width="1" opacity="0.5"/>
  <circle cx="200" cy="200" r="80" fill="none" stroke="#ff1e42" stroke-width="1.5" opacity="0.7"/>
  <circle cx="200" cy="200" r="30" fill="#ff1e42" fill-opacity="0.2" stroke="#ff708a" stroke-width="2"/>
  
  <!-- Crosshairs -->
  <line x1="20" y1="200" x2="380" y2="200" stroke="#ff1e42" stroke-width="1" opacity="0.5"/>
  <line x1="200" y1="20" x2="200" y2="380" stroke="#ff1e42" stroke-width="1" opacity="0.5"/>
  
  <!-- Target Blips -->
  <circle cx="270" cy="140" r="5" fill="#00ffcc" />
  <circle cx="270" cy="140" r="10" fill="none" stroke="#00ffcc" stroke-width="1" opacity="0.7"/>
  <text x="282" y="145" fill="#00ffcc" font-family="monospace" font-size="11">TARGET_01 [AZ 42°]</text>

  <circle cx="120" cy="260" r="4" fill="#ffaa00" />
  <text x="70" y="275" fill="#ffaa00" font-family="monospace" font-size="10">ORBITAL RELAY [11ms]</text>
  
  <!-- Center Core -->
  <circle cx="200" cy="200" r="4" fill="#ffffff"/>
  <text x="145" y="385" fill="#ff708a" font-family="monospace" font-size="10" letter-spacing="2">STARK RADAR // ONLINE</text>
</svg>`,
  },
];

export function getStoredArtifacts(): StarkArtifact[] {
  try {
    const raw = localStorage.getItem(ARTIFACTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(DEFAULT_ARTIFACTS));
      return DEFAULT_ARTIFACTS;
    }
    const parsed: StarkArtifact[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(DEFAULT_ARTIFACTS));
      return DEFAULT_ARTIFACTS;
    }
    return parsed;
  } catch (e) {
    console.warn('Error reading artifacts:', e);
    return DEFAULT_ARTIFACTS;
  }
}

export function saveArtifact(artifact: StarkArtifact): void {
  const current = getStoredArtifacts();
  const existingIdx = current.findIndex((a) => a.id === artifact.id);
  let updated: StarkArtifact[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = artifact;
  } else {
    updated = [artifact, ...current];
  }
  localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(updated));
}

export function createNewArtifact(params: {
  title: string;
  hindiTitle?: string;
  type: ArtifactType;
  category?: string;
  description: string;
  content: string;
  tags?: string[];
}): StarkArtifact {
  const newArt: StarkArtifact = {
    id: `art_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: params.title,
    hindiTitle: params.hindiTitle || params.title,
    type: params.type,
    category: params.category || 'General Stark Tech',
    description: params.description,
    tags: params.tags && params.tags.length > 0 ? params.tags : ['ARTIFACT', params.type.toUpperCase()],
    content: params.content,
    createdAt: new Date().toLocaleDateString(),
    author: 'Satyam Sahani',
    version: '1.0.0',
  };
  saveArtifact(newArt);
  return newArt;
}

export function deleteArtifact(id: string): void {
  const current = getStoredArtifacts();
  const filtered = current.filter((a) => a.id !== id);
  localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(filtered));
}
