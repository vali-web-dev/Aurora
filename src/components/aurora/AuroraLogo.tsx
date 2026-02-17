'use client';

import clsx from 'clsx';
import { useAuroraLogo, type AuroraLogoConcept } from '@/lib/brand/aurora-logo-provider';

const UNIVERSE_LABELS = [
  { label: 'Home', href: '/home' },
  { label: 'Learning', href: '/learning' },
  { label: 'Create', href: '/create' },
  { label: 'Productivity', href: '/productivity' },
  { label: 'Health', href: '/health' },
  { label: 'Finance', href: '/finance' },
  { label: 'Social', href: '/social' },
  { label: 'Entertainment', href: '/entertainment' },
  { label: 'Travel', href: '/travel' },
  { label: 'Home Control', href: '/homecontrol' },
  { label: 'Automation', href: '/automation' },
  { label: 'Commerce', href: '/commerce' },
  { label: 'Brand', href: '/brand' },
  { label: 'Communities', href: '/communities' },
  { label: 'Gaming', href: '/gaming' },
  { label: 'AI', href: '/ai' },
];

interface AuroraLogoProps {
  concept?: AuroraLogoConcept;
  size?: number;
  interactive?: boolean;
  showNav?: boolean;
  className?: string;
  ariaLabel?: string;
}

const NAV_RADIUS = 210;
const NAV_CENTER = 256;
const NAV_POINTS = 16;

function getNavPoints() {
  const step = (Math.PI * 2) / NAV_POINTS;
  return UNIVERSE_LABELS.map((item, index) => {
    const angle = step * index - Math.PI / 2;
    const x = NAV_CENTER + Math.cos(angle) * NAV_RADIUS;
    const y = NAV_CENTER + Math.sin(angle) * NAV_RADIUS;
    return { ...item, x, y };
  });
}

export function AuroraLogo({
  concept,
  size = 96,
  interactive = true,
  showNav = true,
  className,
  ariaLabel,
}: AuroraLogoProps) {
  const { concept: storedConcept } = useAuroraLogo();
  const resolvedConcept = concept ?? storedConcept;
  const navPoints = getNavPoints();
  const enableNav = showNav && size >= 80;
  const label = ariaLabel ?? `Aurora logo ${resolvedConcept}`;

  return (
    <div
      className={clsx('inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={label}
        className={clsx('aurora-logo', resolvedConcept === 'core' ? 'aurora-logo--core' : 'aurora-logo--wave')}
      >
        <defs>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#C9F6FF" />
            <stop offset="70%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </radialGradient>
          <radialGradient id="coreAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E6FBFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="60%" stopColor="#5BC5FF" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="45%" stopColor="#8B5CF6" />
            <stop offset="80%" stopColor="#5BC5FF" />
            <stop offset="100%" stopColor="#F5A962" />
          </linearGradient>
        </defs>

        <style>
          {`
            .aurora-logo { overflow: visible; }
            .aurora-core { animation: aurora-core-pulse 3.8s ease-in-out infinite; transform-origin: 256px 256px; }
            .aurora-halo { animation: aurora-halo-breathe 6.4s ease-in-out infinite; transform-origin: 256px 256px; }
            .aurora-wave { animation: aurora-wave-flow 5.6s ease-in-out infinite; transform-origin: 256px 256px; }
            .aurora-nav { opacity: ${interactive && enableNav ? '0.15' : '0'}; transition: opacity 220ms ease; }
            .aurora-logo:hover .aurora-nav, .aurora-logo:focus .aurora-nav { opacity: ${interactive && enableNav ? '0.95' : '0'}; }
            .aurora-logo:hover .aurora-nav, .aurora-logo:focus .aurora-nav { animation: aurora-orbit 14s linear infinite; }
            .aurora-logo:hover .aurora-core, .aurora-logo:focus .aurora-core { filter: drop-shadow(0 0 10px rgba(0,217,255,0.55)); }
            @keyframes aurora-core-pulse { 0%,100% { transform: scale(0.985); } 50% { transform: scale(1.05); } }
            @keyframes aurora-halo-breathe { 0%,100% { opacity: 0.82; } 50% { opacity: 1; } }
            @keyframes aurora-wave-flow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            @keyframes aurora-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @media (prefers-reduced-motion: reduce) {
              .aurora-core, .aurora-halo, .aurora-wave, .aurora-nav { animation: none; transition: none; }
            }
          `}
        </style>

        <g className="aurora-core">
          <circle cx="256" cy="256" r="104" fill="url(#coreAura)" />
          <circle cx="256" cy="256" r="90" fill="url(#coreGrad)" />
        </g>
        <g className="aurora-halo">
          <circle cx="256" cy="256" r="170" fill="none" stroke="url(#haloGrad)" strokeWidth="6" opacity="0.92" />
          <circle cx="256" cy="256" r="150" fill="none" stroke="#D9E6FF" strokeWidth="2" opacity="0.25" />
        </g>

        {resolvedConcept === 'wave' && (
          <g className="aurora-wave">
            <path
              d="M80 270 C140 210, 200 210, 256 256 C312 302, 372 302, 432 242"
              fill="none"
              stroke="url(#waveGrad)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M96 320 C150 280, 206 280, 256 316 C306 352, 362 352, 416 302"
              fill="none"
              stroke="url(#waveGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M110 232 C168 186, 224 186, 270 222 C316 258, 372 258, 420 214"
              fill="none"
              stroke="#B6F3FF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />
          </g>
        )}

        {enableNav && (
          <g className="aurora-nav" opacity="0.45">
            <line x1="256" y1="86" x2="256" y2="68" stroke="#9FB6FF" strokeWidth="4" strokeLinecap="round" />
            <line x1="426" y1="256" x2="444" y2="256" stroke="#9FB6FF" strokeWidth="4" strokeLinecap="round" />
            <line x1="256" y1="426" x2="256" y2="444" stroke="#9FB6FF" strokeWidth="4" strokeLinecap="round" />
            <line x1="86" y1="256" x2="68" y2="256" stroke="#9FB6FF" strokeWidth="4" strokeLinecap="round" />
            <circle cx="256" cy="36" r="4" fill="#D9E6FF" />
            <circle cx="476" cy="256" r="4" fill="#D9E6FF" />
            <circle cx="256" cy="476" r="4" fill="#D9E6FF" />
            <circle cx="36" cy="256" r="4" fill="#D9E6FF" />
            {navPoints.map((point) => (
              <a key={point.label} href={point.href} aria-label={point.label}>
                <circle cx={point.x} cy={point.y} r="6" fill="#8B5CF6" />
              </a>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
