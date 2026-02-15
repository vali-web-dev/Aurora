# Aurora Button System

## Overview
The Aurora Button System provides a unified, visually stunning button design language inspired by the Aurora cover page. These button variants create a cohesive, futuristic experience across the entire platform.

## Button Variants

### Aurora (Primary Action)
**Usage:** Primary actions, CTAs, confirmations, submissions
**Variant:** `aurora`

```tsx
<Button variant="aurora" size="lg">
  Enter Aurora ✨
</Button>
```

**Features:**
- Gradient background: purple → pink → blue
- Hover gradient darkens for depth
- Shadow with purple glow effect
- Scale transform on hover (1.05x)
- Smooth transitions (300ms)

**When to use:**
- Main call-to-action buttons
- Form submissions
- Checkout/payment actions
- Primary navigation entries
- Conversion-critical actions

---

### Aurora Secondary (Glassmorphic)
**Usage:** Secondary actions, alternative choices
**Variant:** `auroraSecondary`

```tsx
<Button variant="auroraSecondary" size="lg">
  Learn More
</Button>
```

**Features:**
- Glassmorphic background (white/10 with backdrop blur)
- Subtle border (white/20)
- Hover brightens background
- Scale transform on hover (1.05x)
- Maintains transparency theme

**When to use:**
- Secondary navigation
- Alternative actions
- "Learn more" or info buttons
- Supporting CTAs
- Cancel/back actions

---

### Aurora Ghost (Minimal)
**Usage:** Tertiary actions, subtle interactions
**Variant:** `auroraGhost`

```tsx
<Button variant="auroraGhost" size="sm">
  Sign In
</Button>
```

**Features:**
- Transparent background
- Hover shows subtle white overlay
- No shadow or border
- Faster transitions (200ms)
- Minimal visual weight

**When to use:**
- Navigation items
- Menu items
- Inline actions
- Icon buttons
- Less important actions

---

## Button Sizes

### Small
```tsx
<Button variant="aurora" size="sm">
  Action
</Button>
```
- Height: 8 (2rem)
- Padding: px-3
- Text: sm
- Border radius: lg

### Medium (Default)
```tsx
<Button variant="aurora" size="md">
  Action
</Button>
```
- Height: 10 (2.5rem)
- Padding: px-4
- Text: base
- Border radius: xl

### Large
```tsx
<Button variant="aurora" size="lg">
  Action
</Button>
```
- Height: 12 (3rem)
- Padding: px-6
- Text: lg
- Border radius: 2xl

---

## CSS Utilities

### Button Utility Classes
For custom implementations outside the Button component:

```css
.btn-aurora          /* Primary Aurora button */
.btn-aurora-secondary /* Glassmorphic button */
.btn-aurora-ghost    /* Ghost button */
```

### Size Modifiers
```css
.btn-aurora-sm       /* Small size */
.btn-aurora-md       /* Medium size */
.btn-aurora-lg       /* Large size */
```

### Additional Utilities
```css
.text-aurora-gradient   /* Gradient text effect */
.aurora-glow           /* Soft glow effect */
.aurora-glow-strong    /* Strong glow effect */
```

---

## Design Tokens

Located in `src/lib/design-system/tokens.ts`:

```typescript
export const buttonTokens = {
  aurora: {
    gradient: {
      from: '#a855f7', // purple-500
      via: '#ec4899',  // pink-500
      to: '#3b82f6',   // blue-500
    },
    gradientHover: {
      from: '#9333ea', // purple-600
      via: '#db2777',  // pink-600
      to: '#2563eb',   // blue-600
    },
    shadow: {
      base: '0 25px 50px -12px rgba(168, 85, 247, 0.5)',
      hover: '0 25px 50px -12px rgba(168, 85, 247, 0.7)',
    },
    // ... more tokens
  }
}
```

---

## CSS Variables

Defined in `src/app/globals.css`:

```css
:root {
  --btn-aurora-gradient-from: #a855f7;
  --btn-aurora-gradient-via: #ec4899;
  --btn-aurora-gradient-to: #3b82f6;
  --btn-aurora-shadow: 0 25px 50px -12px rgba(168, 85, 247, 0.5);
  /* ... more variables */
}
```

---

## Examples

### Form Submission
```tsx
<form onSubmit={handleSubmit}>
  {/* Form fields */}
  <Button variant="aurora" type="submit" className="w-full">
    Create Account
  </Button>
</form>
```

### Dialog Actions
```tsx
<div className="flex gap-3">
  <Button variant="auroraGhost" onClick={onCancel}>
    Cancel
  </Button>
  <Button variant="aurora" onClick={onConfirm}>
    Confirm
  </Button>
</div>
```

### Navigation
```tsx
<nav>
  <Button variant="auroraGhost" size="sm">
    Features
  </Button>
  <Button variant="aurora" size="sm">
    Get Started
  </Button>
</nav>
```

### Commerce Actions
```tsx
<div className="space-y-2">
  <Button variant="aurora" className="w-full">
    Checkout
  </Button>
  <Button variant="auroraSecondary" className="w-full">
    Save for Later
  </Button>
</div>
```

---

## Migration Guide

### Replacing Old Button Variants

**Before:**
```tsx
<Button variant="primary">Action</Button>
<Button variant="secondary">Action</Button>
<Button variant="ghost">Action</Button>
```

**After:**
```tsx
<Button variant="aurora">Action</Button>
<Button variant="auroraSecondary">Action</Button>
<Button variant="auroraGhost">Action</Button>
```

### When to Use Traditional Variants

The traditional button variants (`primary`, `secondary`, `accent`, `outline`, `ghost`) are still available for:
- Admin interfaces
- Developer tools
- System messages
- Non-Aurora branded areas

---

## Accessibility

All Aurora buttons maintain WCAG 2.1 AA compliance:

- ✅ Sufficient color contrast ratios
- ✅ Focus-visible ring indicators
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Reduced motion support (respects prefers-reduced-motion)
- ✅ Touch target size (minimum 44x44px)

---

## Best Practices

### Do's ✅
- Use `aurora` for primary actions
- Use `auroraSecondary` for alternative paths
- Use `auroraGhost` for subtle interactions
- Maintain visual hierarchy
- Use consistent sizing within sections
- Test in both light and dark modes

### Don'ts ❌
- Don't use multiple `aurora` buttons in the same view
- Don't override gradient colors with className
- Don't mix Aurora and traditional variants in the same feature
- Don't ignore accessibility requirements
- Don't scale beyond 1.1x on hover

---

## Component API

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'aurora' | 'auroraSecondary' | 'auroraGhost' | 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}
```

---

## Related Documentation
- [Aurora Design Culture](./AURORA_DESIGN_CULTURE.md)
- [Design System Tokens](./src/lib/design-system/tokens.ts)
- [Accessibility Guidelines](./AURORA_PRINCIPLES_ETHICS.md)
- [Component Library](./src/components/aurora/Button.tsx)

---

**Last Updated:** February 15, 2026  
**Maintained by:** Aurora Design System Team
