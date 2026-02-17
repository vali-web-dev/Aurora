# RFC: Aurora Master Logo Console v1

- **Status:** Draft
- **Date:** 2026-02-17
- **Owners:** Aurora Brand + Navigation Systems
- **Scope:** Master logo as global navigation console (functional-first), with crystal-water button-style presentation.

## 1) Problem
Aurora needs one master identity surface that is both iconic and operational across many destinations. A static logo cannot scale to platform-wide navigation density, while a purely decorative animated mark harms clarity and usability.

## 2) Goals
1. Make the master logo a **global navigation engine** with explicit interaction states.
2. Preserve the **immutable source geometry** of the selected master icon.
3. Apply only Aurora root token styling (`--btn-*`) for consistency.
4. Support high destination count through arc banks and progressive depth.
5. Keep motion expressive but engineered, predictable, and accessible.

## 3) Non-Goals
1. Redesigning the selected master icon geometry.
2. Shipping final destination iconography in v1.
3. Replacing full navigation IA; this is a top-level console layer.
4. Introducing custom color/shadow systems outside existing root variables.

## 4) Canonical Visual Source
- Master source of truth: `docs/brand/logo-drafts/routes-v1/aurora-route-b-core-master.svg`
- PNG exports are derivative preview/distribution assets only.

## 5) Information Architecture
### 5.1 Structural Layers
- **Core Chamber:** current destination identity holder + quick return/home behavior.
- **Primary Ring:** top-priority destinations (pinned + high-frequency).
- **Orbit Arcs:** grouped destination rails (universes/domains).
- **Arc Banks:** paged slot sets per arc to scale beyond visible slots.
- **Depth Modes:**
  - `compact` (icon-level)
  - `engage` (expanded hints + focus)
  - `deep` (full console interaction)

### 5.2 Initial Capacity
- Visible slots per primary ring/arc in compact/engage: **8**
- Additional destinations: accessed via bank switching in deep mode.

## 6) Functional Model
### 6.1 States
- `idle`: breathing baseline
- `engage`: intent detected
- `target`: slot focus / magnetic snap
- `confirm`: selection lock
- `navigate`: route transition
- `recover`: damped return to baseline

### 6.2 Transitions
- `idle -> engage`: hover >120ms OR tap/click
- `engage -> target`: directional input, slot hover, keyboard focus
- `target -> confirm`: click/tap/enter
- `confirm -> navigate`: immediate
- `navigate -> recover -> idle`: after route settles
- `* -> idle`: cancel/escape with deterministic fallback

## 7) Interaction Contracts
1. Every animated part must represent a navigational state or affordance.
2. No blur haze that reduces symbol/label readability.
3. Primary interactions must work with pointer, keyboard, and touch.
4. Motion must cap velocity and include settle points (no chaotic spin).

## 8) Data Contracts (v1)
## 8.1 Destination
- `id: string`
- `label: string`
- `route: string`
- `group: 'worlds' | 'tools' | 'system' | string`
- `priority: number`
- `usageScore: number`
- `lastUsedAt: number`
- `isPinned: boolean`
- `isCritical: boolean`
- `badgeCount: number`

## 8.2 SlotAssignment
- `slotId: string`
- `destinationId: string`
- `arcId: string`
- `bankIndex: number`
- `rank: number`

## 8.3 ConsoleState
- `mode: 'compact' | 'engage' | 'deep'`
- `activeArc: string`
- `activeBank: number`
- `focusedSlot?: string`
- `selectedDestination?: string`
- `reducedMotion: boolean`

## 9) Ranking Strategy (Initial)
`rank = w1*pin + w2*context + w3*recent + w4*frequency + w5*criticality - w6*crowdingPenalty`

Suggested weights:
- `w1=0.35`
- `w2=0.20`
- `w3=0.15`
- `w4=0.20`
- `w5=0.10`
- `w6=0.10`

Recompute triggers:
- route change
- session start
- every N destination interactions

## 10) Motion Spec (Token-Compatible)
- `idle breathe`: 2800–3600ms, low amplitude
- `ring baseline orbit`: 16–24s equivalent revolution
- `engage accel`: 180–260ms
- `target snap`: 140–220ms
- `confirm pulse`: 220–320ms
- `recover damp`: 260–420ms

All timings/easings must map to existing root transition variables where possible.

## 11) Styling Constraints
1. Use root variables only (`--btn-*`) for gradients, borders, shadows, opacity, transitions, text effects.
2. Keep logo geometry untouched; style lives in container/system layers.
3. Preserve crystal-water language: clarity, reflection, depth, liquid smoothness.
4. Keep active text/icon legible over all effects.

## 12) Accessibility
- Keyboard support for all slot navigation and activation.
- Escape/back exits to prior stable state.
- Reduced motion mode replaces rotation-heavy cues with low-motion alternatives.
- Minimum touch target >= 40px in expanded states.
- Visual state semantics: active/suggested/critical must be distinguishable.

## 13) API Surface (Proposed)
`MasterLogoConsole(props)`

Props:
- `destinations: Destination[]`
- `currentRoute: string`
- `pinnedIds?: string[]`
- `mode?: 'compact' | 'engage' | 'deep'`
- `reducedMotion?: boolean`
- `onNavigate: (route: string) => void`
- `onModeChange?: (mode: string) => void`
- `onTelemetry?: (event: string, payload?: Record<string, unknown>) => void`

## 14) Telemetry Events
- `console_opened`
- `slot_focused`
- `slot_selected`
- `bank_changed`
- `navigate_success`
- `navigate_cancelled`

Primary KPIs:
- time-to-target
- misclick rate
- deep-mode dependence
- repeat route efficiency

## 15) Rollout Plan
### Phase 1 — Skeleton
- Implement component shell + state machine + placeholder destination payloads.

### Phase 2 — Ranking & Banks
- Add slot ranking, arc banking, and deterministic paging.

### Phase 3 — Final Icon Onboarding
- Swap placeholders for final icons without changing behavior contracts.

### Phase 4 — Adaptive Intelligence
- Context-aware ordering + transparent “why surfaced” hints.

## 16) Risks and Mitigations
- **Risk:** Motion spectacle hurts clarity.
  - **Mitigation:** enforce velocity caps + readability checks.
- **Risk:** Too many destinations overwhelm compact mode.
  - **Mitigation:** arc banking + deep mode + ranking.
- **Risk:** Behavior drift across surfaces.
  - **Mitigation:** shared state machine and API contracts.
- **Risk:** Accessibility regressions under complex animation.
  - **Mitigation:** reduced-motion parity and keyboard-first validation.

## 17) Upgrade Architecture (v2)
Name: **Aurora Mechanical Navigation Engine (AMNE-v2)**

Enhancements:
1. Adaptive Arc Orchestrator (contextual arc ordering)
2. Command Mesh Overlay (deep mode command-text parity)
3. Criticality Lanes (separate priority channel)
4. Redundant control paths (pointer/keyboard/command)
5. Predictive pre-focus with user override
6. Deterministic recovery from interrupted interactions

## 18) Open Questions
1. Final slot count for compact state (6 vs 8).
2. Whether deep mode opens on hold, click, or both.
3. Universe grouping taxonomy for initial arcs.
4. Thresholds for criticality lane visibility.
5. Telemetry privacy retention window.

## 19) Acceptance Criteria
- Master icon remains geometrically unchanged.
- All style tokens derive from root button variable system.
- Console supports > platform destination count via banks.
- Pointer + keyboard + touch navigation validated.
- Reduced-motion path preserves full functionality.
- Measurable KPI improvement in navigation efficiency.
