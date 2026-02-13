'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'aurora-memory';
const MAX_EVENTS = 12;

export type MemoryEventType = 'navigation' | 'action' | 'note';

export interface MemoryEvent {
  id: string;
  type: MemoryEventType;
  label: string;
  detail?: string;
  timestamp: string;
}

export interface MemoryState {
  enabled: boolean;
  lastUniverse?: string;
  lastRoute?: string;
  lastVisitedAt?: string;
  events: MemoryEvent[];
}

interface MemoryContextType extends MemoryState {
  setEnabled: (enabled: boolean) => void;
  recordEvent: (event: Omit<MemoryEvent, 'id' | 'timestamp'>) => void;
  setLocation: (location: { route: string; universe: string }) => void;
  addNote: (note: string) => void;
  clearMemory: () => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

const defaultState: MemoryState = {
  enabled: true,
  events: [],
};

const loadState = (): MemoryState => {
  if (typeof window === 'undefined') return defaultState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    const parsed = JSON.parse(stored) as Partial<MemoryState>;
    return {
      ...defaultState,
      ...parsed,
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch (error) {
    console.error('Failed to load memory state:', error);
    return defaultState;
  }
};

export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MemoryState>(defaultState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(loadState());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save memory state:', error);
    }
  }, [state, mounted]);

  const setEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, enabled }));
  }, []);

  const recordEvent = useCallback(
    (event: Omit<MemoryEvent, 'id' | 'timestamp'>) => {
      setState((prev) => {
        if (!prev.enabled) return prev;
        const nextEvent: MemoryEvent = {
          id: `mem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: new Date().toISOString(),
          ...event,
        };
        return {
          ...prev,
          events: [nextEvent, ...prev.events].slice(0, MAX_EVENTS),
        };
      });
    },
    []
  );

  const setLocation = useCallback(
    (location: { route: string; universe: string }) => {
      setState((prev) => {
        if (!prev.enabled) return prev;
        const hasChanged = prev.lastRoute !== location.route || prev.lastUniverse !== location.universe;
        const nextState: MemoryState = {
          ...prev,
          lastRoute: location.route,
          lastUniverse: location.universe,
          lastVisitedAt: new Date().toISOString(),
        };

        if (!hasChanged) return nextState;

        const navEvent: MemoryEvent = {
          id: `mem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: new Date().toISOString(),
          type: 'navigation',
          label: `Visited ${location.universe}`,
          detail: location.route,
        };

        return {
          ...nextState,
          events: [navEvent, ...prev.events].slice(0, MAX_EVENTS),
        };
      });
    },
    []
  );

  const addNote = useCallback(
    (note: string) => {
      const trimmed = note.trim();
      if (!trimmed) return;
      recordEvent({
        type: 'note',
        label: 'Companion note',
        detail: trimmed,
      });
    },
    [recordEvent]
  );

  const clearMemory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      events: [],
      lastUniverse: undefined,
      lastRoute: undefined,
      lastVisitedAt: undefined,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setEnabled,
      recordEvent,
      setLocation,
      addNote,
      clearMemory,
    }),
    [state, setEnabled, recordEvent, setLocation, addNote, clearMemory]
  );

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const context = useContext(MemoryContext);
  if (!context) {
    return {
      ...defaultState,
      setEnabled: () => {},
      recordEvent: () => {},
      setLocation: () => {},
      addNote: () => {},
      clearMemory: () => {},
    };
  }
  return context;
}
