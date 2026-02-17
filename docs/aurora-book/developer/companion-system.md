# Companion System (Developer)

Aurora uses a personality engine that adapts per universe, signal, and time pattern.

## Core Dimensions
- Tones: Mentor, Strategist, Explorer, Analyst, Guardian
- Scopes: Minimal, Light, Standard, Deep, Intensive
- Signals: Exploration, Focus, Learning, Creation, Relaxation, Crisis, Collaboration, Reflection
- Time patterns: first visit, return visitor, power user, new day, late session, off hours

## Universe Defaults
Each universe sets a default tone and scope, with signal overrides. For full mapping, see COMPANION_PERSONALITY_DESIGN.md.

## Companion Panel Data
- Current tone and scope
- Universe and route context
- Memory controls
- Signals
- Quick notes
- Recent memory

## Implementation Flow
1. Resolve current universe from route
2. Apply universe default tone + scope
3. Apply signal overrides (if set)
4. Apply time-based adjustments (late session, first visit)
5. Render Companion Panel state

## Data Contracts (Core)
- `tone`: string (Mentor, Strategist, Explorer, Analyst, Guardian)
- `scope`: string (Minimal, Light, Standard, Deep, Intensive)
- `signal`: string[] (Focus, Exploration, Learning, etc.)
- `context`: { universe, route, timeOfDay, sessionType }
- `memory`: { enabled, recentItems[] }

## Signal Lifecycle
1. User sets signal (UI or automation)
2. Signal stored in local state
3. Companion updates tone/scope in UI
4. Optional memory note saved (if enabled)
5. Signal expires or is cleared

## Data Storage
- Local state for live session
- Local storage for preferences
- Optional server sync when enabled

## Integration Points
- Providers: `CompanionProvider`, `CompanionContextEngineProvider`
- UI: `CompanionPanel` component
- Signals: `useCompanion` hook

## Behavior Requirements
- Explainability: user can ask why suggestions appear
- Opt-in memory
- Clear data provenance

Sources:
- COMPANION_PERSONALITY_DESIGN.md
- AURORA_MANUAL.md
