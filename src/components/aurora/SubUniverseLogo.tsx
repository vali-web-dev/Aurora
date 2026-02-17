import Image from 'next/image';
import React from 'react';

export type SubUniverseId =
  | 'accessibility'
  | 'admin'
  | 'about'
  | 'roadmap'
  | 'blog'
  | 'contact'
  | 'legal'
  | 'product'
  | 'identity'
  | 'shopping-review'
  | 'order-history'
  | 'economy'
  | 'developer'
  | 'ai'
  | 'realms'
  | 'guilds'
  | 'luma'
  | 'navigation'
  | 'security';

export type SubUniverseVariant = 'master' | 'mono' | 'invert';

export interface SubUniverseLogoProps {
  subUniverse: SubUniverseId;
  size?: 16 | 24 | 32 | 48 | 64 | 96 | 128;
  variant?: SubUniverseVariant;
  className?: string;
  ariaLabel?: string;
  showLabel?: boolean;
  labelPosition?: 'right' | 'bottom';
}

const SUB_UNIVERSE_NAMES: Record<SubUniverseId, string> = {
  accessibility: 'Accessibility',
  admin: 'Admin',
  about: 'About',
  roadmap: 'Roadmap',
  blog: 'Blog',
  contact: 'Contact',
  legal: 'Legal',
  product: 'Product',
  identity: 'Identity',
  'shopping-review': 'Shopping Review',
  'order-history': 'Order History',
  economy: 'Economy',
  developer: 'Developer',
  ai: 'AI',
  realms: 'Realms',
  guilds: 'Guilds',
  luma: 'Luma',
  navigation: 'Navigation',
  security: 'Security',
};

function buildLogoPath(subUniverse: SubUniverseId, variant: SubUniverseVariant) {
  const suffix = variant === 'master' ? '' : `-${variant}`;
  return `/docs/brand/sub-universe-logos/${subUniverse}${suffix}.svg`;
}

export const SubUniverseLogo: React.FC<SubUniverseLogoProps> = ({
  subUniverse,
  size = 32,
  variant = 'master',
  className = '',
  ariaLabel,
  showLabel = false,
  labelPosition = 'right',
}) => {
  const logoSrc = buildLogoPath(subUniverse, variant);
  const label = ariaLabel || `${SUB_UNIVERSE_NAMES[subUniverse]} Sub-Universe`;
  const name = SUB_UNIVERSE_NAMES[subUniverse];

  const containerClass = showLabel
    ? labelPosition === 'right'
      ? 'inline-flex items-center gap-2'
      : 'inline-flex flex-col items-center gap-1'
    : 'inline-flex';

  return (
    <div className={containerClass}>
      <Image
        src={logoSrc}
        alt={label}
        width={size}
        height={size}
        className={className}
        aria-label={label}
      />
      {showLabel && (
        <span
          className={`text-sm font-medium ${labelPosition === 'bottom' ? 'text-center' : ''}`}
          aria-hidden="true"
        >
          {name}
        </span>
      )}
    </div>
  );
};

export const SUB_UNIVERSE_IDS: SubUniverseId[] = [
  'accessibility',
  'admin',
  'about',
  'roadmap',
  'blog',
  'contact',
  'legal',
  'product',
  'identity',
  'shopping-review',
  'order-history',
  'economy',
  'developer',
  'ai',
  'realms',
  'guilds',
  'luma',
  'navigation',
  'security',
];

export { SUB_UNIVERSE_NAMES };
