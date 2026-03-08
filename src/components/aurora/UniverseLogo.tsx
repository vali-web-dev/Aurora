/**
 * UniverseLogo Component
 * 
 * Renders universe-specific logos with consistent sizing and accessibility
 * Supports all 15 Aurora universes with their unique visual identities
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';

export type UniverseId = 
  | 'home'
  | 'entertainment'
  | 'commerce'
  | 'social'
  | 'learning'
  | 'create'
  | 'brand'
  | 'communities'
  | 'gaming'
  | 'productivity'
  | 'travel'
  | 'finance'
  | 'health'
  | 'homecontrol'
  | 'automation';

export interface UniverseLogoProps {
  /** Universe identifier */
  universe: UniverseId;
  /** Size in pixels (default: 32) */
  size?: 16 | 24 | 32 | 48 | 64 | 96 | 128;
  /** Custom className for styling */
  className?: string;
  /** Accessible label (defaults to universe name) */
  ariaLabel?: string;
  /** Show universe name alongside logo */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'right' | 'bottom';
}

const UNIVERSE_NAMES: Record<UniverseId, string> = {
  home: 'Home',
  entertainment: 'Entertainment',
  commerce: 'Commerce',
  social: 'Social',
  learning: 'Learning',
  create: 'Create',
  brand: 'Brand',
  communities: 'Communities',
  gaming: 'Gaming',
  productivity: 'Productivity',
  travel: 'Travel',
  finance: 'Finance',
  health: 'Health',
  homecontrol: 'Home Control',
  automation: 'Automation',
};

export const UniverseLogo: React.FC<UniverseLogoProps> = ({
  universe,
  size = 32,
  className = '',
  ariaLabel,
  showLabel = false,
  labelPosition = 'right',
}) => {
  const logoSrc = `/docs/brand/universe-logos/${universe}.svg`;
  const label = ariaLabel || `${UNIVERSE_NAMES[universe]} Universe`;
  const universeName = UNIVERSE_NAMES[universe];
  const universeIconName = resolvePageIconName(universeName, `/${universe}`);

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
        className={`${className}`}
        aria-label={label}
      />
      {showLabel && (
        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${labelPosition === 'bottom' ? 'text-center' : ''}`}>
          <span className={`${getPageIconColor(universeIconName)} inline-flex`} aria-hidden="true">
            <PageIcon pageName={universeIconName} className="h-4 w-4" />
          </span>
          <span aria-hidden="true">{universeName}</span>
        </span>
      )}
    </div>
  );
};

/**
 * UniverseLogoGrid Component
 * 
 * Displays all universe logos in a responsive grid layout
 */

interface UniverseLogoGridProps {
  /** Size of each logo */
  size?: 16 | 24 | 32 | 48 | 64 | 96 | 128;
  /** Show universe names */
  showLabels?: boolean;
  /** Handle logo click */
  onUniverseClick?: (universe: UniverseId) => void;
}

export const UniverseLogoGrid: React.FC<UniverseLogoGridProps> = ({
  size = 48,
  showLabels = true,
  onUniverseClick,
}) => {
  const universes = Object.keys(UNIVERSE_NAMES) as UniverseId[];

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-4 p-4">
      {universes.map((universe) => (
        <button
          key={universe}
          onClick={() => onUniverseClick?.(universe)}
          className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={`Navigate to ${UNIVERSE_NAMES[universe]} Universe`}
        >
          <UniverseLogo
            universe={universe}
            size={size}
            showLabel={showLabels}
            labelPosition="bottom"
          />
        </button>
      ))}
    </div>
  );
};

/**
 * UniverseIcon Component
 * 
 * Simplified inline icon version for tight spaces
 */

interface UniverseIconProps {
  universe: UniverseId;
  className?: string;
}

export const UniverseIcon: React.FC<UniverseIconProps> = ({ 
  universe, 
  className = 'w-4 h-4' 
}) => {
  const logoSrc = `/docs/brand/universe-logos/${universe}.svg`;
  const label = UNIVERSE_NAMES[universe];

  return (
    <Image
      src={logoSrc}
      alt={label}
      width={16}
      height={16}
      className={className}
      aria-label={`${label} icon`}
    />
  );
};

export { UNIVERSE_NAMES };
