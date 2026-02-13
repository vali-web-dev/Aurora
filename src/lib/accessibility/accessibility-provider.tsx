'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  keyboardNav: boolean;
  screenReaderMode: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  setSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  keyboardNav: false,
  screenReaderMode: false,
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage and system preferences
  useEffect(() => {
    setMounted(true);
    
    // Load saved settings
    const savedSettings = localStorage.getItem('aurora-accessibility');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to parse accessibility settings:', e);
      }
    }

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;

    setSettings((prev) => ({
      ...prev,
      reducedMotion: prev.reducedMotion || prefersReducedMotion,
      highContrast: prev.highContrast || prefersContrast,
    }));

    // Apply initial settings
    applySettings({
      ...defaultSettings,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersContrast,
    });
  }, []);

  const setSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('aurora-accessibility', JSON.stringify(newSettings));
      applySettings(newSettings);
      return newSettings;
    });
  };

  const applySettings = (newSettings: AccessibilitySettings) => {
    const html = document.documentElement;

    // High contrast mode
    html.classList.toggle('high-contrast', newSettings.highContrast);

    // Reduced motion
    html.classList.toggle('reduce-motion', newSettings.reducedMotion);

    // Large text
    html.classList.toggle('large-text', newSettings.largeText);

    // Keyboard navigation indicators
    html.classList.toggle('keyboard-nav', newSettings.keyboardNav);

    // Screen reader mode
    html.classList.toggle('screen-reader', newSettings.screenReaderMode);
  };

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('aurora-announcer');
    if (announcer) {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AccessibilityContext.Provider value={{ ...settings, setSetting, announce }}>
      {children}
      {/* Screen reader announcer */}
      <div
        id="aurora-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    return {
      ...defaultSettings,
      setSetting: () => {},
      announce: () => {},
    };
  }
  return context;
}
