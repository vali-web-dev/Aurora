export type RingRole = 'inner' | 'main' | 'outer' | 'overflow';

export interface RingLink {
  id: string;
  label: string;
  route: string;
  iconText: string;
  group: string;
  isMain: boolean;
  isCritical: boolean;
  weight: number;
  children?: RingLink[];
}

export interface RingBand {
  id: string;
  role: RingRole;
  radius: number;
}

export interface PanelMetrics {
  linkWidth: number;
  gap: number;
  fillRatio: number;
}

export interface SlotPoint {
  x: number;
  y: number;
  angle: number;
}

export interface RingPlacement {
  ringId: string;
  role: RingRole;
  radius: number;
  links: RingLink[];
  points: SlotPoint[];
}
