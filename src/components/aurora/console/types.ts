export type ConsoleMode = 'compact' | 'engage' | 'deep';

export type ConsoleInteractionState =
  | 'idle'
  | 'engage'
  | 'target'
  | 'confirm'
  | 'navigate'
  | 'recover';

export type DestinationGroup = 'worlds' | 'tools' | 'system' | string;

export interface Destination {
  id: string;
  label: string;
  route: string;
  group: DestinationGroup;
  priority: number;
  usageScore: number;
  lastUsedAt: number;
  isPinned: boolean;
  isCritical: boolean;
  badgeCount: number;
  shortCode: string;
}

export interface SlotAssignment {
  slotId: string;
  destinationId: string;
  index: number;
  rank: number;
}

export interface ConsoleRankingWeights {
  pin: number;
  context: number;
  recent: number;
  frequency: number;
  criticality: number;
  crowdingPenalty: number;
}

export interface ConsoleRankingContext {
  currentRoute: string;
  now: number;
  slotLimit: number;
}

export interface ConsoleState {
  mode: ConsoleMode;
  status: ConsoleInteractionState;
  focusedSlot: number;
  selectedDestinationId?: string;
  reducedMotion: boolean;
}

export interface ConsoleNavigatePayload {
  route: string;
  destinationId: string;
}
