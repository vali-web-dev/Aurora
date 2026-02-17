# Data and Database

## Database Setup
- PostgreSQL 14+
- Environment configuration in .env.local
- Drizzle migrations and seeding

## Data Layers (Local-First + Server)
- Local: IndexedDB for memory and structured local data
- Local: localStorage for lightweight preferences and feature flags
- Server: PostgreSQL for shared, multi-user data and sync
- Session: NextAuth session storage via database adapter

## Required Environment Variables
- `DATABASE_URL` (PostgreSQL connection string)
- Optional: `LOG_LEVEL`

Copy `.env.example` to `.env.local` and update values before running migrations.

## Connection String Format
- `postgresql://<user>:<password>@<host>:<port>/<database>`
- If your password contains special characters, URL-encode them.

## Commands
- npm run db:generate
- npm run db:push
- npm run db:seed
- npm run db:migrate
- npm run db:drop (local dev only)

## Drizzle Configuration
- `drizzle.config.ts` loads `.env.local` to resolve `DATABASE_URL`.
- If `db:push` fails authentication, verify the user/password and database name.

## Data Model
- Local-first storage for memory and preferences
- Optional server sync for shared content

## Schema Sources (Authoritative)
- `src/lib/schema.ts` (Drizzle schema source of truth)
- `src/aurora_schema.sql` (reference SQL schema)
- `drizzle.config.ts` (Drizzle config and output)

## Seed Data Sources
- `src/lib/seed.ts` (seed entry point)
- `scripts/seed-social-data.ts` (social universe seed helpers)
- `scripts/seed-social-universe.sql` (optional SQL seed)

## Seed Behavior
- Users, brands, and communities are seeded idempotently to avoid duplicate errors.
- Re-running `db:seed` is safe for existing seed data.
- Use `db:drop` only when you want a completely clean local database.

## Migration Workflow
1. Update schema in src/lib/schema.ts
2. Run npm run db:generate
3. Review migration files
4. Run npm run db:push or db:migrate
5. Seed data with npm run db:seed

## Local Dev Reset (Use With Care)
1. Stop the app server
2. Drop local DB only:
	- `npm run db:drop`
3. Re-run migrations and seeds:
	- `npm run db:generate`
	- `npm run db:push`
	- `npm run db:seed`

## Data Ownership
- Users own their data and can export it
- Local data remains local unless sync is enabled
- Shared content is scoped to explicit permissions

## Verification
- Health check endpoint /api/health/db
- Direct database inspection with psql

## Common Failures
- `DATABASE_URL` points to the wrong host or port
- Missing permissions for the DB user
- Schema drift after editing SQL directly (always update `schema.ts`)
- Seed failures from missing environment keys
- `db:push` fails because the wrong database name is set

## Troubleshooting
- If migrations fail, re-run `npm run db:generate` then `npm run db:push`
- Ensure `DATABASE_URL` points to a running PostgreSQL instance
- Use `npm run db:drop` only in local dev environments

Source: DATABASE_SETUP.md
