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

## Build From Source (Full Cookbook)
### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+ (bundled with Node)
- PostgreSQL 14+ (local or Docker)

### Clone and Install
1. Clone the repo and install dependencies:
	- `npm install`
2. Copy `.env.example` to `.env.local` and set required values.
3. Verify the app can start without DB seed:
	- `npm run dev`
4. Stop the server and proceed with database setup.

### Database Bootstrap
1. Ensure PostgreSQL is running and `DATABASE_URL` is correct.
2. Generate and apply schema:
	- `npm run db:generate`
	- `npm run db:push`
3. Seed baseline data:
	- `npm run db:seed`
4. Verify:
	- `/api/health` and `/api/health/db`

### Local Runtime
1. Start the app:
	- `npm run dev`
2. Optional realtime server (Socket.IO):
	- `npm run dev:server`
	- Runs Next.js + Socket.IO together on port 3000 (do not run `dev` in parallel)
3. Visit `/home`, `/social`, `/learning` for a basic smoke test.

### Production Runtime
- Build: `npm run build`
- Start: `npm run start`
- Optional realtime server: `npm run start:server`

### Custom Server Mode
- `server.js` wraps Next.js with Socket.IO for realtime events.
- Use `dev:server` for local testing, `start:server` for prod.

## System Inventory (Everything That Builds Aurora)
### Runtimes
- Next.js app runtime: `npm run dev` / `npm run start`
- Custom server runtime (Next.js + Socket.IO): `server.js`
- Docs runtime: `/docs/*` via `src/app/docs/[[...path]]/page.tsx`

### Apps (Routes)
- App Router: `src/app/*`
- Universe routes: `src/app/<universe>/` (e.g., `/home`, `/social`)
- Shared system routes: `/auth`, `/settings`, `/dashboard`, `/profile`
- API routes: `src/app/api/*`

### Providers (Global Runtime Stack)
- ThemeProvider: `src/lib/design-system/theme-provider.tsx`
- AccessibilityProvider: `src/lib/accessibility/accessibility-provider.tsx`
- RealtimeProvider: `src/lib/realtime/realtime-provider.tsx`
- MemoryProvider: `src/lib/memory/memory-provider.tsx`
- CompanionProvider: `src/lib/companion/companion-provider.tsx`
- CompanionContextEngineProvider: `src/lib/companion/companion-context-engine.tsx`
- AuroraLogoProvider: `src/lib/brand/aurora-logo-provider.tsx`
- AuthSessionProvider: `src/components/auth/SessionProvider.tsx`

### Services
- Auth: NextAuth (`src/lib/auth.ts`, `src/app/api/auth/*`)
- Realtime: `server.js` + `src/lib/websocket-client.ts` + `src/lib/websocket-server.ts`
- Data: Drizzle ORM (`drizzle.config.ts`, `src/lib/schema.ts`)
- Docs: Markdown API (`src/app/api/docs/[...path]/route.ts`)

### Integrations
- OAuth providers (Google/GitHub) via env config
- Payments (Stripe) via env config
- Email (SendGrid) via env config
- File storage (AWS S3) via env config

### Social Comments
Request:
```bash
curl "http://localhost:3000/api/social/comments?postId=1"
```

- Monitoring (Sentry) via env config

### Widgets & UI Surfaces
- UI primitives: `src/components/aurora/*`
- Surface system: `Surface`, `SurfaceHeader`, `SurfaceSection`

- OS shell: `src/components/os/*`
- Universe components: `src/components/<universe>/*`
- Navigation maps: `src/lib/navigation.ts`, `src/lib/expandable-navigation.ts`

### Data Stores

- PostgreSQL (primary server data)
- localStorage (preferences, theme, accessibility)
- IndexedDB (local-first memory and content cache)

## Runtime Services Catalog
### Core Services
- Next.js app server (App Router)
- NextAuth session service (JWT strategy)
- Drizzle ORM data layer
- Socket.IO realtime server (optional)
- Docs renderer (`/docs/*`) + markdown API

### Platform Services (Optional Integrations)
- Payments (Stripe)
- Email (SendGrid)
- Storage (AWS S3)
- Monitoring (Sentry)

### Background/Utility Jobs
- Database migrations (`db:push` / `db:migrate`)
- Database seed (`db:seed`)
- Social seed scripts (`scripts/seed-social-data.ts`)

### Health and Diagnostics
- `/api/health`
- `/api/health/db`
- Socket.IO endpoint: `/socket.io`

## Universe Build Cookbook
### Global Pattern (All Universes)
1. Create route folder: `src/app/<universe>/page.tsx`.
2. Use `AuroraShell` + `Surface` layout pattern.
3. Add components under `src/components/<universe>/`.
4. Register navigation entries in `src/lib/navigation.ts` and `src/lib/expandable-navigation.ts`.
5. Add API routes under `src/app/api/<universe>/` if needed.
6. Update end-user docs: `/docs/aurora-book/end-user/universes/<id>-<universe>.md`.

### Home
- Route: `src/app/home/page.tsx`
- Components: `src/components/home/*`
- Primary surfaces: dashboard, profile preview, quick actions
- Data: `users`, `personas`, `user_settings`

### Social
- Route: `src/app/social/page.tsx`
- Components: `src/components/social/*`
- APIs: `/api/social/feed`, `/api/social/posts`, `/api/social/comments`, `/api/social/reactions`, `/api/social/comment-reactions`
- Tables: `social_posts`, `social_comments`, `social_reactions`, `social_comment_reactions`
- Realtime: Socket.IO client in Social components

### Learning
- Route: `src/app/learning/page.tsx`
- Components: `src/components/learning/*`
- APIs: `/api/learning/courses`, `/api/learning/courses/[id]`
- Tables: `learning_courses`, `learning_lessons`

### Create
- Route: `src/app/create/page.tsx`
- Components: `src/components/create/*`
- Surfaces: builder, templates, assets
- Tables: `surfaces`, `blocks`, `components`, `surface_components`

### Entertainment
- Route: `src/app/entertainment/page.tsx`
- Components: `src/components/entertainment/*`
- APIs: `/api/entertainment/playlists`, `/api/entertainment/playlists/[id]`
- Tables: `media_items`, `playlists`, `playlist_items`

### Commerce
- Route: `src/app/commerce/page.tsx`
- Components: `src/components/commerce/*`
- APIs: `/api/commerce/products`, `/api/commerce/products/[id]`
- Tables: `commerce_providers`, `products`, `carts`, `cart_items`, `orders`, `payments`
- Integrations: payments, providers

### Productivity
- Route: `src/app/productivity/page.tsx`
- Components: `src/components/productivity/*`
- Surfaces: tasks, notes, calendar
- Tables: `surfaces`, `blocks`, `components`

### Travel
- Route: `src/app/travel/page.tsx`
- Components: `src/components/travel/*`
- Surfaces: trips, itineraries
- Tables: `surfaces`, `blocks`

### Finance
- Route: `src/app/finance/page.tsx`
- Components: `src/components/finance/*`
- Surfaces: budgets, accounts
- Tables: `orders`, `payments` (for spend tracking)

### Health
- Route: `src/app/health/page.tsx`
- Components: `src/components/health/*`
- Surfaces: habits, wellness
- Tables: `surfaces`, `blocks`

### Home Control
- Route: `src/app/homecontrol/page.tsx`
- Components: `src/components/homecontrol/*`
- Surfaces: devices, scenes
- Tables: `surfaces`, `blocks`

### Automation
- Route: `src/app/automation/page.tsx`
- Components: `src/components/automation/*`
- Surfaces: workflows, rules
- Tables: `surfaces`, `blocks`

### Communities
- Route: `src/app/communities/page.tsx`
- Components: `src/components/communities/*`
- APIs: `/api/communities`, `/api/communities/[id]`, `/api/communities/[id]/messages`
- Tables: `communities`, `community_members`, `community_messages`

### Gaming
- Route: `src/app/gaming/page.tsx`
- Components: `src/components/gaming/*`
- Surfaces: library, leaderboards
- Tables: `surfaces`, `blocks`

### Brand
- Route: `src/app/brand/page.tsx`
- Components: `src/components/brand/*`
- APIs: `/api/brand/brands`, `/api/brand/brands/[id]`
- Tables: `brands`

### Identity
- Route: `src/app/identity/page.tsx`
- Components: `src/components/identity/*`
- APIs: `/api/users/profile`, `/api/users/[id]`, `/api/users/change-password`
- Tables: `users`, `personas`, `accounts`, `sessions`, `verification_tokens`

### Realms
- Route: `src/app/realms/page.tsx`
- Components: `src/components/realms/*`
- Surfaces: spaces, experiences
- Tables: `surfaces`, `blocks`

### Luma
- Route: `src/app/luma/page.tsx`
- Components: `src/components/luma/*`
- Surfaces: companion hub
- Tables: `notifications`, `user_settings`

### Developer
- Route: `src/app/developer/page.tsx`
- Components: `src/components/developer/*`
- Surfaces: API keys, webhooks
- APIs: `/api/services`, `/api/services/[id]`, `/api/notifications`

## Local Development Flow
1. Start Next.js app (`npm run dev`)
2. Start WebSocket server if realtime enabled (`npm run dev:server`)
3. Verify `/api/health` and `/api/health/db`
4. Test universes via `/home`, `/social`, `/learning`, etc.

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

## Environment Variables (Source of Truth)
Use `.env.example` as the authoritative list of keys. Minimum required:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
Optional integrations:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`, `EMAIL_FROM`
- `AWS_S3_ACCESS_KEY_ID`, `AWS_S3_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_S3_REGION`
- `SENTRY_DSN`
- `LOG_LEVEL`
- `ENABLE_REAL_TIME`, `ENABLE_PAYMENTS`, `ENABLE_AI_FEATURES`

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

## Build Verification Checklist
- App loads on `/` and `/home`
- Auth routes render at `/auth/signin` and `/auth/signup`
- Docs load at `/docs/aurora-book/developer`
- Health endpoints respond: `/api/health`, `/api/health/db`
- Realtime handshake succeeds when `ENABLE_REAL_TIME=true`

## Deployment Runbook
### Environments
- Local: `.env.local` for secrets and feature flags
- Staging: mirrors production config with test integrations
- Production: minimal logging, strict privacy defaults

### Deploy Steps (Production)
1. Pull latest code and install dependencies (`npm install`)
2. Build app (`npm run build`)
3. Apply DB schema (`npm run db:push` or `npm run db:migrate`)
4. Start server (`npm run start`) or combined server (`npm run start:server`)
5. Verify health endpoints and docs route

### Process Management
- Use a process manager (systemd, PM2, or container runtime)
- Ensure Node process restarts on failure
- Capture stdout/stderr logs

### Observability
- Enable Sentry if available
- Track request latency and error rates
- Monitor database connections

### Backups
- Nightly PostgreSQL backups
- Periodic exports for critical user data
- Validate restore procedure monthly

### Rollback Plan
- Keep previous build artifacts
- Revert schema changes only with known-safe migrations
- Restore DB backup if required

## Production Hardening
### Rate Limiting
- Apply IP-based rate limiting for public endpoints
- Protect `/api/auth/*`, `/api/social/*`, and `/api/users/*`

### Security Headers
- Enable CSP, HSTS, X-Content-Type-Options, X-Frame-Options
- Restrict `connect-src` to approved origins

### Secrets and Rotation
- Store secrets in environment variables or a secret manager
- Rotate `NEXTAUTH_SECRET` and third-party keys periodically

### Database Safety
- Use least-privileged DB roles for runtime access
- Enforce SSL for production DB connections
- Monitor slow queries and connection pools

### Storage and Backups
- Enable versioning for object storage
- Encrypt backups at rest
- Validate restore in staging on a schedule

### Logging and Auditing
- Redact PII in logs
- Audit admin actions and auth events
- Ship logs to centralized storage

## Deployment Examples
### Docker (Single Container)
- Build: `npm install` then `npm run build`
- Start: `npm run start` or `npm run start:server`
- Expose port 3000 and ensure `DATABASE_URL` is set

### systemd (Linux)
- Create a service unit that runs `npm run start:server`
- Set `WorkingDirectory` to repo path
- Set environment via `EnvironmentFile=/etc/aurora/env`
- Enable restart on failure

### PM2
- Start: `pm2 start npm --name aurora -- run start:server`
- Save: `pm2 save`
- Startup: `pm2 startup` for boot persistence

### Nginx (Reverse Proxy)
- Proxy to `http://127.0.0.1:3000`
- Enable WebSocket upgrade headers for `/socket.io`
- Terminate TLS at Nginx and set `X-Forwarded-*` headers

Example:
```nginx
server {
	listen 443 ssl;
	server_name aurora.example.com;

	ssl_certificate /etc/ssl/certs/aurora.crt;
	ssl_certificate_key /etc/ssl/private/aurora.key;

	location / {
		proxy_pass http://127.0.0.1:3000;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location /socket.io/ {
		proxy_pass http://127.0.0.1:3000;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
}
```

### Caddy (Reverse Proxy)
- Simple `reverse_proxy localhost:3000`
- Automatic TLS with ACME
- Supports WebSocket upgrades by default

Example:
```caddyfile
aurora.example.com {
	reverse_proxy localhost:3000
}
```

## Production Checklist
### TLS and Domains
- Confirm TLS certificates are valid and auto-renewed
- Ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` match the public domain

### OAuth Callbacks
- Google/GitHub callbacks point to `https://<domain>/api/auth/callback/<provider>`
- Verify provider client IDs match the environment

### CORS and Origins
- Allow only trusted origins for Socket.IO and API calls
- Set `NEXT_PUBLIC_APP_URL` to the same origin as the UI

### Realtime
- Ensure `/socket.io` is reachable behind the proxy
- Confirm WebSocket upgrade headers are configured

### Database
- Run `db:push` or `db:migrate` before deploy
- Verify `DATABASE_URL` points to production DB

## Incident Response and Rollback
### Incident Response
- Triage: identify scope, affected routes, and severity
- Mitigation: disable feature flags for realtime/payments if unstable
- Communication: notify stakeholders and update status
- Root cause: capture logs, error traces, and recent deploys
- Postmortem: document timeline, fixes, and prevention steps

### Rollback
- Revert to last known-good build artifact
- Roll back DB schema only via known-safe migrations
- Restore last backup if data corruption is suspected
- Verify health endpoints and critical flows after rollback

## Universe Checklists and Tests
### Home
- Checklist: dashboard renders, quick actions load, profile preview shows data
- Tests: load `/home`, confirm `user_settings` read/write

### Social
- Checklist: feed loads, post create works, comments and reactions update
- Tests: `GET /api/social/feed`, `POST /api/social/posts`, realtime handshake

### Learning
- Checklist: course list loads, course detail opens
- Tests: `GET /api/learning/courses`, `GET /api/learning/courses/[id]`

### Create
- Checklist: surfaces render, blocks edit/save
- Tests: verify `surfaces` and `blocks` CRUD via UI

### Entertainment
- Checklist: playlists list and detail render
- Tests: `GET /api/entertainment/playlists`, `GET /api/entertainment/playlists/[id]`

### Commerce
- Checklist: products list render, product detail loads
- Tests: `GET /api/commerce/products`, `GET /api/commerce/products/[id]`

### Productivity
- Checklist: notes/tasks surfaces render
- Tests: UI navigation, no API failures

### Travel
- Checklist: trip surfaces render
- Tests: UI navigation, no API failures

### Finance
- Checklist: financial overview renders
- Tests: UI navigation, no API failures

### Health
- Checklist: wellness surfaces render
- Tests: UI navigation, no API failures

### Home Control
- Checklist: devices and scenes surfaces render
- Tests: UI navigation, no API failures

### Automation
- Checklist: workflows list and detail render
- Tests: UI navigation, no API failures

### Communities
- Checklist: community list loads, messages render
- Tests: `GET /api/communities`, `GET /api/communities/[id]/messages`

### Gaming
- Checklist: library and leaderboards render
- Tests: UI navigation, no API failures

### Brand
- Checklist: brand list loads, brand detail renders
- Tests: `GET /api/brand/brands`, `GET /api/brand/brands/[id]`

### Identity
- Checklist: profile loads, password change available
- Tests: `GET /api/users/profile`, `POST /api/users/change-password`

### Realms
- Checklist: realms surfaces render
- Tests: UI navigation, no API failures

### Luma
- Checklist: companion panel opens, notifications list populates
- Tests: `GET /api/notifications`

### Developer
- Checklist: services list loads
- Tests: `GET /api/services`, `GET /api/services/[id]`

## Environment Variable Matrix
### Core
- `DATABASE_URL`: required in all environments
- `NEXTAUTH_SECRET`: required in all environments
- `NEXTAUTH_URL`: required in all environments
- `NEXT_PUBLIC_APP_URL`: required in all environments

### Feature Flags
- `ENABLE_REAL_TIME`: optional (default false in production until enabled)
- `ENABLE_PAYMENTS`: optional
- `ENABLE_AI_FEATURES`: optional

### Integrations
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: optional
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: optional
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`: optional
- `SENDGRID_API_KEY`, `EMAIL_FROM`: optional
- `AWS_S3_ACCESS_KEY_ID`, `AWS_S3_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_S3_REGION`: optional
- `SENTRY_DSN`: optional

### Recommended Defaults
- Local: use local Postgres, test OAuth keys, `ENABLE_REAL_TIME=true`
- Staging: use staging services, `ENABLE_REAL_TIME=true`, telemetry enabled
- Production: strict secrets, `ENABLE_REAL_TIME` only if Socket.IO is deployed

## API Examples
### Social Feed
Request:
```bash
curl "http://localhost:3000/api/social/feed?universe=social&limit=20"
```

Response:
```json
{
	"posts": [
		{
			"id": 1,
			"authorUserId": 1,
			"universe": "social",
			"content": "Hello Aurora",
			"visibility": "public",
			"metadata": {},
			"createdAt": "2026-02-16T12:00:00.000Z",
			"updatedAt": "2026-02-16T12:00:00.000Z"
		}
	]
}
```

Error:
```json
{
	"error": "Unauthorized"
}
```

### Create Post
Request:
```bash
curl -X POST "http://localhost:3000/api/social/posts" \
	-H "Content-Type: application/json" \
	-d '{"content":"New post","universe":"social","visibility":"public"}'
```

Error:
```json
{
	"error": "Validation failed"
}
```

### Register User
Request:
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
	-H "Content-Type: application/json" \
	-d '{"email":"user@example.com","displayName":"User","password":"password123"}'
```

Response:
```json
{
	"message": "Account created successfully"
}
```

Error:
```json
{
	"message": "Email already registered"
}
```

### User Profile
Request:
```bash
curl "http://localhost:3000/api/users/profile"
```

Response:
```json
{
	"id": 6,
	"email": "user@example.com",
	"name": "User",
	"displayName": "User",
	"image": "https://...",
	"avatarUrl": "https://..."
}
```

Error:
```json
{
	"error": "Unauthorized"
}
```

### User Stats
Request:
```bash
curl "http://localhost:3000/api/users/stats"
```

Response:
```json
{
	"posts": 12,
	"communities": 3,
	"messages": 8,
	"connections": 5
}
```

Error:
```json
{
	"error": "Failed to fetch stats"
}
```

### User Activity
Request:
```bash
curl "http://localhost:3000/api/users/activity"
```

Response:
```json
{
	"activities": [
		{
			"id": "post-1",
			"type": "post",
			"title": "Created a post",
			"description": "Hello Aurora",
			"universe": "social",
			"timestamp": "2026-02-16T12:00:00.000Z"
		}
	]
}
```

Error:
```json
{
	"error": "Failed to fetch activity"
}
```

### Notifications
Request:
```bash
curl "http://localhost:3000/api/notifications?limit=20"
```

Error:
```json
{
	"error": "Unauthorized"
}
```

### Social Comments
Request:
```bash
curl "http://localhost:3000/api/social/comments?postId=1"
```

Response:
```json
{
	"comments": [
		{
			"id": 1,
			"postId": 1,
			"content": "Great update",
			"createdAt": "2026-02-16T12:05:00.000Z"
		}
	]
}
```

Error:
```json
{
	"error": "Failed to fetch comments"
}
```

### Social Reactions
Request:
```bash
curl "http://localhost:3000/api/social/reactions?postId=1"
```

Response:
```json
{
	"reactions": [
		{
			"emoji": "👍",
			"count": 3,
			"userReacted": true
		}
	],
	"summary": {
		"👍": 3
	}
}
```

Error:
```json
{
	"error": "Failed to fetch reactions"
}
```

### Social Comment Reactions
Request:
```bash
curl "http://localhost:3000/api/social/comment-reactions?commentId=1"
```

Response:
```json
{
	"reactions": [
		{
			"emoji": "🔥",
			"count": 2,
			"userReacted": false
		}
	],
	"summary": {
		"🔥": 2
	}
}
```

Error:
```json
{
	"error": "Failed to fetch comment reactions"
}
```

### Community Messages
Request:
```bash
curl "http://localhost:3000/api/communities/1/messages"
```

Response:
```json
{
	"messages": [
		{
			"id": 1,
			"communityId": 1,
			"content": "Welcome to Aurora Creators",
			"createdAt": "2026-02-16T12:10:00.000Z"
		}
	]
}
```

Error:
```json
{
	"error": "Failed to fetch messages"
}
```

### Commerce Products
Request:
```bash
curl "http://localhost:3000/api/commerce/products"
```

Response:
```json
{
	"products": [
		{
			"id": 1,
			"title": "Aurora Premium Subscription",
			"priceCents": 999,
			"currency": "USD"
		}
	]
}
```

Error:
```json
{
	"error": "Failed to fetch products"
}
```

### Communities
Request:
```bash
curl "http://localhost:3000/api/communities"
```

Error:
```json
{
	"error": "Failed to fetch communities"
}
```

### Learning Courses
Request:
```bash
curl "http://localhost:3000/api/learning/courses"
```

Error:
```json
{
	"error": "Failed to fetch courses"
}
```

## Auth and Session Troubleshooting
### Common Errors
- `Unauthorized` on protected routes: user session missing or expired
- OAuth callback mismatch: `NEXTAUTH_URL` or provider callback URL incorrect
- CSRF issues: stale cookies or mismatched domains
- Session token invalid: secret rotated without clearing cookies

### Fixes
- Clear browser cookies and sign in again
- Verify `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` match the domain
- Ensure provider callback URLs match `https://<domain>/api/auth/callback/<provider>`
- Rotate `NEXTAUTH_SECRET` only with a coordinated logout

### Session Health Checks
- `GET /api/auth/session` should return a session when signed in
- `GET /api/users/profile` should return user data

## Database Schema Summary
### Users and Identity
- `users`: primary identity table (email, display name, avatar)
- `personas`: user context modes and preferences
- `accounts`, `sessions`, `verification_tokens`: NextAuth tables

### Brand and Services
- `brands`: brand profile and tone
- `services`: integrated service catalog
- `service_integrations`: per-user service connections

### Surfaces and Components
- `surfaces`: saved UI surfaces
- `blocks`: layout blocks inside surfaces
- `components`: reusable UI components
- `surface_components`: component placement instances

### Media and Entertainment
- `media_items`: media catalog entries
- `playlists`: curated media groups
- `playlist_items`: playlist membership

### Commerce
- `commerce_providers`: payment and shop providers
- `products`: product catalog
- `carts`, `cart_items`: shopping carts
- `orders`, `payments`: checkout and transaction records

### Social and Communities
- `communities`: community registry
- `community_members`: membership records
- `community_messages`: community chat messages
- `social_posts`, `social_comments`: social feed content
- `social_reactions`, `social_comment_reactions`: engagement signals

### Learning
- `learning_courses`: course catalog
- `learning_lessons`: course lessons
- `learning_progress`: learner progress

### Automation and Agents
- `agents`: agent configurations
- `routines`: scheduled automation routines

### Notifications and Settings
- `notifications`: user notification feed
- `user_settings`: per-user preferences

## Migration and Backfill Practices
### Migration Workflow
- Update schema in `src/lib/schema.ts`
- Generate or inspect diff with `db:generate` (optional)
- Apply changes with `db:push` (dev) or `db:migrate` (prod)
- Verify with `/api/health/db` and smoke tests

### Backfill Guidance
- Use idempotent scripts for data backfills
- Keep backfills small and resumable
- Log progress and sample results
- Avoid locking large tables during peak usage

### Roll Forward Strategy
- Prefer additive migrations (new columns/tables)
- Deprecate old fields before removal
- Backfill then switch reads to new fields

## Pagination and Filtering Patterns
### List Endpoints
- Use `limit` and `offset` for basic pagination
- Default `limit` to 20 with max 100
- Support `sort` and `order` where applicable

Example:
```bash
curl "http://localhost:3000/api/social/feed?universe=social&limit=20&offset=0"
```

### Filtering
- Use query params such as `universe`, `status`, `unreadOnly`
- Validate filter values server-side

Example:
```bash
curl "http://localhost:3000/api/notifications?limit=20&unreadOnly=true"
```

## Data Retention and Archival
### Retention Principles
- Keep only necessary data for core features
- Allow users to export and delete their data
- Prefer anonymization over deletion when safe

### Suggested Retention Windows
- Auth sessions: 30 days (default)
- Notifications: 90 days
- Activity logs: 180 days
- Audit logs: 365 days

### Archival Strategy
- Export old records to cold storage
- Keep archive metadata in Postgres
- Provide on-demand restore paths

## Testing and CI Strategy
### Tooling
- Unit: `npm run lint` + TypeScript checks
- Integration: API route tests
- E2E: critical flows for auth, social, commerce
- Accessibility: automated checks for WCAG

### CI Steps
1. Install dependencies
2. Run lint
3. Run build
4. Run integration tests
5. Run E2E smoke tests

### Environments
- Run tests against a seeded local database
- Ensure feature flags are deterministic in CI

## Observability and SLOs
### Core Dashboards
- API latency (p50, p95, p99)
- Error rates by route group
- Auth success/failure rates
- Realtime connection counts
- Database query latency and connection pools

### Suggested SLOs
- API success rate: 99.5% monthly
- Auth success rate: 99.7% monthly
- p95 latency: < 500ms for core APIs
- Realtime connection stability: < 1% disconnects per minute

### Alerting
- Page on auth outage or DB connection spikes
- Warn on elevated error rates (>1% for 5 minutes)
- Warn on p95 latency > 750ms

## Data Export and Deletion Controls
### Export Policy
- Require re-authentication for exports
- Allow export of user profile, posts, and settings
- Provide machine-readable formats (JSON/CSV)

### Deletion Policy
- Require explicit confirmation and re-authentication
- Cascade delete user-owned data where possible
- Anonymize shared content if full deletion breaks integrity

### Audit Trail
- Log export and deletion events
- Store audit records for 12 months

## Rate Limit Policy
### Public Endpoints
- `/api/auth/*`: 10 requests per minute per IP
- `/api/users/*`: 60 requests per minute per user
- `/api/social/*`: 120 requests per minute per user

### Admin and Sensitive
- `/api/users/change-password`: 5 requests per minute per user
- `/api/auth/callback/*`: 10 requests per minute per IP

### Realtime
- Socket.IO connection attempts: 20 per minute per IP
- Message send events: 60 per minute per user

## Privacy Impact Assessment Checklist
### Data Collection
- Define the minimal data required for the feature
- Document data sources and retention windows

### User Controls
- Provide opt-in/opt-out where appropriate
- Ensure export and deletion options are documented

### Access and Sharing
- Restrict access by role and universe scope
- Document third-party sharing (if any)

### Risk Review
- Evaluate re-identification risk
- Ensure logs redact PII

## Compliance Mapping (Overview)
### GDPR
- Lawful basis documented for each data category
- Data subject access and deletion supported
- Data retention limits enforced
- Data processing records maintained

### CCPA
- Provide disclosure of collected data categories
- Support data access and deletion requests
- Honor “Do Not Sell/Share” if applicable

## Incident Communication Template
### Initial Notice
- Summary: what happened and when it started
- Impact: affected systems and user scope
- Status: mitigation in progress

### Ongoing Updates
- Timeline of actions taken
- Next update time
- Workarounds (if any)

### Resolution
- Root cause summary
- Fixes applied
- Preventive actions

## SRE On-Call Playbook
### Triage
- Confirm incident severity and scope
- Check health endpoints and recent deploys
- Review error rate and latency dashboards

### Mitigation
- Roll back or disable feature flags as needed
- Restart services if health checks fail
- Isolate failing dependencies

### Escalation
- Page database or auth owners for DB/auth outages
- Notify stakeholders if user impact exceeds SLA

### Recovery
- Validate critical user flows
- Document resolution steps and timestamps

## Dependency Upgrade Policy
### Cadence
- Weekly patch updates
- Monthly minor updates
- Quarterly major updates (with staging validation)

### Process
- Run lint/build/test suite before merge
- Validate auth and realtime flows in staging
- Update `CHANGELOG.md` with dependency changes

## Release Management and Versioning
### Versioning
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Tag releases in Git and update `CHANGELOG.md`
- Release notes required for MINOR and MAJOR

### Release Steps
1. Create a release branch
2. Run full test suite and build
3. Update `CHANGELOG.md` and release notes
4. Deploy to staging and validate
5. Promote to production

## QA Test Matrix
### Authentication
- Sign in, sign out, session refresh
- OAuth callbacks and credentials flow

### Social
- Feed load, create post, comments, reactions
- Realtime updates appear

### Commerce
- Product list and detail views
- Cart and order summary render

### Learning
- Course list and detail pages
- Progress updates

### Communities
- Community list and message view
- Membership join/leave

### System
- Docs render correctly
- Theme switching (light/dark/illuminated)

## Security Review Checklist
### Authentication and Authorization
- Verify access control for new routes
- Ensure privilege checks on admin actions

### Data Protection
- Validate input with schema checks
- Encrypt sensitive fields at rest when required
- Redact PII from logs

### Dependency Risk
- Run dependency audit before release
- Pin versions for security-critical packages

### Realtime and Webhooks
- Validate event payloads and signatures
- Rate-limit external callbacks

## Support Escalation Runbook
### Severity Levels
- Sev 1: platform down or data loss
- Sev 2: critical feature failure
- Sev 3: degraded performance or UX issues

### Escalation Steps
- Triage issue and assign owner
- Collect logs, timestamps, and reproduction steps
- Notify stakeholders for Sev 1/2
- Provide interim workaround when possible

## Performance Optimization Guide
### Frontend
- Use dynamic imports for heavy components
- Avoid unnecessary client components
- Defer non-critical animations
- Keep images optimized and lazy-loaded

### API
- Batch related queries
- Use indexes on frequently queried columns
- Cache read-heavy endpoints
- Limit payload size and compress responses

### Realtime
- Throttle chat and feed events
- Debounce client emits for typing indicators
- Disconnect idle sockets

## Disaster Recovery Plan
### Preparation
- Maintain daily database backups
- Store backups in a separate region
- Document restore steps and owners

### Recovery Steps
1. Declare incident and freeze deploys
2. Restore last known-good backup
3. Validate health endpoints and core flows
4. Communicate recovery status

## Data Governance and Access Policy
### Data Classification
- Public: non-sensitive content and marketing data
- Internal: operational data and metrics
- Sensitive: user PII, auth tokens, financial data

### Access Controls
- Enforce least privilege for database and admin tools
- Require MFA for admin access
- Log privileged actions

### Data Sharing
- Document all third-party processors
- Ensure contracts define data handling responsibilities
- Review access quarterly

## API Deprecation Policy
### Deprecation Window
- Announce at least 90 days before removal
- Provide migration guidance and examples

### Versioning
- Add new endpoints or parameters before removing old ones
- Avoid breaking changes in PATCH/MINOR releases

### Retirement
- Remove endpoints after the deprecation window
- Update docs and release notes

## Secrets Management Guide
### Environment Separation
- Use distinct secrets for local, staging, and production
- Never reuse `NEXTAUTH_SECRET` across environments

### Storage
- Prefer a secrets manager (e.g., cloud KMS)
- Avoid committing secrets to git or docs

### Rotation
- Rotate OAuth and API keys quarterly
- Rotate database passwords on personnel changes

## Change Management Checklist
### Before Change
- Impact assessment completed
- Rollback plan documented
- Feature flag ready (if needed)

### During Change
- Deploy to staging and validate
- Monitor error rates and latency

### After Change
- Update docs and release notes
- Confirm no regressions in core flows

## Compatibility and Support Matrix
### Runtime
- Node.js: 18.x LTS
- npm: 9.x or later
- PostgreSQL: 14.x or later

### Browsers
- Latest Chrome, Edge, Firefox, Safari
- Mobile: latest iOS and Android browsers

## New Developer Onboarding
### Setup
- Install Node 18+ and PostgreSQL 14+
- Clone repo, run `npm install`
- Configure `.env.local` from `.env.example`
- Run `npm run db:push` and `npm run db:seed`
- Start `npm run dev` or `npm run dev:server`

### First Day Tasks
- Load `/docs/aurora-book/developer`
- Verify `/home`, `/social`, `/learning`
- Run `npm run lint`

## Feature Flag Reference
### `ENABLE_REAL_TIME`
- Enables Socket.IO realtime events
- Requires `dev:server` or `start:server`

### `ENABLE_PAYMENTS`
- Enables commerce payment flows
- Requires Stripe keys

### `ENABLE_AI_FEATURES`
- Enables AI/automation experiences
- Requires AI provider configuration (if used)

## Developer FAQ
### Why do I see `Unauthorized` on APIs?
- You must be signed in; session cookies are required.

### Why does `db:push` fail with auth errors?
- Check `DATABASE_URL` and ensure `.env.local` is loaded.

### Why does realtime not connect?
- Use `npm run dev:server` so Socket.IO is available.

## Theme and Accessibility Config
### Theme Mode
- Stored in `localStorage` as `aurora-theme-mode`
- Values: `light`, `dark`, `illuminated`, `system`

### Theme Family
- Stored in `localStorage` as `aurora-theme-family`
- Values: `home`, `office`, `outdoor`, `lifestyle`, `creative`

### Accessibility Settings
- Stored in `localStorage` as `aurora-accessibility`
- Keys: `highContrast`, `reducedMotion`, `largeText`, `keyboardNav`, `screenReaderMode`

## Module Ownership Map
### Core Platform
- `src/app`: routing and universe pages
- `src/components/os`: shell and navigation
- `src/lib`: providers, auth, db, realtime

### Universes
- `src/components/<universe>`: universe-specific UI
- `src/app/<universe>`: universe routes

### Docs
- `docs/aurora-book`: manuals and references

## Local Dev Troubleshooting
### App Won't Start
- Check Node version (18+)
- Delete `.next` and restart

### Auth Errors
- Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- Clear cookies and re-sign in

### Database Errors
- Confirm `DATABASE_URL` and Postgres status
- Run `npm run db:push`

### Realtime Issues
- Use `npm run dev:server` to enable Socket.IO
- Ensure `/socket.io` is reachable

## Performance Budget
### Frontend
- Keep initial JS bundle under 250 KB gzip
- Target LCP < 2.5s on desktop

### API
- p95 latency < 500ms for core endpoints
- Error rate < 1% over 5 minutes

### Realtime
- Connection establishment < 1s
- Message delivery < 250ms for core events

## Data Seeding Strategy
### When to Seed
- Use `db:seed` for local development and demos
- Avoid seeding in production unless explicitly required

### When to Migrate
- Use `db:push` for local dev schema changes
- Use `db:migrate` for production schema changes

### Idempotency
- Seed scripts must be idempotent
- Use unique keys and upserts to avoid duplicates

## Accessibility and Performance Testing Checklist
### Accessibility
- Verify keyboard navigation and focus states
- Run contrast checks for light/dark/illuminated modes
- Confirm screen reader labels for interactive controls

### Performance
- Run Lighthouse on key routes
- Measure bundle size after major changes
- Validate p95 API latency thresholds

## API Versioning and Compatibility
### Strategy
- Keep endpoints stable; add new fields instead of breaking changes
- Deprecate before removing or renaming fields

### Client Compatibility
- Avoid removing fields relied on by mobile clients
- Document defaults for new fields

### Versioning Patterns
- Use URL versioning only for major breaking changes
- Prefer feature flags for incremental rollout

## UI Component Documentation Checklist
### Component Definition
- Purpose and usage
- Props and defaults
- Accessibility notes

### Visual States
- Hover/active/focus states
- Light/dark/illuminated variants

### Integration
- Example usage in a universe surface
- Test coverage or manual verification steps

## Rollout Strategy
### Feature Flags
- Launch new universes behind a flag
- Gradually enable for internal users, then beta, then public

### Data Readiness
- Seed baseline content before public launch
- Verify analytics and monitoring coverage

### Communication
- Update release notes and docs
- Provide migration steps for admins

## Monitoring and Alert Runbook
### Metrics
- API error rate, latency, and throughput
- WebSocket connection count and disconnects
- Database CPU, memory, connection usage

### Alerts
- Error rate > 1% for 5 minutes
- p95 latency > 750ms for 5 minutes
- DB connections > 80% for 5 minutes

### Response Steps
- Acknowledge alert and confirm scope
- Check recent deploys and logs
- Apply mitigation or rollback

## Localization and Internationalization
### Content Strategy
- Keep UI copy centralized in a localization layer
- Avoid hard-coded strings in components

### Formatting
- Use locale-aware date and number formatting
- Store user locale preferences in `user_settings`

### RTL Support
- Test layouts for right-to-left locales
- Ensure icons and spacing mirror correctly

## Data Model Change Process
### Proposal
- Document the change and impacted universes
- Define migration and backfill plan

### Review
- Validate with data and security owners
- Confirm API compatibility

### Implementation
- Update `schema.ts` and run `db:generate`
- Apply changes with `db:push` or `db:migrate`
- Update docs and release notes

## Marketplace and Integration Approval
### Intake
- Collect integration purpose, data access scope, and contact owner
- Validate security and privacy requirements

### Review
- Security review of OAuth scopes and data usage
- Performance impact assessment

### Approval
- Approve in staging first
- Document allowed scopes and rate limits

## Vulnerability Response Plan
### Detection
- Monitor dependency audits and security advisories
- Track Sentry and log anomalies

### Response
- Patch critical vulnerabilities within 24-48 hours
- Hotfix and redeploy if needed

### Verification
- Re-run tests and audits
- Document resolution in `CHANGELOG.md`

## AI Governance and Model Usage
### Principles
- AI is optional and user-controlled
- No training on user data without consent

### Model Policy
- Document model providers and versions
- Log prompts and responses with redaction

### Safety Controls
- Apply content filters and rate limits
- Provide user feedback and reporting channels

## Data Residency and Regional Compliance
### Residency
- Store data in region chosen by the user or organization
- Keep backups in the same region when required

### Compliance
- Map data flows for each region
- Ensure cross-border transfer agreements

## Feature Flag Rollout Checklist
### Preparation
- Define flag name and default state
- Identify affected routes and APIs

### Rollout
- Enable for internal users first
- Monitor error rate and latency
- Expand to beta, then full release

### Cleanup
- Remove flag once fully rolled out
- Update docs and release notes

## Legacy Data Import Strategy
### Planning
- Define source system mappings
- Identify required transformations

### Execution
- Run imports in batches
- Validate records and reconcile counts

### Verification
- Spot-check imported records
- Re-run failed batches

## API Authentication Patterns
### Session-Based
- Default for user-facing routes
- Uses NextAuth session cookies

### Bearer Tokens
- Use for service-to-service requests
- Validate token signature and scope

### Service Tokens
- Short-lived tokens for internal jobs
- Rotate tokens regularly

## Data Quality Monitoring
### Validation
- Validate required fields on ingest
- Enforce schema constraints in `schema.ts`

### Monitoring
- Track null rates and missing fields
- Alert on sudden drops or spikes

### Remediation
- Backfill missing fields
- Fix source mappings and rerun imports

## Auditing and Compliance Logging
### Audit Events
- Auth sign-in/sign-out
- Data export and deletion
- Admin role changes

### Log Hygiene
- Redact PII and tokens
- Store logs in immutable storage
- Retain logs per compliance requirements

## Data Lifecycle (Overview)
### Stages
- Collection -> Validation -> Storage -> Usage -> Retention -> Deletion

### Ownership
- Users can request export and deletion
- Admins can audit access and changes

## Disaster Recovery Drills
### Schedule
- Quarterly recovery drills
- Annual full restore simulation

### Checklist
- Restore last backup into staging
- Validate schema and core flows
- Document recovery time and data loss

## UI Component Deprecation Checklist
### Planning
- Identify dependent components and routes
- Provide replacement component

### Communication
- Announce deprecation in release notes
- Provide migration steps

### Retirement
- Remove old component after deprecation window
- Clean up docs and usage references

## Data Model Glossary and Naming
### Naming Conventions
- Tables: snake_case plural (e.g., `social_posts`)
- Columns: snake_case (e.g., `created_at`)
- Foreign keys: `<table>_id`

### Glossary
- **Universe**: a domain area (Home, Social, Learning)
- **Surface**: a composed UI workspace
- **Block**: a building unit inside a surface
- **Persona**: a user mode/context

## Performance Regression Triage
### Detection
- Compare p95 latency against baseline
- Check bundle size and LCP changes

### Triage Steps
- Identify recent deploy or dependency change
- Isolate routes with elevated latency
- Roll back if regression exceeds budget

## Search and Indexing Strategy
### Database Indexing
- Index foreign keys and frequently queried columns
- Review query plans for social feed and activity endpoints

### Full-Text Search
- Use Postgres full-text search for basic search
- Consider external search service for large catalogs

## Cache Invalidation Policy
### Principles
- Prefer short-lived caches for user-specific data
- Invalidate on write for critical resources

### Examples
- Invalidate social feed cache on new post
- Invalidate notifications cache on new notification

## Realtime Event Catalog
### Event Types
- `POST_CREATE`, `POST_UPDATE`, `POST_DELETE`
- `POST_COMMENT`, `POST_REACTION`
- `FEED_UPDATE`, `PRESENCE_UPDATE`

### Payload Guidelines
- Include `userId`, `timestamp`, and `universe` where applicable
- Keep payloads small and normalized
- Avoid sending sensitive data

## Service Health and Maintenance
### SLA Targets
- API availability: 99.5%
- Realtime availability: 99.0%

### Maintenance Windows
- Schedule weekly low-traffic maintenance
- Announce planned downtime 72 hours in advance

## Cost Management and Budgeting
### Spend Tracking
- Monitor database, storage, and egress costs
- Set monthly budget alerts

### Optimization
- Use caching to reduce API load
- Archive old data to cheaper storage

## Data Anonymization Guidelines
### Principles
- Remove direct identifiers (email, name) when possible
- Hash or tokenize IDs for analytics

### Usage
- Apply anonymization before sharing datasets
- Maintain a re-identification policy

## Uptime Monitoring Checklist
### Monitoring
- Ping `/api/health` and `/api/health/db` every minute
- Track error rate and latency

### Alerting
- Alert on 5xx spikes
- Alert if health checks fail twice in a row

## Data Deletion Verification
### Workflow
- Run deletion job
- Verify user data removed from primary tables
- Confirm audit log entry exists

## API Throttling and Abuse Prevention
### Throttling
- Apply per-IP and per-user limits
- Use exponential backoff on repeated failures

### Abuse Detection
- Monitor repeated failed login attempts
- Detect bursts of write requests

## Data Export Verification
### Workflow
- Generate export artifact
- Validate schema and counts
- Notify user on completion

## Pagination Response Schema
### Example
```json
{
	"data": [],
	"pagination": {
		"limit": 20,
		"offset": 0,
		"total": 0
	}
}
```

## Privacy Request Runbook
### Intake
- Verify requester identity
- Log the request and timestamp

### Processing
- Run export or deletion workflow
- Confirm completion in audit logs

### Response
- Notify user of completion
- Provide export download link if requested

## Migration Rollback Checklist
### Before Rollback
- Confirm impact and scope
- Identify last known-good migration

### Rollback
- Apply rollback migration
- Validate schema integrity

### After Rollback
- Run smoke tests
- Monitor error rates

## Incident Postmortem Template
### Summary
- What happened and impact

### Timeline
- Key events and timestamps

### Root Cause
- Primary cause and contributing factors

### Action Items
- Preventive changes and owners

## Data Lineage and Ownership
### Lineage
- User inputs -> APIs -> Postgres -> UI surfaces
- Exports and analytics consume curated datasets

### Ownership
- Product owners approve schema changes
- Security reviews data access and retention
- Engineering owns data pipelines

## Support Ticket Classification
### Categories
- Auth and access
- Payments and billing
- Data export and deletion
- Performance and outages

### Routing
- Auth issues -> identity owner
- Data issues -> database owner
- Payments -> commerce owner

## Feature Flag Kill-Switch Policy
### Purpose
- Disable unstable features immediately
- Reduce user impact during incidents

### Process
- Define kill-switch owners per feature
- Document how to toggle flags in each environment

## Customer Communication SLA
### Response Targets
- Sev 1: initial response within 30 minutes
- Sev 2: initial response within 2 hours
- Sev 3: initial response within 24 hours

### Updates
- Provide updates at least every 4 hours for Sev 1
- Publish post-incident summary within 72 hours

## Billing and Subscription Data Flow
### Flow
- Product catalog -> cart -> order -> payment
- Payment provider returns status and receipt

### Storage
- `products`, `orders`, `payments` tables
- Provider payload stored in `provider_payload`

## Usage Analytics Policy
### Collection
- Collect only aggregated usage metrics
- Avoid storing raw content in analytics

### Retention
- Keep analytics for 12 months
- Anonymize data before sharing

## User Consent Management
### Consent Types
- Analytics
- Marketing
- AI features

### Enforcement
- Store consent state in `user_settings`
- Respect opt-out across all universes

## Data Breach Notification Procedure
### Detection
- Identify scope and affected data
- Confirm incident timeline

### Notification
- Notify users and regulators within required windows
- Provide remediation steps

## Device and Session Management
### Sessions
- Expire sessions after 30 days by default
- Allow user-initiated session revocation

### Devices
- Track device metadata for security alerts
- Notify users of new device sign-ins

## Secure Coding Checklist
### Input Handling
- Validate all request bodies and query params
- Sanitize any user-generated content

### Auth and Access
- Enforce role checks on protected routes
- Avoid leaking sensitive errors

## Dependency Licensing Policy
### Allowed Licenses
- MIT, Apache-2.0, BSD-2/3
- Avoid copyleft in core platform

### Review
- Review licenses on each new dependency
- Document exceptions in `CHANGELOG.md`

## Data Access Audit Process
### Scope
- Audit admin data access quarterly
- Review logs for unusual access patterns

### Reporting
- Summarize findings and remediation steps
- Track owner and completion status

## Feature Monitoring Dashboard Checklist
### Metrics
- Feature usage counts
- Error rates by feature
- Latency by feature entrypoint

### Alerts
- Alert when usage drops > 30% week-over-week
- Alert when feature error rate exceeds 1%

## Data Encryption Policy
### At Rest
- Encrypt database storage where possible
- Encrypt backups at rest

### In Transit
- Enforce TLS for all external connections
- Require SSL for database connections

## Backup Validation Checklist
### Routine
- Restore a backup into staging monthly
- Verify schema and critical data

### Reporting
- Record recovery time and data loss
- Track issues and remediation

## Data Masking for Non-Prod
### Policy
- Mask PII before using production data in staging
- Use synthetic data for demos

### Techniques
- Hash emails and tokens
- Redact names and addresses

## Secrets Rotation Schedule
### Frequency
- OAuth keys: quarterly
- Database passwords: quarterly or on staff changes
- `NEXTAUTH_SECRET`: semi-annually

### Process
- Rotate in staging first
- Update `.env` and restart services
- Confirm auth and integrations still work

## Service Dependency Map
### Core
- UI -> Next.js -> API routes
- API routes -> Drizzle -> PostgreSQL
- Realtime -> Socket.IO -> API events

### Integrations
- Commerce -> Stripe
- Email -> SendGrid
- Storage -> S3

## Cache Warmup Strategy
### Startup
- Preload home and social feed data
- Warm frequently used queries

### After Deploy
- Run a warmup script against key routes
- Validate cache hit ratios

## Developer Support Onboarding
### Roles
- Primary on-call developer
- Secondary escalation contact

### Access
- Grant read access to logs and dashboards
- Provide runbooks and escalation paths

## Database Connection Pooling
### Policy
- Use connection pooling in production
- Set max connections based on DB capacity

### Monitoring
- Track pool saturation and wait times
- Alert on connection exhaustion

## Post-Release Monitoring Checklist
### First 30 Minutes
- Check error rates and latency
- Verify auth and social flows

### First 24 Hours
- Monitor dashboards for regressions
- Review logs for new warnings

## Deploy Verification by Universe
### Home
- `/home` loads, dashboard widgets render

### Social
- `/social` loads, feed API returns 200

### Learning
- `/learning` loads, courses API returns 200

### Commerce
- `/commerce` loads, products API returns 200

### Communities
- `/communities` loads, messages API returns 200

## Maintenance Mode Plan
### Activation
- Enable maintenance flag in config
- Show maintenance banner in UI

### Recovery
- Disable maintenance flag
- Verify health endpoints

## Release Artifact Signing
### Policy
- Sign production build artifacts
- Store signing keys in a secure vault

### Verification
- Verify signature before deployment
- Reject unsigned artifacts

## Configuration Drift Detection
### Detection
- Compare runtime config against expected baselines
- Alert on unexpected changes in env vars

### Remediation
- Restore approved configuration
- Document drift cause

## Secrets Access Audit Plan
### Scope
- Review access to secrets quarterly
- Verify least privilege for service accounts

### Reporting
- Document who accessed what and when
- Remediate excessive access

## Infrastructure Capacity Planning
### Baselines
- Track peak concurrent users
- Monitor CPU, memory, and DB utilization

### Scaling
- Scale app instances based on CPU and latency
- Scale DB with read replicas when needed

## Data Portability Policy
### Principles
- Provide export in machine-readable formats
- Allow users to download their data on request

### Scope
- Profile, social content, and settings
- Exclude internal system metadata where appropriate

## Service Retirement Plan
### Planning
- Announce retirement at least 90 days ahead
- Provide migration paths and alternatives

### Execution
- Disable new signups to retiring service
- Archive or migrate existing data

## Architecture Decision Records
### When to Create
- New integrations or major architecture changes
- Data model shifts or API versioning changes

### Format
- Context, decision, alternatives, consequences
- Store in `/docs/adr/`

## Zero-Downtime Deployment Checklist
### Preparation
- Ensure migrations are backward compatible
- Deploy with feature flags disabled

### Deployment
- Roll out in batches
- Monitor error rates and latency

### Validation
- Verify core flows and health endpoints

## Dependency Pinning Policy
### Lockfiles
- Commit `package-lock.json`
- Avoid manual edits to lockfiles

### Upgrades
- Pin major versions until validated
- Document breaking changes in release notes

## Performance Regression Testing
### Approach
- Run Lighthouse before and after major changes
- Compare p95 API latency to baseline

### Thresholds
- Block release if p95 latency regresses > 20%
- Block release if LCP regresses > 300ms

## Migration Review Checklist
### Schema Changes
- Verify new tables/columns have indexes where needed
- Ensure migrations are reversible

### Data Impact
- Confirm backfill plan
- Estimate migration runtime

## Feature Rollback Criteria
### Triggers
- Error rate exceeds 1% for 10 minutes
- Latency exceeds p95 budget by 20%

### Actions
- Disable feature flag
- Roll back deploy if needed

## Observability Instrumentation Standards
### Logging
- Use structured logs with request IDs
- Avoid logging PII

### Metrics
- Emit counters for errors and key actions
- Track latency histograms for core routes

## Support Tooling Overview
### Tools
- Logs dashboard (Sentry or equivalent)
- Uptime monitor
- Support ticket system

## Universe SLO Targets
### Home
- Availability: 99.5%
- p95 latency: < 500ms

### Social
- Availability: 99.0%
- Realtime update delivery: < 1s

### Learning
- Availability: 99.5%
- p95 latency: < 600ms

### Commerce
- Availability: 99.9%
- Checkout success rate: 99.5%

## Customer Data Access Checklist
### Verification
- Confirm requester identity
- Verify scope of request

### Fulfillment
- Export requested datasets
- Log export in audit trail

## Database Indexing Review Guide
### Review Steps
- Identify slow queries and missing indexes
- Add indexes on foreign keys and high-cardinality fields

### Validation
- Compare query plans before and after
- Monitor write amplification

## Developer Handoff Checklist
### Documentation
- Update developer manual and release notes
- Document feature flags and defaults

### Knowledge Transfer
- Record walkthrough or demo
- Assign future owner

## Secure Deployment Checklist
### Pre-Deploy
- Validate secrets and env vars
- Run `npm run build` and smoke tests

### Deploy
- Use signed artifacts
- Apply DB migrations before app start

## UI Regression Testing Checklist
### Visual
- Check layout in light/dark/illuminated modes
- Verify responsive breakpoints

### Interaction
- Validate navigation and forms
- Confirm focus and keyboard navigation

## Data Integrity Validation Checklist
### Checks
- Verify foreign key integrity
- Ensure required fields are non-null

### Audits
- Run periodic consistency checks
- Log anomalies for review

## Release Readiness Checklist
### Functional
- All critical flows tested
- No open Sev 1/2 issues

### Operational
- Monitoring and alerting configured
- Backups verified

## Schema Evolution Policy
### Principles
- Prefer additive changes over destructive
- Deprecate before removal

### Process
- Update schema and run `db:generate`
- Apply migrations and validate

## Rollback Communication Plan
### Internal
- Notify incident channel
- Update on-call and stakeholders

### External
- Post status update
- Share impact and recovery ETA

## Testing Coverage Targets
### Expectations
- Unit test coverage: 70%+ on core utilities
- Integration coverage on critical APIs

### Enforcement
- Block release if coverage drops by > 5%
- Track coverage trends in CI

## Security Incident Escalation
### Levels
- Sev 1: active exploit or data loss
- Sev 2: suspected breach or critical vuln

### Escalation
- Notify security owner immediately
- Involve legal and comms if user impact

## Backup Rotation Policy
### Retention
- Daily backups kept for 30 days
- Weekly backups kept for 90 days
- Monthly backups kept for 12 months

### Storage
- Store in encrypted, access-controlled storage
- Replicate to secondary region

## On-Call Handover Checklist
### Handover
- Summarize open incidents and alerts
- Share recent deploys and changes

### Tools
- Verify access to dashboards and logs
- Confirm escalation contacts

## Feature Ownership Registry
### Template
- Feature name
- Primary owner
- Secondary owner
- Slack/Email contact

## Release Post-Checklist
### Follow-up
- Confirm monitoring is stable
- Close completed tickets
- Update status page

## Design System Change Review
### Review Checklist
- Validate typography and spacing tokens
- Check contrast in all modes
- Update component docs and examples

## Data Reconciliation Checklist
### Verification
- Compare source and destination counts
- Validate key fields and totals

### Remediation
- Re-run missing batches
- Log reconciliation results

## Accessibility Review Checklist
### Interaction
- Ensure keyboard navigation works
- Confirm focus states are visible

### Semantics
- Provide ARIA labels for controls
- Test screen reader flow

## Privacy Review Checklist
### Data Fields
- Validate minimal data collection
- Document retention and consent

### Sharing
- Verify third-party data sharing details
- Update privacy docs if needed

## Release Notes Template
### Sections
- Highlights
- New Features
- Fixes
- Known Issues

## Docs Update Checklist
### Required Updates
- Developer manual sections updated
- End-user universes updated
- Quick reference sheets refreshed

## Support Escalation Contact Template
### Contacts
- Primary on-call: name/email
- Secondary on-call: name/email
- Security owner: name/email

## Feature QA Sign-Off Checklist
### Requirements
- Acceptance criteria validated
- Regression tests passed
- Accessibility checks complete

## Customer Impact Assessment
### Scope
- Identify affected universes and user segments
- Estimate duration and severity

### Mitigation
- Prepare rollback plan
- Communicate expected impact

## Maintenance Announcement Template
### Template
- Date/time window
- Expected impact
- Status page link

## Deployment Change Log Policy
### Expectations
- Record all production changes
- Include deploy time and owner

### Format
- Date, summary, impacted universes

## On-Call Readiness Checklist
### Preparation
- Confirm alert access
- Review current incidents

### During Shift
- Monitor dashboards hourly
- Update incident notes

## Product Readiness Checklist
### Requirements
- Features complete and tested
- Documentation updated

### Launch
- Monitoring configured
- Rollback plan ready

## Release Downtime Communication
### Plan
- Notify users 72 hours before downtime
- Post reminders 24 hours and 1 hour prior

## Feature Launch Review Checklist
### Review
- Validate UX and accessibility
- Confirm analytics and monitoring

## Post-Incident Customer Update
### Template
- Summary of impact
- Resolution and next steps

## Platform Governance Charter
### Purpose
- Oversee platform policy changes
- Review ethics and privacy impacts

### Membership
- Product, security, legal, and engineering

## Moderation Escalation Policy
### Levels
- Tier 1: standard content review
- Tier 2: sensitive or urgent cases

### Process
- Escalate within 24 hours for Tier 2
- Document decisions and outcomes

## Trust and Safety Reporting Flow
### Intake
- In-app report form
- Auto-acknowledge receipt

### Review
- Triage within 24 hours
- Escalate high-risk reports

## Model Risk Assessment Checklist
### Scope
- Identify model use cases and data inputs
- Evaluate potential harms

### Mitigation
- Add guardrails and human review
- Document monitoring plans

## AI Incident Response
### Detection
- Identify harmful outputs or policy violations
- Triage severity and scope

### Response
- Disable AI features via flag
- Notify governance council

## Moderation QA Checklist
### Quality
- Sample decisions for consistency
- Verify escalation timelines

### Safety
- Check for bias and fairness
- Confirm appeals workflow works

## Consent Audit Checklist
### Review
- Verify consent state matches user settings
- Check consent logs for anomalies

### Actions
- Correct mismatched consent flags
- Notify user if needed

## Data Classification Handling Guide
### Public
- No restrictions beyond standard logging

### Internal
- Limit access to internal teams

### Sensitive
- Encrypt at rest and in transit
- Restrict access to approved roles

## Privacy by Design Checklist
### Data Minimization
- Collect only what is required
- Avoid storing raw content in analytics

### Transparency
- Document data usage and retention
- Provide clear user controls

## Data Access Logging Schema
### Fields
- `actor_id`, `target_id`, `action`, `timestamp`, `source`
- `reason` and `scope`

## Data Retention Enforcement
### Steps
- Identify records past retention window
- Archive or delete on schedule

### Verification
- Confirm deletions in audit logs
- Report retention compliance monthly

## Consent Revocation Workflow
### Steps
- User revokes consent in settings
- System disables associated features
- Remove data from analytics pipelines

## Data Processing Inventory Template
### Fields
- Data category
- Purpose
- Retention window
- Processor/vendor

## Third-Party Risk Review Checklist
### Review
- Evaluate security posture
- Confirm privacy compliance
- Verify data handling agreements

## Data Breach Tabletop Exercise
### Plan
- Simulate breach scenarios quarterly
- Validate communication and response steps

### Outcomes
- Document gaps and action items
- Update incident runbooks

## Data Subject Request SLA
### Targets
- Acknowledge within 72 hours
- Fulfill within 30 days

### Tracking
- Record timestamps and completion status

## Vendor Due Diligence Checklist
### Security
- Review security certifications
- Validate incident response practices

### Privacy
- Confirm data processing terms
- Verify sub-processor list

## Privacy Owner Role
### Responsibilities
- Approve data collection changes
- Oversee compliance and audits

## Data Minimization Checklist
### Review
- Confirm each field is required
- Remove unused fields

### Governance
- Re-validate quarterly
- Document rationale for sensitive fields

## Security Architecture Diagram (Outline)
### Components
- Client UI
- API Gateway
- Auth service
- Database
- Realtime server

## API Gateway Policy
### Routing
- Enforce consistent API prefixes
- Block unknown routes by default

### Security
- Apply rate limits at the gateway
- Validate auth before forwarding

## Secrets Leakage Response
### Detection
- Monitor secret scanning alerts
- Identify affected keys quickly

### Response
- Revoke and rotate compromised keys
- Audit access logs for misuse

## Threat Modeling Checklist
### Scope
- Identify assets, entry points, and data flows
- Define trust boundaries

### Analysis
- Enumerate abuse cases and mitigations
- Validate authentication and authorization paths

## Data Loss Prevention Policy
### Controls
- Restrict bulk exports by role
- Alert on large data transfers

### Enforcement
- Block unapproved external sharing
- Log DLP events

## Logging Redaction Policy
### Sensitive Fields
- Passwords, tokens, and secrets
- PII such as emails and addresses

### Implementation
- Mask values at the logger
- Avoid logging full request bodies

## Third-Party Data Sharing Approval
### Request
- Document data categories and purpose
- Provide vendor security review

### Approval
- Security and privacy sign-off
- Record sharing scope and duration

## Secure Session Storage Checklist
### Settings
- Use HTTP-only, secure cookies
- Set proper SameSite policy

### Rotation
- Rotate session secrets periodically
- Invalidate sessions after rotation

## Data Retention Exceptions
### Criteria
- Legal hold or regulatory requirement
- Active investigation

### Process
- Document exception scope and duration
- Review exceptions quarterly

## Secrets Scanning Policy
### Scope
- Scan repo and CI logs for secrets
- Block merges on detected secrets

### Response
- Revoke leaked secrets immediately
- Document remediation steps

## Compliance Audit Schedule
### Cadence
- Annual full compliance audit
- Quarterly internal reviews

### Evidence
- Collect logs, policies, and access records
- Track findings to closure

## Access Review Checklist
### Review
- Validate admin and service account access
- Remove stale accounts

### Approval
- Require manager sign-off
- Document changes

## Log Retention Policy
### Retention
- Application logs: 90 days
- Security logs: 365 days

### Storage
- Store logs in immutable storage
- Restrict access to approved roles

## Compliance Evidence Checklist
### Required Evidence
- Access reviews
- Audit logs
- Incident reports

### Storage
- Store evidence in a secure repository
- Retain for 12 months minimum

## Security Patch Cadence
### Targets
- Critical patches within 48 hours
- High severity within 7 days

### Verification
- Re-run tests after patching
- Update vulnerability tracking

## Penetration Testing Schedule
### Cadence
- Annual third-party pen test
- Quarterly internal security review

## Sandbox Environment Policy
### Purpose
- Isolate experimental features
- Prevent impact on production data

### Access
- Limit to internal users
- Use masked or synthetic data

## Security Training Requirements
### Cadence
- Annual security training for all engineers
- Secure coding refresher every 6 months

## Data Access Approval Workflow
### Request
- Submit access request with justification
- Specify time-bound access

### Approval
- Require security and data owner sign-off
- Log approvals for audit

## Incident Severity Classification
### Sev 1
- Full outage or data loss

### Sev 2
- Critical feature unavailable

### Sev 3
- Degraded performance or minor feature issues

## Security Control Validation Checklist
### Controls
- Verify encryption at rest and in transit
- Validate access control enforcement

### Evidence
- Capture screenshots or logs
- Store validation results

## Product Data Taxonomy
### Categories
- Identity data
- Content data
- Commerce data
- Operational data

## Data Quality SLA
### Targets
- Data completeness > 99%
- Data accuracy > 98%

## Data Pipeline Ownership
### Ownership
- ETL jobs: data engineering owner
- API ingestion: backend owner
- Analytics exports: analytics owner

## Data Quality Remediation
### Workflow
- Identify impacted records
- Re-run ingestion or backfill
- Verify corrections with reconciliation checks

## Data Consistency Checks
### Social
- Validate post/comment counts
- Verify reaction totals

### Commerce
- Validate order totals and payment status
- Ensure cart totals match items

### Learning
- Verify progress percent ranges
- Ensure lesson counts align with course metadata

## Schema Documentation Generation
### Guidance
- Use `schema.ts` as source of truth
- Generate docs after schema changes

## API Data Validation Rules
### Rules
- Validate required fields and types with Zod
- Reject unknown fields where possible

### Error Handling
- Return 400 with validation errors
- Log validation failures with request IDs

## Audit Retention Policy
### Retention
- Audit logs retained for 12 months
- Security audits retained for 24 months

### Storage
- Store in immutable storage
- Restrict access to approved roles

## API Error Handling Guidelines
### Responses
- Use consistent `{ error, message }` payloads
- Return appropriate status codes

### Logging
- Include request IDs in error logs
- Avoid logging PII

## Governance Council Cadence
### Meetings
- Monthly policy review
- Quarterly risk review

### Records
- Track decisions and action items

## API Logging and Tracing
### Standards
- Log request IDs and user IDs where permitted
- Trace upstream/downstream latency

### Tools
- Use structured logging format
- Forward traces to observability tools

## Compliance Training Checklist
### Requirements
- Annual privacy training
- Annual security training

### Verification
- Track completion status
- Remediate missed training

## Release Dependency Checklist
### Dependencies
- Database migrations validated
- Third-party services reachable
- Feature flags set correctly

## Consent Audit Cadence
### Schedule
- Quarterly consent audits
- Ad-hoc audits after major changes

## Escalation Contact Rotation
### Policy
- Rotate on-call contacts monthly
- Update contact registry after rotations

## Audit Log Schema Example
### Example
```json
{
	"actorId": 1,
	"targetId": 42,
	"action": "export",
	"timestamp": "2026-02-16T12:00:00.000Z",
	"source": "admin-console",
	"reason": "user request"
}
```

## Vendor Due Diligence Checklist
### Minimum Checks
- Data processing agreements in place
- Security posture review completed
- Incident notification timelines documented

## Data Retention Exception Log
### Fields
- Exception id and owner
- Data category and scope
- Retention override duration
- Approval and renewal dates

## Breakglass Access Procedure
### Steps
- Require incident ticket and executive approval
- Time-box access and log all actions
- Post-incident review within 48 hours

## Privacy Impact Trigger List
### Triggers
- New data category or sensitive attribute
- New third-party data processor
- Cross-region data transfers

## Data Classification Matrix
### Categories
- Public
- Internal
- Confidential
- Restricted

### Controls
- Encryption at rest and in transit
- Access approval and audit logging

## Minimum Logging Fields
### Required Fields
- requestId
- actorId
- action
- targetId
- timestamp
- source
- outcome

### Optional Fields
- reason
- ip
- userAgent

## Key Rotation Playbook
### Cadence
- Rotate keys quarterly
- Rotate immediately on suspected compromise

### Steps
- Generate new key
- Dual-run with old key during transition
- Revoke old key and update references

## Backups and Restore Drill
### Schedule
- Nightly backups
- Monthly restore drill

### Verification
- Validate checksum integrity
- Perform point-in-time restore test
- Record RTO and RPO results

## Secrets Management Policy
### Rules
- Store secrets in a vault
- Never commit secrets to the repo
- Rotate secrets on staff changes

### Access
- Least privilege access only
- Time-bound approvals

## Third-Party Risk Review
### Cadence
- Annual review
- Re-review on scope changes

### Signoff
- Security
- Legal
- Data owner

## Service Degradation Modes
### Modes
- Read-only mode
- Reduced feature set
- Static fallback pages

### User Communication
- In-app banner
- Status page update
- Estimated restoration time

## Release Readiness Checklist
### Gates
- Feature flags verified
- Rollback plan documented
- Metrics dashboard confirmed
- On-call team notified

## Post-Incident Report Template
### Sections
- Timeline
- Impact
- Root cause
- Corrective actions
- Follow-up tasks

## Accessibility Compliance Checklist
### Checks
- Color contrast meets standards
- Keyboard navigation for all actions
- Screen reader labels present
- Reduced motion respected

## Data Residency Map
### Regions
- US
- EU
- APAC
- LATAM

### Rules
- Store data in-region when required
- Document cross-region transfer approvals

## PII Redaction Guidelines
### Logs
- Mask emails and phone numbers
- Truncate tokens and secrets
- Hash user identifiers where possible

## Rate Limiting Standard
### Tiers
- Public APIs: strict limits
- Authenticated APIs: moderate limits
- Internal APIs: elevated limits

### Responses
- Return 429 with retry-after header
- Log rate-limit violations

## Service Ownership Matrix
### Fields
- Service name
- Primary owner
- Backup owner
- SME contact

## Change Management Policy
### Levels
- Standard changes: peer review
- High-risk changes: security approval
- Emergency changes: post-review within 24 hours

## User Consent Revocation Flow
### Steps
- Verify identity
- Revoke consent and tokens
- Confirm deletion or anonymization where required

## Security Patch SLA
### Targets
- Critical: 24 hours
- High: 7 days
- Medium: 30 days
- Low: 90 days

## Operational Metrics
### Metrics
- Availability and error rate
- Latency p95 and p99
- Queue backlog and saturation

### Alerts
- Page on-call for SLO breaches
- Create incident ticket automatically

## Release Freeze Policy
### Windows
- Holiday peaks
- Major events
- Partner launches

### Exceptions
- Security hotfixes only
- Executive approval required

## Dependency Inventory Template
### Fields
- Dependency name
- Owner
- Purpose
- Data shared
- Contract expiration

## Data Lineage Diagram Checklist
### Requirements
- Identify data sources and sinks
- Map transformations and joins
- Track storage locations and retention

## Schema Change Review
### Policy
- Review with data owners and API owners
- Validate backwards compatibility
- Update migration notes

## Access Review Cadence
### Schedule
- Quarterly access reviews
- Immediate review after role changes

## Onboarding Checklist
### Steps
- Access provisioning and MFA setup
- Security training completion
- Environment setup verified

## Deprovisioning Checklist
### Steps
- Revoke access tokens and keys
- Transfer ownership of services
- Archive or reassign credentials

## Critical Path Services
### List
- Auth
- Database
- Realtime gateway
- Docs runtime

## Chaos Engineering Plan
### Summary
- Monthly failure injection exercises
- Validate resilience and recovery
- Document findings and fixes

## Feature Flag Lifecycle
### Stages
- Create and document flag
- Gradual rollout
- Remove flag after stable release

## Zero-Trust Network Rules
### Checklist
- Verify identity for every request
- Segment services by trust zone
- Enforce least privilege routing

## MFA Enforcement Policy
### Requirements
- MFA required for admin access
- MFA required for production deploys
- MFA enforced for third-party tools

## Data Minimization Principles
### Guidelines
- Collect only necessary data
- Limit retention to required durations
- Avoid duplicative storage

## Consent Versioning Policy
### Rules
- Version all consent terms
- Record consent version with timestamp
- Re-consent on material changes

## Third-Party Access Review
### Checklist
- Verify least privilege scopes
- Revoke stale accounts
- Review access logs quarterly

## Incident Severity Matrix
### Levels
- Sev1: critical outage or data breach
- Sev2: major degradation
- Sev3: minor impact
- Sev4: informational

## Service Dependency Diagram Template
### Elements
- Service nodes and edges
- Data flows and protocols
- Criticality tags

## Log Retention Matrix
### Classes
- Public: 30 days
- Internal: 180 days
- Confidential: 365 days
- Restricted: 730 days

## Disaster Recovery Roles
### Roles
- Incident commander
- Communications lead
- Recovery lead
- Scribe

## Infrastructure Change Freeze
### Rules
- Freeze during peak periods
- Exceptions for security fixes
- Executive approval required

## SAST/DAST Coverage Targets
### Targets
- 100% for critical services
- 80% for standard services
- Review coverage quarterly

## Secure SDLC Gate Checklist
### Gates
- Threat model completed
- SAST and dependency scan clean
- Security review signoff

## Data Subject Request (DSR) Workflow
### Steps
- Verify requester identity
- Locate and export data
- Apply deletion or correction
- Confirm completion within SLA

## Breach Notification Playbook
### Actions
- Validate incident scope and impact
- Notify legal and compliance
- Notify regulators and users within required timelines

## Encryption Standards
### Requirements
- Data at rest: AES-256
- Data in transit: TLS 1.2+
- Passwords: bcrypt or scrypt

## Service Tiering Model
### Tiers
- Tier 0: core auth and database
- Tier 1: critical user flows
- Tier 2: non-critical features

## Capacity Planning Checklist
### Checks
- Forecast growth and seasonal peaks
- Validate scaling limits
- Review cost budgets

## Config Drift Detection
### Policy
- Daily drift checks
- Alert on unauthorized changes
- Record drift remediation

## Runbook Ownership Registry
### Fields
- Runbook name
- Owner
- Last review date
- SLA coverage

## API Deprecation Policy
### Rules
- Announce deprecations 90 days ahead
- Provide migration guides
- Track adoption and removal dates

## Release Train Schedule
### Cadence
- Weekly feature release trains
- Monthly stability release

## Code Owner Rules
### Requirements
- Define owners per directory
- Require owner approval on changes
- Review ownership quarterly

## Data Quality SLAs
### Targets
- Freshness within 24 hours
- Accuracy above 99%
- Completeness above 98%

## Event Schema Governance
### Policy
- Register all events in the schema registry
- Version events on breaking changes
- Validate payloads in CI

## Cost Allocation Tags
### Checklist
- Service name
- Owner
- Environment
- Cost center

## Service On-Call Handoff
### Procedure
- Weekly handoff call
- Review open incidents and risks
- Update on-call notes and contacts

## Synthetic Monitoring Plan
### Coverage
- Core login flow
- Purchase or subscription flow
- Critical read APIs

### Alerts
- Trigger after two consecutive failures
- Notify on-call and create incident ticket

## Cache Invalidation Guidelines
### Rules
- Prefer event-driven invalidation
- Set explicit TTLs
- Avoid global cache clears

## Secure Build Pipeline Requirements
### Requirements
- Signed artifacts
- Dependency scanning in CI
- Build isolation and least privilege

## Cross-Team API Contract Review
### Policy
- Review with consumers before release
- Publish contract and examples
- Track contract changes

## Operational Readiness Review
### Template
- SLOs and dashboards defined
- Runbooks complete
- Rollback plan validated

## Regulatory Compliance Matrix
### Dimensions
- Region
- Regulation
- Data category
- Compliance owner

## Data Access Purpose Registry
### Fields
- Purpose id and description
- Data categories used
- Legal basis and consent scope
- Owner and review date

## Customer Data Export Policy
### Rules
- Export within SLA
- Provide machine-readable format
- Verify requester identity

## Service Restart Playbook
### Steps
- Validate health checks and dependencies
- Drain in-flight requests
- Restart service and verify recovery

## Critical Vendor Escalation Path
### Steps
- Notify vendor support tier
- Escalate to account manager
- Engage executive sponsor if required

## Infrastructure Observability Stack
### Components
- Metrics and dashboards
- Log aggregation
- Distributed tracing
- Alerting and paging

## Backup Encryption Key Handling
### Policy
- Separate key storage from backups
- Rotate backup keys annually
- Dual-control for key access

## Latency Budget Allocation
### Budget
- API gateway: 50ms
- Core services: 150ms
- Data layer: 100ms

## Deployment Verification Checklist
### Checks
- Health endpoints return 200
- Error rates within SLO
- Rollback path confirmed

## PII Discovery Process
### Steps
- Scan data stores quarterly
- Review new schemas and fields
- Remediate unclassified PII

## Compliance Evidence Archive
### Contents
- Audit reports
- Control test results
- Training records

## Data Ownership Map
### Fields
- Data domain
- Primary owner
- Backup owner
- Steward contact

## Data Lifecycle Stages
### Stages
- Collection
- Processing
- Storage
- Sharing
- Archival
- Deletion

## Privileged Access Approval Flow
### Steps
- Request with justification
- Security approval
- Time-bound access grant

## Production Access Request Form
### Fields
- Requester and role
- Scope of access
- Duration and purpose
- Approver signatures

## Release Audit Checklist
### Checks
- Change ticket linked
- Evidence captured
- Approvals recorded

## Schema Registry Structure
### Structure
- Domain namespaces
- Version history
- Owners and contacts

## Data Ingestion Validation Rules
### Rules
- Enforce schema validation
- Reject missing required fields
- Quarantine malformed payloads

## Data Deletion Verification
### Checklist
- Confirm primary data deletion
- Confirm replicas and backups
- Log verification evidence

## Incident Communications Plan
### Channels
- Status page updates
- Customer notifications
- Internal comms cadence

## Executive Risk Reporting
### Cadence
- Monthly risk summary
- Quarterly board briefing

## Data Access Approval Matrix
### Levels
- Read-only: manager approval
- Write: data owner approval
- Admin: security approval

## Client Data Segregation
### Policy
- Separate tenant identifiers
- Enforce row-level access controls
- Validate isolation in tests

## Security Control Testing Schedule
### Cadence
- Quarterly control tests
- Annual third-party assessment

## Production Secrets Rotation Plan
### Steps
- Rotate critical secrets quarterly
- Rotate on staff changes
- Verify service health after rotation

## System-of-Record Definition
### Rules
- Identify authoritative source per domain
- Document sync direction and frequency
- Prevent dual writes

## Data Contract Ownership
### Policy
- Assign data contract owners
- Require owner approval on changes
- Review contracts annually

## Service Boundary Guidelines
### Checklist
- Single responsibility per service
- Explicit inputs and outputs
- Versioned interfaces

## Regulatory Change Monitoring
### Process
- Track regulator updates monthly
- Assess impact within 30 days
- Update policies and controls

## Vendor Offboarding Checklist
### Steps
- Revoke access and credentials
- Retrieve or delete shared data
- Archive contracts and evidence

## Critical Data Elements (CDE) Register
### Fields
- Element name
- Sensitivity level
- Owner
- Quality threshold

## Data Retention Legal Hold
### Procedure
- Flag records under legal hold
- Suspend deletion workflows
- Review holds quarterly

## Data Anonymization Standards
### Standards
- Remove direct identifiers
- Tokenize or hash quasi-identifiers
- Validate re-identification risk

## Encryption Key Custodian Roster
### Fields
- Key type and scope
- Primary custodian
- Backup custodian
- Rotation date

## Production Incident Triage Checklist
### Checklist
- Verify impact and severity
- Assign incident commander
- Notify stakeholders

## Service Dependency SLO Map
### Map
- Upstream service SLOs
- Downstream service expectations
- Error budget dependencies

## Data Access Audit Queries
### Queries
- Privileged access usage
- Data export activity
- Admin changes

## PCI Scope Definition
### Scope
- Payment processing paths
- Storage of card data
- Segregated PCI environment

## Customer Security Questionnaire Process
### Steps
- Intake and assign owner
- Provide evidence and answers
- Track completion status

## Business Continuity Objectives
### Objectives
- Define RTO and RPO per service
- Review annually
- Test recovery plans

## Penetration Testing Calendar
### Schedule
- Annual external pen test
- Semiannual internal test
- Remediation tracking

## Data Disposal Certificate
### Contents
- Data category and scope
- Disposal method
- Date and approver

## Cross-Border Transfer Assessment
### Checklist
- Legal basis documented
- Transfer impact assessment
- Encryption in transit and at rest

## Incident Metrics Dashboard
### Metrics
- MTTR and MTTA
- Incident count by severity
- Recurrence rate

## Security Exception Request
### Process
- Submit exception with justification
- Security review and approval
- Time-bound expiration

## Runtime Access Logs Retention
### Policy
- Retain access logs for 180 days
- Archive securely for 12 months
- Restrict access to security roles

## Golden Signals Definition
### Signals
- Latency
- Traffic
- Errors
- Saturation

## Dependency Version Pinning
### Policy
- Pin critical dependencies
- Review updates monthly
- Use lockfiles in CI

## Vendor Security Attestation
### Requirements
- Annual SOC 2 or ISO report
- Evidence of incident response
- Subprocessor disclosure

## Security Champions Program
### Program
- One champion per team
- Monthly security sync
- Track improvements

## Change Risk Scoring
### Rubric
- Data sensitivity impact
- Service criticality
- Rollback complexity

## Security Architecture Review
### Cadence
- Quarterly reviews
- Ad-hoc reviews for major changes

## Threat Modeling Workflow
### Steps
- Identify assets and entry points
- Enumerate threats and mitigations
- Review with security team

## Secrets Scanning Coverage
### Checklist
- Scan all repos in CI
- Block merges on high severity findings
- Track remediation timelines

## Service Account Lifecycle
### Policy
- Create with least privilege
- Rotate credentials regularly
- Disable on inactivity

## Data Access Logging Requirements
### Requirements
- Log all admin data access
- Log exports and deletions
- Retain logs per policy

## Incident Retrospective Template
### Sections
- What happened
- What went well
- What needs improvement
- Action items

## KMS Usage Standards
### Standards
- Use KMS for key storage
- Rotate keys annually
- Audit KMS access logs

## Vendor Risk Scoring
### Rubric
- Data sensitivity handled
- Availability risk
- Regulatory exposure

## Incident Escalation Tree
### Levels
- On-call engineer
- Incident commander
- Executive sponsor

## Security Awareness Campaign
### Plan
- Quarterly training sessions
- Phishing simulations
- Track participation rates

## Data Encryption Key Rotation SOP
### Steps
- Inventory keys by system
- Rotate keys during maintenance windows
- Verify data access post-rotation

## Service Reliability Budget
### Budget
- Error budget per tier
- Monthly burn review
- Freeze changes on exhaustion

## Critical Change Approval Board
### Policy
- Review high-risk changes weekly
- Require cross-functional approval
- Document decisions and rationale

## Runbook Testing Schedule
### Cadence
- Quarterly runbook drills
- Annual full recovery simulation

## API Abuse Detection
### Checklist
- Detect credential stuffing
- Flag anomalous burst traffic
- Auto-block abusive IPs

## User Authentication Assurance Levels
### Levels
- Low: password only
- Medium: MFA required
- High: MFA plus device trust

## WAF Ruleset Governance
### Rules
- Review rules monthly
- Test in staging before prod
- Track false positives

## Incident Tooling Inventory
### Inventory
- Paging system
- Status page
- Incident tracker

## Operational Data Access Policy
### Policy
- Access by approval only
- Time-bound access
- Audit all access

## Security Metrics Scorecard
### Metrics
- Vulnerability remediation time
- Patch compliance rate
- Security training completion

## Data Handling Playbooks
### Classes
- Public
- Internal
- Confidential
- Restricted

## Secure API Gateway Baseline
### Checklist
- TLS enforced
- WAF enabled
- Rate limits configured

## Network Segmentation Map
### Map
- Public zone
- Service zone
- Data zone

## Emergency Access Drill
### Schedule
- Semiannual emergency access drills
- Document findings and actions

## PII Tagging Standard
### Standard
- Tag fields at ingestion
- Propagate tags to derived data
- Enforce tag-aware access rules

## Incident Severity Recalibration
### Policy
- Reassess severity every 2 hours
- Escalate or de-escalate as needed

## Service Dependency Health Checks
### Checklist
- Verify upstream health endpoints
- Validate dependency timeouts
- Track failure modes

## Compliance Reporting Calendar
### Calendar
- Quarterly compliance reporting
- Annual audit preparation

## Infrastructure-as-Code Review
### Checklist
- Peer review required
- Validate drift detection
- Enforce least privilege

## Security Change Freeze
### Policy
- Freeze changes during incidents
- Exceptions for approved hotfixes

## Data Access Justification Logs
### Requirements
- Record request reason
- Capture approver identity
- Retain logs per policy

## Service Integration Contract Checklist
### Checklist
- Define payload schemas
- Document SLAs and limits
- Set authentication requirements

## Sensitive Data Masking Standard
### Standard
- Mask secrets in logs
- Tokenize sensitive identifiers
- Validate masking in tests

## Operational Readiness Exit Criteria
### Criteria
- SLOs and alerts defined
- Runbooks verified
- Rollback plan validated

## Private Network Peering Policy
### Policy
- Enforce private IP ranges
- Document peer ownership
- Review peering annually

## Risk Register Template
### Fields
- Risk description
- Impact and likelihood
- Owner and mitigation

## Service Account Rotation Schedule
### Schedule
- Rotate every 90 days
- Rotate on personnel changes

## Threat Intel Ingestion
### Process
- Subscribe to trusted feeds
- Automate ingestion and scoring
- Track disposition actions

## Rogue Asset Discovery
### Checklist
- Scan for unknown services
- Validate ownership
- Remediate or decommission

## Audit Evidence Packaging
### Checklist
- Collect artifacts and logs
- Verify integrity
- Store in immutable archive

## User Data Portability Checklist
### Checklist
- Provide export format options
- Verify identity before export
- Log exports and retention

## Data Integrity Validation
### Policy
- Validate checksums on ingest
- Run consistency checks weekly
- Alert on integrity failures

## Security Logging Coverage Map
### Coverage
- Auth events
- Admin actions
- Data exports
- Config changes

## Privileged Session Recording
### Policy
- Record admin sessions
- Store recordings securely
- Review on incident

## Cloud Resource Tagging Standard
### Standard
- Owner
- Environment
- Cost center
- Data sensitivity

## Business Impact Analysis (BIA) Template
### Fields
- Business function
- Impact levels
- RTO and RPO

## SRE Error Budget Escalation
### Policy
- Escalate on 50% burn
- Freeze changes on 100% burn
- Track remediation actions

## Secrets Distribution Workflow
### Workflow
- Request and approval
- Secure delivery channel
- Time-bound access

## Data Loss Prevention (DLP) Rules
### Rules
- Block sensitive exports
- Alert on policy violations
- Review DLP rules quarterly

## Security Operations Metrics
### Metrics
- MTTD and MTTR
- Alert volume by severity
- False positive rate

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
