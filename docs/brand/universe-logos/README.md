# Aurora Universe Logos

This directory contains unique logo identities for each of Aurora's 15 universes. Each logo shares Aurora's design DNA with:

- **Gradient-based** color schemes
- **Aurora glow** effects and light trails  
- **Symbolic icons** representing each universe's purpose
- **Scalable SVG** format for all contexts
- **Accessibility** with semantic shapes

## Universe Logo Index

### 🏠 Home
**File:** `home.svg`  
**Colors:** Warm coral to peach (#FF6B6B → #FFB347)  
**Icon:** House with aurora curves  
**Theme:** Personal, warm, welcoming

### 🎬 Entertainment  
**File:** `entertainment.svg`  
**Colors:** Pink to purple (#FF6EC7 → #C56EFF)  
**Icon:** Play button with wave patterns  
**Theme:** Media, enjoyment, streaming

### 🛍️ Commerce
**File:** `commerce.svg`  
**Colors:** Teal to green (#4ECDC4 → #44A08D)  
**Icon:** Shopping bag with checkmark  
**Theme:** Marketplace, transactions, retail

### 👥 Social
**File:** `social.svg`  
**Colors:** Indigo to violet (#667EEA → #764BA2)  
**Icon:** Connected people nodes  
**Theme:** Connection, community, relationships

### 📚 Learning
**File:** `learning.svg`  
**Colors:** Pink to coral (#F093FB → #F5576C)  
**Icon:** Open book with knowledge stars  
**Theme:** Education, growth, discovery

### ✨ Create
**File:** `create.svg`  
**Colors:** Rose to yellow (#FA709A → #FEE140)  
**Icon:** Paintbrush with color strokes  
**Theme:** Creativity, expression, building

### 🏷️ Brand
**File:** `brand.svg`  
**Colors:** Mint to pastel pink (#A8EDEA → #FED6E3)  
**Icon:** Tag with badge  
**Theme:** Identity, recognition, values

### 🤝 Communities
**File:** `communities.svg`  
**Colors:** Magenta to red (#F857A6 → #FF5858)  
**Icon:** Overlapping group circles  
**Theme:** Collaboration, belonging, guilds

### 🎮 Gaming
**File:** `gaming.svg`  
**Colors:** Purple to blue (#6A11CB → #2575FC)  
**Icon:** Game controller  
**Theme:** Play, competition, entertainment

### ✅ Productivity
**File:** `productivity.svg`  
**Colors:** Sky blue to lavender (#48C6EF → #6F86D6)  
**Icon:** Checklist document  
**Theme:** Tasks, focus, efficiency

### ✈️ Travel
**File:** `travel.svg`  
**Colors:** Cyan to mint (#00C9FF → #92FE9D)  
**Icon:** Airplane with contrail  
**Theme:** Exploration, journey, adventure

### 📈 Finance
**File:** `finance.svg`  
**Colors:** Forest to lime (#11998E → #38EF7D)  
**Icon:** Growth chart with upward arrow  
**Theme:** Money, investment, growth

### ❤️ Health
**File:** `health.svg`  
**Colors:** Coral to purple (#E96443 → #904E95)  
**Icon:** Heart with heartbeat line  
**Theme:** Wellness, balance, vitality

### 🏡 Home Control
**File:** `homecontrol.svg`  
**Colors:** Blue to cyan (#3A7BD5 → #00D2FF)  
**Icon:** Smart home with control panel  
**Theme:** Automation, devices, IoT

### ⚙️ Automation
**File:** `automation.svg`  
**Colors:** Red to blue (#FC466B → #3F5EFB)  
**Icon:** Gear with flow lines  
**Theme:** Workflows, AI, intelligence

## Design Principles

### Consistency
- All logos use 64x64 viewBox for perfect scaling
- Gradient-based with 2-3 colors per universe
- Aurora glow effects for brand coherence
- 0.1-0.9 opacity layers for depth

### Differentiation
- Each universe has unique color palette
- Icons are symbolic and immediately recognizable
- Visual metaphors align with universe purpose

### Accessibility
- High contrast between icon and background
- Semantic SVG paths for screen readers
- Works in light and dark themes
- Scalable without quality loss

## Usage

### In React Components
```tsx
import HomeIcon from '@/docs/brand/universe-logos/home.svg'

// As image
<img src="/docs/brand/universe-logos/home.svg" alt="Home Universe" />

// As component (with SVGR)
<HomeIcon className="w-8 h-8" aria-label="Home Universe" />
```

### In Navigation
```tsx
<UniverseNav>
  {universes.map(universe => (
    <UniverseLink key={universe.id} href={universe.path}>
      <img src={`/docs/brand/universe-logos/${universe.id}.svg`} />
      {universe.name}
    </UniverseLink>
  ))}
</UniverseNav>
```

### Sizing Recommendations
- **Navigation icons:** 24-32px
- **Universe cards:** 48-64px  
- **Hero sections:** 96-128px
- **Splash screens:** 256-512px

## Variants Needed

For production use, consider generating:

1. **PNG exports** at 64px, 128px, 256px, 512px
2. **Monochrome versions** for text-only contexts
3. **Inverted versions** for dark backgrounds
4. **Animated versions** with aurora shimmer effects
5. **Favicon variants** at 16px, 32px, 48px

## Brand Alignment

These universe logos complement the main Aurora logo concepts:
- **Concept 1:** Radial aurora with wave pattern
- **Concept 2:** Flowing A-shape letterform  
- **Concept 3:** Minimal circular aurora

All share:
- Gradient-based color approach
- Light/glow effects
- Organic, flowing shapes
- Modern, minimal aesthetic

---

**Status:** ✅ All 15 universe logos created  
**Format:** SVG (vector)  
**Last Updated:** 2026-02-17
