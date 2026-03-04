# Aurora - Digital Civilization Platform

> A calm, beautifully designed digital world for your creative life.

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)](PRODUCTION_READINESS_CHECKLIST.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)](https://www.typescriptlang.org/)

Aurora is a comprehensive, emotionally intelligent digital civilization platform that unifies 15 interconnected universes into one seamless experience. Built with clarity, beauty, integrity, humanity, and wonder.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
npm run db:push
npm run db:seed  # Optional: Add sample data

# Start development server
npm run dev

# Check active dev health endpoint
npm run dev:health

# Show running dev process + endpoint
npm run dev:status

# Force restart dev (clears stale lock/process)
npm run dev:restart

# Stop all workspace dev processes
npm run dev:stop

# Watchdog auto-restart mode (restarts on crash)
npm run dev:watch

# Or start with realtime support (Socket.IO)
npm run dev:server

# If you need the original raw Next.js startup command
npm run dev:raw

# Visit http://localhost:3000
```

## 📚 Documentation

- **[Production Readiness Checklist](PRODUCTION_READINESS_CHECKLIST.md)** - ✅ Status and requirements
- **[Production Setup Guide](PRODUCTION_SETUP.md)** - Environment and security configuration
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Platform-specific deployment instructions
- **[Developer Manual](docs/aurora-book/developer/)** - Complete architecture and API docs
- **[End-User Guide](docs/aurora-book/end-user/)** - Universe guides and tutorials

## 🌍 Universes

Aurora brings together 15 interconnected universes:

| Universe | Description | Route |
|----------|-------------|-------|
| **Home** | Personal dashboard and life control | `/home` |
| **Entertainment** | Unified video, music, and media | `/entertainment` |
| **Commerce** | Federated shopping with universal checkout | `/commerce` |
| **Social** | Unified feeds, communities, and messaging | `/social` |
| **Learning** | Global academy with courses and progress | `/learning` |
| **Create** | Creative studio for building surfaces | `/create` |
| **Brand** | Identity systems and campaigns | `/brand` |
| **Communities** | Creator groups and collaboration | `/communities` |
| **Gaming** | Games, clips, events, and leaderboards | `/gaming` |
| **Productivity** | Notes, tasks, calendar, boards | `/productivity` |
| **Travel** | Trip planning and itineraries | `/travel` |
| **Finance** | Spending, budgets, and goals | `/finance` |
| **Health** | Habits, sessions, reflection | `/health` |
| **Home Control** | Smart device management | `/homecontrol` |
| **Automation** | Routines and intelligent automation | `/automation` |

## 🛠 Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS
- **UI Library:** React 18+
- **Database:** PostgreSQL 14+ with Drizzle ORM
- **Authentication:** NextAuth.js v5
- **Realtime:** Socket.IO (optional)
- **Security:** Built-in rate limiting, PII masking, audit logging

## 🎨 Design System

### Visual Modes
- **Light** — Clean, bright interface
- **Dark** — Low-light mode for reduced eye strain
- **Illuminated** — Awe-inspiring colors and effects
- **System** — Follows OS preferences

### Theme Families
- **Home** — Warm, personal aesthetic
- **Office** — Professional, focused
- **Outdoor** — Natural, expansive
- **Lifestyle** — Contemporary, playful
- **Creative** — Expressive, bold

### Core Design Principles
- **Clarity:** Intentional, readable, grounded
- **Beauty:** Crafted, not cluttered
- **Integrity:** No dark patterns, no manipulation
- **Humanity:** Technology that supports, not replaces
- **Wonder:** Meaningful and emotionally resonant

## ✨ Key Features

### Production-Ready Infrastructure
- ✅ **Health Monitoring** - `/api/health` and `/api/health/db` endpoints
- ✅ **Structured Logging** - JSON logs with PII masking and audit trails
- ✅ **Rate Limiting** - In-memory rate limiter for API protection
- ✅ **Security Headers** - HSTS, CSP, XSS protection, frame denial
- ✅ **Error Sanitization** - Generic errors in production, detailed in dev
- ✅ **Auth Security** - Conditional OAuth, secure sessions, bcrypt passwords
- ✅ **CI/CD Pipeline** - GitHub Actions workflow for automated testing
- ✅ **Comprehensive Docs** - Developer and deployment guides included

### Design Language
- Adaptive theme system with global theme provider
- Motion tokens for consistent animation timing
- Color tokens for semantic and emotional palettes
- Typography system for clear hierarchy

### Accessibility
- High contrast mode support
- Reduced motion preferences
- Screen reader friendly
- Keyboard navigation support
- WCAG 2.1 AA+ compliance

### Components
- **Button** — Multiple variants (primary, secondary, accent, ghost)
- **Card** — Flexible, hoverable content containers
- **ThemeSwitcher** — Interactive theme and mode selection
- **TopNav** — Sticky global navigation with theme tools
- **AuroraShell** — Layout wrapper with header and footer
- **Hero** — Landing page hero section
- **FeatureGrid** — Feature showcase with 6 core capabilities
- **TrustSection** — Trust, ethics, and principles display

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ or higher
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Aurora-Rv.0

# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Development Server Commands

```bash
# Standard dev server (auto-recovery on stale lock)
npm run dev

# Raw Next.js dev (for comparison or special cases)
npm run dev:raw

# Watchdog mode (auto-restart on crash, limit 3)
npm run dev:watch

# Show running dev process + health endpoint
npm run dev:status

# Force restart dev (clears stale lock + stuck processes)
npm run dev:restart

# Stop all workspace dev processes
npm run dev:stop

# Remove lock file without restarting
npm run dev:unlock

# Start on specific port (default 3000)
npm run dev:port3000

# Health check on ports 3000-3005
npm run dev:health
npm run dev:health:json    # for automation/CI
```

### Comprehensive Dev Diagnostics

For a unified view of lock files, running processes, ports, cache size, and health status:

```bash
# Full diagnostic report with recommendations
npm run dev:diagnose

# JSON output for CI integration
npm run dev:diagnose:json

# Auto-apply recommended fixes
npm run dev:diagnose:fix
```

The diagnostics command scans:
- **Lock File:** Presence, age, staleness (>5min = stale)
- **Processes:** Running next dev processes + PIDs
- **Ports:** Availability of ports 3000-3005
- **Cache:** .next-dev directory size
- **Health:** HTTP /health checks on all candidate ports
- **Issues:** Inferred problems (stale lock, multiple servers, stuck processes)
- **Recommendations:** Suggested auto-fixes (unlock, restart, stop-all)

Example report structure:
```
📁 LOCK FILE        → exists, age, staleness
⚙️  PROCESSES        → count + PID list
🔌 PORTS            → availability status
💾 CACHE            → size in MB
❤️  HEALTH CHECK     → healthy endpoint URL
⚠️  ISSUES DETECTED  → severity + problem codes
💡 RECOMMENDATIONS  → actions to resolve
```

### Database Utilities

Comprehensive suite of commands for database inspection, validation, and management:

```bash
# Inspect tables and schema
npm run db:inspect           # List all tables
npm run db:inspect:json      # JSON output for automation

# Validate schema health
npm run db:validate:schema   # Check for issues (missing PK, NULL IDs, etc.)
npm run db:validate:schema:strict  # Fail on warnings

# Row counting and diagnostics
npm run db:count            # Show row count per table
npm run db:count:sort       # Sort by row count descending

# Database health status
npm run db:health           # Connection and performance check
npm run db:health:json      # Structured health output

# Data reset (with interactive confirmation)
npm run db:reset            # Truncate all tables with prompt
npm run db:reset:force      # --no-prompt mode for scripts

# Import/Export JSON
npm run db:export           # Export all tables to ./db-exports/
npm run db:export --table <name>  # Export specific table
npm run db:import --dir ./db-exports  # Import all JSON files
npm run db:import --file ./db-exports/users.json  # Import one file
```

These utilities integrate with your existing database setup (Drizzle ORM + PostgreSQL) and provide rapid diagnostics for development workflows.

### API Testing & Performance Tools

Comprehensive suite of commands for testing, debugging, and analyzing API endpoints:

```bash
# Test single endpoint with custom method/headers/body
npm run api:test -- http://localhost:3000/api/health
npm run api:test -- http://localhost:3000/api/users -m POST -d '{"name":"test"}'
npm run api:test -- http://localhost:3000/api/users --json

# Load testing with configurable concurrency
npm run api:load-test -- http://localhost:3000/api/health --count 100 --concurrency 10
npm run api:load-test -- http://localhost:3000/api/users --count 50 --json

# Performance analysis (P50/P95/P99 latencies)
npm run api:perf -- http://localhost:3000/api/health --samples 20
npm run api:perf -- http://localhost:3000/api/users --samples 50 --json

# Batch health check multiple endpoints
npm run api:health-batch -- http://localhost:3000/api/health http://localhost:3000/api/users
npm run api:health-batch -- --urls endpoints.json --json

# Analyze application routes
npm run api:routes             # List all detected routes
npm run api:routes --json      # JSON output
npm run api:routes --filter api  # Filter by pattern

# API Diagnostics

## Run all API diagnostics (routes + batch health + perf + schema + auth)
npm run api:diagnose
npm run api:diagnose:json
npm run api:diagnose:summary   # Compact one-line output
npm run api:diagnose -- --base=http://localhost:3001

## Output Formats
npm run api:diagnose:artifact  # Writes artifacts/api-diagnostics.json
npm run api:diagnose:junit     # Writes artifacts/api-diagnostics.junit.xml
npm run api:diagnose:html      # Writes artifacts/api-diagnostics.html report
npm run api:diagnose:ndjson    # Newline-delimited JSON per check
npm run api:diagnose:trace     # Include per-check timing breakdown

## Validation & Gates
npm run api:diagnose:strict    # Fail when checks are skipped
npm run api:diagnose:strict:summary  # Strict + compact
npm run api:ci:diagnose        # CI-friendly default (strict + summary + allow-skip)
npm run api:diagnose:smoke     # Fast smoke test (1 sample, /api/health only)
npm run api:diagnose:baseline:write  # Save baseline for regression tests
npm run api:diagnose:regression  # Compare vs baseline, report deltas
npm run api:diagnose:preflight  # Required env preflight validation
npm run api:diagnose:dependencies  # External/local dependency probes
npm run api:diagnose:slo  # Route-level SLO gate
npm run api:diagnose:flaky  # Flakiness confidence score from history
npm run api:diagnose:rerun  # Auto-rerun failed checks with triage label

## Presets & Profiles
npm run api:diagnose:auth      # Auth checks (Bearer + cookie)
npm run api:diagnose:schema-contract  # Schema field coverage tests
npm run api:diagnose:openapi:auto  # Auto-detect OpenAPI spec
npm run api:diagnose:universe:all  # Test all universes
npm run api:ci:diagnose:matrix  # Multi-environment matrix mode

## Advanced Flags
npm run api:diagnose -- --retries=2 --retry-delay-ms=750
npm run api:diagnose -- --ports=3000,3001,3002
npm run api:diagnose -- --include-endpoints=/api/health,/api/health/db
npm run api:diagnose -- --exclude-endpoints=/api/health/db
npm run api:diagnose -- --profile strict  # strict | balanced | lenient
npm run api:diagnose -- --latency-fail-ms=900 --error-rate-fail=0.15
npm run api:diagnose -- --diff
npm run api:diagnose -- --openapi openapi.json
npm run api:diagnose -- --openapi-auto  # Auto-detect spec
npm run api:diagnose -- --matrix-preset dev  # dev | stage | prod
npm run api:diagnose -- --matrix=http://localhost:3000,http://localhost:3001
npm run api:diagnose -- --auto-start-dev --auto-start-timeout=20
npm run api:diagnose -- --auth-token-env API_TOKEN
npm run api:diagnose -- --auth-cookie-env API_AUTH_COOKIE
npm run api:diagnose -- --auth-header "X-API-Key:dev-key"
npm run api:diagnose -- --schema-contract artifacts/api-schema-contract.json
npm run api:diagnose -- --preflight-env DATABASE_URL,NEXTAUTH_SECRET
npm run api:diagnose -- --dependency-targets https://api.example.com/health,https://redis.example.com/ping
npm run api:diagnose -- --dependency-config artifacts/diagnostics-dependencies.json
npm run api:diagnose -- --slo-file artifacts/api-slo.json --slo-samples 3 --slo-max-endpoints 10
npm run api:diagnose -- --flaky-window 8 --flaky-fail-score 75
npm run api:diagnose -- --rerun-on-fail
npm run api:diagnose -- --webhook-url https://hooks.slack.com/services/xxx
npm run api:diagnose -- --html-out artifacts/report.html
npm run api:diagnose -- --gha-summary

## Platform-wide Diagnostics (dev + db + api aggregator)
npm run platform:diagnose        # Default (allow DB skip)
npm run platform:diagnose:strict # Fail if DB unreachable
npm run platform:diagnose:summary  # Compact CI output
npm run platform:diagnose:html   # HTML report
npm run platform:diagnose:ndjson # Per-check NDJSON
npm run platform:diagnose:trace  # Include timing
npm run platform:diagnose:webhook  # Send failure alert to Slack/Teams
npm run platform:diagnose:auto-start  # Auto-start dev server before checks

## Dashboard & Monitoring
Visit http://localhost:3000/dev/diagnostics for the interactive dashboard
- Real-time status cards
- Universe coverage charts
- Failure trend sparklines
- Latest 12-run history feeds
- Baseline diff tracking
- Release readiness scorecard
- Canary vs stable comparison card
- Scheduler alerts feed
- Per-check drilldown views (/dev/diagnostics/api, /dev/diagnostics/platform)
	- Search check names + download JSON
	- Collapsible sections + pagination
	- Tags by check type + copy JSON
- Auto-refresh mode
- Direct command reference

## Compare, Schedule, Scorecard
npm run diagnostics:compare  # Canary vs stable comparison (requires envs)
npm run diagnostics:schedule  # Run scheduled diagnostics from config
npm run diagnostics:schedule:once  # Run all scheduled jobs once
npm run diagnostics:readiness  # Release readiness scorecard

### Scheduler Alerts
- Add `webhookUrl` per job in artifacts/diagnostics-schedule.json
- Or set `SCHEDULE_WEBHOOK_URL` for global alerts

### Canary Compare History
`diagnostics:compare` writes artifacts/api-diagnostics.compare-history.json for trend charts

### Compare Overrides
You can override env-based URLs:
`npm run diagnostics:compare -- --stable http://localhost:3001 --canary http://localhost:3002`

## Mock API Server
npm run api:mock -- --port 3001

Provides pre-configured endpoints for testing:
- `GET /api/health` → `{ status: 'healthy' }`
- `GET /api/users` → List of users
- `GET /api/posts` → List of posts
- Full CORS support


### Available Scripts

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Build Reliability Note

- `npm run build` and `npm run build:ci` use `scripts/next-build-retry.js`.
- A build lock file (`.next-build.lock`) prevents concurrent `next build` runs from clobbering artifacts.
- Stale locks are auto-recovered when the lock owner process is no longer running.
- The wrapper retries once after cleaning `.next-build` only (it does not remove `.next-dev`).
- This is a safeguard for intermittent Next.js manifest race failures seen on some Windows environments.
- Build output still fails normally after the retry if there is a real compile/lint/type error.

If a build is interrupted unexpectedly and you need to recover manually:

```powershell
Remove-Item .next-build.lock -Force -ErrorAction SilentlyContinue
npm run build:ci
```

For machine-readable CI diagnostics, use:

```bash
npm run build:json
npm run build:ci:json
```

These enable `NEXT_BUILD_JSON_LOGS=1` and emit one JSON line per retry event (lock, attempt start/finish, cleanup, final status).

To generate a one-line summary from JSON events:

```bash
npm run build:json:summary
npm run build:ci:json:summary
```

These commands now print both a `BUILD_SUMMARY ...` line and a compact `BUILD_BADGE ...` line where `status` is `stable`, `retried`, or `failed`.

For a CI-focused alias:

```bash
npm run build:ci:json:summary:badge
```

To emit the summary itself as JSON (for CI artifact ingestion):

```bash
npm run build:json:summary:json
npm run build:ci:json:summary:json
```

To enforce CI thresholds (current defaults: max 1 attempt and max 300000ms total):

```bash
npm run build:ci:json:gate
npm run build:ci:json:gate:json
```

To control thresholds via environment variables (no script edits):

```bash
# Example values
BUILD_GATE_MAX_ATTEMPTS=1
BUILD_GATE_MAX_TOTAL_MS=300000

npm run build:ci:json:gate:env
npm run build:ci:json:gate:env:json
```

The parser reads `BUILD_GATE_MAX_ATTEMPTS` and `BUILD_GATE_MAX_TOTAL_MS` when explicit CLI flags are not provided.

Profile presets are also available:

```bash
node scripts/summarize-build-events.js --file build-ci-json.log --profile strict --json
node scripts/summarize-build-events.js --file build-ci-json.log --profile balanced --json
node scripts/summarize-build-events.js --file build-ci-json.log --profile lenient --json
```

You can set a default profile with `BUILD_GATE_PROFILE` (`strict`, `balanced`, `lenient`).

To publish a markdown report directly into GitHub Actions job summary:

```bash
npm run build:ci:json:gha-summary
```

This uses `GITHUB_STEP_SUMMARY` and appends the generated build telemetry report.

Aurora CI workflows also parse `build-ci-json.log` with the balanced profile and emit a compact GitHub annotation badge:

- `✅ stable` for first-attempt success
- `⚠️ retried` for success after retry
- `❌ failed` for build or gate failures

CI runs also upload telemetry artifacts (`build-ci-json.log`, `build-summary.json`, `build-report.md`) for post-run diagnostics.

The parser also supports direct flags:

```bash
node scripts/summarize-build-events.js --file build-ci-json.log --max-attempts 1 --max-total-ms 300000 --json
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with ThemeProvider
│   ├── page.tsx                 # Home page
│   ├── about/                   # About universe
│   ├── product/                 # Product universe
│   ├── realms/                  # Realms universe
│   ├── create/                  # Create (builder) universe
│   ├── guilds/                  # Guilds (communities) universe
│   └── ...                      # Other universe pages
├── components/
│   ├── aurora/                  # Design system components
│   │   ├── Button.tsx           # Themeable button component
│   │   ├── Card.tsx             # Card container
│   │   └── ThemeSwitcher.tsx    # Theme and mode switcher
│   ├── home/                    # Home page components
│   │   ├── Hero.tsx             # Hero section
│   │   ├── FeatureGrid.tsx      # Feature showcase
│   │   └── TrustSection.tsx     # Trust and values
│   └── os/                      # Operating system shell
│       ├── AuroraShell.tsx      # Main layout wrapper
│       ├── TopNav.tsx           # Navigation header
│       └── Footer.tsx           # Footer component
├── lib/
│   ├── design-system/           # Design system utilities
│   │   ├── tokens.ts            # Color, typography, motion tokens
│   │   └── theme-provider.tsx   # Theme context and provider
│   ├── navigation.ts            # Navigation structure
│   └── utils.ts                 # Utility functions (cn, etc.)
├── aurora_blueprint.json        # Aurora specification
├── aurora_schema.sql            # Database schema
└── globals.css                  # Global styles

```

## 🎯 Development Workflow

### Creating a New Component

1. Create component in appropriate `components/` directory
2. Use Tailwind CSS for styling
3. Use the `cn` utility for conditional classes
4. Make it responsive with Tailwind breakpoints
5. Test in light/dark modes using ThemeSwitcher

### Creating a New Universe

1. Create folder in `app/`
2. Add `page.tsx` with universe content
3. Use `AuroraShell` wrapper
4. Follow design system tokens
5. Add navigation link in `lib/navigation.ts`

### Styling Guidelines

- Use Tailwind CSS utilities instead of custom CSS
- Respect light/dark mode with `dark:` prefix
- Use design tokens from `lib/design-system/tokens.ts`
- Maintain consistent spacing (use Tailwind scale: sm, md, lg, xl, etc.)
- Use semantic color suffixes (primary, secondary, accent, success, error, warning, info)

## 🔒 Trust & Ethics

Aurora is built on four core commitments:

1. **Ethical AI** — Non-invasive, optional, transparent. AI serves creativity, never manipulation.
2. **Privacy-First** — Your data belongs to you. No selling, trading, or exploiting.
3. **Accessible** — High contrast, large text, screen readers, clear language for all.
4. **No Dark Patterns** — Transparent pricing, clear settings, respectful design throughout.

## 📦 Environment Variables

Create `.env.local` in project root:

```
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Run TypeScript type check
npm run build

# Run ESLint
npm run lint
```

## 📚 Documentation

- **Aurora Master Prompt:** `src/Aurora-Master-prompt-VS.txt`
- **Aurora Blueprint:** `src/aurora_blueprint.json`
- **Database Schema:** `src/aurora_schema.sql`

## 🎓 Learning Aurora

Key concepts:

- **Universes:** 15 domains seamlessly integrated
- **Themes:** Adaptive interfaces that feel personal
- **Design System:** Tokens for colors, typography, motion
- **Accessibility:** Built-in, not added later
- **Ethical Design:** Privacy, clarity, and integrity first

## 🚧 Development Status

Aurora Rv.0 (Revision 0) is in active development:

- ✅ Design system foundation
- ✅ Core components and layouts
- ✅ Theme switching functionality
- ✅ Navigation structure
- ⏳ Database integration (coming)
- ⏳ User authentication (coming)
- ⏳ Full 15 universe implementations (coming)
- ⏳ Real-time features (coming)

## 📄 License

Aurora © 2026. All rights reserved.

---

**Built with clarity, beauty, integrity, humanity, and wonder.**
