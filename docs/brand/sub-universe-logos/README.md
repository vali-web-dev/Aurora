# Aurora Sub-Universe Logos

This folder contains logos for secondary navigation sub-universes (from the secondary nav list). Each logo has a master SVG plus mono and invert variants.

## Included Sub-Universe Logos

- identity.svg (identity-mono.svg, identity-invert.svg)
- shopping-review.svg (shopping-review-mono.svg, shopping-review-invert.svg)
- order-history.svg (order-history-mono.svg, order-history-invert.svg)
- economy.svg (economy-mono.svg, economy-invert.svg)
- developer.svg (developer-mono.svg, developer-invert.svg)
- ai.svg (ai-mono.svg, ai-invert.svg)
- realms.svg (realms-mono.svg, realms-invert.svg)
- guilds.svg (guilds-mono.svg, guilds-invert.svg)
- luma.svg (luma-mono.svg, luma-invert.svg)
- navigation.svg (navigation-mono.svg, navigation-invert.svg)
- security.svg (security-mono.svg, security-invert.svg)
- accessibility.svg (accessibility-mono.svg, accessibility-invert.svg)
- admin.svg (admin-mono.svg, admin-invert.svg)
- about.svg (about-mono.svg, about-invert.svg)
- roadmap.svg (roadmap-mono.svg, roadmap-invert.svg)
- blog.svg (blog-mono.svg, blog-invert.svg)
- contact.svg (contact-mono.svg, contact-invert.svg)
- legal.svg (legal-mono.svg, legal-invert.svg)
- product.svg (product-mono.svg, product-invert.svg)

## Secondary Nav Items Using Existing Universe Logos

These entries already have matching universe logos in [docs/brand/universe-logos](../universe-logos):

- brand
- communities
- gaming
- entertainment
- social
- productivity
- finance
- health
- homecontrol
- automation
- travel

## Usage

```tsx
import Image from 'next/image';

<Image
  src="/docs/brand/sub-universe-logos/identity.svg"
  alt="Identity"
  width={32}
  height={32}
/>
```

## Variants

- **Master:** Full gradient color
- **Mono:** #1F2937 (light UI)
- **Invert:** #FFFFFF (dark UI)
