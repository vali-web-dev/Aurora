# Data and Database

## Database Setup
- PostgreSQL 14+
- Environment configuration in .env.local
- Drizzle migrations and seeding

## Commands
- npm run db:generate
- npm run db:push
- npm run db:seed
- npm run db:migrate

## Data Model
- Local-first storage for memory and preferences
- Optional server sync for shared content

## Migration Workflow
1. Update schema in src/lib/schema.ts
2. Run npm run db:generate
3. Review migration files
4. Run npm run db:push or db:migrate
5. Seed data with npm run db:seed

## Data Ownership
- Users own their data and can export it
- Local data remains local unless sync is enabled
- Shared content is scoped to explicit permissions

## Verification
- Health check endpoint /api/health/db
- Direct database inspection with psql

Source: DATABASE_SETUP.md
