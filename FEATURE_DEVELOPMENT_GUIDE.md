# Feature Development Guide
## Aurora's Living Documentation Principle

Every new feature, enhancement, or upgrade must include documentation updates as part of the same commit. **Docs are not optional—they're part of feature completion.**

---

## Quick Start: Feature → Documentation Workflow

### 1. **Planning Phase**
Before coding, identify:
- **What feature/upgrade is this?** (e.g., "Session Summaries", "Mood-based Suggestions", "Cross-universe Insights")
- **Which Aurora identity docs does this touch?** (e.g., Personality System, Memory Layer, Companion Behaviors)
- **Where will docs live?**
  - Small feature: Update relevant section in [AURORA_MANUAL.md](AURORA_MANUAL.md)
  - Large feature: Create dedicated feature doc + link from index

### 2. **Implementation Phase**
- Write code with inline doc comments linking to relevant Aurora docs
- Example: `// See FEATURE_DOCS/session-summaries.md and AURORA_MANUAL.md § Memory, § Companion Panel`
- Ensure feature aligns with personality matrix and ethics principles

### 3. **Documentation Phase** (Same Commit)
- **Update relevant section in [AURORA_MANUAL.md](AURORA_MANUAL.md)** (How Users Use It)
- **Update [AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md)** if UI/behavior changes (Visual Patterns, Writing Guidelines)
- **Update [AURORA_QUICK_REFERENCE.md](AURORA_QUICK_REFERENCE.md)** if it's a primary feature (add to tables/workflows)
- **Update [AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md)** if it involves governance/privacy/consent changes
- **Create feature-specific doc** in `src/FEATURE_DOCS/` if complex (see template below)
- **Update [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** to link new docs

### 4. **Verification**
- [ ] Code compiles without errors
- [ ] Documentation is accurate (no broken links, no outdated info)
- [ ] Feature appears in at least one central document ([AURORA_MANUAL.md](AURORA_MANUAL.md) minimum)
- [ ] Inline code comments reference relevant docs
- [ ] Feature respects encryption, privacy, and ethical guidelines
- [ ] Accessibility features are documented in [AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md) § Accessibility Checklist

### 5. **Commit & Push**
- **Commit message format:** `feat: [feature name] + docs` or `enhance: [topic] + docs`
- **Example:** `feat: Session summaries + docs` or `enhance: Memory layer (summaries) + docs`
- Include feature docs and all central doc updates in the same commit
- Push to origin/Vali-branch

---

## Documentation Storage & Hierarchy

### Central Documents (Always Updated)
These are the "always correct" source of truth:

1. **[AURORA_MANUAL.md](AURORA_MANUAL.md)** — What users see and do
   - Update: How to use the new feature, where it lives in Aurora
   - Section: Find relevant universe/system section
   - Example: New memory feature → Update "§ Memory & Context" section

2. **[AURORA_QUICK_REFERENCE.md](AURORA_QUICK_REFERENCE.md)** — Fast orientation
   - Update: If feature is core/primary (appears in workflows/shortcuts tables)
   - Section: Workflows, Keyboard Shortcuts, or add new reference table
   - Example: New signal → Add to Signals table

3. **[AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md)** — How it looks/sounds/feels
   - Update: If feature has UI, interactions, writing, or patterns
   - Section: Visual Patterns, Component Library, Writing Guidelines, Accessibility Checklist
   - Example: New UI component → Add to Component Library section

4. **[AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md)** — Values & governance
   - Update: If feature involves consent, data, privacy, autonomy, or community decisions
   - Section: Core Principles affected, Anti-Principles validation, or governance process
   - Example: New data collection → Verify consent principle, update Anti-Principles section

### Feature-Specific Documents (For Complex Features)
Create when feature is substantial (new system, major personality shift, community-impacting):

Location: `src/FEATURE_DOCS/[feature-name].md`

**When to create:**
- New personality tone or signal
- New memory system or layer
- New universe or major realm
- New governance/community feature
- New accessibility feature

**Template:**
See [FEATURE_DOC_TEMPLATE.md](#feature-specific-documentation-template) below

### Code-Level Documentation
Every feature should have:
- **File header comments** linking to relevant Aurora docs
- **Function/component JSDoc** with Aurora personality context
- **Inline comments** pointing to central docs for maintainers

**Example:**
```typescript
/**
 * SessionSummaryEngine
 * 
 * Generates daily/weekly summaries based on memory events.
 * See: FEATURE_DOCS/session-summaries.md
 * See: AURORA_MANUAL.md § Memory & Context
 * Respects: AURORA_PRINCIPLES_ETHICS.md § Privacy as Default, Consent Over Convenience
 * 
 * Personality: Mentor tone uses verbose summaries; Analyst tone uses data-focused summaries
 * Scopes: Event summaries only if user opt-in (stored in localStorage, never transmitted)
 */
```

---

## Feature Documentation Template

Use this template when creating `src/FEATURE_DOCS/[feature-name].md`:

```markdown
# [Feature Name]

**Status:** Active | Experimental | RFC (Request for Comments)  
**Since Version:** [version] (e.g., v0.2.1)  
**In Personality Matrix:** [if applicable, list tones/universes that use this feature]  
**Privacy:** [Local-only | Optional sync | Server-required] (default: Local-only)  

## Overview
[1-2 sentence description of what this feature does and why it exists]

## How It Works
[How the feature operates from user perspective]
[Algorithm/logic if applicable]
[Key parameters/signals that influence behavior]

## User Guide
[Step-by-step how users interact with it]
[Keyboard shortcuts/access patterns]
[Customization options]

## Personality Integration
[How does this feature adapt across the 5 tones?]
[Example: "Mentor tone provides narrative-rich summaries; Analyst tone shows metrics-first summaries"]
[Signals that modify behavior: which signals increase/decrease activity?]

## Technical Details
[Implementation approach]
[Storage: localStorage | IndexedDB | memory]
[Data structure/schema]
[Performance characteristics]

## Privacy & Ethics
[How does this respect AURORA's privacy principles?]
[Consent required: yes/no]
[Data retention: (e.g., "12 months local, auto-delete after")]
[Auditable: how can user verify behavior?]

## Related Documents
- [AURORA_MANUAL.md](../AURORA_MANUAL.md) § [section]
- [AURORA_DESIGN_CULTURE.md](../AURORA_DESIGN_CULTURE.md) § [section]
- [AURORA_PRINCIPLES_ETHICS.md](../AURORA_PRINCIPLES_ETHICS.md) § [principles affected]

## Future Enhancements
[What could this feature do next?]
[Planned expansions per roadmap]

## Changelog
| Version | Change | Date |
|---------|--------|------|
| v0.2.1 | Initial release | [date] |
```

---

## Making Docs Easily Accessible

### 1. **In-App Documentation Portal**
Add a "Learn Aurora" link in the Footer and a Docs portal accessible from everywhere:

**Access Points:**
- Footer: "Aurora Docs" link → Opens docs portal
- Navigation: "?" Help button → Context-aware docs
- Feature dialogs: "Learn more" links → Relevant feature docs

**Portal Structure:**
```
Aurora Docs Portal
├── Start Here
│   ├── Quick Reference (5 min)
│   ├── Manual (30 min)
│   └── Getting Started
├── By Role
│   ├── Users
│   ├── Developers
│   ├── Designers
│   └── Ethics Reviewers
├── By Topic
│   ├── Personality System
│   ├── Memory & Context
│   ├── Themes & Accessibility
│   ├── Privacy & Ethics
│   └── All Universes
├── Features
│   └── [Auto-index of src/FEATURE_DOCS/]
└── Support
    ├── FAQ
    ├── Community
    └── Report Issue
```

### 2. **Code-Level Links**
Every feature file should have a JSDoc comment linking to docs:

```typescript
/**
 * @see AURORA_MANUAL.md § [Feature Section]
 * @see FEATURE_DOCS/session-summaries.md
 * @see AURORA_PRINCIPLES_ETHICS.md § Privacy as Default
 */
```

### 3. **Markdown Link Convention**
All md files use relative links for cross-linking:

```markdown
See [AURORA_MANUAL.md](../AURORA_MANUAL.md#memory--context)
```

(This makes links work in GitHub, VS Code preview, and any markdown viewer)

---

## Maintenance Schedule

**Weekly:**
- Link-check: Verify all cross-document links are valid
- Broken refs: Fix any references to deleted/moved sections

**Monthly:**
- Consistency review: All central docs align on feature descriptions
- Outdated warnings: Mark sections that need update

**Quarterly:**
- Major audit: Full documentation review for completeness
- Roadmap sync: Ensure unreleased features aren't documented yet

**Annually:**
- Version bump
- Publish to aurora.guide
- Community feedback survey

---

## Checklist for Feature PRs

Before merging any PR with code changes, ensure:

- [ ] **Code written** with inline doc links
- [ ] **Central docs updated** (Manual, Quick Ref, Design Culture, Principles/Ethics as needed)
- [ ] **Feature-specific doc created** (if complex) in `src/FEATURE_DOCS/`
- [ ] **All links tested** (work in GitHub, VS Code, preview)
- [ ] **DOCUMENTATION_INDEX.md updated** with links to new sections
- [ ] **Accessibility documented** in AURORA_DESIGN_CULTURE.md § Accessibility Checklist
- [ ] **Privacy verified** against AURORA_PRINCIPLES_ETHICS.md
- [ ] **Personality matrix updated** if new tone/signal/behavior
- [ ] **Build succeeds** without errors
- [ ] **Commit message includes "+docs"** (e.g., "feat: Session summaries +docs")

---

## Examples

### Example 1: Adding a New Signal
**Feature:** "Collaboration Signal" — User can set signal to increase mentor-like guidance, team-friendly suggestions

**Docs to update:**
1. [AURORA_MANUAL.md](AURORA_MANUAL.md) § Companion System § Signals → Add "Collaboration"
2. [AURORA_QUICK_REFERENCE.md](AURORA_QUICK_REFERENCE.md) § Signals table → Add row for "Collaboration"
3. [src/lib/companion/personality-matrix.ts](src/lib/companion/personality-matrix.ts) → Add `collaboration: boolean` to UserSignal type, add behavior overrides for each tone
4. [AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md) § Component Library § Signal Selector → Add UX pattern

**Commit:** `feat: Add collaboration signal +docs`

### Example 2: Adding a New Universe (e.g., "Guilds Universe")
**Feature:** New realm for community, team collaboration, guild creation

**Docs to update:**
1. Create [src/FEATURE_DOCS/guilds-universe.md](src/FEATURE_DOCS/guilds-universe.md) (describes the entire universe)
2. [AURORA_MANUAL.md](AURORA_MANUAL.md) § All 15 Universes → Add "Guilds" section
3. [AURORA_QUICK_REFERENCE.md](AURORA_QUICK_REFERENCE.md) § 15 Universes table → Add Guilds row
4. [AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md) § Visual Patterns → Add Guilds-specific palette (if unique)
5. [AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md) § Community Governance → Mention Guilds as community structure
6. [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) § By Topic § All Universes → Link to GUILDS_UNIVERSE.md

**Commit:** `feat: Guilds universe +docs`

### Example 3: Enhancing the Memory System
**Feature:** Add "Session Summaries" — Auto-generate brief recaps of the day's activity

**Docs to update:**
1. Create [src/FEATURE_DOCS/session-summaries.md](src/FEATURE_DOCS/session-summaries.md)
2. [AURORA_MANUAL.md](AURORA_MANUAL.md) § Memory & Context → Add subsection "Session Summaries"
3. [AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md) § Component Library → Add "Summary Card" pattern
4. [AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md) § Privacy as Default → Clarify summaries are local-only
5. [AURORA_QUICK_REFERENCE.md](AURORA_QUICK_REFERENCE.md) § Workflows → Add "End-of-day recap" workflow
6. Code comments in `src/lib/memory/session-summary.ts` linking to all above

**Commit:** `enhance: Memory layer (session summaries) +docs`

---

## Questions?

If unsure about doc structure or placement, ask yourself:

1. **Is this primarily about how users experience the feature?** → Update [AURORA_MANUAL.md](AURORA_MANUAL.md)
2. **Is this about how it should look/sound/feel?** → Update [AURORA_DESIGN_CULTURE.md](AURORA_DESIGN_CULTURE.md)
3. **Is this about user choices (signals, moods, preferences)?** → Update [AURORA_QUICK_REFERENCE.md](AURORA_QUICK_REFERENCE.md)
4. **Does it touch privacy, consent, governance, or ethics?** → Update [AURORA_PRINCIPLES_ETHICS.md](AURORA_PRINCIPLES_ETHICS.md)
5. **Is it complex/substantial enough to deserve its own doc?** → Create `src/FEATURE_DOCS/[name].md`
6. **Answer yes to multiple?** → Update all relevant docs (it's all connected)

---

## Principle: Aurora's Identity is Living & Evolving

Every feature added makes Aurora smarter, warmer, and more helpful. Every feature must be documented so everyone—users, developers, designers, auditors, community members—can understand what Aurora is, how it works, why it exists, and how it respects human autonomy.

**Documentation is not a separate phase. Documentation is part of the feature.**

Welcome to Aurora's living identity.
