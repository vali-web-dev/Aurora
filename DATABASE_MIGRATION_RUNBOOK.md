# Aurora Database Migration & Optimization Runbook

**Status**: Phase 5 Complete  
**Last Updated**: February 23, 2026  
**Target**: 10x Query Performance Improvement  

---

## 🚀 Quick Start

### Apply All Optimizations (Development)
```bash
# 1. Create all indexes
npm run db:create-indexes

# 2. Monitor query performance
npm run db:monitor

# 3. Archive old data
npm run db:archive --dry-run   # Preview
npm run db:archive             # Execute
```

### Apply All Optimizations (Production)
```bash
# 1. During low-traffic window
npm run db:create-indexes

# 2. Verify health
npm run db:monitor

# 3. Enable slow query logging
psql -d aurora -c "ALTER DATABASE aurora SET log_min_duration_statement = 1000;"

# 4. Schedule archival job
# Add to cron: 0 2 * * 0 /app/scripts/db-archive.js
```

---

## 📋 Step-by-Step Implementation

### Step 1: Pre-Optimization Baseline (5 min)

```bash
# Capture current performance
npm run db:monitor > baseline-metrics.txt
npm run api:perf > baseline-perf.txt

# Store baseline for comparison
git add baseline-*.txt
git commit -m "docs: baseline metrics pre-optimization"
```

**Expected Output**: 
- Cache hit ratio: 80-95%
- Top slow queries listed
- Index utilization metrics

---

### Step 2: Create Essential Indexes (10 min)

```bash
# Preview what will be created
npm run db:create-indexes 2>&1 | head -20

# Execute index creation
npm run db:create-indexes

# Monitor progress
npm run db:health:json | jq '.indexes'
```

**Expected Behavior**:
- ✅ ~30 indexes created across commerce/social/analytics tables
- ✅ Database size increases by 10-15%
- ✅ Query times reduce immediately

**Rollback if Needed**:
```sql
-- Drop all new indexes (execute in psql)
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_created_at;
-- ... etc
```

---

### Step 3: Optimize N+1 Query Patterns (30 min, requires code review)

#### Before: N+1 Query Pattern
```typescript
// ❌ BAD: N+1 queries (1 order list + N order details)
const orders = await db.select().from(schema.orders).where(eq(schema.orders.userId, userId));
const ordersWithItems = await Promise.all(
  orders.map(order => 
    db.select().from(schema.cartItems).where(eq(schema.cartItems.orderId, order.id))
  )
);
```

#### After: Joined Query
```typescript
// ✅ GOOD: Single query with LEFT JOIN
const ordersWithItems = await db
  .select({
    order: schema.orders,
    items: schema.cartItems,
  })
  .from(schema.orders)
  .leftJoin(schema.cartItems, eq(schema.orders.id, schema.cartItems.orderId))
  .where(eq(schema.orders.userId, userId));
```

**Files to Review** (search for patterns):
- [src/app/api/orders/route.ts](../src/app/api/orders/route.ts) — Order listing endpoint
- [src/components/commerce/OrderHistory.tsx](../src/components/commerce/OrderHistory.tsx) — Order display component
- [src/lib/shop/orders.ts](../src/lib/shop/orders.ts) — Order service layer

**Verification**:
```bash
# Run query analysis after changes
npm run db:monitor | grep -A 5 "Slowest Queries"
```

---

### Step 4: Enable Query Logging (5 min)

```bash
# Connect to database
psql -h localhost -U postgres -d aurora

# Enable slow query logging
ALTER DATABASE aurora SET log_min_duration_statement = 1000;
ALTER DATABASE aurora SET log_statement = 'all';
ALTER DATABASE aurora SET log_duration = ON;

# View logs
SELECT query, mean_exec_time, calls FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

---

### Step 5: Test Performance Improvements (15 min)

```bash
# Run synthetic load test
npm run api:load-test --duration 60 --concurrency 100

# Capture new metrics
npm run db:monitor > optimized-metrics.txt
npm run api:perf > optimized-perf.txt

# Compare
diff baseline-perf.txt optimized-perf.txt
```

**Success Criteria**:
- ✅ Response times < 100ms (down from 500ms+)
- ✅ Cache hit ratio > 99%
- ✅ Database cpu < 30%
- ✅ Zero timeout errors

---

### Step 6: Archive Old Data (10 min)

```bash
# Preview archival (dry-run)
npm run db:archive:dry-run

# Execute archival
npm run db:archive

# Verify
npm run db:count | grep events
npm run db:health:json | jq '.sizes'
```

**Expected Result**:
- Events table reduced by 50-70% (if 90+ days of data)
- Archive tables created with full data history
- Performance significantly improved for recent data queries

---

### Step 7: Set Up Monitoring (continuous)

```bash
# Start continuous monitoring
npm run db:monitor

# Alternative: JSON output for dashboards
npm run db:health:json > /var/log/aurora-db-health.jsonl

# Add to crontab for periodic checks
0 * * * * npm run db:health:json >> /var/log/aurora-db-health.jsonl
```

**Metrics to Track**:
- Cache hit ratio (target: > 99%)
- Slow query count (target: < 5)
- Index bloat (target: < 20%)
- Connection count (target: < 50)

---

## 🔄 Migration Timeline

### Day 1: Development
- [ ] Run Step 1 (Baseline)
- [ ] Run Step 2 (Indexes)
- [ ] Run Step 5 (Performance Test)
- [ ] Commit metrics to git

### Day 2: Code Review
- [ ] Review N+1 patterns (Step 3)
- [ ] Create pull requests with optimizations
- [ ] Code review with team
- [ ] Merge to main branch

### Day 3: Staging Deployment
- [ ] Deploy to staging environment
- [ ] Run full load test (1000 concurrent users)
- [ ] Monitor for 24 hours
- [ ] Capture metrics

### Day 4: Production Deployment
- [ ] Deploy during low-traffic window (2-4 AM UTC)
- [ ] Run archival scripts
- [ ] Monitor metrics in real-time
- [ ] Enable alerts for anomalies

### Weekly: Maintenance
- [ ] Run `npm run db:monitor` (Monday 9 AM)
- [ ] Review slow query log
- [ ] Archive old data if needed
- [ ] Update performance dashboard

---

## 📊 Performance Targets

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Order fetch (10 items) | 500ms | 50ms | 10x |
| Analytics query (1000 events) | 2000ms | 200ms | 10x |
| Invoice generation | 1200ms | 300ms | 4x |
| Payment lookup | 300ms | 30ms | 10x |
| Cache hit ratio | 85% | 99%+ | Stable |
| Database CPU (100 rps) | 60% | 20% | 3x improvement |

---

## 🔍 Troubleshooting

### Problem: "Index creation failed"
```bash
# Check for lock conflicts
psql -d aurora -c "SELECT pid, query FROM pg_stat_activity WHERE state = 'active';"

# Kill blocking queries (if safe)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE duration > 300000;  -- > 5 minutes

# Retry
npm run db:create-indexes
```

### Problem: "Queries still slow after indexing"
```bash
# Verify index usage
npm run db:monitor | grep "Unused Indexes"

# Regenerate statistics
psql -d aurora -c "ANALYZE;"

# Check execution plan
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders WHERE user_id = 123;
```

### Problem: "Archival failed - permission denied"
```bash
# Check user permissions
psql -d aurora -c "\du"

# Grant permissions if needed
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

---

## 📝 Rollback Plan

### If Performance Degrades After Optimization

```bash
# 1. Disable new index temporarily
ALTER INDEX idx_orders_user_id UNUSABLE;

# 2. Verify improvement
npm run api:perf | grep "response_time"

# 3. If still slow, rollback all indexes
npm run db:reset

# 4. Debug issue
npm run db:monitor
npm run api:diagnose --strict
```

---

## 🎯 Success Checklist

- [ ] All indexes created successfully
- [ ] db:monitor shows no errors
- [ ] Response times < 100ms for typical queries
- [ ] Cache hit ratio > 99%
- [ ] No timeout errors in api:load-test
- [ ] Archival completed (if applicable)
- [ ] Monitoring active
- [ ] Metrics documented in git
- [ ] Team trained on new scripts
- [ ] Runbook updated

---

## 📚 Related Documentation

- [DATABASE_OPTIMIZATION_GUIDE.md](./DATABASE_OPTIMIZATION_GUIDE.md) — Full optimization details
- [COMMERCE_FEATURES_COMPLETE.md](./COMMERCE_FEATURES_COMPLETE.md) — Query patterns in commerce service
- [DIAGNOSTICS_QUICK_REFERENCE.md](./DIAGNOSTICS_QUICK_REFERENCE.md) — Monitoring commands

---

## 🚨 Emergency Contacts

**Performance Issue**: 
- Check: `npm run db:monitor`
- Escalate: Database admin

**Data Loss Concern**:
- Backup: `npm run db:export` (creates backup file)
- Restore: `npm run db:import` (restores from backup)

---

**Last Updated**: February 23, 2026  
**Next Review**: March 1, 2026  

