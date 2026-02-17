# API and Realtime Systems

## API Strategy
- REST endpoints for core universes
- Optional GraphQL for complex queries
- Input validation with schema validation (Zod)

## API Route Locations
- App Router API: `src/app/api/*`
- Social APIs: `src/app/api/social/*`
- Learning APIs: `src/app/api/learning/*`
- Users APIs: `src/app/api/users/*`
- Notifications: `src/app/api/notifications/*`
- Services: `src/app/api/services/*`
- Docs API: `src/app/api/docs/[...path]/route.ts`
- Health: `src/app/api/health/route.ts`, `src/app/api/health/db/route.ts`

## API Conventions
- JSON request and response bodies
- Explicit error objects with status codes
- Pagination for list endpoints
- Rate limiting for public endpoints
- Zod validation for request payloads
- Shared API utilities live under `src/lib/request-validation.ts`

## Auth and Permissions
- Session-based auth via Next.js Auth
- Role checks for admin routes
- Universe-specific permissions for shared content

## Request Lifecycle (Typical)
1. Client invokes `fetch` or `server actions`
2. API route validates payload and session
3. Drizzle ORM reads/writes PostgreSQL
4. Optional realtime broadcast via Socket.IO
5. Client updates local state and UI

## Social Universe API
- Feed: GET/POST/PUT/DELETE
- Comments: GET/POST/DELETE
- Reactions: GET/POST/DELETE

## Realtime Events
- POST_CREATE, POST_UPDATE, POST_DELETE
- POST_COMMENT, POST_REACTION
- FEED_UPDATE

## Event Payload Shape (Example)
- event: string
- entityId: string
- universe: string
- timestamp: ISO-8601
- payload: object

## WebSocket Integration
- Real-time updates for feeds and notifications
- Socket server configuration in server.js

## Realtime Runtime (Source of Truth)
- Server entry: `server.js`
- Server implementation: `src/lib/websocket-server.ts`
- Client: `src/lib/websocket-client.ts`
- Types: `src/lib/websocket-types.ts`
- Enable/disable via `ENABLE_REAL_TIME`

## Realtime Runtime
- Server entry: `server.js`
- Client: `src/lib/websocket-client.ts`
- Event types: `src/lib/websocket-types.ts`
- Enable/disable via `ENABLE_REAL_TIME`

## Failure Handling
- Client retries with backoff
- Server drops stale connections
- UI falls back to polling when needed

## Verification
- `ENABLE_REAL_TIME=true` in `.env.local`
- Start `npm run dev:server`
- Confirm server logs show WebSocket initialized
- Load a universe with realtime features and verify updates

Source: SOCIAL_UNIVERSE_GUIDE.md
