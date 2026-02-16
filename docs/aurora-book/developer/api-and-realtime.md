# API and Realtime Systems

## API Strategy
- REST endpoints for core universes
- Optional GraphQL for complex queries
- Input validation with schema validation

## API Conventions
- JSON request and response bodies
- Explicit error objects with status codes
- Pagination for list endpoints
- Rate limiting for public endpoints

## Auth and Permissions
- Session-based auth via Next.js Auth
- Role checks for admin routes
- Universe-specific permissions for shared content

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

## Failure Handling
- Client retries with backoff
- Server drops stale connections
- UI falls back to polling when needed

Source: SOCIAL_UNIVERSE_GUIDE.md
