---
title: Aurora Developer Manual
version: 0.1
release_date: 2026-02-16
status: living
audience: developers and integrators
price: free with community contribution guidelines
format: markdown
license: proprietary with community attribution
UUID: aurora-book-dev-v0.1
SKU: AURORA-BOOK-DE-001
ISSN: 9999-999X
Edition_number: 1
Copyright: "© 2026 Aurora Platform. All rights reserved."
Contrib_guidelines: See CONTRIBUTING.md and contributing.md chapter
Contrib_url: https://contribute.aurora-platform.local/docs
Support_url: https://developer.aurora-platform.local/support
Download_formats: Web (HTML), PDF, Markdown
---

# Aurora Developer Manual

This edition is for developers, integrators, and platform builders. It consolidates architecture, design system, data model, APIs, real-time systems, and documentation operations.

## Table of Contents

### Build From Source (Start Here)
- [Architecture overview](/docs/aurora-book/developer/architecture)
- [Data and database](/docs/aurora-book/developer/data-and-db)
- [API and realtime](/docs/aurora-book/developer/api-and-realtime)
- [Documentation operations](/docs/aurora-book/developer/documentation-ops)

### Full Rebuild Checklist
1. Install dependencies (`npm install`)
2. Configure `.env.local` from `.env.example`
3. Run database bootstrap (`db:generate`, `db:push`, `db:seed`)
4. Start app (`npm run dev`)
5. Start realtime server if enabled (`npm run dev:server`)
6. Verify `/api/health`, `/api/health/db`, and `/docs/aurora-book/developer`

### Foundations
- [Architecture overview](/docs/aurora-book/developer/architecture)
- [Security, privacy, and ethics](/docs/aurora-book/developer/security-privacy-ethics)

### Platform Systems
- [Design system](/docs/aurora-book/developer/design-system)
- [Companion system](/docs/aurora-book/developer/companion-system)
- [Data and database](/docs/aurora-book/developer/data-and-db)
- [API and realtime](/docs/aurora-book/developer/api-and-realtime)

### Operations
- [Documentation operations](/docs/aurora-book/developer/documentation-ops)
- [Roadmap and priorities](/docs/aurora-book/developer/roadmap)
- [Contributing and workflow](/docs/aurora-book/developer/contributing)

## Source References
This manual consolidates:
- AURORA_MANUAL.md
- AURORA_PRINCIPLES_ETHICS.md
- AURORA_DESIGN_CULTURE.md
- AURORA_TYPOGRAPHY_SYSTEM.md
- AURORA_BUTTON_SYSTEM.md
- AURORA_ICON_SYSTEM.md
- COMPANION_PERSONALITY_DESIGN.md
- DATABASE_SETUP.md
- FEATURE_DEVELOPMENT_GUIDE.md
- AURORA_PRIORITY_MAP.md
- AURORA_LAUNCH_ROADMAP.md
- SOCIAL_UNIVERSE_GUIDE.md
- README.md
