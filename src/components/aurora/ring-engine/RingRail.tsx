'use client';

import type { RingPlacement, RingLink } from './types';
import { ChainArcPanel } from './ChainArcPanel';

interface RingRailProps {
  placement: RingPlacement;
  activeId?: string;
  onSelect: (link: RingLink) => void;
}

export function RingRail({ placement, activeId, onSelect }: RingRailProps) {
  return (
    <div className={`ring-rail ring-${placement.role}`}>
      {placement.links.map((link, index) => {
        const point = placement.points[index];
        const rotate = (point.angle * 180) / Math.PI + 90;

        return (
          <div
            key={link.id}
            className="ring-slot"
            style={{
              transform: `translate(${point.x}px, ${point.y}px) rotate(${rotate}deg)`,
            }}
          >
            <div style={{ transform: `rotate(${-rotate}deg)` }}>
              <ChainArcPanel link={link} active={activeId === link.id} onClick={() => onSelect(link)} />
            </div>
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
        }
      `}</style>
    </div>
  );
}
