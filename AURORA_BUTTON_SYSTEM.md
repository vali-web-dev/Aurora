# Aurora Button System Documentation

## Overview

The Aurora Button System is a comprehensive, water droplet-inspired design system that provides consistent, beautiful, and accessible buttons across all Aurora universes. The design embodies the characteristics of water droplets: transparency, smoothness, shininess, flow, reflection, and curvature.

**Version:** 2.0 - Water Droplet Design System  
**Last Updated:** February 17, 2026

## Design Philosophy

### Water Droplet Aesthetics

The button system is inspired by the natural beauty of water droplets:

- **Transparency**: Layered glass effects with subtle opacity variations
- **Smoothness**: Fluid transitions and animations with carefully tuned easing
- **Shininess**: Gradient reflections and shimmer effects that catch the eye
- **Flow**: Natural motion patterns (pulse, breathe, float) that feel organic
- **Reflection**: Light overlay on the top portion simulating real droplet shine
- **Curvature**: Smooth border radius with liquid morph animations

These principles create buttons that feel alive, responsive, and premium while maintaining excellent usability.

## Architecture

### CSS Variable System

All button properties are defined as CSS custom properties at the root level in `globals.css`. This approach ensures:

- **Consistency**: All buttons use the same design tokens
- **Theme Support**: Easy switching between light, dark, gray, and illuminated modes
- **Customization**: Simple overrides for specific use cases
- **Performance**: CSS variables are hardware-accelerated
- **Maintainability**: Centralized source of truth

Variables are organized by category:
- Sizing & Spacing
- Border Properties  
- Typography
- Opacity & Transparency
- Transitions & Timing
- Animation Durations
- Shadows (box, inset, text, glow)
- Gradients (primary, state-specific, glass, reflection, shimmer)
- Colors (background, border, text)

### Theme Support

Four theme modes with automatic variable overrides:

**Dark Mode** (default)
- Purple-based primary colors
- Dark slate backgrounds
- Subtle glows and reflections

**Light Mode**
- Same vibrant colors
- Light, airy backgrounds
- Reduced shadow intensity

**Gray Mode**
- Monochromatic grayscale palette
- Professional, neutral appearance
- Maintains accessibility

**Illuminated Mode**
- High-contrast colors
- Enhanced glow effects
- Maximum visual impact

Theme switching:
```tsx
<div data-theme="light">
  <Button variant="primary">Light Mode</Button>
</div>
```

## Button Variants

### Visual Variants

**Primary** - Main actions
- Purple gradient background
- High contrast text
- Prominent shadow with glow
- Use for: Save, Submit, Confirm, Continue

**Secondary** - Supporting actions
 - Subtle gray background
- Medium contrast
- Minimal shadow
- Use for: Cancel, Back, Edit, View

**Success** - Positive actions
- Green gradient background
- Indicates completion or approval
- Green glow effect
- Use for: Complete, Approve, Done, Publish

**Warning** - Cautionary actions
- Orange gradient background
- Signals need for attention
- Orange glow effect
- Use for: Proceed with caution, Important notice

**Danger** - Destructive actions
- Red gradient background
- High urgency visual
- Red glow effect
- Use for: Delete, Remove, Revoke, Destroy

**Notice** - Informational actions
- Blue gradient background
- Friendly, approachable
- Blue glow effect
- Use for: Learn More, Info, Details, Help

**Ghost** - Minimal actions
- Transparent background
- Border only
- No shadow
- Use for: Tertiary actions, inline buttons

**Cancel/Exit** - Dismissal actions
- Gray by default
- Transforms to red on hover
- Clear intent signaling
- Use for: Cancel, Dismiss, Close, Exit

### Size Variants

| Size | Height | Padding | Font | Use Case |
|------|--------|---------|------|----------|
| `sm` | 32px | 12px | 13px | Compact UIs, tables, dense layouts |
| `md` | 40px | 16px | 14px | Default, most common use |
| `lg` | 48px | 24px | 15px | Prominent actions, forms |
| `xl` | 56px | 32px | 16px | Hero CTAs, landing pages |

### State Variants

**Default** - Normal interactive state
- Full color presentation
- Responsive to hover
- Clickable cursor

**Hover** - Mouse over state
- Scale up by 2%
- Brightness increase
- Enhanced shadow
- Reflection increases

**Active** - Mouse down state
- Scale down by 2%
- Brightness decrease  
- Shadow reduces
- Provides tactile feedback

**Disabled** - Unavailable state
- 40% opacity
- Grayed out appearance
- Not clickable
- No hover effects

**Blocked** - Locked feature state
- 60% opacity
- Lock icon displayed
- Indicates premium/locked features
- Not clickable

**Loading** - Processing state
- Spinner displayed
- Text hidden
- Not clickable
- Shows progress indicator

### Animation Variants

**Pulse** - `animation="pulse"`
- Gentle rhythmic scaling
- Duration: 2s
- Use for: Drawing attention to important actions

**Breathe** - `animation="breathe"`
- Smooth expansion and contraction
- Duration: 3s
- Use for: Calm, persistent presence

**Excited** - `animation="excited"`
- Bouncy animation on hover
- Duration: 0.6s
- Use for: Playful, engaging interactions

**Nervous** - `animation="nervous"`
- Rapid subtle shake
- Duration: 0.3s
- Use for: Urgent warnings, time-sensitive actions

**Shimmer** - `animation="shimmer"`
- Light reflection sweep on hover
- Duration: 2.5s
- Use for: Premium features, special offers

**Glow** - `animation="glow"`
- Pulsating glow effect
- Duration: 2s
- Use for: Highlighting importance

**Float** - `animation="float"`
- Gentle vertical movement
- Duration: 3s
- Use for: Floating CTAs, sticky actions

**Liquid** - `animation="liquid"`
- Border radius morphing
- Duration: 4s
- Use for: Organic, fluid aesthetic

## Emotional Intelligence

### Overview

Aurora buttons feature emotional intelligence that allows them to respond dynamically to user interaction and context. Buttons can exhibit emotions through animation transitions, creating a more engaging and intuitive user experience.

### How It Works

**Hover-Based Transitions**
When emotional intelligence is enabled:
1. **Excited State** (0-5s): On hover, button becomes excited with bouncy animation
2. **Calm State** (5s+): After 5 seconds of hovering, transitions to a calm breathing animation
3. **Return to Context**: On mouse leave, returns to context-aware default animation

**Context-Aware Defaults**
Buttons automatically apply appropriate emotional states based on their variant:
- **Danger/Warning** → Nervous (urgent, cautionary)
- **Success** → Glow (confident, positive)
- **Primary** → Pulse (steady, inviting)
- **Notice** → Breathe (calm, informative)
- **Ghost** → None (subtle, unobtrusive)

**Loading State Progression**
Loading states emotionally progress over time:
- **0-3 seconds**: Pulse (starting work)
- **3-8 seconds**: Breathe (working steadily)
- **8+ seconds**: Shimmer (still working, please wait)

### Usage

#### Basic Emotional Intelligence

```typescript
<Button 
  variant="primary"
  emotional              // Enable emotional intelligence
>
  Click Me
</Button>
```

#### Custom Configuration

```typescript
<Button 
  variant="success"
  emotional
  emotionalExcitementDuration={3000}    // 3s excitement instead of 5s
  emotionalCalmAnimation="glow"         // Use glow instead of breathe
  emotionalContextAware={true}          // Use context-aware defaults
>
  Quick Response Button
</Button>
```

#### Disable Context Awareness

```typescript
<Button 
  variant="danger"
  emotional
  emotionalContextAware={false}  // Don't auto-apply nervous
  animation="pulse"              // Use explicit animation
>
  Custom Danger Button
</Button>
```

### Emotional Props

```typescript
interface EmotionalProps {
  // Enable emotional intelligence
  emotional?: boolean;                    // default: false
  
  // Time before transitioning from excited to calm (ms)
  emotionalExcitementDuration?: number;  // default: 5000
  
  // Animation to use after excitement fades
  emotionalCalmAnimation?: ButtonAnimation; // default: 'breathe'
  
  // Apply context-aware animation defaults
  emotionalContextAware?: boolean;        // default: true
}
```

### Best Practices

**When to Use Emotional Intelligence:**
- ✅ Interactive forms where users might pause to read
- ✅ Confirmation dialogs (danger buttons should be nervous)
- ✅ Landing pages with prominent CTAs
- ✅ Loading processes that take variable time
- ✅ Complex UIs where context matters

**When NOT to Use:**
- ❌ High-density UIs (too much motion)
- ❌ Simple, fast interactions
- ❌ Accessibility reduced-motion contexts (automatically disabled)
- ❌ When explicit animation control is required

### Context-Aware Animation Map

| Variant | Default Animation | Rationale |
|---------|------------------|-----------|
| `danger` | `nervous` | Signals urgency and caution |
| `warning` | `nervous` | Requires attention |
| `success` | `glow` | Confident, positive energy |
| `primary` | `pulse` | Steady, inviting presence |
| `notice` | `breathe` | Calm, informative |
| `secondary` | `none` | Subtle, supportive |
| `ghost` | `none` | Minimal, unobtrusive |
| `cancel`/`exit` | `none` | Neutral dismissal |

### Real-World Examples

**Delete Confirmation Dialog:**
```typescript
<Button 
  variant="danger"
  emotional                    // Automatically nervous
  emotionalContextAware        // Uses danger → nervous mapping
>
  Delete Account
</Button>
```

**Long-Running Process:**
```typescript
<Button 
  variant="primary"
  loading={isProcessing}
  emotional                    // Auto-progresses: pulse → breathe → shimmer
>
  {isProcessing ? 'Processing...' : 'Start Process'}
</Button>
```

**Hover-Aware CTA:**
```typescript
<Button 
  variant="primary"
  size="xl"
  emotional
  emotionalExcitementDuration={4000}  // Quick calm for browsing users
>
  Get Started Free
</Button>
```

## Component API

### Button Props

```typescript
interface ButtonProps {
  // Visual style
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 
            'danger' | 'notice' | 'ghost' | 'cancel' | 'exit';
  
  // Size variant
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // State flags
  disabled?: boolean;
  blocked?: boolean;
  loading?: boolean;
  
  // Animation effect
  animation?: 'pulse' | 'breathe' | 'excited' | 'nervous' | 
              'shimmer' | 'glow' | 'float' | 'liquid' | 'none';
  
  // Layout
  fullWidth?: boolean;
  iconOnly?: boolean;
  
  // Icons
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  
  // Additional customization
  className?: string;
  children?: ReactNode;
  
  // Standard button attributes
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  // ... all other HTMLButtonElement props
}
```

## Usage Examples

### Basic Buttons
```tsx
import { Button } from '@/components/ui/Button';

// Primary action
<Button variant="primary">Save Changes</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Destructive action
<Button variant="danger">Delete</Button>
```

### Buttons with Icons
```tsx
// Icon before text
<Button 
  variant="success" 
  iconBefore={<CheckIcon />}
>
  Confirm
</Button>

// Icon after text
<Button 
  variant="primary" 
  iconAfter={<ArrowRight />}
>
  Continue
</Button>

// Icon only
<Button 
  variant="ghost" 
  iconOnly
  aria-label="Settings"
>
  ⚙️
</Button>
```

### Loading States
```tsx
const [saving, setSaving] = useState(false);

<Button 
  variant="primary"
  loading={saving}
  disabled={saving}
  onClick={handleSave}
>
  {saving ? 'Saving...' : 'Save'}
</Button>
```

### Animated Buttons
```tsx
// Shimmer on hover
<Button 
  variant="primary" 
  animation="shimmer"
>
  Upgrade to Pro
</Button>

// Pulsing attention-grabber
<Button 
  variant="notice" 
  animation="pulse"
>
  New Feature!
</Button>

// Nervous warning
<Button 
  variant="danger" 
  animation="nervous"
>
  Delete Account
</Button>
```

### Button Groups
```tsx
import { ButtonGroup } from '@/components/ui/Button';

<ButtonGroup>
  <Button variant="secondary">Left</Button>
  <Button variant="secondary">Middle</Button>
  <Button variant="secondary">Right</Button>
</ButtonGroup>
```

### Full Width Buttons
```tsx
<Button variant="primary" fullWidth>
  Create Account
</Button>
```

### Complex Example
```tsx
<Button
  variant="primary"
  size="lg"
  animation="glow"
  iconBefore={<RocketIcon />}
  onClick={handleLaunch}
  disabled={!isReady}
  className="custom-class"
>
  Launch Campaign
</Button>
```

## CSS Classes

All classes can be used directly in HTML/CSS if not using the React component.

### Base Class
```css
.aurora-btn /* Base button with all common styles */
```

### Variant Classes
```css
.aurora-btn-primary      /* Purple gradient */
.aurora-btn-secondary    /* Subtle gray */
.aurora-btn-success      /* Green gradient */
.aurora-btn-warning      /* Orange gradient */
.aurora-btn-danger       /* Red gradient */
.aurora-btn-notice       /* Blue gradient */
.aurora-btn-ghost        /* Transparent */
.aurora-btn-cancel       /* Gray → Red on hover */
.aurora-btn-exit         /* Gray → Red on hover */
```

### Size Classes
```css
.aurora-btn-sm    /* 32px height */
.aurora-btn-lg    /* 48px height */
.aurora-btn-xl    /* 56px height */
```

### State Classes
```css
.aurora-btn-disabled  /* Disabled state */
.aurora-btn-blocked   /* Blocked with lock icon */
.aurora-btn-loading   /* Loading with spinner */
```

### Animation Classes
```css
.aurora-btn-pulse     /* Pulse animation */
.aurora-btn-breathe   /* Breathe animation */
.aurora-btn-excited   /* Excited animation */
.aurora-btn-nervous   /* Nervous animation */
.aurora-btn-shimmer   /* Shimmer animation */
.aurora-btn-glow      /* Glow animation */
.aurora-btn-float     /* Float animation */
.aurora-btn-liquid    /* Liquid morph animation */
```

### Layout Classes
```css
.aurora-btn-full   /* Full width */
.aurora-btn-icon   /* Icon only (square) */
```

### Group Class
```css
.aurora-btn-group  /* Container for button groups */
```

## Accessibility

### Built-in Features
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Focus visible indicators with outline and glow
- ✅ ARIA attributes support
- ✅ Proper disabled state handling
- ✅ Reduced motion support (`prefers-reduced-motion`)
- ✅ Touch target size minimum 44x44px (WCAG 2.1)
- ✅ Color contrast ratios meet WCAG AA standards

### Best Practices
```tsx
// Icon-only buttons need aria-label
<Button iconOnly aria-label="Close dialog">
  ✕
</Button>

// Loading state should disable interaction
<Button loading disabled>
  Loading...
</Button>

// Blocked indicates premium/unavailable features
<Button blocked>
  Premium Feature 🔒
</Button>

// Use semantic HTML button types
<Button type="submit" variant="primary">
  Submit Form
</Button>
```

## CSS Variables Reference

### Sizing Variables
```css
--btn-height-sm: 32px;
--btn-height-md: 40px;
--btn-height-lg: 48px;
--btn-height-xl: 56px;
--btn-padding-x-sm: 12px;
--btn-padding-x-md: 16px;
--btn-padding-x-lg: 24px;
--btn-padding-x-xl: 32px;
--btn-gap: 8px;
--btn-icon-size: 20px;
```

### Border Radius
```css
--btn-radius-sm: 8px;
--btn-radius-md: 10px;
--btn-radius-lg: 12px;
--btn-radius-xl: 14px;
--btn-radius-full: 9999px;
```

### Transitions & Timing
```css
--btn-transition-fast: 120ms;
--btn-transition-normal: 200ms;
--btn-transition-slow: 300ms;
--btn-transition-ease: cubic-bezier(0.4, 0, 0.2, 1);
--btn-transition-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--btn-transition-smooth: cubic-bezier(0.4, 0, 0.6, 1);
```

### Animation Durations
```css
--btn-anim-pulse: 2s;
--btn-anim-breathe: 3s;
--btn-anim-excited: 0.6s;
--btn-anim-nervous: 0.3s;
--btn-anim-shimmer: 2.5s;
--btn-anim-ripple: 0.8s;
```

### Shadows
```css
/* Box Shadows */
--btn-shadow-md: 0 2px 4px rgba(0, 0, 0, 0.08), 
                 0 1px 2px rgba(0, 0, 0, 0.06);
--btn-shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.12), 
                 0 2px 4px rgba(0, 0, 0, 0.08);
--btn-shadow-glow: 0 0 20px rgba(167, 139, 250, 0.4), 
                   0 0 40px rgba(139, 92, 246, 0.2);

/* Text Shadows */
--btn-text-shadow-primary: 0 1px 2px rgba(0, 0, 0, 0.3), 
                           0 0 8px rgba(167, 139, 250, 0.5);
--btn-text-shadow-secondary: 0 1px 1px rgba(0, 0, 0, 0.2);

/* Inset Shadows */
--btn-inset-shadow-light: inset 0 1px 2px rgba(255, 255, 255, 0.1);
--btn-inset-shadow-dark: inset 0 2px 4px rgba(0, 0, 0, 0.15);
```

### Gradients
```css
/* Primary Gradients */
--btn-gradient-primary: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
--btn-gradient-primary-hover: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);

/* State Gradients */
--btn-gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
--btn-gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
--btn-gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);

/* Glass Effect */
--btn-gradient-glass: linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.1) 0%, 
                      rgba(255, 255, 255, 0.05) 100%);

/* Reflection Overlay */
--btn-gradient-reflection: linear-gradient(180deg, 
                           rgba(255, 255, 255, 0.25) 0%, 
                           transparent 50%);

/* Shimmer Effect */
--btn-gradient-shimmer: linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(255, 255, 255, 0.3) 50%, 
                        transparent 100%);
```

## Customization

### Overriding Variables

You can customize buttons globally by overriding CSS variables:

```css
:root {
  /* Change default button height */
  --btn-height-md: 44px;
  
  /* Adjust border radius for more rounded buttons */
  --btn-radius-md: 16px;
  
  /* Make transitions faster */
  --btn-transition-normal: 150ms;
  
  /* Customize primary gradient */
  --btn-gradient-primary: linear-gradient(135deg, #your-color 0%, #your-color-2 100%);
}
```

### Creating Custom Variants

```css
/* Custom branded button */
.aurora-btn-brand {
  background: linear-gradient(135deg, #your-brand-color-1, #your-brand-color-2);
  color: #ffffff;
  border-color: rgba(your-brand-color-1-rgb, 0.5);
  box-shadow: var(--btn-shadow-md), 0 0 20px rgba(your-brand-color-1-rgb, 0.3);
}

.aurora-btn-brand:hover:not(:disabled) {
  box-shadow: var(--btn-shadow-lg), 0 0 30px rgba(your-brand-color-1-rgb, 0.5);
  transform: scale(1.02);
}
```

### Theme-Specific Overrides

```css
[data-theme="custom"] {
  --btn-gradient-primary: linear-gradient(135deg, #custom1, #custom2);
  --btn-bg-secondary: rgba(your-color, 0.1);
  --btn-border-secondary: rgba(your-color, 0.3);
}
```

## Performance Considerations

### Optimization Techniques

- **Hardware Acceleration**: All transforms use `translateZ(0)` for GPU acceleration
- **Will-Change**: Applied to animated properties (`transform`, `box-shadow`, `background`)
- **Backface Visibility**: Optimized to prevent flickering
- **Minimal Repaints**: Pseudo-elements for overlays prevent DOM reflows
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

### Best Practices

```tsx
// Good: Conditional animations only when needed
<Button 
  variant="primary"
  animation={isHighlighted ? 'glow' : 'none'}
>
  Action
</Button>

// Good: Disable animations for performance-critical views
<div className="no-animations">
  <Button variant="primary">Fast Action</Button>
</div>
```

## Browser Support

- ✅ Chrome/Edge 88+
- ✅ Firefox 84+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Required Features
- CSS Custom Properties (CSS Variables)
- CSS Grid & Flexbox
- CSS Transforms & Transitions
- CSS Gradients
- Backdrop Filters (for glass effects, graceful degradation)

## Testing Guide

### Visual Regression Testing
```bash
# Test all variants
- [ ] Primary in all sizes
- [ ] Secondary in all sizes
- [ ] Success, Warning, Danger, Notice
- [ ] Ghost, Cancel, Exit
- [ ] Disabled and Blocked states
- [ ] Loading states

# Test all themes
- [ ] Dark mode
- [ ] Light mode
- [ ] Gray mode
- [ ] Illuminated mode

# Test interactions
- [ ] Hover states
- [ ] Active (pressed) states
- [ ] Focus indicators
- [ ] Keyboard navigation
```

### Accessibility Testing
```bash
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Screen reader announces button purpose
- [ ] Touch targets are minimum 44x44px
- [ ] Disabled buttons cannot be focused
- [ ] Icon-only buttons have aria-labels
```

### Cross-Browser Testing
```bash
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (macOS & iOS)
- [ ] Edge
- [ ] Test on actual devices
```

## Migration Guide

### From Old Button System

**Step 1: Update Imports**
```tsx
// Old
import { Button } from '@/components/aurora/Button';

// New
import { Button } from '@/components/ui/Button';
```

**Step 2: Update Variant Names**
```tsx
// Old variants → New variants
aurora          → primary
auroraSecondary → secondary
auroraGhost     → ghost

// Additional new variants available
success, warning, danger, notice, cancel, exit
```

**Step 3: Add New Props (Optional)**
```tsx
// Old (basic)
<Button variant="aurora">Action</Button>

// New (enhanced)
<Button 
  variant="primary"
  size="md"
  animation="shimmer"
  iconBefore={<Icon />}
>
  Action
</Button>
```

### Coexistence Strategy

Both systems can coexist during migration:

```tsx
// Old system (legacy components)
import { Button as LegacyButton } from '@/components/aurora/Button';

// New system (new components)
import { Button } from '@/components/ui/Button';

function MyComponent() {
  return (
    <>
      <LegacyButton variant="aurora">Legacy</LegacyButton>
      <Button variant="primary">New</Button>
    </>
  );
}
```

## Demo & Showcase

View the complete button system showcase at:
```
/dev/buttons
```

Features:
- All button variants with live examples
- Interactive theme switcher
- Size demonstrations
- State showcases (disabled, blocked, loading)
- Animation examples
- Button groups
- Complex usage patterns
- Code snippets

## Troubleshooting

### Common Issues

**Buttons don't have water droplet effects**
- Ensure CSS variables are loaded (check `globals.css`)
- Verify theme is set correctly (`data-theme` attribute)
- Check if `aurora-btn` base class is applied

**Animations not working**
- Check if `prefers-reduced-motion` is enabled
- Verify animation class is applied correctly
- Ensure CSS keyframes are loaded

**TypeScript errors with Button component**
- Update `cn` utility function to support object syntax
- Verify all props match ButtonProps interface
- Check import paths are correct

**Styling conflicts**
- Button classes should be applied in correct order
- Avoid overriding core button variables globally
- Use `!important` sparingly (preferably never)

### Debug Mode

```tsx
// Add debug class to see button structure
<Button variant="primary" className="debug-btn">
  Debug Me
</Button>

// In CSS
.debug-btn * {
  outline: 1px solid red !important;
}
```

## Related Documentation

- [Aurora Design Culture](./AURORA_DESIGN_CULTURE.md)
- [Aurora Typography System](./AURORA_TYPOGRAPHY_SYSTEM.md)
- [Aurora Icon System](./AURORA_ICON_SYSTEM.md)
- [Component Development Guide](./FEATURE_DEVELOPMENT_GUIDE.md)
- [Accessibility Guidelines](./AURORA_PRINCIPLES_ETHICS.md)

## Changelog

### Version 2.0 - Water Droplet Design System (February 17, 2026)
- ✨ Complete redesign based on water droplet aesthetics
- ✨ Added 9 comprehensive variants (primary, secondary, success, warning, danger, notice, ghost, cancel, exit)
- ✨ Added 4 size variants (sm, md, lg, xl)
- ✨ Added 8 animation effects (pulse, breathe, excited, nervous, shimmer, glow, float, liquid)
- ✨ Added blocked and loading states
- ✨ Comprehensive CSS variable system (200+ variables)
- ✨ Full theme support (dark, light, gray, illuminated)
- ✨ Water droplet visual effects (reflection, shimmer, glass)
- ✨ Button group component
- ✨ Enhanced accessibility features
- ✨ React component with full TypeScript support
- 📚 Complete documentation and showcase page

### Version 1.0 - Aurora Brand Buttons (February 15, 2026)
- Initial aurora, auroraSecondary, auroraGhost variants
- Basic size support
- Simple hover effects

## Support & Contribution

**Questions?**
- Check this documentation first
- View `/dev/buttons` showcase
- Review component source code
- Consult Aurora design team

**Found a bug?**
- Verify it's not a configuration issue
- Check browser console for errors
- Test in multiple browsers
- Document steps to reproduce

**Want to contribute?**
- Follow Aurora design principles
- Maintain accessibility standards
- Add tests for new features
- Update documentation

---

**Version:** 2.0.0  
**Last Updated:** February 17, 2026  
**Maintained by:** Aurora Design System Team  
**License:** MIT

