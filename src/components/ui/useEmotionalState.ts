/**
 * Emotional Intelligence Hook for Aurora Buttons
 * Manages dynamic emotional state transitions based on user interaction
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ButtonAnimation, ButtonVariant } from './Button';

export interface EmotionalStateConfig {
  /**
   * Enable emotional intelligence
   * @default false
   */
  enabled?: boolean;

  /**
   * Time in ms before transitioning from excited to calm state
   * @default 5000
   */
  excitementDuration?: number;

  /**
   * Calm state animation after excitement fades
   * @default 'breathe'
   */
  calmAnimation?: ButtonAnimation;

  /**
   * Context-aware: automatically apply nervous animation to danger/warning
   * @default true
   */
  contextAware?: boolean;

  /**
   * Override animation based on external state
   */
  overrideAnimation?: ButtonAnimation;
}

/**
 * Get context-aware default animation based on button variant
 */
const getContextAnimation = (variant?: ButtonVariant): ButtonAnimation => {
  switch (variant) {
    case 'danger':
    case 'warning':
      return 'nervous'; // Danger actions should feel urgent
    case 'success':
      return 'glow'; // Success feels confident
    case 'primary':
      return 'pulse'; // Primary actions have steady presence
    case 'notice':
      return 'breathe'; // Info is calm
    default:
      return 'none';
  }
};

export const useEmotionalState = (
  variant: ButtonVariant = 'primary',
  initialAnimation: ButtonAnimation = 'none',
  config: EmotionalStateConfig = {}
) => {
  const {
    enabled = false,
    excitementDuration = 5000,
    calmAnimation = 'breathe',
    contextAware = true,
    overrideAnimation,
  } = config;

  const [currentAnimation, setCurrentAnimation] = useState<ButtonAnimation>(() => {
    if (overrideAnimation) return overrideAnimation;
    if (contextAware && initialAnimation === 'none') {
      return getContextAnimation(variant);
    }
    return initialAnimation;
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isExcited, setIsExcited] = useState(false);
  const excitementTimeoutRef = useRef<NodeJS.Timeout>();
  const hoverStartTimeRef = useRef<number>(0);

  // Handle hover start
  const handleMouseEnter = useCallback(() => {
    if (!enabled) return;
    
    setIsHovered(true);
    setIsExcited(true);
    hoverStartTimeRef.current = Date.now();

    // Transition to excited state
    setCurrentAnimation('excited');

    // Clear any existing timeout
    if (excitementTimeoutRef.current) {
      clearTimeout(excitementTimeoutRef.current);
    }

    // After excitementDuration, transition to calm state
    excitementTimeoutRef.current = setTimeout(() => {
      setIsExcited(false);
      // If still hovering, go to calm animation
      setCurrentAnimation(calmAnimation);
    }, excitementDuration);
  }, [enabled, excitementDuration, calmAnimation]);

  // Handle hover end
  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;

    setIsHovered(false);
    setIsExcited(false);

    // Clear timeout
    if (excitementTimeoutRef.current) {
      clearTimeout(excitementTimeoutRef.current);
    }

    // Return to context-aware or initial animation
    if (overrideAnimation) {
      setCurrentAnimation(overrideAnimation);
    } else if (contextAware) {
      setCurrentAnimation(getContextAnimation(variant));
    } else {
      setCurrentAnimation(initialAnimation);
    }
  }, [enabled, variant, initialAnimation, contextAware, overrideAnimation]);

  // Update animation when override changes
  useEffect(() => {
    if (overrideAnimation) {
      setCurrentAnimation(overrideAnimation);
    }
  }, [overrideAnimation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (excitementTimeoutRef.current) {
        clearTimeout(excitementTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentAnimation,
    isHovered,
    isExcited,
    handleMouseEnter,
    handleMouseLeave,
  };
};

/**
 * Hook for managing loading state with emotional progression
 */
export const useEmotionalLoadingState = (isLoading: boolean) => {
  const [loadingAnimation, setLoadingAnimation] = useState<ButtonAnimation>('pulse');
  const loadingTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isLoading) {
      loadingTimeRef.current = Date.now();
      setLoadingAnimation('pulse');

      // After 3 seconds, show we're still working (breathe is calmer)
      const timeout1 = setTimeout(() => {
        setLoadingAnimation('breathe');
      }, 3000);

      // After 8 seconds, show it's taking longer (shimmer adds movement)
      const timeout2 = setTimeout(() => {
        setLoadingAnimation('shimmer');
      }, 8000);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    } else {
      loadingTimeRef.current = 0;
      setLoadingAnimation('pulse');
    }
  }, [isLoading]);

  return loadingAnimation;
};
