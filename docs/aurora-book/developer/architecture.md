# Architecture Overview

## Philosophy
Aurora is built on:
- Speed and responsiveness
- Local-first privacy
- Accessibility by default
- Extensibility for new universes
- Durability for offline and low bandwidth scenarios

## Tech Stack
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Optional Framer Motion for animations

## Data Architecture
### Local Layer
- IndexedDB for memory and structured local data
- localStorage for preferences and lightweight state
- Encrypted local credentials

### Optional Server Layer
- PostgreSQL for account sync and shared content
- Next.js Auth for sessions
- APIs for social, communities, and sync

## Request Flow (High Level)
1. UI interaction
2. Local state update
3. Optional API call
4. Realtime broadcast (if enabled)
5. UI reconciliation

## Runtime Concerns
- Prefer local-first reads
- Degrade gracefully without network
- Keep UI responsive with optimistic updates

## Environments
- Local development: .env.local
- Staging: feature flags enabled
- Production: strict telemetry limits and privacy defaults

## Component Hierarchy
- ThemeProvider
- AccessibilityProvider
- RealtimeProvider
- MemoryProvider
- CompanionProvider
- CompanionContextEngineProvider

## Universe Layout Pattern
- AuroraShell
- Surface
- SurfaceHeader
- SurfaceContent

## Testing Strategy (Summary)
- Unit tests for utilities and hooks
- Integration tests for API routes
- E2E tests for critical flows
- Accessibility checks in CI

## Key Files and Folders
- src/app: Universe routes and pages
- src/components: Design system and universe components
- src/lib: Utilities, data, and providers
- docs: Documentation and manuals

## Design Tokens
- Colors: primary, accent, slate scale
- Typography: Inter, consistent scale
- Spacing: 8px grid
- Shadows: layered elevation

See also: AURORA_MANUAL.md, AURORA_DESIGN_CULTURE.md
