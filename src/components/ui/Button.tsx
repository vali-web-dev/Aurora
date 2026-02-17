/**
 * Aurora Button Component
 * Water Droplet Design System
 * 
 * A comprehensive button component with water droplet aesthetics:
 * - Transparency, smoothness, shininess, flow, reflection, curvature
 * - Multiple variants: primary, secondary, success, warning, danger, notice, ghost
 * - Multiple states: default, hover, active, disabled, blocked, loading
 * - Multiple sizes: sm, md, lg, xl
 * - Animation effects: pulse, breathe, excited, nervous, shimmer, glow, float, liquid
 * - Theme support: light, dark, gray, illuminated
 */

'use client';

import React, { forwardRef, ButtonHTMLAttributes, ReactNode, useState, useCallback, useEffect, useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { useEmotionalState, useEmotionalLoadingState } from './useEmotionalState';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'notice'
  | 'ghost'
  | 'cancel'
  | 'exit'
  | 'universe-entertainment'
  | 'universe-commerce'
  | 'universe-social'
  | 'universe-learning'
  | 'universe-create'
  | 'universe-gaming';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export type ButtonAnimation =
  | 'pulse'
  | 'breathe'
  | 'excited'
  | 'nervous'
  | 'shimmer'
  | 'glow'
  | 'float'
  | 'liquid'
  | 'none';

export type ButtonSound = 'click' | 'success' | 'error' | 'none';

export type ButtonPermission = string | string[] | ((context?: any) => boolean);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the button is in blocked state (shows lock icon)
   * @default false
   */
  blocked?: boolean;

  /**
   * Whether the button is in loading state (shows spinner)
   * @default false
   */
  loading?: boolean;

  /**
   * Animation effect to apply
   * @default 'none'
   */
  animation?: ButtonAnimation;

  /**
   * Whether the button should take full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether this is an icon-only button (square aspect ratio)
   * @default false
   */
  iconOnly?: boolean;

  /**
   * Icon to display before the content
   */
  iconBefore?: ReactNode;

  /**
   * Icon to display after the content
   */
  iconAfter?: ReactNode;

  /**
   * Custom className to apply
   */
  className?: string;

  /**
   * Button content
   */
  children?: ReactNode;

  /**
   * Tooltip text to display on hover
   */
  tooltip?: string;

  /**
   * Tooltip position
   * @default 'top'
   */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Keyboard shortcut (e.g., 'Ctrl+S', 'Enter', 'Escape')
   */
  shortcut?: string;

  /**
   * Whether to show the keyboard shortcut in tooltip
   * @default true
   */
  showShortcut?: boolean;

  /**
   * Enable ripple effect on click
   * @default true
   */
  ripple?: boolean;

  /**
   * Loading progress (0-100) for progress indicator
   */
  loadingProgress?: number;

  /**
   * Use layered shadows for enhanced depth
   * @default false
   */
  layered?: boolean;

  /**
   * Apply mesh gradient effect (organic multi-point gradients)
   * @default false
   */
  mesh?: boolean;

  /**
   * Enable magnetic hover effect (stronger scale on hover)
   * @default false
   */
  magnetic?: boolean;

  /**
   * Enable emotional intelligence (dynamic animation transitions)
   * @default false
   */
  emotional?: boolean;

  /**
   * Time in ms before transitioning from excited to calm on hover
   * @default 5000
   */
  emotionalExcitementDuration?: number;

  /**
   * Calm animation after excitement fades
   * @default 'breathe'
   */
  emotionalCalmAnimation?: ButtonAnimation;

  /**
   * Automatically apply context-aware animations (danger=nervous, success=glow, etc.)
   * @default true
   */
  emotionalContextAware?: boolean;

  /**
   * Sound to play on click
   * @default 'none'
   */
  sound?: ButtonSound;

  /**
   * Enable haptic feedback on mobile devices
   * @default false
   */
  haptic?: boolean;

  /**
   * Permission required to enable this button
   */
  permission?: ButtonPermission;

  /**
   * Permission context for evaluation
   */
  permissionContext?: any;

  /**
   * Analytics event name to track
   */
  analyticsEvent?: string;

  /**
   * Analytics event properties
   */
  analyticsProps?: Record<string, any>;

  /**
   * Custom aria-label for accessibility
   */
  'aria-label'?: string;

  /**
   * Whether button represents a selected state
   */
  selected?: boolean;

  /**
   * Badge content to display on button
   */
  badge?: string | number;

  /**
   * Badge variant
   * @default 'default'
   */
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

/**
 * Aurora Button Component
 * 
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary">Click me</Button>
 * 
 * // Secondary with icon
 * <Button variant="secondary" iconBefore={<Icon />}>
 *   Save
 * </Button>
 * 
 * // Loading state
 * <Button loading disabled>Saving...</Button>
 * 
 * // Animated button
 * <Button animation="shimmer" variant="primary">
 *   Hover me
 * </Button>
 * 
 * // Disabled button
 * <Button disabled>Cannot click</Button>
 * 
 * // Blocked button
 * <Button blocked>Locked</Button>
 * ```
 */
// Utility functions
const checkPermission = (permission?: ButtonPermission, context?: any): boolean => {
  if (!permission) return true;
  if (typeof permission === 'function') return permission(context);
  if (Array.isArray(permission)) {
    // Check if user has at least one of the permissions
    return permission.some(perm => {
      // This would integrate with your auth/permission system
      return true; // Placeholder
    });
  }
  // Single permission string
  return true; // Placeholder
};

const playButtonSound = (sound: ButtonSound) => {
  if (sound === 'none' || typeof Audio === 'undefined') return;
  
  // Placeholder for sound system integration
  // const audio = new Audio(`/sounds/${sound}.mp3`);
  // audio.volume = 0.3;
  // audio.play().catch(() => {});
};

const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10); // 10ms vibration
  }
};

const trackAnalytics = (event?: string, props?: Record<string, any>) => {
  if (!event) return;
  
  // Placeholder for analytics integration
  // analytics.track(event, props);
  console.log('[Analytics]', event, props);
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      blocked = false,
      loading = false,
      animation = 'none',
      fullWidth = false,
      iconOnly = false,
      iconBefore,
      iconAfter,
      className,
      children,
      type = 'button',
      tooltip,
      tooltipPosition = 'top',
      shortcut,
      showShortcut = true,
      ripple = true,
      loadingProgress,
      layered = false,
      mesh = false,
      magnetic = false,
      emotional = false,
      emotionalExcitementDuration = 5000,
      emotionalCalmAnimation = 'breathe',
      emotionalContextAware = true,
      sound = 'none',
      haptic = false,
      permission,
      permissionContext,
      analyticsEvent,
      analyticsProps,
      selected = false,
      badge,
      badgeVariant = 'default',
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleIdRef = useRef(0);

    // Emotional intelligence state management
    const emotionalState = useEmotionalState(variant, animation, {
      enabled: emotional,
      excitementDuration: emotionalExcitementDuration,
      calmAnimation: emotionalCalmAnimation,
      contextAware: emotionalContextAware,
    });

    // Use emotional animation if enabled, otherwise use prop animation
    const activeAnimation = emotional ? emotionalState.currentAnimation : animation;

    // Loading state emotional progression
    const loadingEmotionalAnimation = useEmotionalLoadingState(loading);

    // Check permissions
    const hasPermission = checkPermission(permission, permissionContext);
    const isDisabled = disabled || blocked || loading || !hasPermission;

    // Keyboard shortcut handler
    useEffect(() => {
      if (!shortcut || isDisabled) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        const keys = shortcut.split('+').map(k => k.trim().toLowerCase());
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
          e.preventDefault();
          buttonRef.current?.click();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcut, isDisabled]);

    // Ripple effect handler
    const handleRipple = useCallback((e: MouseEvent<HTMLButtonElement>) => {
      if (!ripple || isDisabled) return;

      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleIdRef.current++;

      setRipples(prev => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 800);
    }, [ripple, isDisabled]);

    // Click handler with enhancements
    const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }

      handleRipple(e);

      if (sound !== 'none') {
        playButtonSound(sound);
      }

      if (haptic) {
        triggerHaptic();
      }

      if (analyticsEvent) {
        trackAnalytics(analyticsEvent, {
          variant,
          size,
          ...analyticsProps,
        });
      }

      onClick?.(e);
    }, [isDisabled, sound, haptic, analyticsEvent, variant, size, analyticsProps, onClick, handleRipple]);

    const buttonClasses = cn(
      // Base button class
      'aurora-btn',
      'aurora-text',

      // Variant classes
      {
        'aurora-btn-primary': variant === 'primary',
        'aurora-btn-secondary': variant === 'secondary',
        'aurora-btn-danger': variant === 'danger',
        'aurora-btn-ghost': variant === 'ghost',
        'aurora-btn-success': variant === 'success',
        'aurora-btn-warning': variant === 'warning',
        'aurora-btn-notice': variant === 'notice',
        'aurora-btn-cancel': variant === 'cancel',
        'aurora-btn-exit': variant === 'exit',
        'aurora-btn-universe-entertainment': variant === 'universe-entertainment',
        'aurora-btn-universe-commerce': variant === 'universe-commerce',
        'aurora-btn-universe-social': variant === 'universe-social',
        'aurora-btn-universe-learning': variant === 'universe-learning',
        'aurora-btn-universe-create': variant === 'universe-create',
        'aurora-btn-universe-gaming': variant === 'universe-gaming',
      },

      // Size classes
      {
        'aurora-btn-sm': size === 'sm',
        'aurora-btn-lg': size === 'lg',
        'aurora-btn-xl': size === 'xl',
      },

      // State classes
      {
        'aurora-btn-disabled': disabled && !blocked,
        'aurora-btn-blocked': blocked,
        'aurora-btn-loading': loading,
      },

      // Animation classes (uses emotional state if enabled)
      {
        'aurora-btn-pulse': (loading ? loadingEmotionalAnimation : activeAnimation) === 'pulse',
        'aurora-btn-breathe': (loading ? loadingEmotionalAnimation : activeAnimation) === 'breathe',
        'aurora-btn-excited': (loading ? loadingEmotionalAnimation : activeAnimation) === 'excited',
        'aurora-btn-nervous': (loading ? loadingEmotionalAnimation : activeAnimation) === 'nervous',
        'aurora-btn-shimmer': (loading ? loadingEmotionalAnimation : activeAnimation) === 'shimmer',
        'aurora-btn-glow': (loading ? loadingEmotionalAnimation : activeAnimation) === 'glow',
        'aurora-btn-float': (loading ? loadingEmotionalAnimation : activeAnimation) === 'float',
        'aurora-btn-liquid': (loading ? loadingEmotionalAnimation : activeAnimation) === 'liquid',
      },

      // Modifier classes
      {
        'aurora-btn-layered': layered,
        'aurora-btn-mesh': mesh,
        'aurora-btn-magnetic': magnetic,
      },

      // Layout classes
      {
        'aurora-btn-full': fullWidth,
        'aurora-btn-icon': iconOnly,
      },

      // Selection state
      {
        'aurora-btn-selected': selected,
      },

      // Permission state
      {
        'aurora-btn-no-permission': !hasPermission,
      },

      // Custom className
      className
    );

    const tooltipText = tooltip
      ? shortcut && showShortcut
        ? `${tooltip} (${shortcut})`
        : tooltip
      : shortcut && showShortcut
      ? shortcut
      : undefined;

    return (
      <div className="aurora-btn-wrapper" style={{ position: 'relative', display: fullWidth ? 'block' : 'inline-block', width: fullWidth ? '100%' : 'auto' }}>
        <button
          ref={(node) => {
            (buttonRef as any).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          type={type}
          disabled={isDisabled}
          className={buttonClasses}
          onClick={handleClick}
          onMouseEnter={(e) => {
            setShowTooltip(true);
            if (emotional) {
              emotionalState.handleMouseEnter();
            }
            props.onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            setShowTooltip(false);
            if (emotional) {
              emotionalState.handleMouseLeave();
            }
            props.onMouseLeave?.(e);
          }}
          aria-label={props['aria-label'] || (typeof children === 'string' ? children : undefined)}
          aria-disabled={isDisabled}
          {...props}
        >
          {iconBefore && <span className="aurora-btn-icon-before">{iconBefore}</span>}
          {!iconOnly && children}
          {iconAfter && <span className="aurora-btn-icon-after">{iconAfter}</span>}
          
          {/* Loading Progress Bar */}
          {loading && loadingProgress !== undefined && (
            <div 
              className="aurora-btn-progress-bar"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                width: `${Math.min(100, Math.max(0, loadingProgress))}%`,
                background: 'currentColor',
                opacity: 0.6,
                transition: 'width 0.3s ease',
              }}
            />
          )}

          {/* Badge */}
          {badge !== undefined && (
            <span 
              className={cn(
                'aurora-btn-badge',
                `aurora-btn-badge-${badgeVariant}`
              )}
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              {badge}
            </span>
          )}

          {/* Ripple Effects */}
          {ripples.map(({ x, y, id }) => (
            <span
              key={id}
              className="aurora-btn-ripple"
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: '0px',
                height: '0px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.6)',
                transform: 'translate(-50%, -50%)',
                animation: 'btn-ripple 0.8s ease-out',
                pointerEvents: 'none',
              }}
            />
          ))}
        </button>

        {/* Tooltip */}
        {tooltipText && showTooltip && !isDisabled && (
          <div
            className={cn(
              'aurora-btn-tooltip',
              `aurora-btn-tooltip-${tooltipPosition}`
            )}
            style={{
              position: 'absolute',
              zIndex: 9999,
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#f1f5f9',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              ...(tooltipPosition === 'top' && {
                bottom: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
              }),
              ...(tooltipPosition === 'bottom' && {
                top: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
              }),
              ...(tooltipPosition === 'left' && {
                right: 'calc(100% + 8px)',
                top: '50%',
                transform: 'translateY(-50%)',
              }),
              ...(tooltipPosition === 'right' && {
                left: 'calc(100% + 8px)',
                top: '50%',
                transform: 'translateY(-50%)',
              }),
            }}
          >
            {tooltipText}
            {/* Tooltip Arrow */}
            <div
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                transform: 'rotate(45deg)',
                ...(tooltipPosition === 'top' && {
                  bottom: '-4px',
                  left: '50%',
                  marginLeft: '-4px',
                  borderTop: 'none',
                  borderLeft: 'none',
                }),
                ...(tooltipPosition === 'bottom' && {
                  top: '-4px',
                  left: '50%',
                  marginLeft: '-4px',
                  borderBottom: 'none',
                  borderRight: 'none',
                }),
                ...(tooltipPosition === 'left' && {
                  right: '-4px',
                  top: '50%',
                  marginTop: '-4px',
                  borderTop: 'none',
                  borderRight: 'none',
                }),
                ...(tooltipPosition === 'right' && {
                  left: '-4px',
                  top: '50%',
                  marginTop: '-4px',
                  borderBottom: 'none',
                  borderLeft: 'none',
                }),
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

Button.displayName = 'Button';

/**
 * Button Group Component
 * Groups multiple buttons together with connected borders
 * 
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="secondary">Left</Button>
 *   <Button variant="secondary">Middle</Button>
 *   <Button variant="secondary">Right</Button>
 * </ButtonGroup>
 * ```
 */
export interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className }) => {
  return (
    <div className={cn('aurora-btn-group', className)}>
      {children}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';

export default Button;
