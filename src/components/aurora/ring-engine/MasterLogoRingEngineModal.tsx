'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AuroraModal } from '@/components/aurora/Modal';
import { Button } from '@/components/ui/Button';
import { computeRingSlots } from './layout';
import { RingRail } from './RingRail';
import type { RingLink, RingPlacement } from './types';

interface MasterLogoRingEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: RingLink[];
  onNavigate?: (route: string) => void;
}

const MAIN_ORDER = ['home', 'entertainment', 'commerce', 'social', 'learning', 'creative'];

type MechanicalPhase = 'idle' | 'engage-lock' | 'torque-shift' | 'rail-extend' | 'link-mount' | 'stabilize';

const masterIconSrc = '/docs/brand/logo-drafts/routes-v1/aurora-route-b-core-master.svg';

export function MasterLogoRingEngineModal({ isOpen, onClose, links, onNavigate }: MasterLogoRingEngineModalProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mainLinks = useMemo(() => {
    const pool = links.filter((link) => link.isMain);
    return MAIN_ORDER.map((id) => pool.find((item) => item.id === id)).filter((item): item is RingLink => Boolean(item));
  }, [links]);

  const [activeMainId, setActiveMainId] = useState<string>(() => mainLinks[0]?.id ?? 'home');
  const [activeLinkId, setActiveLinkId] = useState<string | undefined>(undefined);
  const [phase, setPhase] = useState<MechanicalPhase>('idle');
  const [mountedOuterLinks, setMountedOuterLinks] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [stageSize, setStageSize] = useState(680);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const target = stageRef.current;
    if (!target || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextSize = Math.min(entry.contentRect.width, entry.contentRect.height);
      if (Number.isFinite(nextSize) && nextSize > 0) {
        setStageSize(nextSize);
      }
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const engineSize = Math.max(360, stageSize);
  const maxRadius = engineSize / 2 - 38;
  const outerRingRadius = Math.min(Math.round(engineSize * 0.36), maxRadius);
  const mainRingRadius = Math.max(96, Math.round(outerRingRadius * 0.72));
  const innerRingRadius = Math.max(58, Math.round(mainRingRadius * 0.66));

  const selectedMain = mainLinks.find((link) => link.id === activeMainId) ?? mainLinks[0];

  const mainPlacement: RingPlacement = useMemo(() => ({
    ringId: 'main',
    role: 'main',
    radius: mainRingRadius,
    links: mainLinks,
    points: computeRingSlots(mainRingRadius, Math.max(1, mainLinks.length)),
  }), [mainLinks, mainRingRadius]);

  const utilityLinks = useMemo(
    () =>
      links
        .filter((link) => !link.isMain)
        .sort((left, right) => {
          const leftScore = left.weight + (left.isCritical ? 0.2 : 0);
          const rightScore = right.weight + (right.isCritical ? 0.2 : 0);
          return rightScore - leftScore;
        }),
    [links]
  );

  const innerPlacement: RingPlacement = useMemo(
    () => ({
      ringId: 'inner',
      role: 'inner',
      radius: innerRingRadius,
      links: utilityLinks,
      points: computeRingSlots(innerRingRadius, Math.max(1, utilityLinks.length)),
    }),
    [utilityLinks, innerRingRadius]
  );

  const outerPlacement: RingPlacement = useMemo(() => {
    const submenu = selectedMain?.children ?? [];
    return {
      ringId: 'outer',
      role: 'outer',
      radius: outerRingRadius,
      links: submenu,
      points: computeRingSlots(outerRingRadius, Math.max(1, submenu.length)),
    };
  }, [selectedMain, outerRingRadius]);

  const totalOuterLinks = outerPlacement.links.length;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const runMechanicalExpand = (link: RingLink) => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];

    setPhase('engage-lock');
    setMountedOuterLinks(0);
    setActiveMainId(link.id);

    if (reducedMotion) {
      setPhase('stabilize');
      setMountedOuterLinks(link.children?.length ?? 0);
      return;
    }

    const t1 = window.setTimeout(() => setPhase('torque-shift'), 160);
    const t2 = window.setTimeout(() => setPhase('rail-extend'), 360);
    const t3 = window.setTimeout(() => setPhase('link-mount'), 620);
    const t4 = window.setTimeout(() => setPhase('stabilize'), 1180);
    timersRef.current.push(t1, t2, t3, t4);
  };

  useEffect(() => {
    if (phase !== 'link-mount' && phase !== 'stabilize') return;
    if (reducedMotion) return;
    if (totalOuterLinks <= 0) return;

    if (phase === 'stabilize') {
      setMountedOuterLinks(totalOuterLinks);
      return;
    }

    setMountedOuterLinks(0);
    for (let index = 1; index <= totalOuterLinks; index += 1) {
      const id = window.setTimeout(() => {
        setMountedOuterLinks(index);
      }, index * 58);
      timersRef.current.push(id);
    }
  }, [phase, totalOuterLinks, reducedMotion]);

  const visibleOuterPlacement = useMemo(() => {
    const maxVisible = reducedMotion || phase === 'stabilize' ? totalOuterLinks : mountedOuterLinks;
    if (maxVisible <= 0) {
      return {
        ...outerPlacement,
        links: [] as RingLink[],
        points: [] as RingPlacement['points'],
      };
    }

    return {
      ...outerPlacement,
      links: outerPlacement.links.slice(0, maxVisible),
      points: outerPlacement.points.slice(0, maxVisible),
    };
  }, [outerPlacement, mountedOuterLinks, totalOuterLinks, reducedMotion, phase]);

  const coreSize = Math.max(104, Math.round(mainRingRadius * 0.82));
  const coreShellSize = Math.max(72, Math.round(coreSize * 0.68));
  const coreIconSize = Math.max(54, Math.round(coreShellSize * 0.76));

  const handleSelect = (link: RingLink) => {
    setActiveLinkId(link.id);

    if (link.isMain) {
      runMechanicalExpand(link);
      return;
    }

    onNavigate?.(link.route);
  };

  return (
    <AuroraModal
      isOpen={isOpen}
      onClose={onClose}
      title="Aurora Ring Engine (Phase A)"
      description="Mechanical chain-link ring engine with staged outward expansion choreography for submenu mounting."
      size="xl"
      footerContent={<span>Rings: inner + middle + outer • Main ring: 6 fixed • Phase: {phase} • Mounted submenu links: {Math.min(totalOuterLinks, reducedMotion ? totalOuterLinks : mountedOuterLinks)}/{totalOuterLinks}</span>}
    >
      <div className="ring-engine-shell" data-phase={phase}>
        <div className="engine-stage" role="group" aria-label="Aurora ring engine navigation" ref={stageRef}>
          <div className="ring-guide ring-guide-inner" aria-hidden="true" style={{ width: innerRingRadius * 2, height: innerRingRadius * 2 }} />
          <div className="ring-guide ring-guide-main" aria-hidden="true" style={{ width: mainRingRadius * 2, height: mainRingRadius * 2 }} />
          <div className="ring-guide ring-guide-outer" aria-hidden="true" style={{ width: outerRingRadius * 2, height: outerRingRadius * 2 }} />

          <RingRail placement={innerPlacement} activeId={activeLinkId} onSelect={handleSelect} className="inner-rail" />

          <RingRail placement={mainPlacement} activeId={activeMainId} onSelect={handleSelect} className="main-rail" />

          <RingRail placement={visibleOuterPlacement} activeId={activeLinkId} onSelect={handleSelect} className="outer-rail" />

          <div className="core-globe" style={{ width: coreSize, height: coreSize }}>
            <div className="core-shell" style={{ width: coreShellSize, height: coreShellSize }}>
              <img src={masterIconSrc} alt="Aurora master logo" className="core-icon" style={{ width: coreIconSize, height: coreIconSize }} />
            </div>
            <div className="core-caption" style={{ transform: `translateY(${Math.round(coreSize * 0.72)}px)` }}>{selectedMain?.label ?? 'Aurora'}</div>
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
          min-height: clamp(24rem, 74vh, 46rem);
          width: min(100%, 54rem);
          border-radius: calc(var(--btn-radius-xl) + 6px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: linear-gradient(180deg, transparent, var(--btn-glass-opacity));
          position: relative;
          overflow: hidden;
          display: grid;
          place-items: center;
          margin: 0 auto;
        }

        .ring-guide {
          position: absolute;
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          box-shadow: 0 0 0 1px var(--btn-border-primary) inset;
          opacity: 0.25;
          pointer-events: none;
        }

        .ring-guide-main,
        .ring-guide-inner,
        .ring-guide-outer {
          transition: transform 220ms var(--btn-transition-ease), opacity 220ms var(--btn-transition-ease);
        }

        .ring-engine-shell[data-phase='engage-lock'] .ring-guide-outer {
          transform: scale(0.92);
          opacity: 0.2;
        }

        .ring-engine-shell[data-phase='torque-shift'] .ring-guide-outer {
          transform: scale(0.97) rotate(4deg);
          opacity: 0.28;
        }

        .ring-engine-shell[data-phase='rail-extend'] .ring-guide-outer {
          transform: scale(1.05);
          opacity: 0.34;
        }

        .ring-engine-shell[data-phase='link-mount'] .ring-guide-outer,
        .ring-engine-shell[data-phase='stabilize'] .ring-guide-outer {
          transform: scale(1.08);
          opacity: 0.4;
        }

        :global(.outer-rail) {
          transition: opacity 220ms var(--btn-transition-ease), transform 220ms var(--btn-transition-ease);
          opacity: 0.16;
          transform: scale(0.84);
          transform-origin: center;
        }

        .ring-engine-shell[data-phase='rail-extend'] :global(.outer-rail) {
          opacity: 0.48;
          transform: scale(0.96);
        }

        .ring-engine-shell[data-phase='link-mount'] :global(.outer-rail) {
          opacity: 0.84;
          transform: scale(1.04);
        }

        .ring-engine-shell[data-phase='stabilize'] :global(.outer-rail),
        .ring-engine-shell[data-phase='idle'] :global(.outer-rail) {
          opacity: 1;
          transform: scale(1);
        }

        :global(.main-rail) {
          transition: transform 220ms var(--btn-transition-ease);
        }

        .ring-engine-shell[data-phase='torque-shift'] :global(.main-rail) {
          transform: rotate(5deg);
        }

        .ring-engine-shell[data-phase='stabilize'] :global(.main-rail),
        .ring-engine-shell[data-phase='idle'] :global(.main-rail) {
          transform: rotate(0deg);
        }

        .core-globe {
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width-thick) var(--btn-border-style) var(--btn-border-primary);
          background: var(--btn-gradient-glass-glossy), var(--btn-gradient-primary);
          box-shadow: var(--btn-shadow-md), var(--btn-inset-shadow-glossy);
          display: grid;
          place-items: center;
          z-index: 3;
        }

        .core-shell {
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .core-icon {
          object-fit: contain;
          filter: drop-shadow(0 0 8px var(--btn-glow-primary));
        }

        .core-caption {
          position: absolute;
          font-size: var(--btn-font-size-sm);
          color: var(--btn-text-secondary);
          text-shadow: var(--btn-text-shadow-subtle);
          white-space: nowrap;
        }

        .ring-engine-shell[data-phase='engage-lock'] .core-globe {
          transform: scale(0.98);
        }

        .ring-engine-shell[data-phase='torque-shift'] .core-globe {
          transform: scale(1.02);
        }

        .ring-engine-shell[data-phase='rail-extend'] .core-globe,
        .ring-engine-shell[data-phase='link-mount'] .core-globe {
          transform: scale(1.04);
        }

        .ring-engine-shell[data-phase='stabilize'] .core-globe,
        .ring-engine-shell[data-phase='idle'] .core-globe {
          transform: scale(1);
          transition: transform 220ms var(--btn-transition-ease);
        }

        .engine-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 980px) {
          .engine-stage {
            width: 100%;
          }
        }
      `}</style>
    </AuroraModal>
  );
}
