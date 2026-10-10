/**
 * JARVIS Long-term Memory & User Personalization Store
 * Persists user details, preferences, notes, and facts across sessions.
 */

export interface JarvisMemory {
  userName?: string;
  wakeWord?: string;
  preferredVoice?: string;
  notes: { id: string; text: string; date: string }[];
  reminders: { id: string; text: string; time: string; done?: boolean }[];
  facts: Record<string, string>; // e.g. { "birthday": "15 August", "fav_song": "Kesariya" }
  routines: Record<string, string[]>;
}

const MEMORY_KEY = 'jarvis_quantum_memory_v1';

const defaultMemory: JarvisMemory = {
  userName: 'Satyam Sahani',
  wakeWord: 'Jarvis',
  preferredVoice: 'Aoede',
  notes: [],
  reminders: [],
  facts: {
    identity: 'JARVIS Stark-Tech Advanced Personal Assistant',
    developer: 'Satyam Sahani (सत्यम साहनी)',
    creator: 'Satyam Sahani (सत्यम साहनी)',
    language: 'Hinglish (Hindi + English mix)',
  },
  routines: {
    morning: ['weather', 'time', 'motivation', 'news'],
    night: ['silent_mode', 'tomorrow_reminders', 'sleep_quote'],
  },
};

export function getMemory(): JarvisMemory {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return defaultMemory;
    const parsed = JSON.parse(raw);
    const mergedFacts = {
      ...defaultMemory.facts,
      ...(parsed.facts || {}),
      developer: 'Satyam Sahani (सत्यम साहनी)',
      creator: 'Satyam Sahani (सत्यम साहनी)',
    };
    return {
      ...defaultMemory,
      ...parsed,
      facts: mergedFacts,
    };
  } catch (err) {
    console.warn('Failed to load memory:', err);
    return defaultMemory;
  }
}

export function saveMemory(memory: JarvisMemory): void {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch (err) {
    console.warn('Failed to save memory:', err);
  }
}

export function rememberFact(key: string, value: string): void {
  const mem = getMemory();
  mem.facts[key.toLowerCase().trim()] = value;
  saveMemory(mem);
}

export function recallFact(key: string): string | null {
  const mem = getMemory();
  return mem.facts[key.toLowerCase().trim()] || null;
}

export function forgetFact(key: string): boolean {
  const mem = getMemory();
  const k = key.toLowerCase().trim();
  if (k in mem.facts) {
    delete mem.facts[k];
    saveMemory(mem);
    return true;
  }
  return false;
}

export function addNote(text: string): void {
  const mem = getMemory();
  mem.notes.unshift({
    id: Date.now().toString(),
    text,
    date: new Date().toLocaleString(),
  });
  saveMemory(mem);
}

export function addReminder(text: string, time: string): void {
  const mem = getMemory();
  mem.reminders.unshift({
    id: Date.now().toString(),
    text,
    time,
    done: false,
  });
  saveMemory(mem);
}
