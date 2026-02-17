'use client';

import React, { useId, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AuroraLogo } from '@/components/aurora/AuroraLogo';
import clsx from 'clsx';
import { useAuroraLogo } from '@/lib/brand/aurora-logo-provider';

interface DocsSection {
  title: string;
  description: string;
  links: { label: string; href: string; external?: boolean }[];
}

const DOCS_STRUCTURE: Record<string, DocsSection[]> = {
  'Start Here': [
    {
      title: 'Aurora System and Brains Book',
      description: 'Publishable, comprehensive manual (end-user + developer editions)',
      links: [
        { label: 'End-User Edition', href: '/docs/aurora-book/end-user' },
        { label: 'Developer Edition', href: '/docs/aurora-book/developer' },
      ],
    },
    {
      title: 'Quick Reference',
      description: '5-minute orientation to Aurora',
      links: [
        {
          label: 'View Quick Reference',
          href: '/docs/quick-reference',
        },
      ],
    },
    {
      title: 'Complete Manual',
      description: 'Legacy full guide (single file)',
      links: [
        {
          label: 'Read the Manual',
          href: '/docs/manual',
        },
      ],
    },
    {
      title: 'Getting Started',
      description: '10 steps to your first day in Aurora',
      links: [
        {
          label: 'Begin Here',
          href: '/docs/manual#your-first-day',
        },
      ],
    },
  ],
  'By Role': [
    {
      title: 'For Users',
      description: 'How to use Aurora, personalization, memory, privacy',
      links: [
        { label: 'Aurora Book (End-User)', href: '/docs/aurora-book/end-user' },
        { label: 'Manual (User Sections)', href: '/docs/manual#universes' },
        { label: 'Quick Reference', href: '/docs/quick-reference' },
        { label: 'Privacy', href: '/docs/manual#privacy--rights' },
      ],
    },
    {
      title: 'For Developers',
      description: 'Architecture, API docs, feature development',
      links: [
        { label: 'Aurora Book (Developer)', href: '/docs/aurora-book/developer' },
        { label: 'Manual (Tech Section)', href: '/docs/manual#platform-architecture' },
        { label: 'Feature Dev Guide', href: '/docs/feature-dev' },
        { label: 'Code Docs', href: '/docs/code-architecture' },
      ],
    },
    {
      title: 'For Designers',
      description: 'Design system, brand voice, component patterns',
      links: [
        {
          label: 'Design Culture',
          href: '/docs/design-culture',
        },
        { label: 'Component Library', href: '/docs/design-culture#component-library' },
        { label: 'Accessibility', href: '/docs/design-culture#accessibility-checklist' },
      ],
    },
    {
      title: 'For Ethics Reviewers',
      description: 'Principles, privacy policies, governance',
      links: [
        { label: 'Principles & Ethics', href: '/docs/principles-ethics' },
        { label: 'Privacy Policy', href: '/docs/manual#privacy--rights' },
        { label: 'Governance', href: '/docs/principles-ethics#community-governance' },
      ],
    },
  ],
  'By Topic': [
    {
      title: 'Personality System',
      description: '5 tones, 19 universes, signals, memory, hints',
      links: [
        { label: 'Companion System (User)', href: '/docs/aurora-book/end-user/companion-system' },
        { label: 'Companion System (Dev)', href: '/docs/aurora-book/developer/companion-system' },
        { label: 'Companion Panel', href: '/docs/manual#companion-panel' },
        { label: 'Signals Guide', href: '/docs/quick-reference#signals' },
        { label: 'Personality Matrix', href: '/docs/design-culture#tone-of-voice' },
      ],
    },
    {
      title: 'Memory & Context',
      description: 'How Aurora remembers your sessions and preferences',
      links: [
        { label: 'Memory and Privacy', href: '/docs/aurora-book/end-user/memory-privacy' },
        { label: 'Memory System', href: '/docs/manual#memory--context' },
        { label: 'Privacy (Data Handling)', href: '/docs/manual#privacy--rights' },
      ],
    },
    {
      title: 'Themes & Accessibility',
      description: 'Light/dark/illuminated modes, high contrast, keyboard nav',
      links: [
        { label: 'Accessibility', href: '/docs/aurora-book/end-user/accessibility' },
        { label: 'Theming', href: '/docs/aurora-book/end-user/theming' },
        { label: 'Accessibility (Legacy)', href: '/docs/manual#accessibility--inclusivity' },
      ],
    },
    {
      title: 'All 15 Universes',
      description: 'Home, Learning, Create, Productivity, and more',
      links: [
        { label: 'Universe Index', href: '/docs/aurora-book/end-user/universes' },
        { label: 'Universes Guide (Legacy)', href: '/docs/manual#the-15-universes' },
        { label: 'Quick Ref', href: '/docs/quick-reference#universes' },
      ],
    },
    {
      title: 'Privacy & Ethics',
      description: 'Your rights, data handling, ethical AI',
      links: [
        { label: 'Privacy Rights', href: '/docs/manual#privacy--rights' },
        { label: 'Principles', href: '/docs/principles-ethics#core-principles' },
        { label: 'Ethics Guidelines', href: '/docs/manual#10-ethical-guidelines' },
      ],
    },
  ],
  Features: [
    {
      title: 'Session Summaries',
      description: 'Auto-generated daily/weekly recaps',
      links: [
        {
          label: 'Learn More',
          href: '/docs/features/session-summaries',
        },
      ],
    },
    {
      title: 'Companion Hints',
      description: 'Context-aware guidance aligned to your mood',
      links: [
        {
          label: 'Learn More',
          href: '/docs/manual#companion-panel',
        },
      ],
    },
  ],
  Support: [
    {
      title: 'FAQ',
      description: 'Common questions and troubleshooting',
      links: [
        {
          label: 'Read FAQ',
          href: '/docs/faq',
        },
      ],
    },
    {
      title: 'Community',
      description: 'Forums, chat, feature requests',
      links: [
        {
          label: 'Join Community',
          href: 'https://aurora.community',
          external: true,
        },
      ],
    },
    {
      title: 'Report Issue',
      description: 'Found a bug? Let us know',
      links: [
        {
          label: 'Report',
          href: 'https://github.com/vali-web-dev/Aurora/issues',
          external: true,
        },
      ],
    },
  ],
};

export interface DocsPortalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocsPortal({ isOpen, onOpenChange }: DocsPortalProps) {
  const { concept: logoConcept, setConcept: setLogoConcept } = useAuroraLogo();
  const [activeTab, setActiveTab] = useState('Start Here');
  const titleId = useId();
  const descriptionId = useId();

  const currentSection = DOCS_STRUCTURE[activeTab] || [];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
      announceLabel="Documentation portal"
    >
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        titleId={titleId}
        descriptionId={descriptionId}
      >
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>
            <span className="inline-flex items-center gap-3" id={titleId}>
              <AuroraLogo concept={logoConcept} size={36} interactive={false} showNav={false} />
              Aurora Documentation Portal
            </span>
          </DialogTitle>
          <p id={descriptionId} className="aurora-label text-sm text-slate-600 dark:text-slate-400 mt-1">
            Explore Aurora&apos;s docs by topic, role, or feature
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLogoConcept('core')}
                className={clsx(
                  'aurora-label text-xs px-2 py-1 rounded-full border transition-colors',
                  logoConcept === 'core'
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                )}
              >
                Concept 1
              </button>
              <button
                type="button"
                onClick={() => setLogoConcept('wave')}
                className={clsx(
                  'aurora-label text-xs px-2 py-1 rounded-full border transition-colors',
                  logoConcept === 'wave'
                    ? 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30'
                    : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                )}
              >
                Concept 2
              </button>
            </div>
            <div className="flex sm:hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-1 text-[0.6rem] dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                aria-label="Use logo concept 1"
                onClick={() => setLogoConcept('core')}
                className={clsx(
                  'h-5 w-5 rounded-full transition-colors',
                  logoConcept === 'core'
                    ? 'bg-blue-500/70 ring-2 ring-blue-400/60'
                    : 'bg-slate-300/60 dark:bg-slate-700/60'
                )}
              />
              <button
                type="button"
                aria-label="Use logo concept 2"
                onClick={() => setLogoConcept('wave')}
                className={clsx(
                  'h-5 w-5 rounded-full transition-colors',
                  logoConcept === 'wave'
                    ? 'bg-purple-500/70 ring-2 ring-purple-400/60'
                    : 'bg-slate-300/60 dark:bg-slate-700/60'
                )}
              />
            </div>
            <AuroraLogo concept={logoConcept} size={28} interactive={false} showNav={false} />
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.keys(DOCS_STRUCTURE).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`aurora-label px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'aurora-label bg-blue-500 text-white'
                  : 'aurora-label bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSection.map((section) => (
            <div
              key={section.title}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <h3 className="aurora-label font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {section.title}
              </h3>
              <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-3">
                {section.description}
              </p>
              <div className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="aurora-label text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    {link.label}
                    {link.external && (
                      <span className="aurora-label text-xs">↗</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="aurora-label mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
          <p>
            💭 <strong>Pro tip:</strong> Most pages have &quot;Learn more&quot; links that take you to relevant docs
          </p>
          <p className="mt-2">
            📖 <strong>Developer note:</strong> Read{' '}
            <a href="/docs/feature-dev" className="aurora-label text-blue-600 dark:text-blue-400 hover:underline">
              Feature Development Guide
            </a>
            {' '}to add docs to new features
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
