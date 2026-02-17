'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AuroraLogoConcept = 'core' | 'wave';

interface AuroraLogoContextValue {
  concept: AuroraLogoConcept;
  setConcept: (concept: AuroraLogoConcept) => void;
}

const AuroraLogoContext = createContext<AuroraLogoContextValue | undefined>(undefined);

export function AuroraLogoProvider({ children }: { children: ReactNode }) {
  const [concept, setConceptState] = useState<AuroraLogoConcept>('core');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('aurora-logo-concept') as AuroraLogoConcept | null;
    if (stored === 'core' || stored === 'wave') {
      setConceptState(stored);
    }
  }, []);

  const setConcept = (next: AuroraLogoConcept) => {
    setConceptState(next);
    localStorage.setItem('aurora-logo-concept', next);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AuroraLogoContext.Provider value={{ concept, setConcept }}>
      {children}
    </AuroraLogoContext.Provider>
  );
}

export function useAuroraLogo() {
  const context = useContext(AuroraLogoContext);
  if (!context) {
    return { concept: 'core' as AuroraLogoConcept, setConcept: () => {} };
  }
  return context;
}
