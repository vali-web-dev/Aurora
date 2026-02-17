# Aurora Production Environment Configuration

## Critical Security Requirements

### 1. Generate Strong Secrets

```bash
# Generate NEXTAUTH_SECRET (required)
openssl rand -base64 32

# Generate additional secrets for encryption
openssl rand -hex 32
```

### 2. Production Environment Variables

Create `.env.production` (never commit this file):

```bash
# Node Environment
NODE_ENV=production

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database Configuration
# Use managed database service with SSL enabled
DATABASE_URL=postgresql://username:password@production-db-host:5432/aurora?sslmode=require

# Authentication (CRITICAL)
NEXTAUTH_SECRET=<YOUR_GENERATED_SECRET_HERE>
NEXTAUTH_URL=https://yourdomain.com

# OAuth Providers (Optional - only enable if configured)
# Leave blank to disable provider
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# Payment Processing (if enabled)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email Service (if enabled)
SENDGRID_API_KEY=
EMAIL_FROM=noreply@yourdomain.com

# File Storage (if enabled)
AWS_S3_ACCESS_KEY_ID=
AWS_S3_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_S3_REGION=

# Monitoring & Logging
SENTRY_DSN=
LOG_LEVEL=info

# Feature Flags
ENABLE_REAL_TIME=true
ENABLE_PAYMENTS=false
ENABLE_AI_FEATURES=false
```

### 3. Security Checklist Before Production

#### Database Security
- [ ] Use strong, unique database password (20+ characters)
- [ ] Enable SSL/TLS for database connections
- [ ] Restrict database access to application IP ranges only
- [ ] Enable database audit logging
- [ ] Configure automated backups (daily minimum)
- [ ] Test backup restore procedure

#### Application Security
- [ ] Generate and set strong `NEXTAUTH_SECRET`
- [ ] Configure HTTPS/TLS with valid certificates
- [ ] Enable HSTS (HTTP Strict Transport Security)
- [ ] Configure CSP (Content Security Policy) headers
- [ ] Enable rate limiting on API routes
- [ ] Disable verbose error messages (set NODE_ENV=production)
- [ ] Remove all console.log statements from production code

#### Access Control
- [ ] Implement MFA for admin accounts
- [ ] Review and restrict admin API routes
- [ ] Audit user roles and permissions
- [ ] Set up audit logging for admin actions
- [ ] Configure session timeout and refresh policies

#### Infrastructure
- [ ] Use a secrets manager (AWS Secrets Manager, HashiCorp Vault)
- [ ] Enable WAF (Web Application Firewall)
- [ ] Configure DDoS protection
- [ ] Set up monitoring and alerting
- [ ] Implement log aggregation and retention
- [ ] Configure CDN for static assets

### 4. Secrets Management Best Practices

**DO:**
- Use environment-specific secrets (never reuse dev secrets in prod)
- Store secrets in a managed secrets service
- Rotate secrets on a schedule (quarterly minimum)
- Use different secrets for each environment
- Encrypt secrets at rest and in transit
- Audit access to secrets

**DO NOT:**
- Commit secrets to git (add `.env*` to `.gitignore`)
- Share secrets via email, Slack, or other messaging
- Hard-code secrets in application code
- Use weak or predictable secrets
- Reuse secrets across multiple applications
- Log or print secrets to console

### 5. Database Connection String Format

**Development:**
```
postgresql://user:password@localhost:5432/aurora
```

**Production (with SSL):**
```
postgresql://user:password@prod-db-host:5432/aurora?sslmode=require&sslrootcert=/path/to/ca-cert.crt
```

**Connection Pool Settings for Production:**
```
postgresql://user:password@host:5432/aurora?max_connections=20&idle_timeout=30&connect_timeout=10
```

### 6. Production Deployment Steps

1. **Pre-deployment:**
   ```bash
   # Build application
   npm run build
   
   # Run tests
   npm test
   
   # Security audit
   npm audit --production
   ```

2. **Database migration:**
   ```bash
   # Review migration
   npm run db:generate
   
   # Apply in production (review first!)
   npm run db:push
   ```

3. **Start application:**
   ```bash
   # Standard mode
   npm run start
   
   # With realtime support
   npm run start:server
   ```

4. **Post-deployment:**
   - Verify health endpoints: `/api/health` and `/api/health/db`
   - Check monitoring dashboards
   - Review error logs
   - Test critical user flows

### 7. Monitoring Setup

Configure alerts for:
- Error rate > 1%
- Response time > 2 seconds
- Database connection failures
- Memory usage > 80%
- CPU usage > 70%
- Disk usage > 85%

### 8. Backup Strategy

**Database Backups:**
- Automated daily backups
- Retain for 30 days minimum
- Store in geographically separate region
- Test restore monthly

**Application Backups:**
- Version control (git) for code
- Immutable deployments
- Configuration backups
- Documentation backups

### 9. Incident Response Plan

1. **Detection:** Automated alerts + monitoring
2. **Triage:** Assess severity and impact
3. **Response:** Follow runbook for incident type
4. **Communication:** Update status page and stakeholders
5. **Resolution:** Apply fix and validate
6. **Post-incident:** Conduct retrospective within 48 hours

### 10. Compliance Requirements

- [ ] GDPR compliance (if serving EU users)
- [ ] Data retention policies implemented
- [ ] User consent workflow active
- [ ] Data export capability (portability)
- [ ] Data deletion capability (right to erasure)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent banner (if using cookies)

## Quick Start for Production

```bash
# 1. Clone repository
git clone <repo-url>
cd aurora

# 2. Install dependencies
npm install --production

# 3. Set environment variables
cp .env.example .env.production
# Edit .env.production with production values
nano .env.production

# 4. Build application
npm run build

# 5. Apply database migrations
npm run db:push

# 6. Start application
npm run start

# 7. Verify deployment
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/health/db
```

## Support

For production issues:
- Check logs first
- Review monitoring dashboards
- Consult runbooks in `/docs/aurora-book/developer/`
- Escalate to on-call engineer if needed

## Security Contact

Report security vulnerabilities to: security@yourdomain.com
