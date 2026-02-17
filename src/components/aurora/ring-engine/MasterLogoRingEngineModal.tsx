'use client';

import { useMemo, useState } from 'react';
import { AuroraModal } from '@/components/aurora/Modal';
import { Button } from '@/components/ui/Button';
import { computeRingSlots, spawnRingsByCapacity } from './layout';
import { RingRail } from './RingRail';
import type { PanelMetrics, RingBand, RingLink, RingPlacement } from './types';

interface MasterLogoRingEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: RingLink[];
  onNavigate?: (route: string) => void;
}

const MAIN_ORDER = ['home', 'entertainment', 'commerce', 'social', 'learning', 'creative'];
const MAIN_RING_RADIUS = 164;
const OUTER_RING_RADIUS = 230;

const INNER_BANDS: RingBand[] = [
  { id: 'inner-1', role: 'inner', radius: 122 },
  { id: 'inner-2', role: 'inner', radius: 88 },
  { id: 'inner-3', role: 'inner', radius: 54 },
];

const OUTER_BANDS: RingBand[] = [
  { id: 'outer-1', role: 'outer', radius: OUTER_RING_RADIUS },
  { id: 'outer-2', role: 'overflow', radius: 272 },
  { id: 'outer-3', role: 'overflow', radius: 314 },
];

const PANEL_METRICS: PanelMetrics = {
  linkWidth: 42,
  gap: 6,
  fillRatio: 0.88,
};

const masterIconSrc = '/docs/brand/logo-drafts/routes-v1/aurora-route-b-core-master.svg';

export function MasterLogoRingEngineModal({ isOpen, onClose, links, onNavigate }: MasterLogoRingEngineModalProps) {
  const mainLinks = useMemo(() => {
    const pool = links.filter((link) => link.isMain);
    return MAIN_ORDER.map((id) => pool.find((item) => item.id === id)).filter((item): item is RingLink => Boolean(item));
  }, [links]);

  const [activeMainId, setActiveMainId] = useState<string>(() => mainLinks[0]?.id ?? 'home');
  const [activeLinkId, setActiveLinkId] = useState<string | undefined>(undefined);

  const selectedMain = mainLinks.find((link) => link.id === activeMainId) ?? mainLinks[0];

  const mainPlacement: RingPlacement = useMemo(() => ({
    ringId: 'main',
    role: 'main',
    radius: MAIN_RING_RADIUS,
    links: mainLinks,
    points: computeRingSlots(MAIN_RING_RADIUS, Math.max(1, mainLinks.length)),
  }), [mainLinks]);

  const innerPlacements = useMemo(() => {
    const utilityLinks = links.filter((link) => !link.isMain);
    return spawnRingsByCapacity(utilityLinks, INNER_BANDS, PANEL_METRICS);
  }, [links]);

  const outerPlacements = useMemo(() => {
    const submenu = selectedMain?.children ?? [];
    return spawnRingsByCapacity(submenu, OUTER_BANDS, PANEL_METRICS);
  }, [selectedMain]);

  const handleSelect = (link: RingLink) => {
    setActiveLinkId(link.id);

    if (link.isMain) {
      setActiveMainId(link.id);
      return;
    }

    onNavigate?.(link.route);
  };

  return (
    <AuroraModal
      isOpen={isOpen}
      onClose={onClose}
      title="Aurora Ring Engine (Phase A)"
      description="Mechanical chain-link ring skeleton with fixed six-main middle ring and dynamic utility/sub rings."
      size="xl"
      footerContent={<span>Main ring: 6 fixed • Dynamic ring spawning: enabled</span>}
    >
      <div className="ring-engine-shell">
        <div className="engine-stage" role="group" aria-label="Aurora ring engine navigation">
          <div className="ring-guide ring-guide-main" aria-hidden="true" />
          <div className="ring-guide ring-guide-outer" aria-hidden="true" />

          {innerPlacements.map((placement) => (
            <RingRail key={placement.ringId} placement={placement} activeId={activeLinkId} onSelect={handleSelect} />
          ))}

          <RingRail placement={mainPlacement} activeId={activeMainId} onSelect={handleSelect} />

          {outerPlacements.map((placement) => (
            <RingRail key={placement.ringId} placement={placement} activeId={activeLinkId} onSelect={handleSelect} />
          ))}

          <div className="core-globe">
            <div className="core-shell">
              <img src={masterIconSrc} alt="Aurora master logo" className="core-icon" />
            </div>
            <div className="core-caption">{selectedMain?.label ?? 'Aurora'}</div>
          </div>
        </div>

        <div className="engine-actions">
          <Button variant="primary" animation="shimmer" onClick={() => selectedMain && onNavigate?.(selectedMain.route)}>
            Open {selectedMain?.label ?? 'Main'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <style jsx>{`
        .ring-engine-shell {
          display: grid;
          gap: 14px;
          border-radius: calc(var(--btn-radius-xl) + 8px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-secondary);
          box-shadow: var(--btn-shadow-layered-md), var(--btn-inset-shadow-glossy);
          padding: 16px;
        }

        .engine-stage {
          min-height: 680px;
          border-radius: calc(var(--btn-radius-xl) + 6px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: linear-gradient(180deg, transparent, var(--btn-glass-opacity));
          position: relative;
          overflow: hidden;
          display: grid;
          place-items: center;
        }

        .ring-guide {
          position: absolute;
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          box-shadow: 0 0 0 1px var(--btn-border-primary) inset;
          opacity: 0.25;
          pointer-events: none;
        }

        .ring-guide-main {
          width: 328px;
          height: 328px;
        }

        .ring-guide-outer {
          width: 460px;
          height: 460px;
        }

        .core-globe {
          width: 136px;
          height: 136px;
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width-thick) var(--btn-border-style) var(--btn-border-primary);
          background: var(--btn-gradient-glass-glossy), var(--btn-gradient-primary);
          box-shadow: var(--btn-shadow-md), var(--btn-inset-shadow-glossy);
          display: grid;
          place-items: center;
          z-index: 3;
        }

        .core-shell {
          width: 94px;
          height: 94px;
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .core-icon {
          width: 72px;
          height: 72px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px var(--btn-glow-primary));
        }

        .core-caption {
          position: absolute;
          transform: translateY(98px);
          font-size: var(--btn-font-size-sm);
          color: var(--btn-text-secondary);
          text-shadow: var(--btn-text-shadow-subtle);
          white-space: nowrap;
        }

        .engine-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 980px) {
          .engine-stage {
            min-height: 560px;
          }

          .ring-guide-main {
            width: 296px;
            height: 296px;
          }

          .ring-guide-outer {
            width: 420px;
            height: 420px;
          }
        }
      `}</style>
    </AuroraModal>
  );
}
