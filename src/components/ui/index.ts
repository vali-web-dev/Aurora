/**
 * Aurora UI Components - Button System
 * Comprehensive exports for all button-related components and hooks
 */

// Base Button Component
export { Button, ButtonGroup } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonAnimation, ButtonSound, ButtonPermission } from './Button';

// Specialized Button Components
export { IconButton, ToggleButton, DropdownButton } from './SpecializedButtons';
export type { IconButtonProps, ToggleButtonProps, DropdownButtonProps, DropdownButtonItem } from './SpecializedButtons';

// Advanced Button Components
export { SplitButton } from './SplitButton';
export type { SplitButtonProps, SplitButtonAction } from './SplitButton';

export { FloatingActionButton } from './FloatingActionButton';
export type { FloatingActionButtonProps } from './FloatingActionButton';

// Button Hooks
export {
  useButtonAnalytics,
  useButtonSound,
  useButtonState,
  useKeyboardShortcut,
  useHaptic,
} from './useButtonHooks';

export type {
  UseButtonAnalyticsOptions,
  UseButtonSoundOptions,
  UseButtonStateOptions,
  UseKeyboardShortcutOptions,
  UseHapticOptions,
} from './useButtonHooks';

// Emotional Intelligence Hooks
export {
  useEmotionalState,
  useEmotionalLoadingState,
} from './useEmotionalState';

export type {
  EmotionalStateConfig,
} from './useEmotionalState';
