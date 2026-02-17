'use client';

import type { Destination } from './types';
import { SlotNode } from './SlotNode';

interface PrimaryRingProps {
  destinations: Destination[];
  selectedId?: string;
  focusedIndex: number;
  onFocusIndex: (index: number) => void;
  onSelectDestination: (destination: Destination) => void;
}

const RING_RADIUS = 144;

export function PrimaryRing({
  destinations,
  selectedId,
  focusedIndex,
  onFocusIndex,
  onSelectDestination,
}: PrimaryRingProps) {
  return (
    <div className="console-primary-ring" aria-label="Primary destination ring">
      {destinations.map((destination, index) => {
        const angle = (Math.PI * 2 * index) / destinations.length - Math.PI / 2;
        const x = Math.cos(angle) * RING_RADIUS;
        const y = Math.sin(angle) * RING_RADIUS;

        return (
          <div
            key={destination.id}
            className="ring-slot"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <SlotNode
              destination={destination}
              selected={selectedId === destination.id}
              focused={focusedIndex === index}
              onFocus={() => onFocusIndex(index)}
              onSelect={() => onSelectDestination(destination)}
            />
          </div>
        );
      })}

      <style jsx>{`
        .console-primary-ring {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
        }

        .ring-slot {
          position: absolute;
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
