/**
 * Aurora Floating Action Button (FAB)
 * A prominent button for primary actions, typically positioned at bottom-right
 */

import React from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '@/lib/utils';

export interface FloatingActionButtonProps extends Omit<ButtonProps, 'size' | 'variant' | 'iconOnly'> {
  /**
   * Icon to display in FAB
   */
  icon: React.ReactNode;

  /**
   * Label to show on hover/expand
   */
  label?: string;

  /**
   * Position of FAB
   * @default 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

  /**
   * Size of FAB
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Color variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

  /**
   * Whether FAB should expand to show label
   * @default false
   */
  expanded?: boolean;

  /**
   * Distance from edge (in px)
   * @default 24
   */
  offset?: number;

  /**
   * Z-index for stacking
   * @default 1000
   */
  zIndex?: number;

  /**
   * Mini variant (smaller size)
   * @default false
   */
  mini?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  expanded = false,
  offset = 24,
  zIndex = 1000,
  mini = false,
  className,
  ...props
}) => {
  const fabSize = mini ? 48 : size === 'sm' ? 56 : size === 'lg' ? 72 : 64;

  const positionStyles = React.useMemo(() => {
    const styles: React.CSSProperties = {
      position: 'fixed',
      zIndex,
    };

    switch (position) {
      case 'bottom-right':
        styles.bottom = offset;
        styles.right = offset;
        break;
      case 'bottom-left':
        styles.bottom = offset;
        styles.left = offset;
        break;
      case 'top-right':
        styles.top = offset;
        styles.right = offset;
        break;
      case 'top-left':
        styles.top = offset;
        styles.left = offset;
        break;
    }

    return styles;
  }, [position, offset, zIndex]);

  return (
    <div
      className={cn('aurora-fab-container', className)}
      style={positionStyles}
    >
      <Button
        variant={variant}
        animation="float"
        className={cn(
          'aurora-fab',
          expanded && 'aurora-fab-expanded'
        )}
        style={{
          width: expanded && label ? 'auto' : fabSize,
          height: fabSize,
          borderRadius: expanded && label ? fabSize / 2 : '50%',
          padding: expanded && label ? '0 24px' : '0',
          fontSize: size === 'sm' ? '20px' : size === 'lg' ? '28px' : '24px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        {...props}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon}
          {expanded && label && (
            <span
              className="aurora-fab-label"
              style={{
                whiteSpace: 'nowrap',
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
              {label}
            </span>
          )}
        </span>
      </Button>
    </div>
  );
};

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;
