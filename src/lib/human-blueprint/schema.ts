export type BlueprintCategory = 'organ' | 'system' | 'feature';

export type BlueprintPhase = 1 | 2 | 3 | 4 | 5;

export interface HumanBlueprintNode {
  id: string;
  name: string;
  category: BlueprintCategory;
  meshReference: string;
  summary: string;
  function_physical: string;
  function_emotional_psychological: string;
  lifestyle_support: string[];
  lifestyle_harm: string[];
  reflection_questions: string[];
  micro_actions: string[];
  long_term_positive: string;
  long_term_negative: string;
  mythic_identity: string;
  psychological_identity: string;
  narrative_voice: string;
  transformation_arc: string;
  if_ignore_this: string;
  if_honor_this: string;
  relatedNodes?: string[];
  learningPathOrder?: number;
}

export interface AnatomyMeshRegion {
  id: string;
  name: string;
  category: BlueprintCategory;
  meshReference: string;
  geometry: 'sphere' | 'capsule' | 'box';
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

export const BLUEPRINT_PHASES: Array<{ id: BlueprintPhase; label: string; subtitle: string }> = [
  { id: 1, label: 'Quick Insight', subtitle: 'Essential truth in under a minute.' },
  { id: 2, label: 'Practical Guidance', subtitle: 'Habits and behaviors you can apply today.' },
  { id: 3, label: 'Deep Understanding', subtitle: 'Science, psychology, and pattern clarity.' },
  { id: 4, label: 'Mythic Narrative', subtitle: 'Symbolic and archetypal inner meaning.' },
  { id: 5, label: 'Mastery', subtitle: 'Identity, legacy, and long-horizon outcomes.' },
];
