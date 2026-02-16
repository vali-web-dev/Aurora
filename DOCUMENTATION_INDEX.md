# Welcome to Aurora: Complete Documentation

This repository contains Aurora's complete identity, design philosophy, and user guide. Below is a guide to each document and how they fit together.

---

## The Aurora Documentation Suite

### 📘 **[docs/aurora-system-and-brains-book.md](docs/aurora-system-and-brains-book.md)**
**For:** End users and developers (two editions)
**Contains:**
- End-User Help Manual (free)
- Developer Manual (paid)
- Multi-file navigation with per-universe chapters
- Cross-linked system chapters (companion, theming, accessibility, privacy)

**Read this if:** You want the most complete, publishable, navigable manual.

### 🚀 **[AURORA_QUICK_REFERENCE.md](AURORA_QUICK_REFERENCE.md)**
**For:** Anyone with 5 minutes  
**Contains:**
- What is Aurora? (elevator pitch)
- 5 tones at a glance
- 15 universes summary table
- Companion panel quick guide
- Signals explained simply
- Basic keyboard shortcuts
- Common workflows

**Read this if:** You want to get oriented fast without deep reading.

---

### 📖 **[AURORA_MANUAL.md](AURORA_MANUAL.md)**
**For:** Users, makers, curious minds  
**Contains:**
- Complete welcome & promise
- Core philosophy (5 principles)
- Detailed guide to all 15 universes (what you do, who uses it, key features)
- Companion system explained (how it works, tones, signals, scope levels)
- Theming & personalization (modes, families, customization)
- Accessibility features (WCAG AAA, keyboard nav, screen readers, etc.)
- Memory & context (what Aurora remembers, local storage, sync)
- Privacy & consent (data categories, your rights, transparency reports)
- Getting started guide (your first day)
- Platform architecture (tech stack, data architecture, components)
- Advanced usage patterns (productivity workflows, integrations)
- Ethical guidelines (10 core principles)
- Support & community info

**Read this if:** You want to understand Aurora fully, or you're building on top of it.

**Length:** ~4,500 words (30-45 min read)

---

### 🎯 **[AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md)**
**For:** Decision-makers, ethicists, policy people, anyone caring about values  
**Contains:**
- Preamble: what we believe technology should be
- 10 Core Principles (with "In Practice" and "Not This" sections):
  1. User Autonomy
  2. Privacy as Default
  3. Accessibility as Equality
  4. Transparency Over Secrecy
  5. Beauty as Respect
  6. Clarity Over Cleverness
  7. Consent Over Convenience
  8. Community Governance
  9. Local-First by Design
  10. Ethical AI (or None At All)
- Anti-Principles: What we'll never do (dark patterns, addictive design, surveillance, etc.)
- How we make decisions (prioritization framework)
- What we're NOT promising
- The future of Aurora

**Read this if:** You want to know why Aurora is built the way it is, or you're auditing Aurora for alignment with your values.

**Length:** ~3,000 words (15-20 min read)

---

### 💻 **[FEATURE_DEVELOPMENT_GUIDE.md](FEATURE_DEVELOPMENT_GUIDE.md)** **NEW**
**For:** Developers, designers, anyone adding features to Aurora  
**Contains:**
- Feature → Documentation workflow (docs are part of every feature)
- Planning, implementation, documentation, verification checklist
- Documentation storage hierarchy (central docs + feature-specific docs)
- Feature documentation template (use for complex features)
- Making docs accessible (in-app portal, code links, markdown conventions)
- Maintenance schedule
- Real-world examples (adding signals, new universes, memory enhancements)
- Principle: Aurora's identity is living and evolving

**Read this if:** You're adding a feature to Aurora and want to know how to integrate documentation from day one.

**Key principle:** *Documentation is not optional. It's part of feature completion, same commit.*

**Length:** ~2,500 words (15-20 min read)

---

### 🎨 **[AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md)**
**For:** Designers, developers, marketers, brand builders  
**Contains:**
- The Aurora Aesthetic:
  - Color palette (primary, neutrals, status, theme families)
  - Typography (font stack, scale, weight, line height)
  - Spacing system (8px grid)
  - Shadows & elevation
  - Border radius
  - Motion (durations, easing, animations)
- Tone of Voice:
  - Core voice traits (calm, clear, honest, human, respectful)
  - Language examples (OP vs. Aurora way)
  - Universe-specific tones
- Visual Patterns:
  - Typography hierarchy
  - Card pattern
  - Form pattern
  - Button pattern
  - Surface pattern
- User Experience Principles:
  - Motion principles
  - Accessibility in visual design
- Content Principles:
  - Writing for Aurora (be specific, active, concise, honest)
  - Microcopy examples
- Component Library (patterns for each component)
- Accessibility Checklist
- Culture & Collaboration:
  - How we write code
  - How we design
  - How we launch features
  - How we handle mistakes
- The Aurora Spirit (how it should feel)

**Read this if:** You're designing, building, or writing for Aurora.

**Length:** ~3,000 words (20-30 min read)

---

### 📋 **[COMPANION_PERSONALITY_DESIGN.md](COMPANION_PERSONALITY_DESIGN.md)**
**For:** Technical people, feature designers, product people  
**Contains:**
- Overview of companion system
- Core dimensions:
  - 5 tones (mentor, strategist, explorer, analyst, guardian)
  - 5 scopes (minimal, light, standard, deep, intensive)
  - 8 user signals
  - 6 time patterns
- Detailed personality matrix for all 19 universes
- Tone behavioral definitions
- Scope level behaviors
- Personality resolution algorithm
- Privacy & consent model
- Visual & UX signals
- Design philosophy
- Future enhancements

**Read this if:** You're implementing or extending the companion system, or you want to understand the adaptive personality engine.

**Length:** ~2,000 words (15 min read)

---

## How to Use This Documentation

### 📍 **I'm a New User**
1. Start with **[AURORA_QUICK_REFERENCE.md](AURORA_QUICK_REFERENCE.md)** (5 min)
2. Then read **[AURORA_MANUAL.md](AURORA_MANUAL.md#your-first-day-in-aurora)** - just the "Your First Day" section (5 min)
3. Open Aurora in your browser and explore

### 👨‍💻 **I'm a Developer**
1. Read **[AURORA_MANUAL.md](AURORA_MANUAL.md#platform-architecture)** - Platform Architecture section
2. Read **[AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md#component-library)** - Component Library section
3. Check **[COMPANION_PERSONALITY_DESIGN.md](COMPANION_PERSONALITY_DESIGN.md)** if building companion features
4. Look at the codebase in `/src` for examples

### 🎨 **I'm a Designer**
1. Read **[AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md)** (entire document)
2. Reference **[AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md#principle-3-accessibility-as-equality)** - Accessibility Principle
3. Check **[AURORA_MANUAL.md](AURORA_MANUAL.md#theming--personalization)** - Theming section

### 🏛️ **I'm Evaluating Aurora (Privacy/Ethics)**
1. Read **[AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md)** (complete)
2. Check **[AURORA_MANUAL.md](AURORA_MANUAL.md#privacy--consent)** - Privacy section
3. Review **[AURORA_MANUAL.md](AURORA_MANUAL.md#accessibility--inclusivity)** - Accessibility

### ⭐ **I'm Adding a Feature to Aurora** (NEW)
1. **MUST READ:** **[FEATURE_DEVELOPMENT_GUIDE.md](FEATURE_DEVELOPMENT_GUIDE.md)** (20 min)
2. Understand: **[AURORA_MANUAL.md](AURORA_MANUAL.md#the-companion-system)** - Companion System (context for personality)
3. Verify: **[AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md#core-principles)** - Does your feature align?
4. Reference: **[AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md)** - Design patterns (as needed)
5. **Key principle:** Docs are part of the feature. Same commit. See Feature Development Guide § Checklist.

### 📚 **I Want to Learn Everything**
Read in this order:
1. **[AURORA_MANUAL.md](AURORA_MANUAL.md)** - Get grounded
2. **[AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md)** - Understand why
3. **[AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md)** - Know how it looks/feels
4. **[COMPANION_PERSONALITY_DESIGN.md](COMPANION_PERSONALITY_DESIGN.md)** - Understand the magic
5. **[FEATURE_DEVELOPMENT_GUIDE.md](FEATURE_DEVELOPMENT_GUIDE.md)** - Learn to contribute

Total time: ~120 minutes

---

## The Big Picture

Aurora is built on interconnected ideas:

```
PRINCIPLES & ETHICS
(Why we exist, what we believe)
    ↓
DESIGN LANGUAGE & CULTURE
(How we communicate, how it looks, how it feels)
    ↓
COMPANION SYSTEM
(How Aurora adapts to you)
    ↓
MANUAL
(How to use all of this)
    ↓
YOU
(Using Aurora with purpose)
```

---

## Core Values (Across All Documents)

These themes appear throughout:

| Theme | Why It Matters | Where to Read |
|-------|----------------|--------------|
| **User Autonomy** | You're in control, always | Principles, Manual (Privacy) |
| **Privacy by Default** | Your data is yours | Principles, Manual (Privacy), Design (Content) |
| **Accessibility** | Everyone deserves Aurora | Manual, Design (accessibility section) |
| **Clarity** | Simple beats clever | Design (tone, language), Principles |
| **Beauty** | Respect made visual | Design, Manual (theming) |
| **Transparency** | Show your work | Principles, Manual (companion system) |
| **Community** | Your voice matters | Principles, Manual (support) |
| **Calm** | No manipulation, no addiction | Design (motion, voice), Principles |

---

## Quick Links to Key Sections

**Design System**
- [Aurora_Design_Culture.md - Color Palette](AURORA_DESIGN_CULTURE.md#color-palette)
- [Aurora_Design_Culture.md - Typography](AURORA_DESIGN_CULTURE.md#typography)
- [Aurora_Design_Culture.md - Component Library](AURORA_DESIGN_CULTURE.md#component-library)

**Using Aurora**
- [AURORA_MANUAL.md - 15 Universes](AURORA_MANUAL.md#the-15-universes-your-digital-worlds)
- [AURORA_MANUAL.md - Companion System](AURORA_MANUAL.md#the-companion-system)
- [AURORA_MANUAL.md - Getting Started](AURORA_MANUAL.md#your-first-day-in-aurora)

**Technical Details**
- [AURORA_MANUAL.md - Architecture](AURORA_MANUAL.md#platform-architecture)
- [COMPANION_PERSONALITY_DESIGN.md - Full Details](COMPANION_PERSONALITY_DESIGN.md)

**Values & Ethics**
- [AURORA_PRINCIPLES_ETHICS.md - Core Principles](AURORA_PRINCIPLES_ETHICS.md#core-principles)
- [AURORA_MANUAL.md - Ethical Guidelines](AURORA_MANUAL.md#ethical-guidelines)
- [AURORA_PRINCIPLES_ETHICS.md - Anti-Principles](AURORA_PRINCIPLES_ETHICS.md#anti-principles-what-well-never-do)

**Contributing & Feature Development** ⭐ **NEW**
- [FEATURE_DEVELOPMENT_GUIDE.md - Complete Workflow](FEATURE_DEVELOPMENT_GUIDE.md)
- [FEATURE_DEVELOPMENT_GUIDE.md - Checklist](FEATURE_DEVELOPMENT_GUIDE.md#checklist-for-feature-prs)
- [FEATURE_DEVELOPMENT_GUIDE.md - Feature Doc Template](FEATURE_DEVELOPMENT_GUIDE.md#feature-specific-documentation-template)
- [FEATURE_DEVELOPMENT_GUIDE.md - Examples](FEATURE_DEVELOPMENT_GUIDE.md#examples)

---

## Contributing to Aurora's Identity

Aurora is a living project. These documents will evolve.

If you:
- **Found a mistake:** Email corrections@aurora.guide
- **Disagree with a principle:** Email principles@aurora.guide (we'll discuss)
- **Have feedback on tone/design:** Email design@aurora.guide
- **Want to suggest a feature:** Visit aurora.guide/roadmap

---

## Document Maintenance

These documents are maintained by:
- **AURORA_MANUAL.md** - User Experience & Product Team
- **AURORA_PRINCIPLES_ETHICS.md** - Ethics & Policy Team
- **AURORA_DESIGN_CULTURE.md** - Design & Brand Team
- **COMPANION_PERSONALITY_DESIGN.md** - Engineering & Product Team
- **AURORA_QUICK_REFERENCE.md** - All teams (collaborative)
- **FEATURE_DEVELOPMENT_GUIDE.md** - Engineering & Product Team ⭐ **NEW**

**Last Updated:** February 2026 (added Feature Development Guide)  
**Next Review:** May 2026

---

## The Aurora Promise

These documents aren't marketing. They're our promise to you.

Every design decision, every feature, every line of code in Aurora is guided by these words. If Aurora ever stops living up to these documents, it's our failure, not yours.

We welcome feedback. We welcome scrutiny. We welcome your help in making Aurora what we promise.

---

## Principle: Living Documentation

Aurora's identity lives in these documents. **Every feature, enhancement, and upgrade is added to Aurora's identity profile and made easily accessible.**

This means:
- Features aren't complete until docs are complete (same commit)
- Docs are accessible in-app via the "?" button (DocsPortal)
- Features have inline code comments linking to relevant docs
- Central docs are the source of truth

See [FEATURE_DEVELOPMENT_GUIDE.md](FEATURE_DEVELOPMENT_GUIDE.md) for the complete workflow.

---

## Getting Help

- 📖 **Full documentation:** aurora.guide
- 🤔 **Questions:** support@aurora.guide
- 🐛 **Bug reports:** aurora.guide/bugs
- 💬 **Community:** forum.aurora.guide
- 🤝 **Contributing:** [FEATURE_DEVELOPMENT_GUIDE.md](FEATURE_DEVELOPMENT_GUIDE.md) (now available!)

---

**Aurora Documentation Suite v0.2** ⭐ **UPDATED**  
**Status:** Complete & Living (Feature Development Guide now integrated)  
**Next Update:** April 2026

> *"Clarity, beauty, integrity, humanity, wonder."*
