'use client';

import clsx from 'clsx';
import type { Destination } from './types';

interface SlotNodeProps {
  destination: Destination;
  selected: boolean;
  focused: boolean;
  onFocus: () => void;
  onSelect: () => void;
}

export function SlotNode({ destination, selected, focused, onFocus, onSelect }: SlotNodeProps) {
  return (
    <button
      type="button"
      className={clsx('console-slot-node', selected && 'is-selected', focused && 'is-focused')}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={onSelect}
      aria-label={`Navigate to ${destination.label}`}
      title={`${destination.label} (${destination.route})`}
    >
      <span className="slot-code">{destination.shortCode}</span>
      {destination.badgeCount > 0 && <span className="slot-badge">{destination.badgeCount}</span>}
      <style jsx>{`
        .console-slot-node {
          height: 42px;
          min-width: 42px;
          padding: 0 10px;
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          color: var(--btn-text-secondary);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          text-shadow: var(--btn-text-shadow-subtle);
          transition: all var(--btn-transition-fast) var(--btn-transition-ease);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          position: relative;
          letter-spacing: var(--btn-letter-spacing);
          font-size: var(--btn-font-size-sm);
          font-weight: var(--btn-font-weight-bold);
        }

        .console-slot-node:hover,
        .console-slot-node.is-focused {
          border-color: var(--btn-border-primary);
          transform: translateY(-1px) scale(var(--btn-hover-scale));
          box-shadow: var(--btn-shadow-md), 0 0 0 1px var(--btn-border-primary) inset;
        }

        .console-slot-node.is-selected {
          background: var(--btn-gradient-primary);
          color: var(--btn-text-primary);
          border-color: var(--btn-border-primary);
          box-shadow: var(--btn-shadow-md), 0 0 14px var(--btn-glow-primary), var(--btn-inset-shadow-glossy);
        }

        .slot-code {
          line-height: 1;
        }

        .slot-badge {
          min-width: 16px;
          height: 16px;
          border-radius: var(--btn-radius-full);
          background: var(--btn-gradient-danger);
          color: var(--btn-text-primary);
          font-size: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--btn-shadow-sm);
          padding: 0 4px;
        }
      `}</style>
    </button>
  );
}
