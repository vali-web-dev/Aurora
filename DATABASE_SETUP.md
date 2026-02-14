# Aurora Database Setup Guide

## Phase 1: Database Infrastructure

This guide walks through setting up PostgreSQL for Aurora, including migrations and seeding.

---

## Prerequisites

- **PostgreSQL 14+** installed locally or access to a managed PostgreSQL instance (AWS RDS, Supabase, etc.)
- **Node.js 18+** with npm
- **Environment variables configured** in `.env.local`

---

## Step 1: Setup PostgreSQL

### Option A: Local PostgreSQL (Windows)

1. **Download PostgreSQL**: https://www.postgresql.org/download/windows/
2. **Install** with default settings (default port: 5432)
3. **Create database**:
   ```bash
   psql -U postgres
   CREATE DATABASE aurora;
   \q
   ```

### Option B: Managed PostgreSQL (Recommended for Production)

- **Supabase**: https://supabase.com (free tier included)
- **AWS RDS**: https://aws.amazon.com/rds/postgresql/
- **Railway**: https://railway.app (simple, free tier available)
- **Render**: https://render.com

---

## Step 2: Environment Configuration

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Update `.env.local`** with your database credentials:
   ```bash
   DATABASE_URL=postgresql://username:password@localhost:5432/aurora
   ```

3. **Example for different providers**:
   - **Local**: `postgresql://postgres:password@localhost:5432/aurora`
   - **Supabase**: `postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres`
   - **AWS RDS**: `postgresql://admin:password@[ENDPOINT].rds.amazonaws.com:5432/aurora`

---

## Step 3: Generate and Run Migrations

### Generate Schema from TypeScript

This creates SQL migration files from the Drizzle schema (`src/lib/schema.ts`):

```bash
npm run db:generate
```

**Output**: Migration files created in `src/lib/migrations/`

### Push Schema to Database

This applies all migrations and creates tables:

```bash
npm run db:push
```

**Output**: All tables created in PostgreSQL

---

## Step 4: Seed Initial Data

Populate the database with sample data for testing:

```bash
npm run db:seed
```

**Creates**:
- 3 sample users
- 3 personas
- 2 brands
- 4 third-party services
- 2 commerce providers
- 2 products
- 3 communities
- 3 learning courses

---

## Step 5: Verify Setup

### Check Database Health

```bash
curl http://localhost:3000/api/health/db
```

**Response (success)**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-14T10:30:00.000Z"
}
```

### Connect to Database Directly

```bash
psql postgresql://username:password@localhost:5432/aurora
```

```sql
-- List all tables
\dt

-- Count users
SELECT COUNT(*) FROM users;

-- View sample users
SELECT * FROM users LIMIT 5;
```

---

## Available Commands

| Command | Purpose |
|---------|---------|
| `npm run db:generate` | Generate migrations from schema changes |
| `npm run db:push` | Apply migrations to database |
| `npm run db:migrate` | Run migration with Drizzle kit |
| `npm run db:drop` | ⚠️ Drop all tables (caution!) |
| `npm run db:seed` | Populate with sample data |
| `npm run db:format` | Validate schema format |

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/aurora` |
| `NEXTAUTH_SECRET` | Session encryption key | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Auth callback URL | `http://localhost:3000` |

---

## Common Issues

### ❌ "connect ECONNREFUSED 127.0.0.1:5432"
**Problem**: PostgreSQL not running
**Solution**: 
- Start PostgreSQL service
- Check it's listening: `psql -U postgres`

### ❌ "database "aurora" does not exist"
**Problem**: Database not created
**Solution**:
```bash
createdb -U postgres aurora
```

### ❌ "role "postgres" does not exist"
**Problem**: PostgreSQL user not found
**Solution**: Create user in PostgreSQL:
```bash
psql -U postgres
CREATE ROLE postgres WITH LOGIN PASSWORD 'password';
ALTER ROLE postgres CREATEDB;
\q
```

### ❌ "permission denied for schema public"
**Problem**: Insufficient permissions
**Solution**:
```bash
psql -U postgres aurora
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

---

## Backup & Recovery

### Backup Database

```bash
pg_dump postgresql://user:pass@localhost/aurora > aurora_backup.sql
```

### Restore from Backup

```bash
psql postgresql://user:pass@localhost/aurora < aurora_backup.sql
```

---

## Development Workflow

1. **Modify schema** in `src/lib/schema.ts`
2. **Generate migrations**: `npm run db:generate`
3. **Review migrations** in `src/lib/migrations/`
4. **Push to database**: `npm run db:push`
5. **Test changes** locally
6. **Commit migrations** to git

---

## Production Deployment

### Before Going Live

- [ ] Database is backed up daily
- [ ] Connection pooling enabled (PgBouncer)
- [ ] SSL/TLS enabled for connections
- [ ] Read replicas configured (optional)
- [ ] Monitoring alerts set up
- [ ] Connection limits appropriate

### Deployment Steps

1. **Run migrations** on staging first
2. **Verify all tables** created
3. **Backup production** database
4. **Run migrations** on production
5. **Monitor** for issues

---

## Next Steps

After database is setup:

1. ✅ Database infrastructure ready
2. 📝 **Next**: Implement NextAuth.js authentication (Phase 2)
3. 🌐 Build API layer with endpoints (Phase 3)
4. 🔄 Real-time WebSocket features (Phase 4)
5. 💳 Payment processing (Phase 5)

---

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Getting Started](https://supabase.com/docs)
- [AWS RDS Setup](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)

---

**Last Updated**: February 14, 2026
