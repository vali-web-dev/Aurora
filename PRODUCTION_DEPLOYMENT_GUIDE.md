# Aurora Production Deployment & Operations Guide

**Status**: Phase 8 - Production Ready  
**Last Updated**: February 23, 2026  
**Audience**: Platform Engineering, DevOps, CTO  

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Production Infrastructure](#production-infrastructure)
3. [Deployment Process](#deployment-process)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Operations & Monitoring](#operations--monitoring)
6. [Incident Response](#incident-response)
7. [Rollback Procedures](#rollback-procedures)

---

## ✅ Pre-Deployment Checklist

### Code Quality (Must Pass)
- [ ] All tests passing: `npm run test:strict`
- [ ] No linting errors: `npm run lint:strict`
- [ ] TypeScript strict mode: `npm run type-check`
- [ ] Security audit: `npm audit --audit-level=moderate`
- [ ] Code review approved by 2+ maintainers
- [ ] Git commit signed: `git commit -S`

### Infrastructure (Must Complete)
- [ ] Production database provisioned and tested
- [ ] SSL/TLS certificates installed
- [ ] Domain DNS records configured
- [ ] CDN configured for static assets
- [ ] Load balancer configured and health checks set
- [ ] Backup systems tested
- [ ] Monitoring & alerting configured

### Secrets & Configuration (Must Verify)
- [ ] All environment variables set in production
- [ ] No secrets in git history: `npm run audit:secrets`
- [ ] API keys rotated within last 30 days
- [ ] Database credentials in secure vault
- [ ] Encryption keys backed up offline

### Documentation (Must Complete)
- [ ] Runbook updated with production procedures
- [ ] Architecture diagrams current
- [ ] Team trained on incident response
- [ ] On-call schedule published
- [ ] Communication plan for deployment

---

## 🏗️ Production Infrastructure

### Cloud Architecture

```
┌─────────────────────────────────────────────────┐
│                 CDN (CloudFlare)                │
│              Static Assets & Caching             │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Load Balancer (ALB)                │
│          Health Checks Every 10 Seconds          │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼──┐    ┌────▼──┐   ┌────▼──┐
   │App 1  │    │App 2  │   │App 3  │
   │3000ms │    │3000ms │   │3000ms │
   └────┬──┘    └────┬──┘   └────┬──┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼──────┐          ┌──────▼────┐
   │PostgreSQL │          │  Redis    │
   │ Primary   │          │  Cluster  │
   │ (Region A)│          │ (Region A)│
   └────┬──────┘          └──────┬────┘
        │                        │
        └────────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Backups   │
              │ (Region B)  │
              └─────────────┘
```

### Database Configuration

```sql
-- Production Database Setup
CREATE DATABASE aurora_prod;

-- High-availability replication
-- Primary: aurora-db-primary.region-a.internal
-- Replica: aurora-db-replica.region-b.internal
-- Backup: aurora-db-backup.region-c.internal

-- Connection pooling
-- Min connections: 10
-- Max connections: 100
-- Idle timeout: 300 seconds

-- Automatic failover enabled
-- Recovery time objective (RTO): 5 minutes
-- Recovery point objective (RPO): < 30 seconds
```

### Domain & SSL

```
Domain: aurora.com
Subdomain API: api.aurora.com
Subdomain Analytics: analytics.aurora.com

SSL Certificates:
- *.aurora.com (wildcard)
- Valid for: Feb 23, 2026 - Feb 23, 2027
- Issuer: Let's Encrypt
- Auto-renewal: Enabled
- Monitoring: Alert if expires in 30 days
```

---

## 🚀 Deployment Process

### Deployment Schedule

**Recommended Window**: Saturday 2-4 AM UTC
- Low user traffic
- Team available for monitoring
- 2-hour rollback window available

### Step 1: Final Pre-Deployment (1 hour before)

```bash
# 1. Lock deployments (prevent accidental deploys)
git tag -a v1.0.0-prod -m "Production deployment $(date)" --sign

# 2. Create backup snapshot
npm run db:export > backups/aurora-pre-deployment-$(date +%s).sql

# 3. Run final smoke tests
npm run test:smoke --environment=staging

# 4. Notify team
curl -X POST https://slack.com/api/chat.postMessage \
  -H 'Content-Type: application/json' \
  -d '{
    "channel": "#platform-deployments",
    "text": "🚀 Aurora v1.0.0 deployment starting in 60 minutes"
  }'
```

### Step 2: Deploy New Version (30 minutes)

```bash
# 1. Build production image
docker build \
  --target runtime \
  --build-arg NODE_ENV=production \
  --tag aurora:v1.0.0 \
  --tag aurora:latest .

# 2. Push to container registry
docker push aurora:v1.0.0
docker push aurora:latest

# 3. Update deployment (gradual rollout)
kubectl set image deployment/aurora-app \
  aurora-app=aurora:v1.0.0 \
  --record

# 4. Monitor rollout
kubectl rollout status deployment/aurora-app --timeout=10m

# 5. Verify new pods healthy
kubectl get pods -l app=aurora
```

### Step 3: Database Migrations (10 minutes)

```bash
# 1. Run migrations (non-blocking)
npm run db:migrate -- --production

# 2. Create indexes (if needed)
npm run db:create-indexes -- --production

# 3. Update statistics
npm run db:analyze

# 4. Wait for migration complete
npm run db:migrate:status
```

### Step 4: Cache Warmup (5 minutes)

```bash
# 1. Warm static file cache
npm run cache:warm -- --environment=production

# 2. Warm API response cache
npm run cache:warm:api

# 3. Verify cache hit ratio
npm run db:monitor | grep "Cache Hit Ratio"
```

---

## ✅ Post-Deployment Verification

### Immediate Verification (5 minutes)

```bash
# 1. Health checks
curl https://api.aurora.com/health
# Expected: { "status": "ok", "version": "1.0.0" }

# 2. API endpoints responding
curl https://api.aurora.com/api/products | jq '.count' > /dev/null
echo "✓ API responding"

# 3. Database connected
curl https://api.aurora.com/api/health/db
# Expected: { "dbStatus": "connected" }

# 4. Cache working
curl https://api.aurora.com/cache/status
# Expected: { "hitRatio": 0.99 }
```

### Extended Verification (30 minutes)

```bash
# 1. Monitor error rate
npm run monitor:errors -- --duration=30m --threshold=0.1%

# 2. Check response times
npm run monitor:latency -- --log-file=deployment-latency.json

# 3. Verify payment processing
npm run test:payment --environment=production --test-count=10

# 4. Check analytics pipeline
npm run test:analytics --environment=production

# Example test results:
# ✓ All payments processed (10/10)
# ✓ Analytics events collected (100+ events/min)
# ✓ Error rate < 0.1%
# ✓ P95 latency < 500ms
```

### Long-term Monitoring (1 hour+)

```bash
# 1. Database performance
npm run db:monitor

# 2. Application performance
npm run monitor:apm

# 3. User behavior analytics
npm run analytics:metrics --output=markdown > deployment-metrics.md

# 4. Error tracking
npm run monitor:sentry --overview
```

---

## 📊 Operations & Monitoring

### Key Metrics Dashboard

Create `/monitoring/grafana-aurora-prod.json`:

```json
{
  "dashboard": {
    "title": "Aurora Production Dashboard",
    "panels": [
      {
        "title": "Request Rate (requests/sec)",
        "targets": [
          {
            "query": "rate(http_requests_total[1m])"
          }
        ]
      },
      {
        "title": "Response Time (p95 latency)",
        "targets": [
          {
            "query": "histogram_quantile(0.95, http_request_duration_seconds)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "query": "rate(http_requests_total{status=~'5..'}[1m])"
          }
        ]
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "query": "pg_stat_activity_count"
          }
        ]
      },
      {
        "title": "Cache Hit Ratio",
        "targets": [
          {
            "query": "redis_keyspace_hits_total / (redis_keyspace_hits_total + redis_keyspace_misses_total)"
          }
        ]
      }
    ]
  }
}
```

### Alerting Rules

Create `/monitoring/prometheus-alerts.yml`:

```yaml
groups:
  - name: aurora_production
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate on Aurora ({{ $value }}%)"

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        annotations:
          summary: "High latency on Aurora ({{ $value }}s)"

      - alert: DatabaseDown
        expr: pg_up == 0
        for: 1m
        annotations:
          summary: "PostgreSQL down"

      - alert: LowCacheHitRatio
        expr: redis_keyspace_hits / (redis_keyspace_hits + redis_keyspace_misses) < 0.95
        for: 10m
        annotations:
          summary: "Cache hit ratio below threshold"

      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 10m
        annotations:
          summary: "Disk space running low"
```

---

## 🚨 Incident Response

### Critical Incident (Error Rate > 5%)

```bash
# 1. Assess severity
ERROR_RATE=$(curl https://api.aurora.com/health/metrics | jq '.error_rate')
if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
  echo "CRITICAL: Error rate $ERROR_RATE exceeds threshold"
fi

# 2. Notify on-call
curl -X POST $PAGERDUTY_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{
    "routing_key": "PAGERDUTY_ROUTING_KEY",
    "event_action": "trigger",
    "severity": "critical",
    "summary": "Aurora error rate critical"
  }'

# 3. Gather logs
kubectl logs -l app=aurora --tail=1000 > incident-logs.txt

# 4. Check recent changes
git log --oneline -n 20

# 5. Prepare rollback if needed
npm run deploy:rollback --to=v0.9.9 --dry-run
```

### Performance Degradation (P95 > 1s)

```bash
# 1. Check database performance
npm run db:monitor | grep "Slowest Queries"

# 2. Check CPU/Memory usage
kubectl top pods -l app=aurora

# 3. Check if cache is working
redis-cli INFO stats | grep hits

# 4. Check active connections
psql -c "SELECT count(*) FROM pg_stat_activity"

# 5. If database issue, scale horizontally
kubectl scale deployment aurora-app --replicas=10
```

### Database Replication Lag

```bash
# 1. Check replication lag
psql -h aurora-db-replica.region-b.internal -c "SELECT now() - pg_last_xact_replay_timestamp();"

# 2. If lag > 5 seconds, alert team
# 3. Monitor until lag resolves
# 4. If doesn't resolve, promote replica to primary
```

---

## ⏮️ Rollback Procedures

### Quick Rollback (< 5 minutes)

```bash
# 1. Identify issue
npm run diagnostics:strict > rollback-analysis.txt

# 2. Trigger automatic rollback
kubectl rollout undo deployment/aurora-app --to-revision=1

# 3. Verify rollback complete
kubectl rollout status deployment/aurora-app

# 4. Confirm services healthy
npm run health:check

# 5. Notify team
echo "✓ Rollback to v0.9.9 complete"
```

### Full Rollback (Manual)

```bash
# 1. Stop current deployment
kubectl set image deployment/aurora-app aurora-app=aurora:v0.9.9

# 2. Roll back database (if migrations ran)
npm run db:migrate:rollback

# 3. Restore from backup if needed
npm run db:import < backups/aurora-pre-deployment-*.sql

# 4. Clear all caches
npm run cache:flush

# 5. Health check
npm run test:smoke --environment=production

# 6. If all passes, deployment complete
echo "✓ Full rollback successful"
```

---

## 📈 Post-Deployment Metrics

### Success Criteria

Track first 24 hours:

- ✅ Error rate < 0.1%
- ✅ P95 latency < 500ms
- ✅ Cache hit ratio > 99%
- ✅ 99.9% uptime
- ✅ Zero data loss incidents
- ✅ All payment transactions successful
- ✅ User feedback positive

### Weekly Metrics Review

```bash
# Generate weekly report
npm run report:production -- --format=markdown --output=weekly-metrics.md

# Sample metrics:
# - Total requests: 5.2M
# - Error rate: 0.08%
# - Most common error: Session timeout (0.05%)
# - Top slow endpoint: /api/analytics/metrics (avg 250ms)
# - Database: 98.5% avg CPU, 4.2GB RAM
# - Users active: 50K peak
```

---

## 🎓 Team Operations

### On-Call Rotation

- **Primary**: Pages immediately, handles critical incidents (24x7)
- **Secondary**: Pages for critical incidents after 15 minutes (business hours)
- **Escalation**: Both unavailable after 30 minutes

### Communication Channels

- **Critical Issue**: #aurora-critical (Slack)
- **Deployment Updates**: #platform-deployments (Slack)
- **General Updates**: @aurora-team (email digest)

### Runbook Access

```bash
# View runbook
cat production-runbook.md

# Quick commands
alias aurora-status='curl https://api.aurora.com/health'
alias aurora-logs='kubectl logs -l app=aurora'
alias aurora-metrics='npm run monitor:apm'
```

---

## 📚 Related Documentation

- [DATABASE_OPTIMIZATION_GUIDE.md](./DATABASE_OPTIMIZATION_GUIDE.md) — Database tuning
- [DATABASE_MIGRATION_RUNBOOK.md](./DATABASE_MIGRATION_RUNBOOK.md) — Migration procedures
- [STAGING_DEPLOYMENT_GUIDE.md](./STAGING_DEPLOYMENT_GUIDE.md) — Staging setup
- [DIAGNOSTICS_QUICK_REFERENCE.md](./DIAGNOSTICS_QUICK_REFERENCE.md) — Troubleshooting

---

## 🎯 Post-Launch Roadmap

- Week 1: Monitor stability & performance
- Week 2: Optimize based on metrics
- Week 3: Scale based on user growth
- Week 4: Plan feature releases

---

**Environment**: Production  
**Last Updated**: February 23, 2026  
**Version**: Aurora v1.0.0  

