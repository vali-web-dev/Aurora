# Aurora Deployment Guide

## Quick Production Deployment

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ database provisioned
- Domain configured with SSL/TLS certificate
- Environment variables prepared

### Step-by-Step Deployment

#### 1. Prepare Environment
```bash
# Clone repository
git clone <your-repo-url>
cd aurora

# Install production dependencies
npm ci --production=false

# Create production environment file
cp .env.example .env.production
# Edit .env.production with production values
```

#### 2. Configure Environment Variables

**Critical Variables (Required):**
```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database (with SSL)
DATABASE_URL=postgresql://user:password@host:5432/aurora?sslmode=require

# Authentication
NEXTAUTH_SECRET=<generated-secret-32-chars>
NEXTAUTH_URL=https://yourdomain.com
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

#### 3. Build Application
```bash
# Lint and type-check
npm run lint

# Build for production
npm run build
```

Expected output: ✓ Build successful with ~62 routes

#### 4. Database Setup
```bash
# Generate migrations (if needed)
npm run db:generate

# Apply schema to production database
npm run db:push

# DO NOT run db:seed in production unless seeding sample data
```

#### 5. Start Application
```bash
# Standard mode
npm run start

# OR with realtime support (Socket.IO)
npm run start:server
```

Application will run on port 3000 by default.

#### 6. Verify Deployment
```bash
# Health check
curl https://yourdomain.com/api/health

# Database health
curl https://yourdomain.com/api/health/db

# Expected response:
# {"status":"healthy","timestamp":"...","checks":{...}}
```

---

## Platform-Specific Deployments

### Vercel Deployment

1. **Connect Repository**
   - Import project in Vercel dashboard
   - Connect GitHub/GitLab repository

2. **Configure Environment Variables**
   - Add all required variables in Vercel dashboard
   - Settings → Environment Variables

3. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm ci
   ```

4. **Deploy**
   - Push to main branch
   - Automatic deployment triggered

**Note:** Vercel Postgres recommended for database

### AWS Deployment (EC2/ECS)

#### EC2 Instance

1. **Launch EC2 Instance**
   - Amazon Linux 2 or Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security group: Allow 80, 443, 22

2. **Install Dependencies**
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # PM2 (process manager)
   sudo npm install -g pm2
   ```

3. **Deploy Application**
   ```bash
   # Clone and build
   git clone <repo-url>
   cd aurora
   npm ci
   npm run build

   # Start with PM2
   pm2 start npm --name "aurora" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

#### ECS/Fargate

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Docker Deployment

1. **Create Dockerfile** (see above)

2. **Build Image**
   ```bash
   docker build -t aurora:latest .
   ```

3. **Run Container**
   ```bash
   docker run -d \
     -p 3000:3000 \
     --env-file .env.production \
     --name aurora \
     aurora:latest
   ```

4. **Docker Compose** (with PostgreSQL)
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/aurora
         - NEXT AUTH_SECRET=${NEXTAUTH_SECRET}
         - NEXTAUTH_URL=${NEXTAUTH_URL}
       depends_on:
         - db

     db:
       image: postgres:14-alpine
       environment:
         - POSTGRES_DB=aurora
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

---

## Security Checklist Before Go-Live

### Critical Security Steps

- [ ] **Secrets Generated**: Strong `NEXTAUTH_SECRET` (32+ chars)
- [ ] **Database Secured**: SSL enabled, strong password, restricted access
- [ ] **HTTPS Enabled**: Valid TLS certificate installed
- [ ] **OAuth Configured**: Only enable if providers are properly configured
- [ ] **Rate Limiting**: Verify limits in `src/lib/rate-limit.ts`
- [ ] **Error Messages**: Generic errors in production (no stack traces)
- [ ] **Logging**: Structured logs enabled, PII masked
- [ ] **Monitoring**: Health endpoints accessible (`/api/health`)
- [ ] **Backups**: Automated database backups configured
- [ ] **Firewall**: Restrict database to app servers only

### Security Headers Verification

Visit your site and check headers:
```bash
curl -I https://yourdomain.com
```

Expected headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (if HTTPS)

---

## Post-Deployment Monitoring

### Health Checks

Set up monitoring for:
1. **Application Health**: `GET /api/health`
2. **Database Health**: `GET /api/health/db`
3. **Response Time**: Target < 2 seconds
4. **Error Rate**: Target < 1%

### Recommended Monitoring Tools

- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry (configure `SENTRY_DSN`)
- **Performance**: Vercel Analytics, Google Analytics
- **Logs**: CloudWatch, Datadog, Logtail

### Alerts to Configure

- Application down (health check fails)
- Database connection errors
- High error rate (>5%)
- Slow response time (>5s)
- High memory usage (>80%)

---

## Rollback Strategy

### Quick Rollback Steps

1. **Identify Last Known Good Deployment**
   ```bash
   git log --oneline
   ```

2. **Revert to Previous Version**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Or Rollback on Platform**
   - **Vercel**: Deployments → Select previous → Promote
   - **AWS**: Update ECS task definition to previous revision
   - **PM2**: `pm2 reload aurora --update-env`

4. **Database Rollback** (if needed)
   ```bash
   # Restore from backup
   pg_restore -d aurora backup.dump
   ```

---

## Scaling Considerations

### Horizontal Scaling

- **Load Balancer**: Distribute traffic across multiple instances
- **Session Management**: Use Redis for session storage if scaling horizontally
- **Database**: Read replicas for heavy read traffic
- **Static Assets**: Use CDN (Cloudflare, CloudFront)

### Performance Optimization

- Enable Next.js caching
- Use CDN for static assets
- Optimize images (Next.js Image component)
- Database connection pooling configured

---

## Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection Fails:**
- Check `DATABASE_URL` format
- Verify database is running and accessible
- Check firewall rules
- Verify SSL settings

**Auth Not Working:**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Verify OAuth credentials (if using)

**500 Errors:**
- Check application logs
- Verify environment variables
- Check database connectivity
- Review error tracking (Sentry)

---

## Support & Documentation

- **Developer Documentation**: `/docs/aurora-book/developer/`
- **API Documentation**: `/docs/aurora-book/developer/api-and-realtime.md`
- **Architecture Guide**: `/docs/aurora-book/developer/architecture.md`
- **Production Setup**: `PRODUCTION_SETUP.md`
- **Security Configuration**: `src/lib/security-config.ts`

For production issues:
1. Check `/api/health` and `/api/health/db`
2. Review application logs
3. Check monitoring dashboards
4. Consult runbooks in documentation
5. Escalate to on-call engineer

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review error logs and alerts
- Check disk space and memory usage
- Verify backup completion

**Monthly:**
- Update dependencies (`npm update`)
- Review security advisories (`npm audit`)
- Test database restore
- Review access logs

**Quarterly:**
- Rotate secrets and API keys
- Review and update documentation
- Conduct security audit
- Load testing

---

## License & Security

Report security vulnerabilities to: security@yourdomain.com

Do not disclose security issues publicly until patched.
