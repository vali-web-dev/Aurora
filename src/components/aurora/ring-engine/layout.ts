import type { PanelMetrics, RingBand, RingLink, RingPlacement, SlotPoint } from './types';

export function computeRingCapacity(radius: number, metrics: PanelMetrics) {
  const thetaLink = metrics.linkWidth / radius;
  const thetaGap = metrics.gap / radius;
  const thetaSlot = thetaLink + thetaGap;
  return Math.max(1, Math.floor((Math.PI * 2 * metrics.fillRatio) / thetaSlot));
}

export function computeRingSlots(radius: number, count: number, startAngle = -Math.PI / 2): SlotPoint[] {
  if (count <= 0) return [];
  return new Array(count).fill(null).map((_, index) => {
    const angle = startAngle + (Math.PI * 2 * index) / count;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      angle,
    };
  });
}

export function spawnRingsByCapacity(
  links: RingLink[],
  bands: RingBand[],
  metrics: PanelMetrics
): RingPlacement[] {
  const placements: RingPlacement[] = [];
  let cursor = 0;

  for (const band of bands) {
    if (cursor >= links.length) break;
    const capacity = computeRingCapacity(band.radius, metrics);
    const slice = links.slice(cursor, cursor + capacity);
    cursor += slice.length;

    placements.push({
      ringId: band.id,
      role: band.role,
      radius: band.radius,
      links: slice,
      points: computeRingSlots(band.radius, slice.length),
    });
  }

  return placements;
}
