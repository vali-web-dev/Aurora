# Human Blueprint System — Production Architecture

## Step 1 — High-level architecture

### Located existing model
- Existing 3D transparent anatomy model was located in `src/components/health/Anatomy3DExplorer.tsx`.
- It has now been completed and modularized with consistent mesh references via `ANATOMY_MESH_REGIONS`.

### Runtime architecture
1. **3D Rendering Layer** (`@react-three/fiber`, `three`, `@react-three/drei`)
   - Transparent body shell
   - Interactive mesh regions
   - Front/back camera director
   - Pulse + breathing animation loop
2. **Content Engine Layer** (`src/lib/human-blueprint`)
   - Typed schema (`schema.ts`)
   - Full content library (`contentLibrary.ts`)
   - Daily focus selector + timeline date helper (`dailyFocus.ts`)
3. **Experience Layer** (`Anatomy3DExplorer.tsx`)
   - Adaptive phase controls (Phase 1..5)
   - Five learning layers in panel
   - Daily Body Focus widget
   - Progress, mastery, timeline, journal
4. **Persistence Layer**
   - Local storage progress model (`aurora-human-blueprint-progress-v1`)
5. **Scaffold Layer for scale**
   - `HumanBlueprintDailyFocus.tsx`
   - `HumanBlueprintInsightPanel.tsx`
   - `HumanBlueprintProgressRail.tsx`

### Data flow
`3D click` -> `meshReference/node id resolve` -> `content engine lookup` -> `phase-adaptive panel` -> `progress + journal persistence` -> `timeline + mastery updates`.

### Stack recommendation
- Frontend: Next.js + TypeScript
- 3D: React Three Fiber + Drei
- State (next phase): Zustand slice for multi-surface sync
- Content: Typed TypeScript/JSON library, i18n-ready

## Step 2 — Schema + example entries

Canonical schema is implemented in `src/lib/human-blueprint/schema.ts`.

```ts
{
  id,
  name,
  category,
  meshReference,
  summary,
  function_physical,
  function_emotional_psychological,
  lifestyle_support,
  lifestyle_harm,
  reflection_questions[],
  micro_actions[],
  long_term_positive,
  long_term_negative,
  mythic_identity,
  psychological_identity,
  narrative_voice,
  transformation_arc
}
```

Detailed entries are implemented in `src/lib/human-blueprint/contentLibrary.ts`.
Required examples included: **Heart, Brain, Lungs, Liver, Kidneys, Spine, Eyes, Skin, Hands**.

## Step 3 — Project scaffold

### Added folders/files
- `src/lib/human-blueprint/schema.ts`
- `src/lib/human-blueprint/contentLibrary.ts`
- `src/lib/human-blueprint/dailyFocus.ts`
- `src/lib/human-blueprint/modelManifest.ts`
- `src/components/health/human-blueprint/HumanBlueprintDailyFocus.tsx`
- `src/components/health/human-blueprint/HumanBlueprintInsightPanel.tsx`
- `src/components/health/human-blueprint/HumanBlueprintProgressRail.tsx`

### GLB drop-in runtime
- Place a model file at `public/models/human-blueprint/human-blueprint.glb`.
- Configure in `.env.local`:
   - `NEXT_PUBLIC_HUMAN_BLUEPRINT_MODEL_SOURCE=glb`
   - `NEXT_PUBLIC_HUMAN_BLUEPRINT_GLB_URL=/models/human-blueprint/human-blueprint.glb`
- If the GLB file is missing/unreachable, explorer automatically falls back to procedural rendering.

## Step 4 — First interactive vertical slice

Implemented in `src/components/health/Anatomy3DExplorer.tsx`:
- 3D transparent human model with organs/features
- Mesh click selection + alias resolution
- Front/back preset controls
- Phase controls (1–5)
- Five layer panel:
  1. Core Facts
  2. Lifestyle Links
  3. Emotional/Psychological
  4. Reflective Guidance
  5. Long-term Consequences

## Step 5 — Daily Body Focus

Implemented in `Anatomy3DExplorer.tsx` via:
- deterministic daily organ/system selection (`getDailyFocusNode`)
- daily micro-practice card
- direct “Open Focus Guide” jump

## Step 6 — Full content library

Current library includes organ, system, and major feature entries:
- Organs: brain, heart, lungs, liver, stomach, kidneys
- Systems: nervous, circulatory, respiratory, endocrine, digestive, urinary, immune
- Features: spine, eyes, skin, hands, sleep architecture

Library is designed for infinite expansion without touching rendering logic.

## Step 7 — Visual style guide

See `docs/HUMAN_BLUEPRINT_STYLE_GUIDE.md`.

## Step 8 — Narrative layer

See `docs/HUMAN_BLUEPRINT_NARRATIVE_LIBRARY.md`.

## Step 9 — Comments and TODOs for expansion

Expansion TODO recommendations:
1. Migrate local storage progress to authenticated profile persistence.
2. Add i18n resource loader for all narrative fields.
3. Support external GLB anatomy meshes with server-side manifest validation.
4. Add role-specific learning paths (student, clinician, coach, parent).
5. Add accessibility narrator mode for screen-reader-first exploration.
