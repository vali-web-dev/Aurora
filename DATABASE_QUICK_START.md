# Aurora Database Quick Start Guide

**Status:** Ready for database connectivity  
**Updated:** February 18, 2026  
**Time to Setup:** ~5 minutes

---

## Option 1: Supabase (Recommended - Free Cloud PostgreSQL)

### 1. Sign up free (2 min)
- Visit: https://supabase.com/dashboard/projects
- Sign in with GitHub, Google, or email
- Create new project:
  - **Name:** `aurora`
  - **Password:** Generate strong (save temporarily)
  - **Region:** Choose closest to you
  - **Pricing:** Free tier
- Wait for initialization (~1-2 min)

### 2. Get connection string (1 min)
1. Click project name in dashboard
2. Go to **Settings** → **Database** (left sidebar)
3. Find **Connection string** → **URI**
4. Copy the full URL (includes `postgres://...`)

**⚠️ Important:** Replace `[password]` with your generated password

### 3. Configure Aurora (30 sec)
```bash
# Edit .env.local and update:
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres?sslmode=require
```

### 4. Initialize database (1 min)
```bash
npm run db:init
```

✅ Done! Database is ready.

---

## Option 2: Docker Compose (Local Development)

### 1. Start PostgreSQL
```bash
docker compose up postgres -d
```

### 2. Update .env.local
```
DATABASE_URL=postgresql://aurora:aurora-dev-pass@localhost:5432/aurora
```

### 3. Initialize
```bash
npm run db:init
```

---

## Option 3: Other Managed PostgreSQL

- **Railway:** https://railway.app (1-click deploy, free tier)
- **Render:** https://render.com (PostgreSQL hosting)
- **AWS RDS:** RDS instances
- **Azure Database:** Azure portal

All work the same: Get connection string → Update `.env.local` → `npm run db:init`

---

## Verify Setup

### Quick health check
```bash
npx drizzle-kit push --config=drizzle.config.ts
```

Expected output:
```
✓ No changes detected
```

### Full verification
```bash
npm run dev
```

Then test API:
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

---

## Database Commands

| Command | Purpose |
|---------|---------|
| `npm run db:init` | Complete setup (recommended first) |
| `npm run db:push` | Apply schema without seed |
| `npm run db:seed` | Add test data |
| `npm run db:generate` | Generate migrations from schema |
| `npm run db:drop` | Reset database (⚠️ deletes data) |

---

## Troubleshooting

### ❌ "Connection refused"
- **Supabase:** Wait 30 sec for project initialization
- **Docker:** Run `docker compose up postgres -d` first
- **URL:** Verify `?sslmode=require` in connection string

### ❌ "Password authentication failed"
- Check password in connection string
- Verify no special characters (or URL-encode them)
- For Supabase: Use exact password generated during project creation

### ❌ "Database already exists"
- Completely safe! Schema already applied.
- Run: `npm run db:seed` to add test data

### ❌ "ENOTFOUND host"
- Hostname is incorrect in connection string
- Copy directly from provider dashboard

---

## Database Schema

Aurora comes with pre-built schema for:
- **Users & Auth:** accounts, sessions, profiles
- **Brands:** brand management, company info
- **Surfaces:** pages, layouts, templates
- **Components:** reusable UI components
- **Services:** integrations, connections
- **Communities:** groups, channels, messages
- **Media:** images, videos, files
- **Social:** posts, comments, reactions
- **Learning:** courses, lessons, progress
- **Gaming:** characters, quests, achievements

See `src/lib/schema.ts` for full definition.

---

## Next Steps

Once `npm run db:init` succeeds:

```bash
# 1. Start development server
npm run dev

# 2. Open browser
# http://localhost:3000

# 3. Test API routes
# http://localhost:3000/api/health
# http://localhost:3000/api/services
# http://localhost:3000/api/communities
```

---

## What's Included

✅ Drizzle ORM configured  
✅ PostgreSQL dialect ready  
✅ Migration system (generate + push)  
✅ Full schema defined  
✅ NextAuth.js integration  
✅ API routes (30+)  
✅ Seed data templates  

---

**Need more help?** See:
- Setup guide: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- Database docs: [DATABASE_SETUP.md](DATABASE_SETUP.md)
- Schema reference: [src/lib/schema.ts](src/lib/schema.ts)
