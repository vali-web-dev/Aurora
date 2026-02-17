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

# Or start with realtime support (Socket.IO)
npm run dev:server

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
