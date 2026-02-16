/**
 * Page Icons - simplified, reliable icon set per universe/page.
 */

import React from 'react';

interface PageIconProps {
  pageName: string;
  className?: string;
}

const ICONS: Record<string, JSX.Element> = {
  Home: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Dashboard: (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Profile: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M3 21a9 9 0 0118 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Entertainment: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M8 14.5l8-5-8-5v10z" fill="currentColor" />
    </svg>
  ),
  Commerce: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Social: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Learning: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Create: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 2l7.586 7.586" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Brand: (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 7h10M7 12h10M7 17h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Communities: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="15" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="15" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M10.5 10.5L7.5 13M13.5 10.5L16.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Gaming: (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="10" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="17" cy="10" r="1" fill="currentColor" />
      <circle cx="17" cy="14" r="1" fill="currentColor" />
    </svg>
  ),
  Productivity: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Travel: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Finance: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Health: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'Home Control': (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 10V6a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  Automation: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  AI: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 4.21l4.5 2.6 4.5-2.6M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Identity: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 21a8 8 0 0116 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Security: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Roadmap: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Blog: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Contact: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Accessibility: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 18v-6a5 5 0 0110 0v6M9 22v-8M15 22v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Admin: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Realms: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2v7M9 9l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Guilds: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Developer: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function PageIcon({ pageName, className = '' }: PageIconProps) {
  const icon = ICONS[pageName] || ICONS.Home;
  return React.cloneElement(icon, { className });
}

export function getPageIconColor(pageName: string): string {
  const colorMap: Record<string, string> = {
    Home: 'aurora-label text-blue-500',
    Dashboard: 'aurora-label text-blue-400',
    Profile: 'aurora-label text-blue-600',
    Entertainment: 'aurora-label text-purple-500',
    Commerce: 'aurora-label text-emerald-500',
    Social: 'aurora-label text-blue-500',
    Learning: 'aurora-label text-amber-500',
    Create: 'aurora-label text-rose-500',
    Brand: 'aurora-label text-fuchsia-500',
    Communities: 'aurora-label text-indigo-500',
    Gaming: 'aurora-label text-violet-500',
    Productivity: 'aurora-label text-indigo-600',
    Travel: 'aurora-label text-cyan-500',
    Finance: 'aurora-label text-emerald-600',
    Health: 'aurora-label text-rose-600',
    'Home Control': 'aurora-label text-slate-500',
    Automation: 'aurora-label text-sky-500',
    AI: 'aurora-label text-violet-600',
    Identity: 'aurora-label text-amber-600',
    Security: 'aurora-label text-rose-600',
    Settings: 'aurora-label text-slate-500',
    Roadmap: 'aurora-label text-amber-500',
    Blog: 'aurora-label text-slate-500',
    Contact: 'aurora-label text-slate-500',
    Accessibility: 'aurora-label text-emerald-500',
    Admin: 'aurora-label text-slate-500',
    Realms: 'aurora-label text-indigo-500',
    Guilds: 'aurora-label text-blue-600',
    Developer: 'aurora-label text-slate-500',
  };

  const toneClass = colorMap[pageName] || 'aurora-label text-slate-400';
  return toneClass.includes('aurora-label') ? toneClass : `aurora-label ${toneClass}`;
}
