'use client';

import { useMemo, useState } from 'react';
import { AuroraModal } from '@/components/aurora/Modal';
import { Button, ButtonGroup } from '@/components/ui/Button';
import type { RingLink } from './types';

type SegmentState = 'idle' | 'focus' | 'active' | 'critical';

interface SingleChainSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: RingLink;
  onNavigate?: (route: string) => void;
}

export function SingleChainSegmentModal({ isOpen, onClose, link, onNavigate }: SingleChainSegmentModalProps) {
  const [state, setState] = useState<SegmentState>(link.isCritical ? 'critical' : 'idle');
  const [expanded, setExpanded] = useState(false);

  const computedState = useMemo<SegmentState>(() => {
    if (state === 'critical') return 'critical';
    if (state === 'active') return 'active';
    if (state === 'focus') return 'focus';
    return 'idle';
  }, [state]);

  return (
    <AuroraModal
      isOpen={isOpen}
      onClose={onClose}
      title="Single Chain Segment Craft"
      description="Mechanical arc-panel module for ring-engine assembly."
      size="lg"
      footerContent={<span>Segment state: {computedState} • Expanded: {expanded ? 'yes' : 'no'}</span>}
    >
      <div className="segment-shell" data-state={computedState} data-expanded={expanded}>
        <div className="segment-controls">
          <ButtonGroup>
            <Button size="sm" variant={computedState === 'idle' ? 'primary' : 'secondary'} onClick={() => setState('idle')}>
              Idle
            </Button>
            <Button size="sm" variant={computedState === 'focus' ? 'primary' : 'secondary'} onClick={() => setState('focus')}>
              Focus
            </Button>
            <Button size="sm" variant={computedState === 'active' ? 'primary' : 'secondary'} onClick={() => setState('active')}>
              Active
            </Button>
            <Button size="sm" variant={computedState === 'critical' ? 'danger' : 'secondary'} onClick={() => setState('critical')}>
              Critical
            </Button>
          </ButtonGroup>

          <Button size="sm" variant={expanded ? 'primary' : 'secondary'} onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>

        <div className="segment-stage">
          <div className="segment-module" role="group" aria-label="Single chain segment module">
            <div className="coupler left" aria-label="Left coupler" />

            <div className="segment-body" aria-label="Link body">
              <div className="latch top" aria-hidden="true" />
              <div className="latch bottom" aria-hidden="true" />

              <div className="icon-chamber" aria-label="Icon chamber">
                <span className="icon-text">{link.iconText}</span>
              </div>

              <div className="segment-meta">
                <span className="segment-label">{link.label}</span>
                <span className="segment-route">{link.route}</span>
              </div>
            </div>

            <div className="coupler right" aria-label="Right coupler" />
          </div>
        </div>

        <div className="segment-actions">
          <Button variant="primary" animation="shimmer" onClick={() => onNavigate?.(link.route)}>
            Navigate to {link.label}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <style jsx>{`
        .segment-shell {
          display: grid;
          gap: 14px;
          border-radius: calc(var(--btn-radius-xl) + 6px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-secondary);
          box-shadow: var(--btn-shadow-layered-md), var(--btn-inset-shadow-glossy);
          padding: 16px;
        }

        .segment-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .segment-stage {
          min-height: clamp(14rem, 38vh, 20rem);
          border-radius: calc(var(--btn-radius-xl) + 4px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: linear-gradient(180deg, transparent, var(--btn-glass-opacity));
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .segment-module {
          display: inline-flex;
          align-items: center;
          gap: 0;
          transition: transform var(--btn-transition-normal) var(--btn-transition-ease);
          --segment-body-width: clamp(14rem, 56vw, 22rem);
          --segment-body-height: clamp(3.1rem, 8vw, 5.6rem);
          --segment-coupler-size: clamp(1rem, 2.8vw, 1.6rem);
        }

        .coupler {
          width: var(--segment-coupler-size);
          height: var(--segment-coupler-size);
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          transform: scale(0.95);
          transition: all var(--btn-transition-fast) var(--btn-transition-ease);
        }

        .coupler.left {
          margin-right: -4px;
        }

        .coupler.right {
          margin-left: -4px;
        }

        .segment-body {
          width: var(--segment-body-width);
          min-height: var(--segment-body-height);
          border-radius: calc(var(--btn-radius-full) + 6px);
          border: var(--btn-border-width-thick) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass-glossy), var(--btn-gradient-secondary);
          box-shadow: var(--btn-shadow-md), var(--btn-inset-shadow-glossy);
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: clamp(0.45rem, 1.6vw, 0.8rem);
          padding: clamp(0.45rem, 1.4vw, 0.7rem) clamp(0.7rem, 2vw, 0.95rem);
          position: relative;
          transition: all var(--btn-transition-normal) var(--btn-transition-ease);
        }

        .latch {
          position: absolute;
          left: 50%;
          width: clamp(1.8rem, 6vw, 2.6rem);
          height: clamp(0.16rem, 0.7vw, 0.25rem);
          transform: translateX(-50%);
          border-radius: var(--btn-radius-full);
          background: var(--btn-gradient-glass);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          opacity: 0.62;
        }

        .latch.top {
          top: -3px;
        }

        .latch.bottom {
          bottom: -3px;
        }

        .icon-chamber {
          width: calc(var(--segment-body-height) * 0.64);
          height: calc(var(--segment-body-height) * 0.64);
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          display: grid;
          place-items: center;
        }

        .icon-text {
          font-size: clamp(0.86rem, 2.6vw, 1.15rem);
          font-weight: var(--btn-font-weight-bold);
          color: var(--btn-text-primary-enhanced);
          text-shadow: var(--btn-text-shadow-primary);
          line-height: 1;
        }

        .segment-meta {
          display: grid;
          gap: 4px;
        }

        .segment-label {
          color: var(--btn-text-primary-enhanced);
          font-size: var(--btn-font-size-lg);
          font-weight: var(--btn-font-weight-bold);
          text-shadow: var(--btn-text-shadow-primary);
          line-height: 1.2;
        }

        .segment-route {
          color: var(--btn-text-secondary-muted);
          font-size: var(--btn-font-size-sm);
          text-shadow: var(--btn-text-shadow-subtle);
          line-height: 1.2;
        }

        .segment-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .segment-shell[data-expanded='true'] .segment-module {
          transform: scale(1.1);
        }

        .segment-shell[data-state='focus'] .segment-body {
          border-color: var(--btn-border-primary);
          box-shadow: var(--btn-shadow-lg), 0 0 16px var(--btn-glow-primary), var(--btn-inset-shadow-glossy);
        }

        .segment-shell[data-state='active'] .segment-body {
          border-color: var(--btn-border-primary);
          background: var(--btn-gradient-glass-glossy), var(--btn-gradient-primary);
          box-shadow: var(--btn-shadow-lg), 0 0 20px var(--btn-glow-primary), var(--btn-inset-shadow-glossy);
        }

        .segment-shell[data-state='critical'] .segment-body {
          border-color: var(--btn-border-danger);
          background: var(--btn-gradient-glass-glossy), var(--btn-gradient-danger);
          box-shadow: var(--btn-shadow-lg), 0 0 16px var(--btn-glow-danger), var(--btn-inset-shadow-glossy);
        }

        .segment-shell[data-state='active'] .coupler,
        .segment-shell[data-state='focus'] .coupler {
          border-color: var(--btn-border-primary);
          box-shadow: var(--btn-shadow-md), 0 0 8px var(--btn-glow-primary);
        }

        .segment-shell[data-state='critical'] .coupler {
          border-color: var(--btn-border-danger);
          box-shadow: var(--btn-shadow-md), 0 0 8px var(--btn-glow-danger);
        }
      `}</style>
    </AuroraModal>
  );
}
