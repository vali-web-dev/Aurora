'use client';

import clsx from 'clsx';
import type { RingLink } from './types';

interface ChainArcPanelProps {
  link: RingLink;
  active?: boolean;
  onClick?: () => void;
}

export function ChainArcPanel({ link, active = false, onClick }: ChainArcPanelProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx('chain-panel', active && 'is-active', link.isCritical && 'is-critical')}
      aria-label={`Navigate to ${link.label}`}
      title={`${link.label} · ${link.route}`}
    >
      <span className="coupler left" aria-hidden="true" />
      <span className="panel-body">
        <span className="icon-text">{link.iconText}</span>
      </span>
      <span className="coupler right" aria-hidden="true" />

      <style jsx>{`
        .chain-panel {
          border: none;
          background: transparent;
          display: inline-flex;
          align-items: center;
          gap: 0;
          padding: 0;
          cursor: pointer;
          outline: none;
        }

        .coupler {
          width: 10px;
          height: 10px;
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm);
        }

        .panel-body {
          min-width: 44px;
          height: 32px;
          padding: 0 10px;
          margin: 0 -1px;
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          color: var(--btn-text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-shadow: var(--btn-text-shadow-subtle);
          transition: all var(--btn-transition-fast) var(--btn-transition-ease);
        }

        .icon-text {
          font-size: var(--btn-font-size-sm);
          font-weight: var(--btn-font-weight-bold);
          letter-spacing: var(--btn-letter-spacing);
          line-height: 1;
        }

        .chain-panel:hover .panel-body,
        .chain-panel:focus-visible .panel-body,
        .chain-panel.is-active .panel-body {
          border-color: var(--btn-border-primary);
          background: var(--btn-gradient-primary);
          color: var(--btn-text-primary);
          box-shadow: var(--btn-shadow-md), 0 0 12px var(--btn-glow-primary), var(--btn-inset-shadow-glossy);
          transform: scale(var(--btn-hover-scale));
        }

        .chain-panel.is-critical .panel-body {
          border-color: var(--btn-border-danger);
          box-shadow: var(--btn-shadow-md), 0 0 10px var(--btn-glow-danger), var(--btn-inset-shadow-glossy);
        }
      `}</style>
    </button>
  );
}
