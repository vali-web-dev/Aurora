# Aurora Typography System

## Overview
Aurora's comprehensive typography system provides gradient-filled, animated text styling for all alphanumeric characters (A-Z, a-z, 0-9) with room for expansion and upgrades.

## Base Classes

### Static Gradient
```tsx
<h1 className="aurora-text">Aurora Platform</h1>
```
- Purple → Pink → Blue gradient
- Static positioning
- 600 font weight
- Optimized letter spacing

### Animated Gradient
```tsx
<h1 className="aurora-text-animated">Welcome Home</h1>
```
- Flowing gradient animation (8s cycle)
- Smooth color transitions
- Medium intensity

### Breathing Effect
```tsx
<h1 className="aurora-text-breathe">Living Typography</h1>
```
- Gradient flow + opacity breathing
- Dual animation (8s + 4s cycles)
- Organic, alive feeling

### Shimmer Effect
```tsx
<span className="aurora-text-shimmer">New Feature</span>
```
- Fast horizontal shimmer (3s)
- Perfect for badges and labels
- High-energy aesthetic

## Semantic Headings

### Display (Hero Text)
```tsx
<h1 className="aurora-display">AURORA</h1>
```
- Massive scale: clamp(3rem, 8vw, 6rem)
- 900 weight, uppercase
- Breathing animation
- Use sparingly for maximum impact

### Heading Hierarchy
```tsx
<h1 className="aurora-heading-1">Primary Heading</h1>
<h2 className="aurora-heading-2">Secondary Heading</h2>
<h3 className="aurora-heading-3">Tertiary Heading</h3>
<h4 className="aurora-heading-4">Quaternary Heading</h4>
```

| Class | Size Range | Weight | Animation |
|-------|------------|--------|-----------|
| `aurora-heading-1` | 2rem - 3.5rem | 800 | Animated |
| `aurora-heading-2` | 1.5rem - 2.5rem | 700 | Static |
| `aurora-heading-3` | 1.25rem - 2rem | 700 | Static |
| `aurora-heading-4` | 1.125rem - 1.5rem | 600 | Static |

### UI Text
```tsx
<label className="aurora-label">Section Name</label>
<span className="aurora-badge">NEW</span>
```

## Color Variants

### Warm Palette
```tsx
<span className="aurora-text-warm">Orange → Pink → Purple</span>
```
- Energetic, passionate
- Use for: CTAs, highlights

### Cool Palette
```tsx
<span className="aurora-text-cool">Blue → Cyan → Purple</span>
```
- Calm, professional
- Use for: Data, tech features

### Nature Palette
```tsx
<span className="aurora-text-nature">Green → Teal → Cyan</span>
```
- Fresh, growth-oriented
- Use for: Health, wellness, eco themes

## Size Modifiers

Combine with any aurora-text class:
```tsx
<p className="aurora-text aurora-text-xs">Extra small</p>
<p className="aurora-text aurora-text-sm">Small</p>
<p className="aurora-text aurora-text-base">Base</p>
<p className="aurora-text aurora-text-lg">Large</p>
<p className="aurora-text aurora-text-xl">Extra large</p>
<p className="aurora-text aurora-text-2xl">2X large</p>
<p className="aurora-text aurora-text-3xl">3X large</p>
<p className="aurora-text aurora-text-4xl">4X large</p>
```

## Weight Modifiers

```tsx
<p className="aurora-text aurora-text-normal">Normal (400)</p>
<p className="aurora-text aurora-text-medium">Medium (500)</p>
<p className="aurora-text aurora-text-semibold">Semibold (600)</p>
<p className="aurora-text aurora-text-bold">Bold (700)</p>
<p className="aurora-text aurora-text-extrabold">Extrabold (800)</p>
```

## Composition Examples

### Combining Modifiers
```tsx
<h2 className="aurora-text-animated aurora-text-2xl aurora-text-extrabold">
  Featured Universe
</h2>

<span className="aurora-text-shimmer aurora-text-xs">
  BETA
</span>

<p className="aurora-text-cool aurora-text-lg aurora-text-semibold">
  Enterprise Solutions
</p>
```

### Navigation Headers
```tsx
<h3 className="aurora-heading-3">
  Aurora Universes
</h3>
```

### Labels & Badges
```tsx
<span className="aurora-label">Primary</span>
<span className="aurora-badge">NEW</span>
```

## Accessibility

### Reduced Motion
All animations respect `prefers-reduced-motion: reduce`:
```css
@media (prefers-reduced-motion: reduce) {
  .aurora-text-animated,
  .aurora-text-breathe,
  .aurora-text-shimmer {
    animation: none;
  }
}
```

### Dark Mode
Automatic brightness/saturation boost in dark mode:
```css
html.dark .aurora-text-* {
  filter: brightness(1.15) saturate(1.1);
}
```

## Migration Guide

### Replace Old Gradient Text
**Before:**
```tsx
<h2 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
  Title
</h2>
```

**After:**
```tsx
<h2 className="aurora-heading-2">
  Title
</h2>
```

### Replace Static Gradients
**Before:**
```tsx
<span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
  Text
</span>
```

**After:**
```tsx
<span className="aurora-text">
  Text
</span>
```

## Extension Points

### Adding New Color Variants
```css
.aurora-text-custom {
  background: linear-gradient(135deg, #color1 0%, #color2 50%, #color3 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Adding New Animations
```css
.aurora-text-pulse {
  @apply aurora-text;
  animation: aurora-text-pulse 2s ease-in-out infinite;
}

@keyframes aurora-text-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### Custom Size Ranges
```css
.aurora-text-5xl {
  font-size: clamp(2.5rem, 6vw, 3rem);
  line-height: 1;
}
```

## Browser Support

- **Chrome/Edge:** Full support
- **Safari:** Full support (webkit prefix included)
- **Firefox:** Full support
- **Mobile:** Optimized with clamp() responsive sizing

## Performance Notes

- Uses CSS gradients (GPU-accelerated)
- Animations use `transform` and `opacity` (60fps)
- `will-change` not used (prevents layout thrashing)
- Respects system preferences for motion

## Future Enhancements

### Planned
- [ ] Aurora text with glow effects for illuminated mode
- [ ] Hover state animations
- [ ] Interactive gradient following cursor
- [ ] More color theme variants
- [ ] Monospace variant for code
- [ ] Outlined text variant

### Experimental
- [ ] 3D text depth effects
- [ ] Particle text effects
- [ ] Liquid metal gradients
- [ ] Neon glow variants
