'use client';

import type { CSSProperties } from 'react';
import type { RingPlacement, RingLink } from './types';
import { ChainArcPanel } from './ChainArcPanel';

interface RingRailProps {
  placement: RingPlacement;
  activeId?: string;
  onSelect: (link: RingLink) => void;
  className?: string;
}

export function RingRail({ placement, activeId, onSelect, className }: RingRailProps) {
  const panelCount = Math.max(1, placement.links.length);
  const slotArcLength = (Math.PI * 2 * placement.radius) / panelCount;

  const baseRadius =
    placement.role === 'main'
      ? 176
      : placement.role === 'outer'
        ? 245
        : placement.role === 'inner'
          ? 116
          : 176;
  const ringScale = Math.max(0.68, Math.min(1.9, placement.radius / baseRadius));

  const widthRatio =
    placement.role === 'main'
      ? 1.46
      : placement.role === 'outer'
        ? 1.24
        : placement.role === 'inner'
          ? 1.18
          : 1.2;

  const baseMinWidth =
    placement.role === 'main'
      ? 52
      : placement.role === 'outer'
        ? 48
        : placement.role === 'inner'
          ? 42
          : 44;
  const baseMaxWidth =
    placement.role === 'main'
      ? 208
      : placement.role === 'outer'
        ? 188
        : placement.role === 'inner'
          ? 156
          : 170;

  const panelWidth = Math.max(baseMinWidth * ringScale, Math.min(slotArcLength * widthRatio, baseMaxWidth * ringScale));
  const panelHeight =
    placement.role === 'main'
      ? Math.max(26 * ringScale, Math.min(panelWidth * 0.34, 44 * ringScale))
      : Math.max(22 * ringScale, Math.min(panelWidth * 0.38, 40 * ringScale));

  const segmentAngleDeg = 360 / panelCount;
  const halfChord = Math.min(panelWidth / 2, placement.radius * 0.95);
  const sagitta = placement.radius - Math.sqrt(Math.max(0, placement.radius * placement.radius - halfChord * halfChord));
  const curveOffset = Math.max(0.75 * ringScale, Math.min(4.5 * ringScale, sagitta * 0.7 + 0.45 * ringScale));
  const couplerSize = Math.max(10 * ringScale, panelHeight * 0.58);
  const overlap = Math.max(4 * ringScale, Math.min(couplerSize * 0.82, panelWidth * 0.22));
  const slotStyleVars: CSSProperties = {
    ['--segment-height' as string]: `${panelHeight}px`,
    ['--segment-width' as string]: `${panelWidth}px`,
    ['--segment-coupler' as string]: `${couplerSize}px`,
    ['--segment-overlap' as string]: `${overlap}px`,
    ['--segment-angle-deg' as string]: `${segmentAngleDeg}`,
    ['--segment-curve-offset' as string]: `${curveOffset}px`,
  };

  return (
    <div className={`ring-rail ring-${placement.role} ${className ?? ''}`}>
      {placement.links.map((link, index) => {
        const point = placement.points[index];
        const rotate = (point.angle * 180) / Math.PI + 90;

        return (
          <div
            key={link.id}
            className="ring-slot"
            style={{
              transform: `translate(${point.x}px, ${point.y}px) rotate(${rotate}deg)`,
              zIndex: activeId === link.id ? 999 : 10 + ((index % 2 === 0 ? 2 : 1) * 10) + index,
              ...slotStyleVars,
            }}
          >
            <ChainArcPanel link={link} active={activeId === link.id} onClick={() => onSelect(link)} />
          </div>
        );
      })}

      <style jsx>{`
        .ring-rail {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
        }

        .ring-slot {
          position: absolute;
          transform-origin: center center;
          display: grid;
          place-items: center;
        }
      `}</style>
    </div>
  );
}
