/**
 * Aurora Specialized Button Components
 * IconButton, ToggleButton, and DropdownButton
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '@/lib/utils';

// ========================================
// ICON BUTTON
// ========================================

export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children'> {
  /**
   * Icon to display
   */
  icon: React.ReactNode;

  /**
   * Accessible label (required for screen readers)
   */
  'aria-label': string;

  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  ...props
}) => {
  return (
    <Button
      iconOnly
      size={size}
      {...props}
    >
      {icon}
    </Button>
  );
};

IconButton.displayName = 'IconButton';

// ========================================
// TOGGLE BUTTON
// ========================================

export interface ToggleButtonProps extends Omit<ButtonProps, 'selected'> {
  /**
   * Whether button is in selected/pressed state
   */
  selected: boolean;

  /**
   * Callback when selection changes
   */
  onSelectedChange?: (selected: boolean) => void;

  /**
   * Icon to show when selected
   */
  selectedIcon?: React.ReactNode;

  /**
   * Icon to show when not selected
   */
  unselectedIcon?: React.ReactNode;

  /**
   * Label for selected state
   */
  selectedLabel?: string;

  /**
   * Label for unselected state
   */
  unselectedLabel?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  selected,
  onSelectedChange,
  selectedIcon,
  unselectedIcon,
  selectedLabel,
  unselectedLabel,
  children,
  onClick,
  variant = 'secondary',
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectedChange?.(!selected);
    onClick?.(e);
  };

  const icon = selected ? selectedIcon : unselectedIcon;
  const label = selected ? selectedLabel : unselectedLabel;
  const displayContent = label || children;

  return (
    <Button
      variant={selected ? 'primary' : variant}
      selected={selected}
      onClick={handleClick}
      iconBefore={icon}
      aria-pressed={selected}
      {...props}
    >
      {displayContent}
    </Button>
  );
};

ToggleButton.displayName = 'ToggleButton';

// ========================================
// DROPDOWN BUTTON
// ========================================

export interface DropdownButtonItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
  shortcut?: string;
  divider?: boolean; // Shows a divider after this item
}

export interface DropdownButtonProps extends Omit<ButtonProps, 'children' | 'onClick' | 'onSelect'> {
  /**
   * Button label
   */
  label: string;

  /**
   * Dropdown items
   */
  items: DropdownButtonItem[];

  /**
   * Callback when item is selected
   */
  onSelect: (value: string) => void;

  /**
   * Currently selected value
   */
  value?: string;

  /**
   * Dropdown placement
   * @default 'bottom-start'
   */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

  /**
   * Show checkmark for selected item
   * @default true
   */
  showCheckmark?: boolean;

  /**
   * Maximum height of dropdown (scrollable)
   * @default 320
   */
  maxHeight?: number;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  label,
  items,
  onSelect,
  value,
  placement = 'bottom-start',
  showCheckmark = true,
  maxHeight = 320,
  variant = 'secondary',
  size = 'md',
  disabled = false,
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

  const handleItemClick = (item: DropdownButtonItem) => {
    if (!item.disabled) {
      onSelect(item.value);
      setIsOpen(false);
    }
  };

  return (
    <div className="aurora-dropdown-btn-container" style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        iconAfter={<span style={{ fontSize: '0.8em' }}>▼</span>}
        aria-expanded={isOpen}
        aria-haspopup="true"
        {...buttonProps}
      >
        {label}
      </Button>

      {isOpen && (
        <div
          className="aurora-dropdown-btn-menu"
          style={{
            position: 'absolute',
            ...getDropdownPosition(placement),
            minWidth: '200px',
            maxHeight: `${maxHeight}px`,
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            padding: '4px',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {items.map((item, index) => (
            <React.Fragment key={item.value}>
              <button
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={cn(
                  'aurora-dropdown-item',
                  item.variant && `aurora-dropdown-item-${item.variant}`,
                  item.value === value && 'aurora-dropdown-item-selected'
                )}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: item.disabled ? '#64748b' : '#f1f5f9',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  opacity: item.disabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.background = 'rgba(148, 163, 184, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {showCheckmark && (
                  <span style={{ width: '16px', display: 'flex', alignItems: 'center' }}>
                    {item.value === value && '✓'}
                  </span>
                )}
                {item.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.shortcut && (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {item.shortcut}
                  </span>
                )}
              </button>
              {item.divider && (
                <div
                  style={{
                    height: '1px',
                    background: 'rgba(148, 163, 184, 0.2)',
                    margin: '4px 8px',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

function getDropdownPosition(placement: DropdownButtonProps['placement']) {
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
      return { top: 'calc(100% + 4px)', left: 0 };
  }
}

DropdownButton.displayName = 'DropdownButton';

const specializedButtons = { IconButton, ToggleButton, DropdownButton };

export default specializedButtons;
