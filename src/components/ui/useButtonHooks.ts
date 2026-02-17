/**
 * Aurora Button Hooks
 * Utilities for analytics, sound effects, and button state management
 */

import { useCallback, useEffect, useRef } from 'react';

// ========================================
// ANALYTICS HOOK
// ========================================

export interface UseButtonAnalyticsOptions {
  /**
   * Event name to track
   */
  event: string;

  /**
   * Event properties
   */
  properties?: Record<string, any>;

  /**
   * Whether to track automatically on mount
   * @default false
   */
  trackOnMount?: boolean;

  /**
   * Custom analytics function
   */
  trackFn?: (event: string, properties?: Record<string, any>) => void;
}

export const useButtonAnalytics = (options: UseButtonAnalyticsOptions) => {
  const { event, properties = {}, trackOnMount = false, trackFn } = options;

  const track = useCallback(() => {
    if (trackFn) {
      trackFn(event, properties);
    } else {
      // Default tracking (console log in dev, integrate with analytics in prod)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Button Analytics]', event, properties);
      }
      // In production, integrate with your analytics service:
      // analytics.track(event, properties);
      // posthog.capture(event, properties);
      // mixpanel.track(event, properties);
    }
  }, [event, properties, trackFn]);

  useEffect(() => {
    if (trackOnMount) {
      track();
    }
  }, [trackOnMount, track]);

  return { track };
};

// ========================================
// BUTTON SOUND HOOK
// ========================================

export interface UseButtonSoundOptions {
  /**
   * Sound to play
   */
  sound?: 'click' | 'success' | 'error' | 'warning' | 'info' | string;

  /**
   * Volume level (0-1)
   * @default 0.3
   */
  volume?: number;

  /**
   * Whether to preload sound
   * @default true
   */
  preload?: boolean;

  /**
   * Custom sound URL
   */
  soundUrl?: string;
}

export const useButtonSound = (options: UseButtonSoundOptions = {}) => {
  const { sound, volume = 0.3, preload = true, soundUrl } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!sound || typeof Audio === 'undefined') return;

    const url = soundUrl || `/sounds/buttons/${sound}.mp3`;
    audioRef.current = new Audio(url);
    audioRef.current.volume = volume;

    if (preload) {
      audioRef.current.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sound, volume, preload, soundUrl]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently fail if audio playback is not allowed
      });
    }
  }, []);

  return { play };
};

// ========================================
// BUTTON STATE HOOK
// ========================================

export interface UseButtonStateOptions {
  /**
   * Initial loading state
   * @default false
   */
  initialLoading?: boolean;

  /**
   * Initial disabled state
   * @default false
   */
  initialDisabled?: boolean;

  /**
   * Async function to execute
   */
  asyncFn?: (...args: any[]) => Promise<any>;

  /**
   * Callback on success
   */
  onSuccess?: (result: any) => void;

  /**
   * Callback on error
   */
  onError?: (error: Error) => void;

  /**
   * Auto-disable button while loading
   * @default true
   */
  disableWhileLoading?: boolean;
}

export const useButtonState = (options: UseButtonStateOptions = {}) => {
  const {
    initialLoading = false,
    initialDisabled = false,
    asyncFn,
    onSuccess,
    onError,
    disableWhileLoading = true,
  } = options;

  const [loading, setLoading] = React.useState(initialLoading);
  const [disabled, setDisabled] = React.useState(initialDisabled);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      if (!asyncFn) return;

      setLoading(true);
      setError(null);
      if (disableWhileLoading) setDisabled(true);

      try {
        const result = await asyncFn(...args);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
        if (disableWhileLoading) setDisabled(false);
      }
    },
    [asyncFn, onSuccess, onError, disableWhileLoading]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setDisabled(initialDisabled);
    setError(null);
  }, [initialDisabled]);

  return {
    loading,
    disabled,
    error,
    execute,
    reset,
    setLoading,
    setDisabled,
    setError,
  };
};

// ========================================
// KEYBOARD SHORTCUT HOOK
// ========================================

export interface UseKeyboardShortcutOptions {
  /**
   * Shortcut combination (e.g., 'Ctrl+S', 'Enter', 'Escape')
   */
  shortcut: string;

  /**
   * Callback to execute
   */
  onTrigger: () => void;

  /**
   * Whether shortcut is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Prevent default browser behavior
   * @default true
   */
  preventDefault?: boolean;

  /**
   * Stop event propagation
   * @default false
   */
  stopPropagation?: boolean;
}

export const useKeyboardShortcut = (options: UseKeyboardShortcutOptions) => {
  const { shortcut, onTrigger, enabled = true, preventDefault = true, stopPropagation = false } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = shortcut.toLowerCase().split('+').map(k => k.trim());
      const ctrl = keys.includes('ctrl') || keys.includes('control');
      const shift = keys.includes('shift');
      const alt = keys.includes('alt');
      const meta = keys.includes('meta') || keys.includes('cmd');
      const key = keys[keys.length - 1];

      const matches =
        (!ctrl || e.ctrlKey || e.metaKey) &&
        (!shift || e.shiftKey) &&
        (!alt || e.altKey) &&
        (!meta || e.metaKey) &&
        e.key.toLowerCase() === key;

      if (matches) {
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        onTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, onTrigger, enabled, preventDefault, stopPropagation]);
};

// ========================================
// HAPTIC FEEDBACK HOOK
// ========================================

export interface UseHapticOptions {
  /**
   * Vibration pattern (ms)
   * @default 10
   */
  pattern?: number | number[];

  /**
   * Whether haptics are enabled
   * @default true
   */
  enabled?: boolean;
}

export const useHaptic = (options: UseHapticOptions = {}) => {
  const { pattern = 10, enabled = true } = options;

  const trigger = useCallback(() => {
    if (!enabled || !('vibrate' in navigator)) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // Silently fail if vibration is not supported
    }
  }, [pattern, enabled]);

  return { trigger };
};

// React import for useState
import React from 'react';

const buttonHooks = {
  useButtonAnalytics,
  useButtonSound,
  useButtonState,
  useKeyboardShortcut,
  useHaptic,
};

export default buttonHooks;
