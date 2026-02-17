import type {
  ConsoleRankingContext,
  ConsoleRankingWeights,
  Destination,
  SlotAssignment,
} from './types';

const DEFAULT_WEIGHTS: ConsoleRankingWeights = {
  pin: 0.35,
  context: 0.2,
  recent: 0.15,
  frequency: 0.2,
  criticality: 0.1,
  crowdingPenalty: 0.1,
};

function normalizeRecentness(lastUsedAt: number, now: number) {
  const ageMs = Math.max(0, now - lastUsedAt);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.max(0, 1 - ageMs / (oneDay * 7));
}

function scoreDestination(
  destination: Destination,
  index: number,
  context: ConsoleRankingContext,
  weights: ConsoleRankingWeights
): number {
  const pinned = destination.isPinned ? 1 : 0;
  const contextual = destination.route === context.currentRoute ? 1 : 0;
  const recent = normalizeRecentness(destination.lastUsedAt, context.now);
  const frequency = Math.max(0, Math.min(1, destination.usageScore));
  const critical = destination.isCritical ? 1 : 0;
  const crowdingPenalty = index / Math.max(1, context.slotLimit * 2);

  return (
    weights.pin * pinned +
    weights.context * contextual +
    weights.recent * recent +
    weights.frequency * frequency +
    weights.criticality * critical +
    destination.priority * 0.05 -
    weights.crowdingPenalty * crowdingPenalty
  );
}

export function rankDestinations(
  destinations: Destination[],
  context: ConsoleRankingContext,
  weights: ConsoleRankingWeights = DEFAULT_WEIGHTS
) {
  return destinations
    .map((destination, index) => ({
      destination,
      rank: scoreDestination(destination, index, context, weights),
    }))
    .sort((a, b) => b.rank - a.rank);
}

export function assignPrimarySlots(
  destinations: Destination[],
  context: ConsoleRankingContext,
  weights?: ConsoleRankingWeights
): SlotAssignment[] {
  const ranked = rankDestinations(destinations, context, weights);
  return ranked.slice(0, context.slotLimit).map(({ destination, rank }, index) => ({
    slotId: `primary-${index}`,
    destinationId: destination.id,
    index,
    rank,
  }));
}
