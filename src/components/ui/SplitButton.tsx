/**
 * Aurora Split Button Component
 * A button with a primary action and a dropdown menu for additional actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

export interface SplitButtonAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
  shortcut?: string;
}

export interface SplitButtonProps extends Omit<ButtonProps, 'iconAfter' | 'children'> {
  /**
   * Primary button label
   */
  label: string;

  /**
   * Primary button action
   */
  onClick: () => void;

  /**
   * Additional actions in dropdown
   */
  actions: SplitButtonAction[];

  /**
   * Dropdown placement
   * @default 'bottom-end'
   */
  dropdownPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  label,
  onClick,
  actions,
  variant = 'primary',
  size = 'md',
  disabled = false,
  dropdownPlacement = 'bottom-end',
  ...buttonProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close dropdown on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useBodyScrollLock(isOpen);

  return (
    <div className="aurora-split-btn-container" style={{ position: 'relative', display: 'inline-flex' }} ref={dropdownRef}>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Primary Action Button */}
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onClick}
        className="aurora-split-btn-primary"
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderRight: 'none',
        }}
        {...buttonProps}
      >
        {label}
      </Button>

      {/* Dropdown Toggle Button */}
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        iconOnly
        className="aurora-split-btn-toggle"
        style={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          minWidth: size === 'sm' ? '32px' : size === 'lg' ? '48px' : size === 'xl' ? '56px' : '40px',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        aria-label="More actions"
        aria-expanded={isOpen}
      >
        ▼
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="aurora-split-btn-dropdown"
          style={{
            position: 'absolute',
            ...getDropdownPosition(dropdownPlacement),
            minWidth: '200px',
            background: 'rgb(15, 23, 42)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            padding: '4px',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                if (!action.disabled) {
                  action.onClick();
                  setIsOpen(false);
                }
              }}
              disabled={action.disabled}
              className={cn(
                'aurora-split-btn-action',
                action.variant && `aurora-split-btn-action-${action.variant}`
              )}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: 500,
                color: action.disabled ? '#64748b' : '#f1f5f9',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: action.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                opacity: action.disabled ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!action.disabled) {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {action.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{action.icon}</span>}
              <span style={{ flex: 1 }}>{action.label}</span>
              {action.shortcut && (
                <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {action.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function getDropdownPosition(placement: SplitButtonProps['dropdownPlacement']) {
  switch (placement) {
    case 'bottom-start':
      return { top: 'calc(100% + 4px)', left: 0 };
    case 'bottom-end':
      return { top: 'calc(100% + 4px)', right: 0 };
    case 'top-start':
      return { bottom: 'calc(100% + 4px)', left: 0 };
    case 'top-end':
      return { bottom: 'calc(100% + 4px)', right: 0 };
    default:
      return { top: 'calc(100% + 4px)', right: 0 };
  }
}

SplitButton.displayName = 'SplitButton';

export default SplitButton;
