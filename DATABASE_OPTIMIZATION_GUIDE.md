# Aurora Database Optimization Guide

**Status**: Production Readiness  
**Last Updated**: February 23, 2026  
**Focus**: Indexing, Query Optimization, Schema Evolution  

---

## Current Schema Inventory

### Core Tables
- `users` — User profiles, auth records
- `posts` — Social feed posts  
- `comments` — Post comments
- `reactions` — Post/comment reactions
- `products` — Commerce catalog
- `orders` — Order history
- `payments` — Payment records (NEW)
- `shipments` — Fulfillment tracking (NEW)
- `invoices` — Invoice ledger (NEW)
- `events` — Analytics events (NEW)

---

## Phase 1: Essential Indexes (Immediate)

### Commerce Indexes
```sql
-- Order lookups by user
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Payment tracking
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- Shipment lookups
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);

-- Invoice retrieval
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
```

### Social Indexes
```sql
-- Feed queries
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
```

### Analytics Indexes
```sql
-- Event queries
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_action ON events(action);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_order_id ON events(metadata->'orderId');  -- JSONB
```

### Composite Indexes (High-Value)
```sql
-- Fast order history lookup with status
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Fast analytics queries by date range
CREATE INDEX idx_events_category_timestamp ON events(category, timestamp DESC);

-- Fast shipment status queries
CREATE INDEX idx_shipments_order_status ON shipments(order_id, status);
```

---

## Phase 2: Query Optimization

### N+1 Query Prevention

**Current Problem:**
```typescript
const orders = await db.select().from(schema.orders).where(eq(schema.orders.userId, userId));
const ordersWithDetails = await Promise.all(
  orders.map(async (order) => ({
    ...order,
    items: await db.select().from(schema.cartItems).where(eq(schema.cartItems.orderId, order.id))
  }))
);
// Result: 1 + N queries
```

**Optimized:**
```typescript
const ordersWithItems = await db
  .select()
  .from(schema.orders)
  .leftJoin(schema.cartItems, eq(schema.orders.id, schema.cartItems.orderId))
  .where(eq(schema.orders.userId, userId));
// Result: 1 query
```

### Pagination in High-Volume Tables

```typescript
// SLOW: SELECT COUNT(*) then offset
const total = await db.select().from(schema.events);
const page = await db.select()
  .from(schema.events)
  .limit(20)
  .offset(page * 20);

// BETTER: Keyset pagination
const page = await db.select()
  .from(schema.events)
  .where(lt(schema.events.id, lastSeenId))
  .orderBy(desc(schema.events.id))
  .limit(20);
```

### Selective Column Loading

```typescript
// SLOW: Load all columns
const orders = await db.select().from(schema.orders);

// BETTER: Load only needed columns
const orders = await db.select({
  id: schema.orders.id,
  total: schema.orders.total,
  status: schema.orders.status,
  createdAt: schema.orders.createdAt,
}).from(schema.orders);
```

---

## Phase 3: Data Archival

### Archive Old Orders (> 2 years)

```sql
-- Create archive table
CREATE TABLE orders_archive AS
SELECT * FROM orders WHERE created_at < NOW() - INTERVAL '2 years';

-- Add index to archive
CREATE INDEX idx_orders_archive_user ON orders_archive(user_id);

-- Delete from main
DELETE FROM orders WHERE created_at < NOW() - INTERVAL '2 years';

-- Vacuum
VACUUM ANALYZE orders;
```

### Archive Old Events (> 90 days)

```sql
-- Partition events by month for efficient archival
CREATE TABLE events_202601 PARTITION OF events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Archive to cold storage (AWS S3, etc)
-- After archival, DROP partition
```

---

## Phase 4: Connection Pooling

### PgBouncer Configuration

```ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
aurora = host=localhost port=5432 dbname=aurora

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3
```

### Next.js Configuration

```typescript
// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL, {
  max: 25,  // Pool size
  timeout: 30,
  idle_timeout: 30,
});

export const db = drizzle(client);
```

---

## Phase 5: Prepared Statements & Query Caching

### Enable Query Plan Caching

```typescript
// Reuse prepared statements
const getOrderById = db.query.orders.getOne({
  where: eq(schema.orders.id, sql.placeholder('orderId')),
});

// Usage (planifies once, reuses)
await getOrderById.execute({ orderId: 123 });
await getOrderById.execute({ orderId: 456 });
```

### Application-Level Caching

```typescript
import { cache } from 'react';

// Cache expensive queries within request lifetime
export const getCachedOrder = cache(async (orderId: string) => {
  return await db.query.orders.getOne({
    where: eq(schema.orders.id, orderId),
  });
});
```

---

## Monitoring Queries

### Slow Query Log

```sql
-- Enable logging
ALTER DATABASE aurora SET log_min_duration_statement = 1000; -- 1s threshold

-- View slow queries
SELECT query, mean_exec_time, calls FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Query Performance Analysis

```sql
-- EXPLAIN ANALYZE slow query
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20;
```

---

## Maintenance Tasks (Regular)

### Weekly
```bash
# Vacuum and analyze
npm run db:vacuum

# Reindex if needed
npm run db:reindex
```

### Monthly
```bash
# Full maintenance
npm run db:maintenance

# Update statistics
npm run db:analyze
```

### Quarterly
```bash
# Archive old data
npm run db:archive

# Review slow queries
npm run db:slow-query-report
```

---

## Expected Performance Gains

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Fetch user orders | 500ms | 50ms | **10x** |
| List order items | 800ms | 80ms | **10x** |
| Search events | 2000ms | 200ms | **10x** |
| Payment lookup | 300ms | 30ms | **10x** |
| Generate invoice | 1200ms | 300ms | **4x** |

---

## Database Features to Enable

### PostgreSQL 14+ Features

```sql
-- BRIN indexes for time-series data (events, timestamps)
CREATE INDEX idx_events_ts_brin ON events USING BRIN (timestamp)
  WITH (pages_per_range = 128);

-- Partial indexes (only active records)
CREATE INDEX idx_orders_active ON orders(id)
WHERE status != 'completed';

-- Expression indexes (computed columns)
CREATE INDEX idx_orders_year ON orders(EXTRACT(YEAR FROM created_at));
```

---

## Automation Scripts

### Enable in `package.json`

```json
{
  "scripts": {
    "db:indexes": "node scripts/create-indexes.js",
    "db:analyze": "node scripts/analyze-queries.js",
    "db:vacuum": "node scripts/vacuum-database.js",
    "db:archive": "node scripts/archive-old-data.js",
    "db:monitor": "node scripts/monitor-queries.js"
  }
}
```

---

## Migration Checklist

- [ ] Create indexes (Phase 1)
- [ ] Optimize N+1 queries in checkout flow
- [ ] Optimize N+1 queries in order history
- [ ] Enable query logging
- [ ] Set up PgBouncer
- [ ] Archive orders > 2 years
- [ ] Archive events > 90 days
- [ ] Add monitoring dashboard
- [ ] Load test with 1000 concurrent users
- [ ] Document performance baselines

---

## Next Steps

1. **Immediate**: Apply Phase 1 indexes (1 hour)
2. **This Sprint**: Optimize queries + enable logging (2 days)
3. **Next Sprint**: Connection pooling + caching (2 days)
4. **Design Phase**: Archive strategy (1 week)

---

**Target**: 10x query performance improvement by end of Q1 2026

