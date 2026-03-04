# Aurora + Supabase Setup Guide

Supabase provides managed PostgreSQL with free tier - no Docker needed!

## Step 1: Create Supabase Account & Project

1. Go to https://supabase.com/dashboard
2. Sign up (GitHub, Google, or email)
3. Create new project:
   - **Name:** `aurora` (or any name)
   - **Password:** Generate strong password (save it temporarily)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier
4. Wait for project to initialize (~2 min)

## Step 2: Get Connection String

Once project is ready:

1. Go to **Settings** → **Database** (left sidebar)
2. Find **Connection string** section
3. Copy the **URI** (not the psql command)
   - Should look like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require`
4. Replace `[PASSWORD]` with the password you generated

**⚠️ Important:** The database name is `postgres` (default), not `aurora`

## Step 3: Update .env.local

Replace the `DATABASE_URL` in `.env.local`:

```bash
# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres?sslmode=require
```

## Step 4: Verify Connection

```bash
npm run db:push
```

Should output:
```
✓ Pulling schema from database...
✓ Creating tables...
[success-message]
```

## Step 5: Seed Initial Data

```bash
npm run db:seed
```

## Troubleshooting

### Connection Refused
- ✅ Check DATABASE_URL contains `?sslmode=require` at the end
- ✅ Verify password doesn't have special characters (or URL-encode them)
- ✅ Wait 10 seconds and retry

### Table Already Exists
- Safe to ignore - schema is already applied
- Run seed script: `npm run db:seed`

### Need to Reset Database
Go to Supabase dashboard → **Settings** → **Danger Zone** → **Reset database**

## Next Steps

Once `db:push` succeeds, run:

```bash
npm run dev
```

Go to http://localhost:3000 and test API routes:
- `GET /api/users/profile` (requires auth)
- `GET /api/health` (no auth)
- `GET /api/services` (list services)

---

**Created:** February 18, 2026
**Status:** Ready to connect to Aurora database infrastructure
