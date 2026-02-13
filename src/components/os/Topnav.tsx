'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { primaryNav } from '@/lib/navigation';
import { ThemeSelector } from '@/components/aurora/ThemeSelector';
import { CollapsibleNav } from '@/components/os/CollapsibleNav';
import { useTheme } from '@/lib/design-system/theme-provider';
import clsx from 'clsx';

export function TopNav() {
  const pathname = usePathname();
  const { mode } = useTheme();

  const isIlluminated = mode === 'illuminated';

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
          {/* Theme Selector */}
          <ThemeSelector variant="compact" showLabel={false} />

          {/* Collapsible Menu - Mobile Only */}
          <CollapsibleNav />
        </div>
      </div>
    </header>
  );
}