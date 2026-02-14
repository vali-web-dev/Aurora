# Aurora Design Language & Culture Guide

*How Aurora looks, sounds, and feels. The DNA of Aurora's identity.*

---

## The Aurora Aesthetic

### Color Palette

**Primary Colors**
```
Primary Blue: #46a3fa        // Hope, clarity, action
Accent Cyan: #7df8ffe7         // Wonder, innovation, energy
Warm Orange: #f77b2d         // Creativity, warmth, energy
```

**Neutral Palette** (Slate)
```
Slate 50:   #f8fafc          // Background
Slate 100:  #f1f5f9          // Subtle backgrounds
Slate 200:  #e2e8f0          // Borders, dividers
Slate 300:  #cbd5e1          // Muted text
Slate 400:  #94a3b8          // Secondary text
Slate 500:  #64748b          // Tertiary text
Slate 600:  #475569          // Strong text
Slate 700:  #334155          // Dark text
Slate 800:  #1e293b          // Very dark backgrounds
Slate 900:  #0f172a          // Black backgrounds
Slate 950:  #020617          // Darkest backgrounds
```

**Status Colors**
```
Success Green: #10b981       // Achievements, confirmations
Warning Amber: #f59e0b       // Alerts, cautions
Error Rose: #f43f5e         // Errors, critical
Alert Orange: #f97316        // Urgent attention
Info Blue: #3b82f6           // Information, hints
Wellness Emerald: #059669    // Health, positive
```

**Theme Families** (Can override primary)
```
Home:       #0084ff (warm, official)
Office:     #0070e6 (professional, muted)
Outdoor:    #059669 (natural, green)
Lifestyle:  #ec4899 (vibrant, pink)
Creative:   #a855f7 (expressive, purple)
```

### Typography

**Font Stack**
```
Primary: Inter, system-ui, sans-serif
Code:    'Fira Code', 'Menlo', monospace
Dyslexic: OpenDyslexic (toggle-able)
```

**Type Scale**
```
XS: 0.75rem (12px)  - Labels, tags, small text
SM: 0.875rem (14px) - Body small, captions, form hints
BASE: 1rem (16px)   - Body text, inputs
LG: 1.125rem (18px) - Subheadings
XL: 1.25rem (20px)  - Headings
2XL: 1.5rem (24px)  - Section titles
3XL: 1.875rem (30px) - Page titles
4XL: 2.25rem (36px) - Hero headlines
```

**Weight**
```
Regular: 400         - Body text, normal speech
Medium: 500          - Subheadings, emphasis
Semibold: 600        - Headings, strong emphasis
Bold: 700            - Page titles, very strong
```

**Line Height**
```
Tight: 1.25          - Headings (efficient)
Normal: 1.5          - Body text (readable)
Relaxed: 1.75        - Important content (breathier)
Loose: 2             - Large text, code blocks
```

### Spacing System (8px Grid)

```
0px, 2px, 4px, 6px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 80px, 96px

Or using Tailwind:
0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 80, 96
```

### Shadows & Elevation

```
Subtle: 0 1px 2px rgba(0,0,0,0.05)
SM:     0 1px 3px rgba(0,0,0,0.1)
BASE:   0 4px 6px rgba(0,0,0,0.1)
MD:     0 10px 15px rgba(0,0,0,0.1)
LG:     0 20px 25px rgba(0,0,0,0.15)
XL:     0 25px 50px rgba(0,0,0,0.15)
2XL:    0 25px 50px rgba(0,0,0,0.25)
```

### Border Radius

```
None:     0px
SM:       0.25rem (4px)
BASE:     0.375rem (6px)
MD:       0.5rem (8px)
LG:       0.75rem (12px)
XL:       1rem (16px)
2XL:      1.5rem (24px)
Full:     9999px
```

### Motion

**Durations**
```
Fast:     150ms - Quick feedback (hover, toggles)
Base:     300ms - Normal transitions
Slow:     500ms - Emphasis transitions
Slowest:  800ms - Entrance animations
```

**Easing**
```
Linear:   cubic-bezier(0, 0, 1, 1)
In:       cubic-bezier(0.4, 0, 1, 1)
Out:      cubic-bezier(0, 0, 0.2, 1)
InOut:    cubic-bezier(0.4, 0, 0.2, 1)
```

**Animations**
```
Fade in:           opacity: 0 → 1
Slide from top:    transform: translateY(-20px) → 0
Slide from left:   transform: translateX(-20px) → 0
Scale:             transform: scale(0.95) → 1
Pulse (subtle):    opacity oscillates 0.95 → 1
```

---

## Tone of Voice

Aurora speaks to you with a consistent voice. Not all universes sound the same (each has a tone), but they all speak the same language underneath.

### Core Voice Traits

**Calm**
- No urgency unless necessary
- No exclamation marks unless special
- Soothing language, not hype
- Example: "Your goal is on track." not "CRUSHING IT! 🔥"

**Clear**
- Short sentences. Active voice.
- Specific words, not vague.
- Free of jargon unless necessary (and explained)
- Example: "You spent $42 on coffee this month." not "Beverage category allocation: $42 YTD"

**Honest**
- We admit what we don't know
- We explain limitations
- We avoid marketing speak
- Example: "We don't have perfect data on this." not "Cutting-edge insights available"

**Human**
- We're people talking to people
- We use contractions (you'll, we're, it's)
- We acknowledge feelings
- We don't pretend to be a friend (but we're friendly)
- Example: "It's okay to take a break." not "SELF-CARE ACTIVATED"

**Respectful**
- We value your time
- We don't talk down to you
- We acknowledge your agency
- Example: "You could also try X" not "You should definitely do X"

### Language Examples

**OP (Wrong)** | **Aurora Way** | **Why**
---|---|---
"ERROR: Input validation failed" | "Please enter a valid email address" | Clear + helpful, not technical
"Optimizing algorithm..." | "Saving your data..." | Specific + honest, not marketing
"Click here" | "Save your draft" | Actionable, not generic
"Syncing data to cloud..." | "Backing up to your account..." | Human + specific, not technical
"User experience optimized!" | "Easier to use now" | Honest + calm, not hype
"Access denied" | "You don't have permission to see this" | Clear + specific

### Universe-Specific Tones

**Learning Universe (Mentor)**
- Encouraging: "You got this."
- Progressive: "Next, let's try..."
- Example-rich: "For instance, in React you might..."
- Celebratory: "You finished the module!"

**Productivity Universe (Strategist)**
- Direct: "Here's your priority today."
- Goal-focused: "This moves you closer to your goal."
- Efficient: "Done. 2 more to go."
- Momentum-driven: "Keep going."

**Create Universe (Explorer)**
- Curious: "What if you tried...?"
- Playful: "Let's see what happens."
- Possibility-focused: "Imagine if you..."
- Discovery: "You might find this interesting."

**Finance Universe (Analyst)**
- Neutral: "Your average monthly spend is $X."
- Data-driven: "Based on your last 12 months..."
- Risk-aware: "This could impact your goal if..."
- Empowering: "Your choice. Here's the data."

**Health Universe (Guardian)**
- Protective: "Your wellbeing matters."
- Transparent: "Here's why we suggest this."
- Supportive: "You're not alone in this."
- Educational: "Here's what the research shows."

---

## Visual Patterns

### Typography Hierarchy

**Page Title (3XL, Bold, Slate-900)**
```
Productivity Universe
```

**Section Header (2XL, Semibold, Slate-800)**
```
Today's Goals
```

**Subsection (LG, Semibold, Slate-700)**
```
In Progress
```

**Body Text (Base, Regular, Slate-600)**
```
This is the main content users read. Calm, readable, never small.
```

**Secondary Text (SM, Regular, Slate-500)**
```
This is supplementary info or captions
```

**Label (XS, Medium, Slate-600)**
```
Deadline
```

### Card Pattern

```
┌─────────────────────────────┐
│  Title                  [x] │  Tight spacing, clear hierarchy
├────────────────────────────│  Border bottom for separation
│ Content area               │  Generous padding (24px)
│                            │  Calm background (Slate 50/900)
│ With multiple lines        │  Hover effect (slight shadow lift)
│                            │
│  [Primary]      [Secondary]│  Actions at bottom, spaced
└─────────────────────────────┘
```

### Form Pattern

```
┌─ Label (Medium) ─────────────────┐
│ Placeholder text                  │  Label above input
| [Input field (Base, Slate 600)]   │  Clear border, high contrast
│                                   │  Focus ring (blue)
└─ Hint text (SM, Slate 500) ──────┘  Hint below

Error state:
┌─ Label (Medium) ─────────────────┐
│ [Input field (red border)]        │  Red border, red icon
│ ⚠️ Please enter a valid email      │  Red error message
```

### Button Pattern

```
PRIMARY: Blue background, white text
SECONDARY: Slate background, slate text
OUTLINE: Border only, no fill
GHOST: Text only, no border/fill

Size:       SM (32px), MD (40px), LG (48px)
States:     Default, Hover, Active, Focus, Disabled
Padding:    SM (4-12px), MD (4-16px), LG (6-24px)
Icons:      12px left margin, aligned center
```

### Surface Pattern (Universe Containers)

```
┌─────────────────────────────────────────────────┐
│  [Icon] Universe Title                          │  Header (Slate 50/900)
├─────────────────────────────────────────────────┤  Divider
│  [Filters] [Search]                             │  Secondary controls
├─────────────────────────────────────────────────┤  Another divider
│                                                 │
│  Main content area                              │  Lots of white space
│  Cards, text, interactions                      │
│                                                 │
│                                                 │  Padding: 24-48px
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## User Experience Principles

### Motion Principles

**Purposeful:**
- Every animation has a reason
- Show/hide transitions (entrance/exit)
- Feedback on interaction (click, hover)
- Connection between states (where did it go?)

**Respectful:**
- Respect `prefers-reduced-motion` system preference
- No auto-playing animations (unless essential)
- No looping animations (let them rest)
- Fast enough to feel snappy
- Slow enough to understand

**Examples:**
- Button click: 150ms scale effect (feedback)
- Modal open: 300ms fade-in (entrance)
- Hover: 200ms shadow lift (state change)
- Loading: Pulse animation (patience indicator)

### Accessibility in Visual Design

**Color Contrast**
- Text on background: 7:1 ratio (WCAG AAA)
- UI elements: 3:1 ratio minimum
- Never rely on color alone (use icons/text too)

**Visual Indicators**
- Focus rings always visible (2px, bright color)
- Error: red + icon (not color alone)
- Alert: orange + icon + bold text
- Success: green + checkmark icon

**Readable Text**
- Minimum 16px for body (mobile)
- Line length 50-70 characters
- Line height 1.5+ for body text
- Clear hierarchy (size, weight, color)

**Interactive Elements**
- Minimum 44px x 44px touch target (mobile WCAG)
- Buttons obvious and clickable
- Links underlined or sufficiently contrasted
- Hover states clear and visible

---

## Content Principles

### Writing for Aurora

**Be Specific**
```
❌ "An error occurred"
✅ "Your email address is already registered to another account"
```

**Be Active**
```
❌ "This file will be deleted by the system"
✅ "You can delete this file"
```

**Be Concise**
```
❌ "In order to enhance your experience and ensure optimal utilization of our platform's features, we kindly recommend that you enable notifications"
✅ "Turn on notifications to stay updated"
```

**Be Honest**
```
❌ "Your data is being leveraged to maximize engagement"
✅ "We use your data to improve Aurora for everyone"
```

### Microcopy Examples

**Buttons**
```
❌ "OK"
✅ "Save changes"

❌ "Cancel"
✅ "Keep editing"

❌ "Delete"
✅ "Delete forever"
```

**Empty States**
```
❌ No data
✅ "You haven't created any goals yet. Start with something small."
```

**Loading**
```
❌ Loading...
✅ "Saving your note..."
```

**Confirmation**
```
❌ Are you sure?
✅ "Delete this note? You can't undo this."
```

---

## Component Library

Every component in Aurora follows these patterns:

**Button**
- Clear, specific labels
- Icon optional (left side)
- 3 variants: Primary, Secondary, Ghost
- 3 sizes: Small, Medium, Large

**Card**
- Subtle border (Slate-200)
- Rounded corners (12px)
- Padding (24px)
- Hover lift effect
- Accessible headings

**Modal**
- Backdrop dark overlay
- Opens below sticky nav (80px offset)
- Close button (X) and Escape key
- Focus managed on open/close (returns to trigger)
- Focus trapped inside the modal
- Screen reader announces open/close
- Scrollable content if needed

**Input**
- Clear label above
- Placeholder text (not label)
- Hint text below
- Focus ring (blue)
- Error state (red)

**Notification/Toast**
- Fixed position (bottom-right)
- Auto-dismiss (4-5 seconds)
- Dismissible manually
- Color coded (green/amber/red)
- Icon + text

**Avatar**
- 32px/40px/48px sizes
- Initials or image
- Fallback color (random from palette)
- Outlined variant

**Badge**
```
SM: 12px, Medium weight
MD: 16px, Medium weight
LG: 20px, Medium weight
```

---

## Accessibility Checklist for New Features

- [ ] Keyboard navigable (Tab, Enter, Esc, arrows)
- [ ] Screen reader tested with NVDA/JAWS/VoiceOver
- [ ] Color contrast verified (7:1 for WCAG AAA)
- [ ] Touch target 44x44px minimum
- [ ] Focus ring visible and clear
- [ ] No color-only indicators
- [ ] ARIA labels on non-obvious elements
- [ ] Semantic HTML (button, not div)
- [ ] Error messages helpful and specific
- [ ] Alternative text for images
- [ ] Captions for video
- [ ] Transcripts for audio
- [ ] Works with reduced motion enabled
- [ ] Works with high contrast mode
- [ ] Works with large text (200%)

---

## Culture & Collaboration

### How We Write Code

- **Readable:** Comments explain why, not what
- **Consistent:** Same style across all files
- **Tested:** Unit tests for logic, accessibility tests for UI
- **Documented:** README and JSDoc comments
- **Performant:** Lazy load, optimize images, cache

### How We Design

- **User-centered:** Research with real users
- **Accessible-first:** Accessibility built in, not bolted on
- **Mobile-first:** Design for small screens first
- **Iteration:** Prototype, test, refine
- **Feedback:** Regular user testing

### How We Launch Features

1. **Design:** Wireframes + prototypes
2. **Build:** Code with accessibility in mind
3. **Test:** Unit tests, accessibility audit, real users
4. **Feedback:** Iterate based on feedback
5. **Launch:** Gradual rollout, monitor for issues
6. **Retrospective:** What worked, what didn't?

### How We Handle Mistakes

1. **Acknowledge:** We messed up. Here's how.
2. **Explain:** Why did it happen?
3. **Fix:** Here's what we're doing about it.
4. **Learn:** How do we prevent this next time?
5. **Communicate:** Tell users what changed.

---

## The Aurora Spirit

Aurora is not just a product. It's a philosophy made interactive.

**When you're in Aurora, you should feel:**
- 🤔 Respected (your time and attention matter)
- 🎨 Inspired (beauty that helps you think better)
- 😌 Calm (no urgency, no manipulation)
- 🔒 Safe (your privacy and data are protected)
- 🚀 Empowered (you're in control)
- 🌍 Connected (to people and purpose)
- 📚 Learning (always growing)
- 🎭 Yourself (not a persona, but you)

If Aurora ever stops feeling like this, tell us. We'll fix it.

---

**Aurora Design Language & Culture v0.1**  
**Published:** February 2026  
**Maintained by:** Design, Engineering, Product Teams

> *"Design with intent. Build with care. Ship with confidence."*
