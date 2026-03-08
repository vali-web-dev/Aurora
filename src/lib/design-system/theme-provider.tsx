'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { ThemeMode, ThemeFamily } from './tokens';
import { themeFamilies, illuminatedTokens } from './tokens';

interface ThemeContextType {
  mode: ThemeMode;
  family: ThemeFamily;
  setMode: (mode: ThemeMode) => void;
  setFamily: (family: ThemeFamily) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('text30');
  const [family, setFamilyState] = useState<ThemeFamily>('home');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    setMounted(true);
    const migrationKey = 'aurora-theme-migrated-text30-v1';
    if (!localStorage.getItem(migrationKey)) {
      localStorage.setItem('aurora-theme-mode', 'text30');
      localStorage.setItem(migrationKey, 'true');
    }

    const savedMode = (localStorage.getItem('aurora-theme-mode') as ThemeMode) || 'text30';
    const savedFamily = (localStorage.getItem('aurora-theme-family') as ThemeFamily) || 'home';
    setModeState(savedMode);
    setFamilyState(savedFamily);
    applyTheme(savedMode, savedFamily);
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('aurora-theme-mode', newMode);
    applyTheme(newMode, family);
  };

  const setFamily = (newFamily: ThemeFamily) => {
    setFamilyState(newFamily);
    localStorage.setItem('aurora-theme-family', newFamily);
    applyTheme(mode, newFamily);
  };

  const applyTheme = (themeMode: ThemeMode, themeFamily: ThemeFamily) => {
    const html = document.documentElement;
    const isText30Mode = themeMode === 'text30';
    html.classList.toggle('theme-text30', isText30Mode);
    
    // Apply mode
    if (themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.toggle('dark', prefersDark);
      html.classList.remove('illuminated');
    } else if (themeMode === 'illuminated') {
      html.classList.add('dark', 'illuminated');
    } else {
      html.classList.toggle('dark', themeMode === 'dark' || isText30Mode);
      html.classList.remove('illuminated');
    }
    
    // Apply family
    html.classList.forEach((cls) => {
      if (cls.startsWith('theme-')) {
        html.classList.remove(cls);
      }
    });
    html.classList.add(`theme-${themeFamily}`);
    
    // Set CSS variables for theme family colors
    const familyColors = themeFamilies[themeFamily];
    Object.entries(familyColors).forEach(([key, value]) => {
      html.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply illuminated mode styles
    if (themeMode === 'illuminated') {
      html.style.setProperty('--bg-primary', illuminatedTokens.background);
      html.style.setProperty('--bg-surface', illuminatedTokens.surface);
      html.style.setProperty('--border-color', illuminatedTokens.border);
      html.style.setProperty('--text-primary', illuminatedTokens.text.primary);
      html.style.setProperty('--text-secondary', illuminatedTokens.text.secondary);
      html.style.setProperty('--glow-soft', illuminatedTokens.glow.soft);
      html.style.setProperty('--glow-medium', illuminatedTokens.glow.medium);
      html.style.setProperty('--glow-strong', illuminatedTokens.glow.strong);
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, family, setMode, setFamily }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default values if context is not available (e.g., during SSR)
    return {
      mode: 'text30' as const,
      family: 'home' as const,
      setMode: () => {},
      setFamily: () => {},
    };
  }
  return context;
}
