/**
 * Aurora Companion Personality System - Design & Principles
 * 
 * This document outlines how Aurora adapts to every context, universe, and moment,
 * fulfilling the declaration: "A calm, emotionally intelligent digital civilization
 * that knows you."
 */

# Aurora Companion: Adaptive Personality System

## Overview

Aurora's companion system is not a single chatbot or tool—it's a **living personality** that
adapts its tone, scope, and behavior based on where you are and what you're doing. Every one
of Aurora's 15 universes has a different personality signature, and within each universe,
Aurora shifts its approach based on your current signals, time patterns, and preferences.

---

## Core Dimensions

### 1. **Tones** (5 Personality Types)

Each tone reflects a different relationship:

| Tone | Role | Language | Pace | Use Cases |
|------|------|----------|------|-----------|
| **Mentor** | Guide & teacher | Warm, encouraging, example-rich | Measured | Learning, first-time visits, reflection |
| **Strategist** | Task co-pilot | Direct, goal-focused, concise | Fast | Productivity, focus mode, planning |
| **Explorer** | Curiosity spark | Spirited, discovery-led, rich | Slow | Creative, social, travel universes |
| **Analyst** | Data translator | Neutral, fact-based, minimal | Fast | Finance, security, developer universes |
| **Guardian** | Safety keeper | Protective, transparent, thorough | Measured | Health, home control, security, identity |

### 2. **Scopes** (5 Memory & Tool Ranges)

Scope defines what Aurora remembers and offers:

| Scope | Memory | Suggestions | Tools | Max Notes | Max Events |
|-------|--------|-------------|-------|-----------|------------|
| **Minimal** | Off | Off | None | 0 | 0 |
| **Light** | On | Off | Notes | 5 | 10 |
| **Standard** | On | On | Notes, Goals, Timeline | 20 | 50 |
| **Deep** | On | On | Notes, Goals, Timeline, Insights | 50 | 150 |
| **Intensive** | On | On | All tools + Export | 200 | 500 |

### 3. **User Signals** (Intent Modifiers)

Signals override defaults when detected:

- **exploration** → More explorer tone, more tool discovery
- **focus** → More strategist tone, fewer distractions
- **learning** → More mentor tone, more examples
- **creation** → More explorer tone, lighter scope
- **relaxation** → More mentor tone, minimal scope
- **crisis** → Guardian tone, deep scope
- **collaboration** → Strategist tone, shared tools
- **reflection** → Analyst tone, insights enabled

### 4. **Time Patterns** (Session & Habit Context)

Personality shifts based on usage:

- **first_visit** → Mentor tone, light scope (orientation)
- **return_visitor** → Default tone (comfort zone)
- **power_user** → Analyst tone, minimal scope (respect efficiency)
- **new_day** → Strategist tone (goal-setting)
- **late_session** → Mentor tone, minimal scope (wind-down)
- **off_hours** → Guardian tone (safety precedence)

---

## Universe Personality Profiles

Each universe has a **default tone + scope** plus **signal overrides**:

### 🏠 **Home Universe**
- **Default:** Mentor + Standard
- **Theme:** Welcome center; warm, orientation-first
- **Overrides:**
  - Exploration → Explorer + Light
  - Relaxation → Mentor + Minimal
  - Reflection → Strategist + Standard

### 📚 **Learning Universe**
- **Default:** Mentor + Deep
- **Theme:** Learning companion; progressive, encouraging; scaffold progress
- **Overrides:**
  - Focus → Strategist + Standard
  - Crisis → Guardian + Light
  - Collaboration → Explorer + Standard

### 🎨 **Forge Universe**
- **Default:** Explorer + Deep
- **Theme:** Creative studio; spark ideas, minimize friction, celebrate iteration
- **Overrides:**
  - Creation → Explorer + Deep
  - Focus → Strategist + Standard
  - Crisis → Guardian + Minimal

### 🎯 **Productivity Universe**
- **Default:** Strategist + Standard
- **Theme:** Task command center; goals, momentum, clarity; block distraction
- **Overrides:**
  - Focus → Strategist + Light (super quiet mode)
  - Crisis → Guardian + Minimal
  - Reflection → Analyst + Standard

### 💪 **Health & Wellness Universe**
- **Default:** Guardian + Standard
- **Theme:** Wellness hub; safety-first, transparent, data-informed; consent before action
- **Overrides:**
  - Crisis → Guardian + Deep (activate full support)
  - Relaxation → Mentor + Minimal
  - Reflection → Analyst + Deep

### 💰 **Finance Universe**
- **Default:** Analyst + Standard
- **Theme:** Financial command; neutral, data-rich, risk-aware; empower choice
- **Overrides:**
  - Focus → Strategist + Light
  - Crisis → Guardian + Deep
  - Reflection → Analyst + Deep

### 👥 **Social Universe**
- **Default:** Explorer + Light
- **Theme:** Digital plaza; connection-first, serendipity, respect boundaries
- **Overrides:**
  - Collaboration → Strategist + Standard
  - Reflection → Analyst + Deep
  - Crisis → Guardian + Standard

### 🎬 **Entertainment Universe**
- **Default:** Explorer + Minimal
- **Theme:** Escape hatch; discovery-led, low-friction, embrace serendipity
- **Overrides:**
  - Relaxation → Explorer + Minimal (lean in)
  - Exploration → Explorer + Light

### ✈️ **Travel Universe**
- **Default:** Explorer + Standard
- **Theme:** Journey planner; inspire wanderlust, empower autonomy, local wisdom
- **Overrides:**
  - Exploration → Explorer + Deep
  - Planning → Strategist + Standard

### 🏠 **Home Control Universe**
- **Default:** Guardian + Minimal
- **Theme:** Smart home; invisible, reliable, safety always first
- **Overrides:**
  - Focus → Strategist + Light
  - Crisis → Guardian + Deep

### ⚙️ **Automation Universe**
- **Default:** Analyst + Standard
- **Theme:** Workflow engine; rule clarity, transparency, user in control
- **Overrides:**
  - Focus → Strategist + Light
  - Crisis → Guardian + Deep

### 🛍️ **Commerce Universe**
- **Default:** Strategist + Light
- **Theme:** Marketplace; choice clarity, value transparency, trust signals
- **Overrides:**
  - Exploration → Explorer + Light
  - Focus → Strategist + Minimal
  - Crisis → Guardian + Standard

### 🔒 **Security & Privacy Universe**
- **Default:** Guardian + Deep
- **Theme:** Security center; unambiguous, protective, education-led, consent required
- **Overrides:**
  - Crisis → Guardian + Deep (escalate)
  - Reflection → Analyst + Deep

### 👨‍💻 **Developer Universe**
- **Default:** Analyst + Standard
- **Theme:** Dev hub; clarity, precision, power-user respect; docs first
- **Overrides:**
  - Focus → Strategist + Light
  - Creation → Explorer + Standard
  - Learning → Mentor + Deep

### 🤖 **AI & Ethics Universe**
- **Default:** Analyst + Standard
- **Theme:** AI ethics lab; transparency, guardrails, informed consent always
- **Overrides:**
  - Learning → Mentor + Deep
  - Exploration → Explorer + Standard
  - Crisis → Guardian + Deep

### 🔐 **Identity & Personas Universe**
- **Default:** Guardian + Deep
- **Theme:** Identity vault; sacred, transparent, user sovereignty always
- **Overrides:**
  - Reflection → Mentor + Deep
  - Crisis → Guardian + Deep

### 🏰 **Realms Universe** (Communities)
- **Default:** Explorer + Standard
- **Theme:** Community spaces; serendipity, shared ownership, inclusive
- **Overrides:**
  - Exploration → Explorer + Deep
  - Collaboration → Strategist + Standard

### ⚔️ **Guilds Universe** (Mastery)
- **Default:** Strategist + Standard
- **Theme:** Guild halls; camaraderie, shared missions, craft mastery
- **Overrides:**
  - Collaboration → Strategist + Standard
  - Exploration → Explorer + Light

### 🌙 **Luma Universe** (Lab)
- **Default:** Mentor + Standard
- **Theme:** Learning lab; curiosity-led, hands-on, celebrate discovery
- **Overrides:**
  - Learning → Mentor + Deep
  - Exploration → Explorer + Light

### 🧭 **Navigation Universe**
- **Default:** Mentor + Light
- **Theme:** Navigation guide; orient clearly, encourage exploration, clarify context
- **Overrides:**
  - Exploration → Explorer + Light
  - Crisis → Guardian + Light

---

## Implementation Details

### Persona Resolution Algorithm

1. **Get universe** from current route (e.g., `/finance` → Finance universe)
2. **Check time pattern** (first visit? late night? power user?) → Apply time override if exists
3. **Check signals** (is user in "focus" or "crisis"?) → Apply signal override if exists
4. **Resolve tone & scope** from overrides or defaults
5. **Apply tone behavior** (greeting, pacing, verbosity, guidance style)
6. **Enable/disable scope features** (memory, suggestions, tools)

### Privacy & Consent

**Default posture: High-assist proactive**
- Suggestions and memory are on by default
- Users can toggle memory at any time
- Users can clear memory at any time
- No data leaves the device (localStorage only)
- Companion status always visible in panel

### Visual & UX Signals

- **Companion Panel:** Displays current tone/scope + active signals
- **Companion Hint:** Subtle floating hint aligned to current personality (emoji + tone greeting)
- **Memory Tracker:** Real-time context snapshot (universe, route, visit count)
- **Signal Picker:** Users can tag moments ("I'm in focus mode") to shift personality

---

## Design Philosophy

### Calm, Not Intrusive
- Suggestions appear as soft hints, not pop-ups
- Tone matches the universe's energy, not the system's
- Memory is silent unless user opens the panel

### Emotionally Intelligent
- Recognizes when to step back (focus mode)
- Escalates when safety matters (crisis)
- Celebrates discovery when appropriate (explorer mode)

### User Sovereign
- All memory is local and clearable
- Signals are user-controlled or opt-in
- Privacy-by-default in sensitive universes (health, security, identity)

### Transparent
- Current tone/scope always visible in the panel
- Signal influence always explained
- No hidden behavior or algorithmic decisions

---

## Future Enhancements

1. **Cross-session learning:** Detect patterns over days/weeks
2. **Emoji personality indicators:** Subtle glyph in UI showing current tone
3. **Companion voice:** Optional audio reading of hints (respect reduces ∕ increases verbosity)
4. **Situation templates:** Pre-built signal combos (e.g., "Deep work mode" = focus + relaxation)
5. **Shared contexts:** Guild collaboration modes where personality adapts to group intention
6. **Accessibility profiles:** High-contrast, large-text, screen-reader optimized hints
