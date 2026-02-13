# Aurora - Digital Civilization Platform

> A calm, beautifully designed digital world for your creative life.

Aurora is a comprehensive, emotionally intelligent digital civilization platform that unifies 15 interconnected universes into one seamless experience. Built with clarity, beauty, integrity, humanity, and wonder.

## 🌍 Overview

Aurora brings together:
- **Home** — Personal dashboard and life control
- **Entertainment** — Unified video, music, and media
- **Commerce** — Federated shopping with universal checkout
- **Social** — Unified feeds, communities, and messaging
- **Learning** — Global academy with courses and progress
- **Forge** — Creative studio for building surfaces and components
- **Brand** — Identity systems and campaigns
- **Communities** — Creator groups and collaboration
- **Gaming** — Games, clips, events, and leaderboards
- **Productivity** — Notes, tasks, calendar, boards
- **Travel** — Trip planning and itineraries
- **Finance** — Spending, budgets, and goals
- **Health & Wellness** — Habits, sessions, reflection
- **Home Control** — Smart device management
- **Automation & Agents** — Routines and intelligent automation

## 🛠 Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** React 18+
- **Components:** Modular, accessible, and themeable
- **Design System:** Aurora Design Language with tokens for color, typography, motion
- **Database Schema:** PostgreSQL (provided in `src/aurora_schema.sql`)

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
│   ├── forge/                   # Forge (builder) universe
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
