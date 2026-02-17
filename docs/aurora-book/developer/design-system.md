# Design System (Developer)

This chapter consolidates the core design language, typography system, button system, and icon system.

## Design Language
- Color palette and theme families
- Typography scale and weights
- Spacing system (8px grid)
- Elevation and shadow tiers
- Motion durations and easing

## Source of Truth (Files)
- Tokens: `src/lib/design-system/tokens.ts`
- Theme provider: `src/lib/design-system/theme-provider.tsx`
- Global styles: `src/app/globals.css`
- UI primitives: `src/components/aurora/*`

## Core Component Inventory
- Buttons: `Button`, `Modal`, `Card`, `Surface`, `SurfaceHeader`
- Navigation: `AuroraLogoMenu`, `Topnav`, `CollapsibleNav`
- Feedback: `RealtimeToasts`, `InlineNotice`, `CompanionHint`
- Inputs: `Form`, `GlobalSearch`
- Layout: `AuroraShell`, `SurfaceSection`

## Theming Rules
- Use CSS variables from theme provider
- Avoid direct hex usage in components
- Respect `dark` and `illuminated` modes

## Motion System
- Use calm motion: 200–600ms transitions
- Respect reduced-motion user setting
- Keep animation subtle and purposeful

## Component Usage Pattern
- Prefer semantic components over raw divs
- Use `aurora-label` for body text
- Use `aurora-heading-*` for titles

## Accessibility Requirements
- Keyboard navigable controls
- Visible focus rings
- Contrast verified in light/dark modes
- aria-label on icon-only buttons

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
