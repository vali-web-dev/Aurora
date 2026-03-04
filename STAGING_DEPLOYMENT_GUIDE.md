# Aurora Staging Environment & Deployment Guide

**Status**: Phase 7 - Implementation Ready  
**Last Updated**: February 23, 2026  
**Target**: Production-Grade Staging  

---

## 📋 Overview

This guide covers:
1. **Staging Environment Setup** — Docker Compose configuration
2. **Environment Separation** — Staging vs Production secrets
3. **Database Configuration** — Separate staging database
4. **Load Testing** — k6 performance testing
5. **Pre-Production Validation** — Checklist before production deployment

---

## 🚀 Quick Start

### Local Staging Environment (5 minutes)

```bash
# 1. Start all services
docker-compose -f docker-compose.staging.yml up -d

# 2. Verify services
docker-compose -f docker-compose.staging.yml ps

# 3. Initialize database
npm run db:init

# 4. Run migrations
npm run db:migrate

# 5. Access staging
open http://localhost:3000
```

### Stop Staging Environment

```bash
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml down -v  # Remove volumes too
```

---

## 🐳 Docker Compose Configuration

Create `docker-compose.staging.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: aurora-staging-db
    environment:
      POSTGRES_USER: aurora_staging
      POSTGRES_PASSWORD: ${STAGING_DB_PASSWORD}
      POSTGRES_DB: aurora_staging
    ports:
      - "5433:5432"  # Different port from production
    volumes:
      - staging_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aurora_staging"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - aurora_staging

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: aurora-staging-cache
    ports:
      - "6380:6379"  # Different port from production
    volumes:
      - staging_cache_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - aurora_staging

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runtime
      args:
        NODE_ENV: staging
    container_name: aurora-staging-app
    environment:
      NODE_ENV: staging
      DATABASE_URL: postgresql://aurora_staging:${STAGING_DB_PASSWORD}@postgres:5432/aurora_staging
      REDIS_URL: redis://redis:6379
      NEXT_PUBLIC_API_URL: http://localhost:3000
      NEXT_PUBLIC_ENVIRONMENT: staging
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    networks:
      - aurora_staging

  # PgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: aurora-staging-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@aurora.local
      PGADMIN_DEFAULT_PASSWORD: ${STAGING_PGADMIN_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - aurora_staging

volumes:
  staging_db_data:
  staging_cache_data:

networks:
  aurora_staging:
    driver: bridge
```

---

## 🔑 Environment Configuration

### `.env.staging` (Staging Variables)

Create in project root:

```bash
# Environment
NODE_ENV=staging
NEXT_PUBLIC_ENVIRONMENT=staging

# Database
DATABASE_URL=postgresql://aurora_staging:${STAGING_DB_PASSWORD}@localhost:5433/aurora_staging
STAGING_DB_PASSWORD=your-secure-staging-password

# Redis
REDIS_URL=redis://localhost:6380

# API Keys (Test/Sandbox)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
ADYEN_API_KEY=your-adyen-test-key
ADYEN_API_URL=https://checkout-test.adyen.com

# Auth
NEXTAUTH_SECRET=staging-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_BATCH_SIZE=50
ANALYTICS_FLUSH_INTERVAL=5000

# PgAdmin
STAGING_PGADMIN_PASSWORD=admin-password

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

### Secrets Management

```bash
# Load staging secrets (do NOT commit to git)
export $(cat .env.staging | xargs)

# Verify secrets loaded
echo $DATABASE_URL
```

---

## 🗄️ Database Setup

### Create Staging Database Schema

```bash
# Connect to staging database
psql postgresql://aurora_staging:password@localhost:5433/aurora_staging

# Create essential tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  value INTEGER
);

# Create indexes
CREATE INDEX idx_events_user_timestamp ON events(user_id, timestamp DESC);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

# Exit psql
\q
```

### Seed Test Data

```bash
# Create seed script: scripts/db-seed-staging.js
npm run db:seed:staging
```

---

## 📊 Load Testing with k6

### Install k6

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows (via Chocolatey)
choco install k6
```

### Load Testing Script

Create `load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95th percentile < 500ms
    http_req_failed: ['rate<0.1'],                    // Failure rate < 10%
  },
};

export default function () {
  // Test API endpoints
  let res = http.get('http://localhost:3000/api/products');
  check(res, {
    'products status 200': (r) => r.status === 200,
    'products response < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test checkout flow
  res = http.post('http://localhost:3000/api/cart/items', {
    productId: '123',
    quantity: 1,
  }, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    'add to cart status 200': (r) => r.status === 200,
  });

  sleep(2);
}
```

### Run Load Test

```bash
# Run with default settings
k6 run load-test.js

# Run with custom VU count
k6 run -u 500 -d 10m load-test.js

# Generate summary report
k6 run -o json=staging-test-results.json load-test.js

# View results
cat staging-test-results.json | jq '.data.metrics'
```

---

## 📋 Pre-Production Validation Checklist

### Day 1: Environment Setup
- [ ] Docker Compose starts all services successfully
- [ ] Database migrations complete without errors
- [ ] Test data seeds successfully
- [ ] Web application accessible at localhost:3000
- [ ] PgAdmin accessible at localhost:5050

### Day 2: Functional Testing
- [ ] User can browse products
- [ ] User can add items to cart
- [ ] User can complete checkout
- [ ] Payments process successfully (test mode)
- [ ] Invoices generate correctly
- [ ] Shipping tracking works

### Day 3: Performance Testing
- [ ] Load test completes with < 500ms p95 response time
- [ ] Database queries complete within SLA
- [ ] Cache hit ratio > 99%
- [ ] No timeout errors under load
- [ ] Memory usage stays under limits

### Day 4: Security Testing
- [ ] HTTPS certificates valid (if applicable)
- [ ] CORS headers correct
- [ ] Rate limiting enabled
- [ ] SQL injection prevented
- [ ] XSS protection active

### Day 5: Analytics & Monitoring
- [ ] Events collect successfully
- [ ] Metrics dashboard loads
- [ ] Database backups functional
- [ ] Logs aggregate correctly
- [ ] Alerts trigger on errors

---

## 🔄 Deployment Strategies

### Strategy 1: Blue-Green Deployment

```bash
# Option A: Run in parallel
docker-compose -p aurora-blue up -d
docker-compose -p aurora-green up -d

# Test green environment
curl http://localhost:3001/health

# Switch traffic (via load balancer)
# Redirect all traffic to green

# Remove blue when stable
docker-compose -p aurora-blue down
```

### Strategy 2: Canary Deployment

```bash
# 1. Deploy to 10% of traffic
npm run deploy:canary --percentage=10

# 2. Monitor metrics for 30 minutes
npm run monitor:canary --duration=30m

# 3. If healthy, increase to 25%
npm run deploy:canary --percentage=25

# 4. Continue rolling out
npm run deploy:canary --percentage=50
npm run deploy:canary --percentage=100
```

### Strategy 3: Rolling Deployment

```bash
# 1. Deploy new version
docker-compose up -d --build

# 2. Run migrations
npm run db:migrate

# 3. Warm cache
npm run cache:warm

# 4. Health checks
npm run health:check

# 5. If all pass, mark as production-ready
echo "✅ Deployment successful"
```

---

## 📈 Performance Validation

### Create Performance Baseline

```bash
# Run initial tests
npm run api:perf > baseline-perf.json

# Compare with thresholds
npm run api:perf:compare --baseline baseline-perf.json
```

### Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| API Response Time (p95) | < 500ms | ✓ |
| API Response Time (p99) | < 1000ms | ✓ |
| Database Query Time | < 100ms | ✓ |
| Cache Hit Ratio | > 99% | ✓ |
| Error Rate | < 0.1% | ✓ |
| Throughput | > 1000 rps | ✓ |

---

## 🚨 Rollback Procedure

If staging deployment fails:

```bash
# 1. Identify issue
npm run diagnostics:strict

# 2. Check logs
docker-compose logs app | tail -100

# 3. Rollback to previous version
git checkout previous-commit
npm run build

# 4. Restart services
docker-compose down
docker-compose up -d

# 5. Verify recovery
npm run health:check
```

---

## 📚 Related Documentation

- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [k6 Performance Testing Guide](https://k6.io/docs/)
- [PostgreSQL Staging Setup](./DATABASE_OPTIMIZATION_GUIDE.md)
- [Production Deployment Guide](./PRODUCTION_SETUP.md)

---

## 🎯 Next Steps

1. ✅ Complete staging environment setup (this guide)
2. Run 3-day validation cycle (performance, security, functionality)
3. Document any issues and patches
4. Prepare production deployment (Friday)
5. Schedule maintenance window (Saturday 2-4 AM UTC)

---

**Environment**: Staging  
**Last Updated**: February 23, 2026  
**Maintained By**: Platform Engineering Team  

