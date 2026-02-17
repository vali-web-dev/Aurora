'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MasterLogoRingEngineModal } from '@/components/aurora/ring-engine/MasterLogoRingEngineModal';
import type { RingLink } from '@/components/aurora/ring-engine/types';

const MAIN_LINKS: RingLink[] = [
  {
    id: 'home',
    label: 'Home',
    route: '/home',
    iconText: 'HM',
    group: 'worlds',
    isMain: true,
    isCritical: false,
    weight: 1,
    children: [
      { id: 'home-dashboard', label: 'Dashboard', route: '/dashboard', iconText: 'DB', group: 'home', isMain: false, isCritical: false, weight: 0.9 },
      { id: 'home-settings', label: 'Settings', route: '/settings', iconText: 'ST', group: 'home', isMain: false, isCritical: false, weight: 0.75 },
      { id: 'home-profile', label: 'Profile', route: '/profile', iconText: 'PF', group: 'home', isMain: false, isCritical: false, weight: 0.74 },
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    route: '/entertainment',
    iconText: 'EN',
    group: 'worlds',
    isMain: true,
    isCritical: false,
    weight: 0.98,
    children: [
      { id: 'ent-blog', label: 'Blog', route: '/blog', iconText: 'BL', group: 'ent', isMain: false, isCritical: false, weight: 0.65 },
      { id: 'ent-luma', label: 'Luma', route: '/luma', iconText: 'LM', group: 'ent', isMain: false, isCritical: false, weight: 0.69 },
      { id: 'ent-gaming', label: 'Gaming', route: '/gaming', iconText: 'GM', group: 'ent', isMain: false, isCritical: false, weight: 0.81 },
      { id: 'ent-create', label: 'Create', route: '/create', iconText: 'CR', group: 'ent', isMain: false, isCritical: false, weight: 0.78 },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    route: '/commerce',
    iconText: 'CM',
    group: 'worlds',
    isMain: true,
    isCritical: false,
    weight: 0.97,
    children: [
      { id: 'co-cart', label: 'Cart', route: '/commerce/cart', iconText: 'CT', group: 'co', isMain: false, isCritical: false, weight: 0.83 },
      { id: 'co-orders', label: 'Orders', route: '/commerce/orders', iconText: 'OR', group: 'co', isMain: false, isCritical: false, weight: 0.8 },
      { id: 'co-checkout', label: 'Checkout', route: '/commerce/checkout', iconText: 'CK', group: 'co', isMain: false, isCritical: false, weight: 0.84 },
      { id: 'co-review', label: 'Review', route: '/commerce/review', iconText: 'RV', group: 'co', isMain: false, isCritical: false, weight: 0.7 },
      { id: 'co-brand', label: 'Brand', route: '/brand', iconText: 'BR', group: 'co', isMain: false, isCritical: false, weight: 0.66 },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    route: '/social',
    iconText: 'SC',
    group: 'worlds',
    isMain: true,
    isCritical: false,
    weight: 0.96,
    children: [
      { id: 'so-communities', label: 'Communities', route: '/communities', iconText: 'CO', group: 'so', isMain: false, isCritical: false, weight: 0.8 },
      { id: 'so-guilds', label: 'Guilds', route: '/guilds', iconText: 'GD', group: 'so', isMain: false, isCritical: false, weight: 0.76 },
      { id: 'so-profile', label: 'Identity', route: '/identity', iconText: 'ID', group: 'so', isMain: false, isCritical: false, weight: 0.73 },
    ],
  },
  {
    id: 'learning',
    label: 'Learning',
    route: '/learning',
    iconText: 'LR',
    group: 'worlds',
    isMain: true,
    isCritical: false,
    weight: 0.95,
    children: [
      { id: 'le-docs', label: 'Docs', route: '/docs', iconText: 'DC', group: 'le', isMain: false, isCritical: false, weight: 0.79 },
      { id: 'le-dev', label: 'Developer', route: '/developer', iconText: 'DV', group: 'le', isMain: false, isCritical: false, weight: 0.75 },
      { id: 'le-roadmap', label: 'Roadmap', route: '/roadmap', iconText: 'RM', group: 'le', isMain: false, isCritical: false, weight: 0.72 },
    ],
  },
  {
    id: 'creative',
    label: 'Creative',
    route: '/create',
    iconText: 'CV',
    group: 'worlds',
    isMain: true,
    isCritical: false,
    weight: 0.94,
    children: [
      { id: 'cr-brand', label: 'Brand', route: '/brand', iconText: 'BR', group: 'cr', isMain: false, isCritical: false, weight: 0.74 },
      { id: 'cr-productivity', label: 'Productivity', route: '/productivity', iconText: 'PD', group: 'cr', isMain: false, isCritical: false, weight: 0.79 },
      { id: 'cr-automation', label: 'Automation', route: '/automation', iconText: 'AT', group: 'cr', isMain: false, isCritical: false, weight: 0.77 },
      { id: 'cr-ai', label: 'AI', route: '/ai', iconText: 'AI', group: 'cr', isMain: false, isCritical: true, weight: 0.9 },
    ],
  },
];

const UTILITY_LINKS: RingLink[] = [
  { id: 'finance', label: 'Finance', route: '/finance', iconText: 'FN', group: 'tools', isMain: false, isCritical: false, weight: 0.8 },
  { id: 'travel', label: 'Travel', route: '/travel', iconText: 'TV', group: 'tools', isMain: false, isCritical: false, weight: 0.7 },
  { id: 'health', label: 'Health', route: '/health', iconText: 'HL', group: 'tools', isMain: false, isCritical: false, weight: 0.73 },
  { id: 'security', label: 'Security', route: '/security', iconText: 'SE', group: 'system', isMain: false, isCritical: true, weight: 0.88 },
  { id: 'realms', label: 'Realms', route: '/realms', iconText: 'RL', group: 'tools', isMain: false, isCritical: false, weight: 0.67 },
  { id: 'homecontrol', label: 'HomeControl', route: '/homecontrol', iconText: 'HC', group: 'tools', isMain: false, isCritical: false, weight: 0.69 },
  { id: 'admin', label: 'Admin', route: '/admin', iconText: 'AD', group: 'system', isMain: false, isCritical: true, weight: 0.84 },
  { id: 'about', label: 'About', route: '/about', iconText: 'AB', group: 'system', isMain: false, isCritical: false, weight: 0.55 },
  { id: 'contact', label: 'Contact', route: '/contact', iconText: 'CN', group: 'system', isMain: false, isCritical: false, weight: 0.54 },
  { id: 'legal', label: 'Legal', route: '/legal', iconText: 'LG', group: 'system', isMain: false, isCritical: false, weight: 0.51 },
  { id: 'navigation', label: 'Navigation', route: '/navigation', iconText: 'NV', group: 'tools', isMain: false, isCritical: false, weight: 0.62 },
  { id: 'automation-agents', label: 'Agents', route: '/automation', iconText: 'AG', group: 'tools', isMain: false, isCritical: false, weight: 0.78 },
];

export default function LogoRingEngineDevPage() {
  const [open, setOpen] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('/home');

  const links = useMemo(() => [...MAIN_LINKS, ...UTILITY_LINKS], []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold">Aurora Ring Engine — Phase A</h1>
        <p className="text-slate-400">Mechanical chain-link ring skeleton with fixed six-main middle ring and dynamic ring spawning.</p>
        <div className="flex gap-3 flex-wrap">
          <Button variant="primary" animation="shimmer" onClick={() => setOpen(true)}>
            Open Ring Engine
          </Button>
          <Button variant="secondary" onClick={() => setCurrentRoute('/home')}>
            Route: /home
          </Button>
          <Button variant="secondary" onClick={() => setCurrentRoute('/social')}>
            Route: /social
          </Button>
          <Button variant="secondary" onClick={() => setCurrentRoute('/commerce')}>
            Route: /commerce
          </Button>
        </div>
        <p className="text-sm text-slate-500">Current context: {currentRoute}</p>
      </div>

      <MasterLogoRingEngineModal
        isOpen={open}
        onClose={() => setOpen(false)}
        links={links}
        onNavigate={(route) => setCurrentRoute(route)}
      />
    </main>
  );
}
