# Security, Privacy, and Ethics

Aurora is built on strict user autonomy, privacy by default, and accessibility as equality.

## Core Principles
- User autonomy
- Privacy as default
- Accessibility as equality
- Transparency over secrecy
- Beauty as respect
- Clarity over cleverness
- Consent over convenience

## Practical Expectations
- Memory off by default
- Suggestions off by default
- No tracking pixels or data selling
- Clear opt-in for sync and AI

## Security Architecture (Build Requirements)
- Auth and session handling: NextAuth (`src/lib/auth.ts`, `src/app/api/auth/*`)
- Secrets in environment only (`.env.local`, never committed)
- Strict role checks in server routes
- Client never receives server secrets
- Feature flags gate risky features (AI, payments, realtime)

## Data Classification
- P0: Authentication secrets (never logged)
- P1: Personal data (name, email, profile)
- P2: Behavioral data (signals, preferences)
- P3: Public content (posts, public profiles)

## Privacy-First Defaults
- Memory and sync off by default
- Explicit opt-in for AI suggestions
- Per-universe toggles for data retention
- Clear UX for delete/export data

## Threat Model (Practical)
- Credential leakage (mitigation: env isolation + no client secrets)
- Cross-tenant access (mitigation: server-side auth checks)
- Unauthorized data sync (mitigation: explicit opt-in + audit logs)
- Injection attacks (mitigation: schema validation and sanitization)

## Logging and Observability
- Never log secrets, tokens, or credentials
- Log request IDs for API troubleshooting
- Log auth failures without sensitive payloads
- Rate-limit public endpoints

## Incident Response
1. Identify affected surface (API, auth, realtime)
2. Disable related feature flag if needed
3. Rotate secrets if compromised
4. Notify affected users if required
5. Postmortem with action items

## Compliance (Baseline)
- GDPR-style export and deletion path
- Accessibility compliance (WCAG AA/AAA intent)
- Clear consent and revocation flows

## AI and Automation Ethics
- Explainability: users can ask “why this”
- No hidden model training on private data
- Opt-in for AI features and memory

Source: AURORA_PRINCIPLES_ETHICS.md
