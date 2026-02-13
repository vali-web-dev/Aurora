'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  type ToneType,
  type ScopeLevel,
  type UniverseContext,
  type UserSignal,
  type TimePattern,
  resolvePersonality,
  personalityMatrix,
  toneBehaviors,
  scopeBehaviors,
} from '@/lib/companion/personality-matrix';

interface CompanionContextEngine {
  // Current state
  currentUniverse: UniverseContext | null;
  currentTone: ToneType;
  currentScope: ScopeLevel;
  guidanceTheme: string | undefined;

  // Signals
  signals: UserSignal[];
  addSignal: (signal: UserSignal) => void;
  clearSignal: (signal: UserSignal) => void;
  clearAllSignals: () => void;

  // Time context
  timePattern: TimePattern;
  visitCount: number;

  // Tone behavior
  toneBehavior: (typeof toneBehaviors)[ToneType];

  // Scope behavior
  scopeBehavior: (typeof scopeBehaviors)[ScopeLevel];

  // Helpers
  canShowSuggestion: () => boolean;
  canMemorize: () => boolean;
  canSummarize: () => boolean;
}

const CompanionContextEngineContext = createContext<CompanionContextEngine | undefined>(undefined);

const universePathMap: Record<string, UniverseContext> = {
  '/': 'home',
  '/learning': 'learning',
  '/learn': 'learning',
  '/forge': 'forge',
  '/create': 'forge',
  '/productivity': 'productivity',
  '/tasks': 'productivity',
  '/health': 'health',
  '/wellness': 'health',
  '/finance': 'finance',
  '/social': 'social',
  '/entertainment': 'entertainment',
  '/travel': 'travel',
  '/homecontrol': 'homecontrol',
  '/automation': 'automation',
  '/product': 'commerce',
  '/shop': 'commerce',
  '/security': 'security',
  '/developer': 'developer',
  '/ai': 'ai',
  '/identity': 'identity',
  '/realms': 'realms',
  '/guilds': 'guilds',
  '/luma': 'luma',
  '/navigation': 'navigation',
};

const getUniverseFromPath = (pathname: string): UniverseContext => {
  // Direct match
  if (universePathMap[pathname]) {
    return universePathMap[pathname];
  }

  // Prefix match
  const segment = pathname.split('/').filter(Boolean)[0];
  if (segment && universePathMap[`/${segment}`]) {
    return universePathMap[`/${segment}`];
  }

  return 'home';
};

const getTimePattern = (visitCount: number): TimePattern => {
  if (visitCount === 1) return 'first_visit';
  if (new Date().getHours() >= 22 || new Date().getHours() <= 5) return 'late_session';
  if (visitCount >= 50) return 'power_user';
  if (visitCount >= 10) return 'return_visitor';
  return 'new_day';
};

export function CompanionContextEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [signals, setSignals] = useState<UserSignal[]>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('aurora-companion-context');
      if (stored) {
        const parsed = JSON.parse(stored);
        setVisitCount(parsed.visitCount || 0);
        setSignals(parsed.signals || []);
      }
    } catch (error) {
      console.error('Failed to hydrate companion context:', error);
    }
  }, []);

  // Update visit count on universe change
  useEffect(() => {
    if (!mounted) return;
    setVisitCount((prev) => prev + 1);
  }, [pathname, mounted]);

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        'aurora-companion-context',
        JSON.stringify({ visitCount, signals })
      );
    } catch (error) {
      console.error('Failed to persist companion context:', error);
    }
  }, [visitCount, signals, mounted]);

  const currentUniverse = useMemo(
    () => (pathname ? getUniverseFromPath(pathname) : null),
    [pathname]
  );

  const timePattern = useMemo(() => getTimePattern(visitCount), [visitCount]);

  const { tone: currentTone, scope: currentScope } = useMemo(() => {
    if (!currentUniverse) {
      return { tone: 'mentor' as ToneType, scope: 'standard' as ScopeLevel };
    }
    return resolvePersonality(currentUniverse, signals, timePattern);
  }, [currentUniverse, signals, timePattern]);

  const guidanceTheme = useMemo(
    () => (currentUniverse ? personalityMatrix[currentUniverse]?.guidanceTheme : undefined),
    [currentUniverse]
  );

  const toneBehavior = useMemo(
    () => toneBehaviors[currentTone],
    [currentTone]
  );

  const scopeBehavior = useMemo(
    () => scopeBehaviors[currentScope],
    [currentScope]
  );

  const addSignal = (signal: UserSignal) => {
    setSignals((prev) =>
      prev.includes(signal) ? prev : [...prev, signal].slice(-5)
    );
  };

  const clearSignal = (signal: UserSignal) => {
    setSignals((prev) => prev.filter((s) => s !== signal));
  };

  const clearAllSignals = () => {
    setSignals([]);
  };

  const canShowSuggestion = () => scopeBehavior.suggestionsEnabled;

  const canMemorize = () => scopeBehavior.memoryEnabled;

  const canSummarize = () =>
    scopeBehavior.summariesEnabled && scopeBehavior.toolsAvailable.includes('timeline');

  const value: CompanionContextEngine = {
    currentUniverse,
    currentTone,
    currentScope,
    guidanceTheme,
    signals,
    addSignal,
    clearSignal,
    clearAllSignals,
    timePattern,
    visitCount,
    toneBehavior,
    scopeBehavior,
    canShowSuggestion,
    canMemorize,
    canSummarize,
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CompanionContextEngineContext.Provider value={value}>
      {children}
    </CompanionContextEngineContext.Provider>
  );
}

export function useCompanionContextEngine() {
  const context = useContext(CompanionContextEngineContext);
  if (!context) {
    return {
      currentUniverse: null,
      currentTone: 'mentor' as ToneType,
      currentScope: 'standard' as ScopeLevel,
      guidanceTheme: undefined,
      signals: [],
      addSignal: () => {},
      clearSignal: () => {},
      clearAllSignals: () => {},
      timePattern: 'return_visitor' as TimePattern,
      visitCount: 0,
      toneBehavior: toneBehaviors.mentor,
      scopeBehavior: scopeBehaviors.standard,
      canShowSuggestion: () => false,
      canMemorize: () => false,
      canSummarize: () => false,
    };
  }
  return context;
}
