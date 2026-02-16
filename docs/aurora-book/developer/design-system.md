# Design System (Developer)

This chapter consolidates the core design language, typography system, button system, and icon system.

## Design Language
- Color palette and theme families
- Typography scale and weights
- Spacing system (8px grid)
- Elevation and shadow tiers
- Motion durations and easing

## Token Usage
- Use tokens from src/lib/design-system/tokens.ts
- Prefer semantic classes over raw colors
- Avoid hard-coded colors for text and backgrounds

## Typography System
- Base classes: aurora-text, aurora-text-animated, aurora-text-breathe, aurora-text-shimmer
- Semantic headings: aurora-heading-1 through aurora-heading-4
- Variants: warm, cool, nature
- Size and weight modifiers

## Button System
- Variants: aurora, auroraSecondary, auroraGhost
- Sizes: sm, md, lg
- Utility classes for custom implementations

## Icon System
- Semantic icon mapping by universe
- 24x24 viewBox and 2px stroke
- Accessible labeling and color usage

## Accessibility Guidance
- Semantic HTML and ARIA
- Reduced motion support
- Contrast-first design

## QA Checklist
- Typography uses aurora-label or aurora-heading classes
- Components respect light and dark modes
- Focus states are visible and clear

Sources:
- AURORA_DESIGN_CULTURE.md
- AURORA_TYPOGRAPHY_SYSTEM.md
- AURORA_BUTTON_SYSTEM.md
- AURORA_ICON_SYSTEM.md
