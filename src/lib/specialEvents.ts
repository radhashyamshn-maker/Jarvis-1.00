/**
 * Event bus for special reactive UI events (Fake Call, SOS Siren, Breathing, Routines)
 */

type SpecialEventListener = (data?: any) => void;

class SpecialEventBus {
  private listeners: Record<string, Set<SpecialEventListener>> = {};

  public on(event: string, fn: SpecialEventListener): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(fn);
    return () => {
      this.listeners[event]?.delete(fn);
    };
  }

  public emit(event: string, data?: any): void {
    this.listeners[event]?.forEach((fn) => {
      try {
        fn(data);
      } catch (e) {
        console.error(`Error in event listener for ${event}:`, e);
      }
    });
  }
}

export const specialEvents = new SpecialEventBus();
