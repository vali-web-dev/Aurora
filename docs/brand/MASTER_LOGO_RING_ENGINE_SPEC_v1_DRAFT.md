# Aurora Master Logo Ring Engine Spec (Draft v1)

- **Status:** Draft
- **Date:** 2026-02-17
- **Scope:** Mechanical chain-link ring system for Aurora master logo navigation
- **Depends on:** `docs/brand/MASTER_LOGO_CONSOLE_RFC_v1.md`

---

## 1) Vision Lock
Aurora master logo behaves as a **mechanical-futuristic navigation engine**.

- Arc panels are chain-link modules (not button-shaped), but inherit Aurora button token styling.
- Rings are functional navigation rails, not decorative circles.
- Motion and sound communicate mechanical state transitions.
- Ring system scales dynamically to destination count (no fixed 8-panel limit globally).

---

## 2) Ring Topology

### 2.1 Core + Rings
- **Core Globe (C0):** identity anchor + current route context.
- **Middle Main Ring (R0):** fixed 6 main universes:
  - Home, Entertainment, Commerce, Social, Learning, Creative
- **Inner Utility Rings (R-1, R-2, ...):** additional non-main pages.
- **Outer Sub-Ring (R+1):** contextual submenu for selected R0 link.
- **Outer Overflow Rings (R+2, R+3, ...):** spawned only when submenu size exceeds R+1 capacity.

### 2.2 Ring Priority Order
1. Mandatory placement: `R0` six mains.
2. Contextual placement: selected main submenu on `R+1`.
3. Utility placement: remaining destinations to inner rings by rank.
4. Overflow policy: spawn next ring when active ring reaches max comfortable capacity.

---

## 3) Arc Panel Unit (Chain Link)

### 3.1 Structural Parts
- **Left Coupler**
- **Link Body (icon chamber)**
- **Right Coupler**
- **State Latch (active/focus indicator)**

### 3.2 Functional Contract
Each arc panel must:
- hold logo/icon payload
- map to route link
- support focus/selected/critical states
- connect visually with neighboring links in the same ring

### 3.3 Design Contract
- Use root token family `--btn-*` for all gradient, border, shadow, timing, opacity, and text effects.
- Must remain crystal-clear; no haze layer that reduces icon legibility.
- Can inherit button style language without using button silhouette.

---

## 4) Geometry + Capacity Rules

### 4.1 Core Variables
- `r`: ring radius (px)
- `w`: link body width projected along tangent (px)
- `g`: gap between links (px)
- `f`: fill ratio safety factor (0.82–0.92)

### 4.2 Angular Model
- Link angle: `θ_link = w / r`
- Gap angle: `θ_gap = g / r`
- Total slot angle: `θ_slot = θ_link + θ_gap`
- Capacity:

$$
N_{max} = \left\lfloor \frac{2\pi f}{\theta_{slot}} \right\rfloor
$$

### 4.3 Practical Defaults (v1)
- `f = 0.88`
- `w = 42` (compact), `50` (engage), `58` (deep)
- `g = 6` (compact), `8` (engage/deep)

### 4.4 Radius Bands (starting defaults)
- `R-1`: 118
- `R0`: 158
- `R+1`: 206
- additional rings: `+40` radius increment per ring

### 4.5 Ring Spawning Rule
If `items > N_max(r,w,g,f)`, create next ring and continue packing by rank order.

---

## 5) Mechanical Open/Close Sequencing

### 5.1 Open Sequence (Parent → Sub-Ring)
1. **EngageLock (120–180ms):** selected parent link latches.
2. **TorqueShift (160–240ms):** neighboring links redistribute spacing.
3. **RailExtend (180–280ms):** outer track segment materializes from selected sector.
4. **LinkMount (220–380ms):** child links mount sequentially onto sub-ring.
5. **Stabilize (160–240ms):** damping and settle at readable state.

### 5.2 Close Sequence
1. **ReleaseFocus (100–140ms)**
2. **UnmountChildLinks (180–260ms)**
3. **RailRetract (160–240ms)**
4. **NeighborRebalance (120–180ms)**
5. **IdleBreath Return (120–180ms)**

### 5.3 Motion Character
- Engineered, deterministic, damped.
- No chaotic high-speed spin.
- Velocity caps enforced at each state.

---

## 6) Interaction State Machine

### 6.1 States
- `idle`
- `engage`
- `lock`
- `expand`
- `submenu-focus`
- `navigate`
- `recover`

### 6.2 Events
- `INTENT_OPEN`
- `PARENT_SELECT`
- `SUBMENU_OPENED`
- `CHILD_SELECT`
- `NAVIGATE_COMPLETE`
- `CANCEL`

### 6.3 Required Guarantees
- Escape/cancel from any state returns to nearest stable state.
- Keyboard can perform every pointer action.
- Reduced-motion path preserves full functionality.

---

## 7) Sound Engine Spec (v1)

### 7.1 Sound Events
- `engage_tick`
- `lock_click`
- `rail_extend_soft`
- `link_mount_tactile`
- `confirm_chime`
- `recover_damp`

### 7.2 Sound Rules
- Sounds are short, low-volume, non-looping by default.
- Sound disabled by default in low-sensory mode.
- Master toggle + per-event attenuation.
- No continuous mechanical drone.

---

## 8) Data Model (Ring-Oriented)

```ts
type RingRole = 'inner' | 'main' | 'outer' | 'overflow';

interface RingLink {
  id: string;
  label: string;
  route: string;
  iconId: string; // placeholder until final icon assets
  group: string;
  isMain: boolean;
  isCritical: boolean;
  weight: number;
  children?: RingLink[];
}

interface RingLayout {
  ringId: string;
  role: RingRole;
  radius: number;
  capacity: number;
  linkIds: string[];
}
```

---

## 9) Packing Algorithm (v1)
1. Seed `R0` with 6 fixed mains in canonical order.
2. Resolve selected main’s submenu.
3. Compute `R+1` capacity and place submenu links.
4. Overflow submenu links into `R+2+` if needed.
5. Rank remaining non-main links and fill `R-1`, then `R-2`, etc.
6. Recompute on route/context change with deterministic stable anchors.

---

## 10) Accessibility + Comfort
- Minimum interactive target >= 40px in engage/deep.
- Keyboard radial traversal (`Left/Right` next link, `Up/Down` ring shift, `Enter` activate, `Esc` cancel).
- Reduced-motion mode:
  - no rotational choreography,
  - use opacity/scale/latch states only.
- High-contrast mode must preserve link boundaries and selected path visibility.

---

## 11) Implementation Phases

### Phase A — Mechanical Layout Skeleton
- Ring generation
- chain-link panel component
- deterministic slot geometry

### Phase B — Hierarchical Expansion
- parent lock
- outer sub-ring expansion
- submenu link mount/retract

### Phase C — Inner/Overflow Rings
- dynamic ring spawning
- packing/ranking integration

### Phase D — Sound + Accessibility Hardening
- event sound hooks
- reduced-motion and keyboard parity

---

## 12) Acceptance Criteria (Draft)
1. R0 always shows six main universes as chain links.
2. Selecting a main link opens contextual outer sub-ring with same chain grammar.
3. System creates additional rings automatically when capacity is exceeded.
4. All links are route-capable and keyboard-operable.
5. Motion remains mechanically legible and bounded.
6. Styling uses Aurora root token variables only.

---

## 13) Open Validation Items
1. Confirm canonical order for six main universes.
2. Confirm priority policy for inner ring packing.
3. Confirm maximum practical ring count per viewport size.
4. Confirm sound profile defaults for different sensory modes.
5. Confirm icon placeholder policy until full logo set is complete.

---

## 14) Phase A Implementation Tickets (Build-Ready)

### A-1: Ring Geometry Utility
- **Goal:** Deterministically compute ring capacity and slot coordinates.
- **Deliverables:**
  - `computeRingCapacity(radius, linkWidth, gap, fillRatio)`
  - `computeRingSlots(radius, count, startAngle)`
  - `spawnRingsByCapacity(items, ringBands, panelMetrics)`
- **Acceptance:** Given fixed inputs, output is stable and testable.

### A-2: Chain Arc Panel Primitive
- **Goal:** Build reusable chain-link panel unit.
- **Deliverables:**
  - Left coupler + body + right coupler layout
  - icon chamber payload region
  - focus/selected/critical visual states
- **Acceptance:** Panel has clear chain continuity and keyboard-focus visibility.

### A-3: Ring Rail Component
- **Goal:** Render one ring from slot coordinates and chain panels.
- **Deliverables:**
  - `RingRail` component with role-aware styling (`inner`, `main`, `outer`, `overflow`)
  - link click/focus handlers
  - optional rotation channel (disabled under reduced motion)
- **Acceptance:** Ring renders N links with correct radial placement and targetability.

### A-4: Engine Skeleton Modal
- **Goal:** Compose core globe + middle fixed ring + generated utility rings.
- **Deliverables:**
  - `MasterLogoRingEngineModal` shell
  - fixed R0 with six main universes
  - dynamic inner ring generation for overflow destinations
- **Acceptance:** R0 always has six main links; extra links appear on additional rings.

### A-5: Dev Harness + Placeholder Data
- **Goal:** Enable interactive validation before final icon onboarding.
- **Deliverables:**
  - dedicated dev route
  - placeholder payloads for links/icons/routes
  - control toggles (reduced motion, ring density)
- **Acceptance:** Dev page allows deterministic visual and interaction checks.

### A-6: Accessibility + Comfort Baseline
- **Goal:** Ensure functional parity across modalities.
- **Deliverables:**
  - keyboard radial traversal
  - escape cancel behavior
  - reduced motion branch without ring rotation
- **Acceptance:** All core actions possible without pointer.

### A-7: Phase A Exit Criteria
- Middle ring fixed with 6 mains in canonical order.
- At least one inner utility ring auto-generated when needed.
- Chain-link panel grammar consistent across all rendered rings.
- No blur/haze layer that degrades icon readability.
- No hard-coded palette outside Aurora token system.
