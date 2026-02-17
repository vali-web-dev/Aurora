# Aurora Universe Logo Guidelines

## Purpose
This guide standardizes how Aurora universe logos are created, implemented, and used across the platform. Consistency ensures brand coherence while allowing each universe to maintain its unique identity.

---

## Logo Anatomy

### Required Elements
Each universe logo must contain:

1. **Primary Icon** - Symbolic representation of universe purpose
2. **Aurora Gradient** - 2-3 color gradient unique to that universe
3. **Glow/Light Effect** - Subtle aurora borealis-inspired lighting
4. **64x64 ViewBox** - Standard SVG canvas for scalability

### Optional Elements
- Secondary shapes for depth
- Connecting lines or flows
- Sparkles or accent marks
- Background circles/shapes (at low opacity)

---

## Color Palettes

### Gradient Selection
Each universe has a primary gradient:

```css
/* Example: Home Universe */
--home-start: #FF6B6B;  /* Warm coral */
--home-end: #FFB347;    /* Soft peach */

/* Example: Social Universe */
--social-start: #667EEA; /* Indigo */
--social-end: #764BA2;   /* Violet */
```

### Color Contrast
- Maintain 4.5:1 contrast ratio for accessibility
- Test against white and dark backgrounds
- Ensure readability at 16px minimum

### Opacity Layers
- Primary icon: 0.9 opacity
- Secondary elements: 0.5-0.7 opacity
- Background glows: 0.1-0.3 opacity

---

## Size Standards

### Export Sizes
Generate universe logos in these dimensions:

| Size | Use Case |
|------|----------|
| 16px | Inline text icons, breadcrumbs |
| 24px | Navigation items, tabs |
| 32px | Buttons, small cards |
| 48px | Medium cards, sidebars |
| 64px | Large cards, headers |
| 96px | Hero sections, featured content |
| 128px | Landing pages, app icons |
| 256px | High-res displays, marketing |
| 512px | Splash screens, presentations |

### Responsive Behavior
```tsx
// Mobile: 24-32px
// Tablet: 32-48px
// Desktop: 48-64px
// Large displays: 64-96px
```

---

## Variant Types

### 1. Master (Full Color)
- Default gradient version
- Used in most contexts
- File naming: `[universe].svg`

### 2. Monochrome
- Single color (#1F2937 for light, #FFF for dark)
- Used in text-heavy contexts
- File naming: `[universe]-mono.svg`

### 3. Inverted
- Light colors for dark backgrounds
- Maintains brand identity on dark themes
- File naming: `[universe]-invert.svg`

### 4. Animated (Future)
- Subtle aurora shimmer effects
- CSS or SMIL animations
- File naming: `[universe]-animated.svg`

---

## Usage Guidelines

### Do's ✅

- **Use appropriate sizing** - Match logo size to context
- **Maintain spacing** - Minimum 8px padding around logos
- **Respect aspect ratio** - Always maintain 1:1 square ratio
- **Test accessibility** - Check contrast and screen reader compatibility
- **Combine with labels** - Add universe name for clarity

### Don'ts ❌

- **Don't distort** - Never stretch or squash logos
- **Don't recolor** - Use official variants instead of custom colors
- **Don't add effects** - Keep logos pure; effects are built-in
- **Don't use low-res** - Always use vector SVG or appropriate PNG size
- **Don't overlap excessively** - Let each logo breathe

---

## Implementation Patterns

### React Component
```tsx
import { UniverseLogo } from '@/components/aurora/UniverseLogo';

<UniverseLogo 
  universe="home" 
  size={32} 
  showLabel={true}
  ariaLabel="Navigate to Home Universe"
/>
```

### CSS Background
```css
.universe-icon-home {
  background-image: url('/docs/brand/universe-logos/home.svg');
  background-size: contain;
  background-repeat: no-repeat;
  width: 32px;
  height: 32px;
}
```

### Next.js Image
```tsx
import Image from 'next/image';

<Image 
  src="/docs/brand/universe-logos/home.svg"
  alt="Home Universe"
  width={32}
  height={32}
/>
```

---

## Accessibility Requirements

### Alt Text Standards
```tsx
// Navigation
alt="Home Universe"

// Decorative (when text label is present)
aria-hidden="true"

// Interactive
aria-label="Navigate to Entertainment Universe"
```

### Screen Reader Support
- Always include descriptive ARIA labels
- Use semantic HTML with logos
- Ensure keyboard navigation works with clickable logos

### High Contrast Mode
- Test logos in Windows High Contrast mode
- Ensure monochrome versions work well
- Add explicit strokes when needed for clarity

---

## Animation Guidelines (Future)

### Subtle Aurora Effect
```css
@keyframes aurora-shimmer {
  0%, 100% { opacity: 0.8; filter: brightness(1); }
  50% { opacity: 1; filter: brightness(1.2); }
}

.universe-logo {
  animation: aurora-shimmer 3s ease-in-out infinite;
}
```

### Hover States
- Scale: 1.05x on hover
- Add subtle glow effect
- Transition duration: 200-300ms

### Loading States
- Fade in animation (300ms)
- Skeleton loader with logo shape
- Graceful fallback to emoji if SVG fails

---

## Quality Checklist

Before publishing a new universe logo:

- [ ] SVG is optimized (no unnecessary paths)
- [ ] 64x64 viewBox is set correctly
- [ ] Gradient IDs are unique (no conflicts)
- [ ] Tested on light backgrounds
- [ ] Tested on dark backgrounds
- [ ] Tested at 16px, 32px, 64px sizes
- [ ] Alt text is descriptive
- [ ] Monochrome variant created
- [ ] Inverted variant created
- [ ] Added to UniverseLogo component
- [ ] Added to UNIVERSE_NAMES mapping
- [ ] Documentation updated
- [ ] Accessibility audit passed

---

## File Structure

```
docs/brand/universe-logos/
├── README.md                  # Index of all logos
├── GUIDELINES.md              # This file
├── home.svg                   # Master versions
├── home-mono.svg             # Monochrome variants
├── home-invert.svg           # Inverted variants
├── entertainment.svg
├── commerce.svg
└── ...                       # All 15 universes
```

---

## Maintenance & Updates

### Versioning
- Major changes: Increment version (v2.0)
- Minor updates: Document in CHANGELOG
- Keep previous versions archived

### Review Cycle
- Quarterly review of all universe logos
- User feedback integration
- Accessibility audit updates
- Performance optimization

---

## Related Resources

- [Aurora Design Culture](../../AURORA_DESIGN_CULTURE.md)
- [Aurora Icon System](../../AURORA_ICON_SYSTEM.md)
- [Main Aurora Logo](../logo-drafts/README.md)
- [Typography System](../../AURORA_TYPOGRAPHY_SYSTEM.md)

---

**Version:** 1.0  
**Last Updated:** 2026-02-17  
**Maintained by:** Aurora Design Team
