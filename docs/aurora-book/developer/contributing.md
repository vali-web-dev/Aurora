# Contributing and Workflow

## Local Setup
- Install dependencies: `npm install`
- Create `.env.local` from `.env.example`
- Run database setup:
	- `npm run db:generate`
	- `npm run db:push`
	- `npm run db:seed`
- Start app: `npm run dev`
- (Optional) Start realtime server: `npm run dev:server` (runs Next.js + Socket.IO on port 3000)
- Use the design system tokens from `src/lib/design-system/tokens.ts`

## Full Rebuild Checklist
1. Verify prerequisites (Node 18+, npm 9+, PostgreSQL 14+)
2. Install dependencies (`npm install`)
3. Configure `.env.local` using `.env.example`
4. Run database bootstrap (`db:generate`, `db:push`, `db:seed`)
5. Start app (`npm run dev`) or combined server (`npm run dev:server`)
6. Start realtime server if enabled (`npm run dev:server`)
7. Validate `/api/health` and `/api/health/db`
8. Load `/docs/aurora-book/developer` for docs runtime check

## Branching and Reviews
- Use feature branches per change
- Keep docs and code in the same PR
- Require at least one review for releases

## Component Development
- Use Tailwind utilities
- Respect light and dark modes
- Ensure accessibility (ARIA, focus, semantics)

## Testing
- Run `npm run lint`
- Run `npm run build` for production checks
- Verify UI with light, dark, and illuminated modes
- Test docs via `/docs/aurora-book/end-user` and `/docs/aurora-book/developer`

## Universe Development
- Create app route
- Use AuroraShell and Surface
- Add navigation entries

## Required Documentation Updates
- Update universe chapter in `/docs/aurora-book/end-user/universes/`
- Update developer manual sections if architecture, API, or data changed
- Add or update quick reference sheets when UX changes

Source: README.md
