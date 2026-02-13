'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { primaryNav } from '@/lib/navigation';
import { ThemeSelector } from '@/components/aurora/ThemeSelector';
import { GlobalSearch } from '@/components/aurora/GlobalSearch';
import { RealtimeNotifications } from '@/components/aurora/RealtimeNotifications';
import { CollapsibleNav } from '@/components/os/CollapsibleNav';
import { DocsPortal } from '@/components/aurora/DocsPortal';
import { KeyboardShortcutsHelp } from '@/components/aurora/KeyboardShortcutsHelp';
import { useTheme } from '@/lib/design-system/theme-provider';
import { useCompanion } from '@/lib/companion/companion-provider';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import clsx from 'clsx';

export function TopNav() {
  const pathname = usePathname();
  const { mode } = useTheme();
  const { toggle } = useCompanion();
  const [docsOpen, setDocsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const isIlluminated = mode === 'illuminated';

  // Global keyboard shortcuts
  useKeyboardShortcuts(
    () => setSearchOpen(true),
    () => setDocsOpen(true),
    () => setHelpOpen(true)
  );

  return (
    <header
      id="navigation"
      role="banner"
      className={clsx(
        'sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800',
        'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl',
        'transition-all duration-300',
        isIlluminated && 'border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 gap-4">
        {/* Logo */}
        <Link
          href="/"
          className={clsx(
            'flex items-center gap-2 transition-all duration-300',
            'hover:opacity-80 hover:translate-x-1',
            isIlluminated && 'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
          )}
        >
          <div
            className={clsx(
              'h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600',
              'shadow-lg transition-all duration-300',
              isIlluminated && 'shadow-[0_0_20px_rgba(59,130,246,0.6)]'
            )}
          />
          <span className="text-sm font-bold tracking-wider uppercase hidden sm:inline text-slate-900 dark:text-slate-50">
            Aurora
          </span>
        </Link>

        {/* Primary Navigation - Hidden on Mobile */}
        <nav className="hidden md:flex gap-1 flex-1">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg',
                'transition-all duration-200',
                pathname === item.href
                  ? clsx(
                      'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-md',
                      isIlluminated && 'shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    )
                  : clsx(
                      'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50',
                      'hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:shadow-sm',
                      isIlluminated && 'hover:bg-blue-950/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                    )
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Spacer for centered layout */}
        <div className="hidden md:flex flex-1" />

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <GlobalSearch 
            externalOpen={searchOpen}
            onOpenChange={setSearchOpen}
          />
          <RealtimeNotifications />
          <button
            onClick={() => setDocsOpen(true)}
            className={clsx(
              'relative w-10 h-10 rounded-lg flex items-center justify-center',
              'text-slate-600 dark:text-slate-300',
              'bg-slate-100/70 dark:bg-slate-900/60',
              'border border-slate-200 dark:border-slate-800',
              'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            )}
            aria-label="Open documentation"
            title="Docs"
            type="button"
          >
            <span className="text-xs font-semibold">?</span>
          </button>
          <button
            onClick={toggle}
            className={clsx(
              'relative w-10 h-10 rounded-lg flex items-center justify-center',
              'text-slate-600 dark:text-slate-300',
              'bg-slate-100/70 dark:bg-slate-900/60',
              'border border-slate-200 dark:border-slate-800',
              'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            )}
            aria-label="Open companion panel"
            title="Companion"
            type="button"
          >
            <span className="text-xs font-semibold">CP</span>
          </button>
          {/* Theme Selector */}
          <ThemeSelector variant="compact" showLabel={false} />

          {/* Collapsible Menu - Mobile Only */}
          <CollapsibleNav />
          
          {/* Docs Portal Modal */}
          <DocsPortal isOpen={docsOpen} onOpenChange={setDocsOpen} />
          
          {/* Keyboard Shortcuts Help Modal */}
          <KeyboardShortcutsHelp isOpen={helpOpen} onOpenChange={setHelpOpen} />
        </div>
      </div>
    </header>
  );
}