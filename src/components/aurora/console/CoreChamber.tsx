'use client';

import type { Destination } from './types';

interface CoreChamberProps {
  destination?: Destination;
  masterIconSrc?: string;
}

const DEFAULT_MASTER_ICON = '/docs/brand/logo-drafts/routes-v1/aurora-route-b-core-master.svg';

export function CoreChamber({ destination, masterIconSrc = DEFAULT_MASTER_ICON }: CoreChamberProps) {
  return (
    <div className="console-core-chamber" aria-label="Aurora console core chamber">
      <div className="core-icon-shell">
        <img src={masterIconSrc} alt="Aurora master logo" className="core-master-icon" />
      </div>
      <div className="core-meta">
        <div className="core-label">{destination?.label ?? 'Aurora Hub'}</div>
        <div className="core-route">{destination?.route ?? '/dashboard'}</div>
      </div>

      <style jsx>{`
        .console-core-chamber {
          width: 212px;
          height: 212px;
          border-radius: calc(var(--btn-radius-xl) + 8px);
          border: var(--btn-border-width-thick) var(--btn-border-style) var(--btn-border-primary);
          background: var(--btn-gradient-glass-glossy), var(--btn-gradient-secondary);
          box-shadow: var(--btn-shadow-layered-md), var(--btn-inset-shadow-glossy);
          display: grid;
          grid-template-rows: 1fr auto;
          align-items: center;
          justify-items: center;
          padding: 14px;
        }

        .core-icon-shell {
          width: 132px;
          height: 132px;
          border-radius: var(--btn-radius-lg);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .core-master-icon {
          width: 102px;
          height: 102px;
          object-fit: contain;
          filter: drop-shadow(0 0 10px var(--btn-glow-primary));
        }

        .core-meta {
          width: 100%;
          display: grid;
          gap: 2px;
          text-align: center;
        }

        .core-label {
          color: var(--btn-text-primary-enhanced);
          font-size: var(--btn-font-size-md);
          font-weight: var(--btn-font-weight-bold);
          text-shadow: var(--btn-text-shadow-primary);
        }

        .core-route {
          color: var(--btn-text-secondary-muted);
          font-size: var(--btn-font-size-sm);
          text-shadow: var(--btn-text-shadow-subtle);
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
